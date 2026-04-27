import { speak } from './speech.js';
import { getCards } from './cards.js';
import { currentFolder } from './folders.js';
import { showModal } from './modal.js';

let studyCards = [];
let currentIndex = 0;
let isFlipped = false;
let shuffle = true;

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
    document.getElementById('folder-actions-bar').classList.add('hidden');
    document.getElementById('study-actions-bar').classList.remove('hidden');

    document.getElementById('cards-grid').classList.add('hidden');
    document.getElementById('study-view').classList.remove('hidden');
    document.getElementById('study-settings').classList.add('hidden');

    showCard();
}

function showCard() {
    const studyCard = document.getElementById('study-card');
    const inner = studyCard.querySelector('.study-card-inner');

    if (studyCards.length === 0) {
        document.getElementById('study-term-text').textContent = 'Всё выучено!';
        document.getElementById('study-translation-text').textContent = '';
        updateStudyInfo(0);
        studyCard.classList.remove('flipped');
        isFlipped = false;
        return;
    }

    const card = studyCards[currentIndex];
    studyCard.classList.remove('flipped');
    inner.style.transition = 'none';
    document.getElementById('study-term-text').textContent = card.showFront;
    document.getElementById('study-translation-text').textContent = card.showBack;
    void inner.offsetHeight;
    inner.style.transition = '';
    isFlipped = false;
    updateStudyInfo(studyCards.length);
    speak(card.showFront, card.frontLang);
}

function updateStudyInfo(remaining) {
    const progressTop = document.getElementById('study-progress-top');
    if (progressTop) progressTop.textContent = `Осталось: ${remaining}`;
    const progressBottom = document.getElementById('study-progress');
    if (progressBottom) progressBottom.textContent = `Осталось: ${remaining} | Текущая: ${currentIndex + 1}`;
}

// Обработчики кнопок (основные)
document.getElementById('study-card').addEventListener('click', () => {
    if (studyCards.length === 0) return;
    const studyCard = document.getElementById('study-card');
    studyCard.classList.toggle('flipped');
    isFlipped = !isFlipped;
    const card = studyCards[currentIndex];
    if (isFlipped) speak(card.showBack, card.backLang);
});

document.getElementById('remembered-btn').addEventListener('click', () => {
    if (studyCards.length === 0) return;
    studyCards.splice(currentIndex, 1);
    if (studyCards.length === 0) {
        showCard();
    } else {
        if (currentIndex >= studyCards.length) currentIndex = studyCards.length - 1;
        showCard();
    }
});

document.getElementById('forgot-btn').addEventListener('click', () => {
    if (studyCards.length === 0) return;
    const card = studyCards.splice(currentIndex, 1)[0];
    studyCards.push(card);
    if (currentIndex >= studyCards.length) currentIndex = 0;
    showCard();
});

// Начать сначала (кнопка и в верхней панели, и в нижней)
function restartStudy() { startStudy(); }
document.getElementById('restart-study-btn').addEventListener('click', restartStudy);
document.getElementById('restart-study-top-btn').addEventListener('click', restartStudy);

document.getElementById('speak-current').addEventListener('click', (e) => {
    e.stopPropagation();
    if (studyCards.length === 0) return;
    const card = studyCards[currentIndex];
    speak(card.showFront, card.frontLang);
});

document.getElementById('speak-translation-current').addEventListener('click', (e) => {
    e.stopPropagation();
    if (studyCards.length === 0) return;
    const card = studyCards[currentIndex];
    speak(card.showBack, card.backLang);
});

export function exitStudy() {
    document.getElementById('study-view').classList.add('hidden');
    document.getElementById('cards-grid').classList.remove('hidden');
    document.getElementById('folder-actions-bar').classList.remove('hidden');
    document.getElementById('study-actions-bar').classList.add('hidden');
    studyCards = [];
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}