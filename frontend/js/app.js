import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal, removeDuplicates } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';

document.addEventListener('DOMContentLoaded', () => {
    // Тема уже применена, просто иконка
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const updateIcon = (t) => {
            themeToggle.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        };
        updateIcon(savedTheme);
        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
            document.documentElement.className = newTheme;
            document.body.className = newTheme;
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

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
    } catch(e) {}

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    loadFolders();
    initImportText();

    // Кнопка «Добавить папку»
    document.getElementById('add-folder-btn').addEventListener('click', () => openFolderModal());

    // Кнопка «Назад» — контекстное поведение
    const backBtn = document.getElementById('back-to-folders-btn');
    backBtn.addEventListener('click', () => {
        const studyView = document.getElementById('study-view');
        // Если обучение активно — возвращаемся к карточкам
        if (!studyView.classList.contains('hidden')) {
            exitStudy();
            document.getElementById('cards-grid').classList.remove('hidden');
            document.getElementById('study-settings').classList.add('hidden');
            // Не закрываем папку
        } else {
            // Обучения нет -> закрываем папку и возвращаемся в список папок
            exitStudy();
            closeFolderView();
        }
    });

    // Обработчики для карточек и старта обучения (как раньше)
    document.getElementById('add-card-btn').addEventListener('click', () => openCardModal());
    document.getElementById('start-study-btn').addEventListener('click', () => {
        const settings = document.getElementById('study-settings');
        if (settings.classList.contains('hidden')) {
            settings.classList.remove('hidden');
            document.getElementById('start-study-btn').innerHTML = '<i class="fa-solid fa-play"></i> Начать сейчас';
        } else {
            settings.classList.add('hidden');
            startStudy();
            document.getElementById('start-study-btn').innerHTML = '<i class="fa-solid fa-play"></i> Старт';
        }
        const deduplicateBtn = document.getElementById('deduplicate-btn');
        if (deduplicateBtn) {
            deduplicateBtn.addEventListener('click', () => {
                removeDuplicates();
            });
        }
    });
    
});