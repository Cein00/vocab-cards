import { speak } from './speech.js';
import { getCards } from './cards.js';
import { currentFolder } from './folders.js';

let studyCards = [];
let currentIndex = 0;
let isFlipped = false;
let shuffle = true;

// Запуск обучения
export function startStudy() {
  const cards = getCards();
  if (cards.length === 0) {
    alert('Нет карточек для изучения');
    return;
  }
  // Настройки
  shuffle = document.getElementById('shuffle-checkbox').checked;
  const showFirst = document.getElementById('show-first-select').value; // 'term' или 'translation'

  // Копируем массив
  studyCards = cards.map(card => ({
    ...card,
    showFront: showFirst === 'term' ? card.term : card.translation,
    showBack: showFirst === 'term' ? card.translation : card.term,
    frontLang: showFirst === 'term' ? currentFolder?.targetLanguage || 'en' : 'ru',
    backLang: showFirst === 'term' ? 'ru' : currentFolder?.targetLanguage || 'en',
  }));

  if (shuffle) {
    shuffleArray(studyCards);
  }

  currentIndex = 0;
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
    document.getElementById('study-progress').textContent = '';
    studyCard.classList.remove('flipped');
    isFlipped = false;
    return;
  }
  
  const card = studyCards[currentIndex];
  
  // 1. Сбрасываем переворот
  studyCard.classList.remove('flipped');
  // 2. Временно отключаем transition
  inner.style.transition = 'none';
  // 3. Обновляем текст
  document.getElementById('study-term-text').textContent = card.showFront;
  document.getElementById('study-translation-text').textContent = card.showBack;
  // 4. Принудительная перерисовка (reflow)
  void inner.offsetHeight;
  // 5. Восстанавливаем transition
  inner.style.transition = '';
  
  isFlipped = false;
  updateProgress();
  speak(card.showFront, card.frontLang);
}

function updateProgress() {
  document.getElementById('study-progress').textContent =
    `Осталось: ${studyCards.length} | Текущая: ${currentIndex + 1}`;
}

// Переворот карточки по клику
document.getElementById('study-card').addEventListener('click', () => {
  if (studyCards.length === 0) return;
  const studyCard = document.getElementById('study-card');
  studyCard.classList.toggle('flipped');
  isFlipped = !isFlipped;
  const card = studyCards[currentIndex];
  if (isFlipped) {
    speak(card.showBack, card.backLang);
  }
});

// Кнопка "Запомнил"
document.getElementById('remembered-btn').addEventListener('click', () => {
  if (studyCards.length === 0) return;
  studyCards.splice(currentIndex, 1);
  if (studyCards.length === 0) {
    showCard(); // покажет сообщение
  } else {
    if (currentIndex >= studyCards.length) currentIndex = studyCards.length - 1;
    showCard();
  }
});

// Кнопка "Не запомнил"
document.getElementById('forgot-btn').addEventListener('click', () => {
  if (studyCards.length === 0) return;
  // Перемещаем в конец
  const card = studyCards.splice(currentIndex, 1)[0];
  studyCards.push(card);
  if (currentIndex >= studyCards.length) currentIndex = 0;
  showCard();
});

// Начать сначала
document.getElementById('restart-study-btn').addEventListener('click', () => {
  startStudy();
});

// Кнопки динамиков (без переворота)
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

// Выход из режима обучения (через кнопку "Назад" или при закрытии папки)
export function exitStudy() {
  document.getElementById('study-view').classList.add('hidden');
  document.getElementById('cards-grid').classList.remove('hidden');
  studyCards = [];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}