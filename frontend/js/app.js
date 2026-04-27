import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal, removeDuplicates } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';
import { apiRequest } from './api.js';

async function loadUserSettings() {
    try {
      const settings = await apiRequest('/user/settings');
        window.appSettings = settings;
    } catch (err) {
        console.warn('Настройки не загружены, используются значения по умолчанию', err);
        window.appSettings = { speechEnabled: false, nativeLanguage: 'ru' };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Тема
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const updateThemeIcon = (t) => {
        themeToggle.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('pointerup', (e) => {
        e.preventDefault();
        const current = document.body.classList.contains('light') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.className = next;
        document.body.className = next;
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    // Авторизация
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }
    try {
        const user = JSON.parse(userData);
        document.getElementById('user-name').textContent = user.username || 'Пользователь';
    } catch (e) {}

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    loadFolders();
    initImportText();

    document.getElementById('add-folder-btn').addEventListener('click', () => openFolderModal());

    // Кнопка «Назад»
    document.getElementById('back-to-folders-btn').addEventListener('click', () => {
        const studyView = document.getElementById('study-view');
        if (!studyView.classList.contains('hidden')) {
            exitStudy();
        } else {
            closeFolderView();
        }
    });

    // Кнопки действий
    document.getElementById('add-card-btn').addEventListener('click', () => openCardModal());

    // Старт обучения — сразу
    document.getElementById('start-study-btn').addEventListener('click', () => {
        startStudy();
    });

    document.getElementById('deduplicate-btn').addEventListener('click', () => {
        removeDuplicates();
    });
});