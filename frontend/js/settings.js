import { apiRequest } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');
    const speechToggle = document.getElementById('speech-toggle');
    const nativeLanguage = document.getElementById('native-language');
    const defaultFolderLang = document.getElementById('default-folder-language');
    const messageEl = document.getElementById('settings-message');

    // Загружаем текущие настройки с сервера
    async function loadSettings() {
        try {
            const data = await apiRequest('/user/settings');
            window.appSettings = data;
            localStorage.setItem('appSettings', JSON.stringify(data));
            if (data) {
                speechToggle.checked = !!data.speechEnabled;
                nativeLanguage.value = data.nativeLanguage || 'ru';
                defaultFolderLang.value = data.defaultFolderLanguage || 'en';
            }
        } catch (err) {
            console.error('Ошибка загрузки настроек:', err);
            messageEl.textContent = 'Не удалось загрузить настройки. Попробуйте позже.';
        }
    }

    loadSettings();

    // Сохраняем настройки
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            speechEnabled: speechToggle.checked,
            nativeLanguage: nativeLanguage.value,
            defaultFolderLanguage: defaultFolderLang.value
        };

        try {
            await apiRequest('/user/settings', 'PUT', payload);
            // Обновим глобальную переменную, если страница index открыта в другой вкладке – не критично,
            // при следующей загрузке index свежие настройки подхватятся.
            if (window.opener && window.opener.appSettings) {
                window.opener.appSettings = data;
            }
            messageEl.textContent = '✅ Настройки сохранены';
            messageEl.style.color = 'var(--accent)';
        } catch (err) {
            messageEl.textContent = '❌ Ошибка сохранения: ' + err.message;
            messageEl.style.color = '#ff4d6a';
        }
    });
});