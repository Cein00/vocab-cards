import { apiRequest } from './api.js';
import { loadCards } from './cards.js';
import { currentFolder } from './folders.js';
import { showModal } from './modal.js';

export function initImportText() {
    const modal = document.getElementById('import-text-modal');
    const openBtn = document.getElementById('import-trigger-btn'); // новая кнопка
    const closeBtn = modal.querySelector('.close-modal');
    const textarea = document.getElementById('import-textarea');
    const parseBtn = document.getElementById('parse-import-btn');
    const previewContainer = document.getElementById('import-preview-list');
    const confirmBtn = document.getElementById('confirm-import-btn');

    let pairs = [];

    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        textarea.value = '';
        previewContainer.innerHTML = '';
        confirmBtn.disabled = true;
        pairs = [];
    });

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    parseBtn.addEventListener('click', () => {
        const rawText = textarea.value.trim();
        if (!rawText) return;

        const lines = rawText.split(/\n|;/).filter(line => line.trim() !== '');
        pairs = [];
        for (let line of lines) {
            const match = line.match(/^(.*?)\s*[-–—:]\s*(.*)$/);
            if (match) {
                const term = match[1].trim();
                const translation = match[2].trim();
                if (term && translation) {
                    pairs.push({ term, translation });
                }
            }
        }

        if (pairs.length === 0) {
            previewContainer.innerHTML = '<p>Не удалось распознать пары. Формат: слово - перевод (разделители: тире, двоеточие, строки через Enter или ;)</p>';
            confirmBtn.disabled = true;
            return;
        }
        renderPreview(pairs);
        confirmBtn.disabled = false;
    });

    function renderPreview(pairsArray) {
        previewContainer.innerHTML = '';
        if (pairsArray.length > 0) {
            confirmBtn.disabled = false;
            pairsArray.forEach((pair, idx) => {
                const div = document.createElement('div');
                div.className = 'import-pair-item';
                div.innerHTML = `
                    <div class="pair-info">
                        <span class="pair-term">${escapeHtml(pair.term)}</span>
                        <span class="pair-translation">${escapeHtml(pair.translation)}</span>
                    </div>
                    <button class="remove-pair-btn" data-index="${idx}" title="Удалить">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                `;
                previewContainer.appendChild(div);
            });

            previewContainer.querySelectorAll('.remove-pair-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = btn.dataset.index;
                    pairs.splice(index, 1);
                    renderPreview(pairs);
                });
            });
        } else {
            confirmBtn.disabled = true;
        }
    }

    confirmBtn.addEventListener('click', async () => {
        if (!currentFolder) {
            showModal('Ошибка', 'Сначала откройте папку');
            return;
        }
        if (pairs.length === 0) return;

        try {
            let created = 0;
            for (const pair of pairs) {
                await apiRequest('/cards', 'POST', {
                    folderId: currentFolder._id,
                    term: pair.term,
                    translation: pair.translation,
                });
                created++;
            }
            modal.classList.add('hidden');
            await loadCards(currentFolder._id);
            showModal('Импорт завершён', `✅ Добавлено ${created} карточек`);
        } catch (err) {
            showModal('Ошибка', 'Ошибка: ' + err.message);
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}