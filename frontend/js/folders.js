import { apiRequest } from './api.js';
import { loadCards, resetCardView } from './cards.js';

export let currentFolder = null; // объект текущей открытой папки

// Загрузить и отобразить папки
export async function loadFolders() {
  try {
    const folders = await apiRequest('/folders');
    renderFolders(folders);
  } catch (err) {
    console.error('Ошибка загрузки папок:', err);
  }
}

function renderFolders(folders) {
  const container = document.getElementById('folders-list');
  container.innerHTML = '';
  folders.forEach(folder => {
    const div = document.createElement('div');
    div.className = 'folder-card';
    div.dataset.id = folder._id;
    div.innerHTML = `
      <div class="folder-name">
        <i class="fa-solid fa-folder"></i>
        <span>${escapeHtml(folder.name)}</span>
        <small>(${folder.targetLanguage})</small>
      </div>
      <div class="folder-actions">
        <i class="fa-solid fa-pen-to-square edit-folder" title="Редактировать"></i>
        <i class="fa-solid fa-trash delete-folder" title="Удалить"></i>
      </div>
    `;
    container.appendChild(div);
  });

  container.onclick = async (e) => {
    const card = e.target.closest('.folder-card');
    if (!card) return;
    const folderId = card.dataset.id;
    const folderName = card.querySelector('span').textContent;
    const targetLang = card.querySelector('small').textContent.replace(/[()]/g, '');

    if (e.target.classList.contains('delete-folder')) {
      e.stopPropagation();
      if (confirm(`Удалить папку "${folderName}" и все карточки?`)) {
        await apiRequest(`/folders/${folderId}`, 'DELETE');
        loadFolders();
      }
      return;
    }
    if (e.target.classList.contains('edit-folder')) {
      e.stopPropagation();
      const folder = { _id: folderId, name: folderName, targetLanguage: targetLang };
      openFolderModal(folder);
      return;
    }

    // Открытие папки
    openFolderView(folderId, folderName, targetLang);
  };
}

export function openFolderView(folderId, name, lang) {
  currentFolder = { _id: folderId, name, targetLanguage: lang };
  document.body.classList.add('folder-open');          // ← добавляем класс
  document.getElementById('folders-panel').classList.add('hidden');
  document.getElementById('folder-view').classList.remove('hidden');
  document.getElementById('folder-view-title').textContent = name;
  document.getElementById('add-card-btn').disabled = false;
  loadCards(folderId);
}

export function closeFolderView() {
  document.getElementById('folder-view').classList.add('hidden');
  document.getElementById('folders-panel').classList.remove('hidden');
  document.body.classList.remove('folder-open');       // ← убираем класс
  currentFolder = null;
  resetCardView();
  // exitStudy() вызывается в app.js при необходимости
}

// Модальное окно папки
const folderModal = document.getElementById('folder-modal');
const folderForm = document.getElementById('folder-form');
const folderIdInput = document.getElementById('folder-id');
const folderNameInput = document.getElementById('folder-name');
const folderLangSelect = document.getElementById('folder-language');
const folderModalTitle = document.getElementById('folder-modal-title');

export function openFolderModal(folder = null) {
  if (folder) {
    folderModalTitle.textContent = 'Редактировать папку';
    folderIdInput.value = folder._id;
    folderNameInput.value = folder.name;
    folderLangSelect.value = folder.targetLanguage;
  } else {
    folderModalTitle.textContent = 'Новая папка';
    folderIdInput.value = '';
    folderNameInput.value = '';
    folderLangSelect.value = 'en';
  }
  folderModal.classList.remove('hidden');
}

folderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = folderIdInput.value;
  const name = folderNameInput.value;
  const targetLanguage = folderLangSelect.value;
  try {
    if (id) {
      await apiRequest(`/folders/${id}`, 'PUT', { name, targetLanguage });
    } else {
      await apiRequest('/folders', 'POST', { name, targetLanguage });
    }
    folderModal.classList.add('hidden');
    loadFolders();
  } catch (err) {
    alert(err.message);
  }
});

document.querySelector('#folder-modal .close-modal').addEventListener('click', () => {
  folderModal.classList.add('hidden');
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}