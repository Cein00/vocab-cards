import { apiRequest } from './api.js';
import { loadCards, resetCardView, getCards } from './cards.js';
import { showModal } from './modal.js';   // ← прямой импорт

export let currentFolder = null;

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
    if (!container) return;
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
                <i class="fa-solid fa-download download-folder" title="Скачать карточки"></i>
                <i class="fa-solid fa-trash delete-folder" title="Удалить"></i>
            </div>
        `;
        container.appendChild(div);
    });

    // Единый обработчик кликов
    container.onclick = async (e) => {
        const card = e.target.closest('.folder-card');
        if (!card) return;
        const folderId = card.dataset.id;
        const folderName = card.querySelector('span')?.textContent || '';
        const targetLang = card.querySelector('small')?.textContent.replace(/[()]/g, '') || '';

        // Удаление папки
        if (e.target.classList.contains('delete-folder')) {
            e.stopPropagation();
            const confirmed = await showModal(
                'Удаление папки',
                `Удалить папку «${folderName}» и все карточки?`,
                true
            );
            if (confirmed) {
                try {
                    await apiRequest(`/folders/${folderId}`, 'DELETE');
                    loadFolders();
                } catch (err) {
                    showModal('Ошибка', err.message);
                }
            }
            return;
        }

        // В container.onclick, после условия для редактирования, добавить:
        if (e.target.classList.contains('download-folder')) {
            e.stopPropagation();
            downloadFolder(folderId, folderName);
            return;
        }

        // Редактирование папки
        if (e.target.classList.contains('edit-folder')) {
            e.stopPropagation();
            openFolderModal({ _id: folderId, name: folderName, targetLanguage: targetLang });
            return;
        }

        // Открытие папки
        openFolderView(folderId, folderName, targetLang);
    };
}

export function openFolderView(folderId, name, lang) {
    currentFolder = { _id: folderId, name, targetLanguage: lang };
    document.body.classList.add('folder-open');
    document.getElementById('folders-panel')?.classList.add('hidden');
    document.getElementById('folder-view')?.classList.remove('hidden');
    const titleEl = document.getElementById('folder-view-title');
    if (titleEl) titleEl.textContent = name;
    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) addCardBtn.disabled = false;
    loadCards(folderId).then(() => {
        const count = getCards().length;
        const el = document.getElementById('card-count-top');
        if (el) el.textContent = `Карточек: ${count}`;
    });
}

export function closeFolderView() {
    document.getElementById('folder-view')?.classList.add('hidden');
    document.getElementById('folders-panel')?.classList.remove('hidden');
    document.body.classList.remove('folder-open');
    currentFolder = null;
    resetCardView();
}

const folderModal = document.getElementById('folder-modal');
const folderForm = document.getElementById('folder-form');
const folderIdInput = document.getElementById('folder-id');
const folderNameInput = document.getElementById('folder-name');
const folderLangSelect = document.getElementById('folder-language');
const folderModalTitle = document.getElementById('folder-modal-title');

export function openFolderModal(folder = null) {
  if (!folderModal) return;
  if (folder) {
    // редактирование
    folderModalTitle.textContent = 'Редактировать папку';
    folderIdInput.value = folder._id;
    folderNameInput.value = folder.name;
    folderLangSelect.value = folder.targetLanguage;
  } else {
    // новая папка
    folderModalTitle.textContent = 'Новая папка';
    folderIdInput.value = '';
    folderNameInput.value = '';
    // Берём язык из настроек, по умолчанию 'en'

    const defaultLang = window.appSettings?.defaultFolderLanguage || 'en';
    folderLangSelect.value = defaultLang;
  }
  folderModal.classList.remove('hidden');
}

folderForm?.addEventListener('submit', async (e) => {
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
        showModal('Ошибка', err.message);
    }
});

document.querySelector('#folder-modal .close-modal')?.addEventListener('click', () => {
    folderModal?.classList.add('hidden');
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция для копирования карточек папки в буфер обмена
async function downloadFolder(folderId, folderName) {
    try {
        // Загружаем карточки с сервера для этой папки
        const cards = await apiRequest(`/cards?folderId=${folderId}`);
        if (!cards.length) {
            showToast(`В папке «${folderName}» нет карточек`, 'info');
            return;
        }
        // Формируем текст: слово - перевод (каждая пара с новой строки)
        const lines = cards.map(card => `${card.term} - ${card.translation}`);
        const text = lines.join('\n');
        // Копируем в буфер обмена
        await navigator.clipboard.writeText(text);
        showToast(`Скопировано ${cards.length} карточек из папки «${folderName}»`, 'success');
    } catch (err) {
        console.error('Ошибка при скачивании папки:', err);
        showToast('❌ Не удалось скопировать карточки', 'error');
    }
}

/**
 * Показывает всплывающее уведомление с иконкой и анимацией.
 * @param {string} message - текст уведомления
 * @param {string} type - тип: 'success', 'error', 'info' (по умолчанию 'info')
 */
function showToast(message, type = 'success') {
    // Удаляем предыдущее уведомление, если есть
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    // Выбираем иконку в зависимости от типа
    let iconHtml = '';
    switch (type) {
        case 'success':
            iconHtml = '<i class="fa-solid fa-circle-check"></i>';
            break;
        case 'error':
            iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';
            break;
        case 'info':
        default:
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
            break;
    }

    // Создаём элемент уведомления
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${iconHtml}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
    `;
    document.body.appendChild(toast);

    // Принудительный reflow для запуска анимации
    toast.offsetHeight;

    // Добавляем класс для показа с анимацией
    toast.classList.add('show');

    // Убираем через 3 секунды с анимацией
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 3000);
}