import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal, removeDuplicates } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';
import { apiRequest } from './api.js';

/**
 * Загружает настройки пользователя с сервера и сохраняет в window.appSettings.
 * При ошибке устанавливает значения по умолчанию.
 */
async function loadUserSettings() {
    try {
        const settings = await apiRequest('/user/settings');
        window.appSettings = {
            speechEnabled: settings.speechEnabled ?? false,
            nativeLanguage: settings.nativeLanguage ?? 'ru',
            defaultFolderLanguage: settings.defaultFolderLanguage ?? 'en'
        };
        console.log('Настройки загружены:', window.appSettings);
    } catch (err) {
        console.warn('Не удалось загрузить настройки с сервера, используются значения по умолчанию', err);
        window.appSettings = {
            speechEnabled: false,
            nativeLanguage: 'ru',
            defaultFolderLanguage: 'en'
        };
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Загружаем настройки пользователя (важно для всего приложения)
    await loadUserSettings();

    // 2. Тема оформления
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const updateThemeIcon = (t) => {
        themeToggle.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
    updateThemeIcon(savedTheme);
    document.documentElement.className = savedTheme;
    document.body.className = savedTheme;

    themeToggle.addEventListener('pointerup', (e) => {
        e.preventDefault();
        const current = document.body.classList.contains('light') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.className = next;
        document.body.className = next;
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    // 3. Проверка авторизации
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
    } catch (e) {
        console.error('Ошибка парсинга user data', e);
    }

    // 4. Обработчик выхода
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // 5. Загружаем список папок и инициализируем импорт
    loadFolders();
    initImportText();

    // 6. Кнопка добавления папки
    document.getElementById('add-folder-btn').addEventListener('click', () => openFolderModal());

    // 7. Кнопка «Назад» из папки / выход из режима обучения
    document.getElementById('back-to-folders-btn').addEventListener('click', () => {
        const studyView = document.getElementById('study-view');
        if (!studyView.classList.contains('hidden')) {
            exitStudy();
        } else {
            closeFolderView();
        }
    });

    // 8. Кнопка добавления карточки
    document.getElementById('add-card-btn').addEventListener('click', () => openCardModal());

    // 9. Кнопка начала обучения
    document.getElementById('start-study-btn').addEventListener('click', () => {
        startStudy();
    });

    // 10. Кнопка удаления дубликатов
    document.getElementById('deduplicate-btn').addEventListener('click', () => {
        removeDuplicates();
    });
});