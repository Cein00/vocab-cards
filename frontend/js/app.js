import { loadFolders, openFolderModal, closeFolderView } from './folders.js';
import { openCardModal, removeDuplicates } from './cards.js';
import { startStudy, exitStudy } from './study.js';
import { initImportText } from './import-text.js';
import { showModal } from './modal.js'; // новый модуль модалки

document.addEventListener('DOMContentLoaded', () => {
    // ========== ТЕМА ==========
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    const updateThemeIcon = (t) => {
        themeToggle.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    };
    updateThemeIcon(savedTheme);

    // pointerup – гарантирует одно срабатывание на мобильных
    themeToggle.addEventListener('pointerup', (e) => {
        e.preventDefault();               // исключаем двойные срабатывания
        const current = document.body.classList.contains('light') ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.className = next;
        document.body.className = next;
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    // ========== АВТОРИЗАЦИЯ ==========
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

    // ========== ПАПКИ ==========
    loadFolders();
    initImportText();

    document.getElementById('add-folder-btn').addEventListener('click', () => openFolderModal());

    // Кнопка «Назад» (контекстное поведение)
    const backBtn = document.getElementById('back-to-folders-btn');
    backBtn.addEventListener('click', () => {
        const studyView = document.getElementById('study-view');
        if (!studyView.classList.contains('hidden')) {
            exitStudy();
            document.getElementById('cards-grid').classList.remove('hidden');
            document.getElementById('study-settings').classList.add('hidden');
        } else {
            exitStudy();
            closeFolderView();
        }
    });

    // ========== КАРТОЧКИ И ОБУЧЕНИЕ ==========
    document.getElementById('add-card-btn')?.addEventListener('click', () => openCardModal());

    // Главная кнопка «Старт»
    const startBtn = document.getElementById('start-study-main-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startStudy();
        });
    }

    // Импорт (отдельный обработчик)
    document.getElementById('import-trigger-btn')?.addEventListener('click', () => {
        // показываем модальное окно импорта (оно уже инициализировано)
        document.getElementById('import-text-modal').classList.remove('hidden');
    });

    // Дубликаты – единый слушатель
    const dedupBtn = document.getElementById('deduplicate-btn');
    if (dedupBtn) {
        dedupBtn.addEventListener('click', () => {
            removeDuplicates();
        });
    }

    // Обновить счётчик карточек при загрузке папки (вызов из folders.js)
    window.updateCardCount = (count) => {
        const cnt = document.getElementById('card-count');
        if (cnt) cnt.textContent = `Карточек: ${count}`;
    };
});