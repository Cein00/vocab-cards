import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. ТЕМА УЖЕ ПРИМЕНЕНА ИНЛАЙН-СКРИПТОМ В HTML, ПРОСТО ОБНОВЛЯЕМ ИКОНКУ
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const updateThemeIcon = (theme) => {
            themeToggle.innerHTML = theme === 'dark' 
                ? '<i class="fa-solid fa-sun"></i>' 
                : '<i class="fa-solid fa-moon"></i>';
        };
        updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
            document.body.className = newTheme;
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // 2. ПРОВЕРКА АВТОРИЗАЦИИ
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
    }

    // 3. ОТОБРАЖЕНИЕ ИМЕНИ ПОЛЬЗОВАТЕЛЯ
    try {
        const user = JSON.parse(userData);
        const userNameElem = document.getElementById('user-name');
        if (userNameElem && user.username) {
            userNameElem.textContent = user.username;
        }
    } catch (e) {
        console.error("Ошибка парсинга данных пользователя", e);
    }

    // 4. ВЫХОД ИЗ АККАУНТА
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // 5. ИНИЦИАЛИЗАЦИЯ ДАННЫХ
    loadFolders();
    initImportText();

    // 6. ОБРАБОТЧИКИ КНОПОК
    const addFolderBtn = document.getElementById('add-folder-btn');
    if (addFolderBtn) {
        addFolderBtn.addEventListener('click', () => openFolderModal());
    }

    const backBtn = document.getElementById('back-to-folders-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            exitStudy();
            closeFolderView();
        });
    }

    const addCardBtn = document.getElementById('add-card-btn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => openCardModal());
    }

    const startBtn = document.getElementById('start-study-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const settings = document.getElementById('study-settings');
            if (settings.classList.contains('hidden')) {
                settings.classList.remove('hidden');
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Начать сейчас';
            } else {
                settings.classList.add('hidden');
                startStudy();
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Старт';
            }
        });
    }
});