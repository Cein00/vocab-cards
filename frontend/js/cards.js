import { apiRequest } from './api.js';
import { speak } from './speech.js';
import { currentFolder } from './folders.js';
import { showModal } from './modal.js';

let cards = [];



export async function loadCards(folderId) {
    try {
        cards = await apiRequest(`/cards?folderId=${folderId}`);
        renderCards(cards);
        window.updateCardCount?.(cards.length);
    } catch (err) {
        console.error('Ошибка загрузки карточек:', err);
    }
}

function renderCards(cardsArray) {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';
    if (!cardsArray || cardsArray.length === 0) {
        grid.innerHTML = '<p>Нет карточек. Создайте или импортируйте.</p>';
        window.updateCardCount?.(0);
        return;
    }

    const fragment = document.createDocumentFragment();
    cardsArray.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div class="card-term">${escapeHtml(card.term)}</div>
            <div class="card-translation">${escapeHtml(card.translation)}</div>
            <div class="card-actions">
                <i class="fa-solid fa-volume-high speak-term" data-text="${escapeHtml(card.term)}" title="Озвучить"></i>
                <i class="fa-solid fa-pen-to-square edit-card" data-id="${card._id}" title="Редактировать"></i>
                <i class="fa-solid fa-trash delete-card" data-id="${card._id}" title="Удалить"></i>
            </div>
        `;
        fragment.appendChild(div);
    });
    grid.appendChild(fragment);
    window.updateCardCount?.(cardsArray.length);

    // Делегирование событий
    grid.onclick = async (e) => {
        const target = e.target;
        if (target.classList.contains('speak-term')) {
            e.stopPropagation();
            const text = target.dataset.text;
            const lang = currentFolder?.targetLanguage || 'en';
            speak(text, lang);
            return;
        }
        if (target.classList.contains('edit-card')) {
            e.stopPropagation();
            const card = cards.find(c => c._id === target.dataset.id);
            if (card) openCardModal(card);
            return;
        }
        if (target.classList.contains('delete-card')) {
            e.stopPropagation();
            const confirmed = await showModal(
                'Удаление карточки',
                'Вы уверены, что хотите удалить эту карточку?',
                true
            );
            if (!confirmed) return;
            try {
                await apiRequest(`/cards/${target.dataset.id}`, 'DELETE');
                loadCards(currentFolder._id);
            } catch (err) {
                showModal('Ошибка', 'Не удалось удалить карточку');
            }
            return;
        }
    };
}

// Модальное окно карточки
const cardModal = document.getElementById('card-modal');
const cardForm = document.getElementById('card-form');
const cardIdInput = document.getElementById('card-id');
const termInput = document.getElementById('card-term');
const translationInput = document.getElementById('card-translation');

export function openCardModal(card = null) {
    if (card) {
        document.getElementById('modal-title').textContent = 'Редактировать карточку';
        cardIdInput.value = card._id;
        termInput.value = card.term;
        translationInput.value = card.translation;
    } else {
        document.getElementById('modal-title').textContent = 'Новая карточка';
        cardIdInput.value = '';
        termInput.value = '';
        translationInput.value = '';
    }
    cardModal.classList.remove('hidden');
}

cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentFolder) {
        showModal('Ошибка', 'Папка не выбрана');
        return;
    }
    const id = cardIdInput.value;
    const data = {
        folderId: currentFolder._id,
        term: termInput.value,
        translation: translationInput.value,
    };
    try {
        if (id) {
            await apiRequest(`/cards/${id}`, 'PUT', data);
        } else {
            await apiRequest('/cards', 'POST', data);
        }
        cardModal.classList.add('hidden');
        loadCards(currentFolder._id);
        showModal('Готово', 'Карточка сохранена');
    } catch (err) {
        showModal('Ошибка', err.message);
    }
});

document.querySelector('#card-modal .close-modal').addEventListener('click', () => {
    cardModal.classList.add('hidden');
});

export function resetCardView() {
    cards = [];
    document.getElementById('cards-grid').innerHTML = '';
    window.updateCardCount?.(0);
}

export function getCards() {
    return cards;
}

// Удаление дубликатов
export async function removeDuplicates() {
    if (!currentFolder) {
        showModal('Ошибка', 'Сначала откройте папку');
        return;
    }
    const cards = getCards();
    if (cards.length === 0) {
        showModal('Дубликаты', 'Дубликаты не найдены');
        return;
    }

    const seen = new Map();
    const duplicates = [];
    cards.forEach(card => {
        const key = `${card.term.trim().toLowerCase()}|${card.translation.trim().toLowerCase()}`;
        if (seen.has(key)) {
            duplicates.push({ id: card._id, term: card.term, translation: card.translation });
        } else {
            seen.set(key, card._id);
        }
    });

    if (duplicates.length === 0) {
        showModal('Дубликаты', 'Дубликаты не найдены');
        return;
    }

    const confirmed = await showModal(
        'Удаление дубликатов',
        `Найдено ${duplicates.length} дубликат(ов). Удалить их, оставив по одному слову?`,
        true
    );
    if (!confirmed) return;

    try {
        for (const dup of duplicates) {
            await apiRequest(`/cards/${dup.id}`, 'DELETE');
        }
        await loadCards(currentFolder._id);
        showModal('Готово', `✅ Удалено ${duplicates.length} дубликатов`);
    } catch (err) {
        showModal('Ошибка', 'Ошибка при удалении дубликатов: ' + err.message);
        console.error(err);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

