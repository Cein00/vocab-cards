import { speak } from './speech.js';
import { getCards } from './cards.js';
import { currentFolder } from './folders.js';
import { showModal } from './modal.js';

let studyCards = [];
let currentIndex = 0;
let isFlipped = false;
let shuffle = true;

// Инициализация обработчиков (выполняется один раз при загрузке модуля)
document.addEventListener('DOMContentLoaded', () => {
    const studyCardEl = document.getElementById('study-card');
    if (studyCardEl) {
        studyCardEl.addEventListener('click', () => {
            if (studyCards.length === 0) return;
            studyCardEl.classList.toggle('flipped');
            isFlipped = !isFlipped;
            const card = studyCards[currentIndex];
            if (isFlipped) speak(card.showBack, card.backLang);
        });
    }

    const rememberedBtn = document.getElementById('remembered-btn');
    if (rememberedBtn) {
        rememberedBtn.addEventListener('click', () => {
            if (studyCards.length === 0) return;
            studyCards.splice(currentIndex, 1);
            if (studyCards.length === 0) {
                showCard();
            } else {
                if (currentIndex >= studyCards.length) currentIndex = studyCards.length - 1;
                showCard();
            }
        });
    }

    const forgotBtn = document.getElementById('forgot-btn');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', () => {
            if (studyCards.length === 0) return;
            const card = studyCards.splice(currentIndex, 1)[0];
            studyCards.push(card);
            if (currentIndex >= studyCards.length) currentIndex = 0;
            showCard();
        });
    }

    const speakFront = document.getElementById('speak-current');
    if (speakFront) {
        speakFront.addEventListener('click', (e) => {
            e.stopPropagation();
            if (studyCards.length === 0) return;
            const card = studyCards[currentIndex];
            speak(card.showFront, card.frontLang);
        });
    }

    const speakBack = document.getElementById('speak-translation-current');
    if (speakBack) {
        speakBack.addEventListener('click', (e) => {
            e.stopPropagation();
            if (studyCards.length === 0) return;
            const card = studyCards[currentIndex];
            speak(card.showBack, card.backLang);
        });
    }

    // Кнопка «Начать сначала» (в верхней панели обучения)
    const restartTopBtn = document.getElementById('restart-study-top-btn');
    if (restartTopBtn) {
        restartTopBtn.addEventListener('click', () => {
            startStudy();
        });
    }
});

export function startStudy() {
    const cards = getCards();
    if (cards.length === 0) {
        showModal('Обучение', 'Нет карточек для изучения');
        return;
    }

    shuffle = document.getElementById('shuffle-checkbox')?.checked ?? true;
    const showFirst = document.getElementById('show-first-select')?.value ?? 'term';

    studyCards = cards.map(card => ({
        ...card,
        showFront: showFirst === 'term' ? card.term : card.translation,
        showBack: showFirst === 'term' ? card.translation : card.term,
        frontLang: showFirst === 'term' ? currentFolder?.targetLanguage || 'en' : 'ru',
        backLang: showFirst === 'term' ? 'ru' : currentFolder?.targetLanguage || 'en',
    }));

    if (shuffle) shuffleArray(studyCards);
    currentIndex = 0;

    // Переключение панелей
    const actionsBar = document.getElementById('folder-actions-bar');
    const studyBar = document.getElementById('study-actions-bar');
    if (actionsBar) actionsBar.classList.add('hidden');
    if (studyBar) studyBar.classList.remove('hidden');

    document.getElementById('cards-grid').classList.add('hidden');
    document.getElementById('study-view').classList.remove('hidden');

    const settings = document.getElementById('study-settings');
    if (settings) settings.classList.add('hidden');

    showCard();
}

function showCard() {
    const studyCard = document.getElementById('study-card');
    const inner = studyCard?.querySelector('.study-card-inner');

    if (studyCards.length === 0) {
        const termText = document.getElementById('study-term-text');
        const transText = document.getElementById('study-translation-text');
        if (termText) termText.textContent = 'Всё выучено!';
        if (transText) transText.textContent = '';
        updateStudyInfo(0);
        if (studyCard) studyCard.classList.remove('flipped');
        isFlipped = false;
        return;
    }

    const card = studyCards[currentIndex];
    if (studyCard) studyCard.classList.remove('flipped');
    if (inner) {
        inner.style.transition = 'none';
    }
    const termText = document.getElementById('study-term-text');
    const transText = document.getElementById('study-translation-text');
    if (termText) termText.textContent = card.showFront;
    if (transText) transText.textContent = card.showBack;
    if (inner) {
        void inner.offsetHeight; // reflow
        inner.style.transition = '';
    }
    isFlipped = false;
    updateStudyInfo(studyCards.length);
    speak(card.showFront, card.frontLang);
}

function updateStudyInfo(remaining) {
    const progressTop = document.getElementById('study-progress-top');
    if (progressTop) progressTop.textContent = `Осталось: ${remaining}`;
}

export function exitStudy() {
    const studyView = document.getElementById('study-view');
    const cardsGrid = document.getElementById('cards-grid');
    const actionsBar = document.getElementById('folder-actions-bar');
    const studyBar = document.getElementById('study-actions-bar');

    if (studyView) studyView.classList.add('hidden');
    if (cardsGrid) cardsGrid.classList.remove('hidden');
    if (actionsBar) actionsBar.classList.remove('hidden');
    if (studyBar) studyBar.classList.add('hidden');

    studyCards = [];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}