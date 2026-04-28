import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal, removeDuplicates } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';
import { apiRequest } from './api.js';

/**
 * Загружает настройки пользователя с сервера.
 * Применяет тему и сохраняет все настройки в window.appSettings.
 */
async function loadUserSettings() {
    try {
        const settings = await apiRequest('/user/settings');
        window.appSettings = {
            speechEnabled: settings.speechEnabled ?? false,
            nativeLanguage: settings.nativeLanguage ?? 'ru',
            defaultFolderLanguage: settings.defaultFolderLanguage ?? 'en',
            theme: settings.theme ?? 'light'
        };
        // Применяем тему из настроек
        const theme = window.appSettings.theme;
        document.documentElement.className = theme;
        document.body.className = theme;
        localStorage.setItem('theme', theme); // для быстрой загрузки в следующий раз
        console.log('Настройки загружены:', window.appSettings);
    } catch (err) {
        console.warn('Не удалось загрузить настройки с сервера, используются значения по умолчанию', err);
        window.appSettings = {
            speechEnabled: false,
            nativeLanguage: 'ru',
            defaultFolderLanguage: 'en',
            theme: 'light'
        };
        document.documentElement.className = 'light';
        document.body.className = 'light';
        localStorage.setItem('theme', 'light');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Загружаем настройки (включая тему)
    await loadUserSettings();

    // 2. Кнопка переключения темы (теперь синхронизируется с сервером)
    const themeToggle = document.getElementById('theme-toggle');
    const updateThemeIcon = (theme) => {
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
    updateThemeIcon(window.appSettings.theme);

    themeToggle.addEventListener('pointerup', async (e) => {
        e.preventDefault();
        const newTheme = window.appSettings.theme === 'light' ? 'dark' : 'light';
        
        // Меняем тему визуально сразу
        document.documentElement.className = newTheme;
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Обновляем глобальный объект
        window.appSettings.theme = newTheme;
        
        // Отправляем на сервер
        try {
            await apiRequest('/user/settings', 'PUT', { theme: newTheme });
            console.log('Тема сохранена на сервере');
        } catch (err) {
            console.warn('Не удалось сохранить тему на сервере', err);
        }
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

    // 4. Выход
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // 5. Загрузка папок и импорт
    loadFolders();
    initImportText();

    // 6. Кнопка добавления папки
    document.getElementById('add-folder-btn').addEventListener('click', () => openFolderModal());

    // 7. Назад / выход из обучения
    document.getElementById('back-to-folders-btn').addEventListener('click', () => {
        const studyView = document.getElementById('study-view');
        if (!studyView.classList.contains('hidden')) {
            exitStudy();
        } else {
            closeFolderView();
        }
    });

    // 8. Добавление карточки
    document.getElementById('add-card-btn').addEventListener('click', () => openCardModal());

    // 9. Старт обучения
    document.getElementById('start-study-btn').addEventListener('click', () => {
        startStudy();
    });

    // 10. Удаление дубликатов
    document.getElementById('deduplicate-btn').addEventListener('click', () => {
        removeDuplicates();
    });
});