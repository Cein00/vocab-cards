/**
 * Показывает кастомное модальное окно.
 * @param {string} title - заголовок
 * @param {string} message - текст сообщения (может содержать HTML)
 * @param {function} [onConfirm] - если передан, показываются кнопки «ОК» и «Отмена», иначе только «ОК»
 * @returns {Promise<boolean>} true – если пользователь нажал «ОК» (или закрыл окно), false – «Отмена»
 */
export function showModal(title, message, onConfirm) {
    return new Promise((resolve) => {
        const existing = document.querySelector('.custom-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <span class="custom-modal-close">&times;</span>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="custom-modal-buttons"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = (result) => {
            modal.remove();
            resolve(result);
        };

        const btnContainer = modal.querySelector('.custom-modal-buttons');
        if (onConfirm) {
            const okBtn = document.createElement('button');
            okBtn.textContent = 'ОК';
            okBtn.className = 'modal-ok-btn';
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Отмена';
            cancelBtn.className = 'modal-cancel-btn';
            btnContainer.appendChild(okBtn);
            btnContainer.appendChild(cancelBtn);
            okBtn.addEventListener('click', () => closeModal(true));
            cancelBtn.addEventListener('click', () => closeModal(false));
        } else {
            const okBtn = document.createElement('button');
            okBtn.textContent = 'ОК';
            okBtn.className = 'modal-ok-btn';
            btnContainer.appendChild(okBtn);
            okBtn.addEventListener('click', () => closeModal(true));
        }

        modal.querySelector('.custom-modal-close').addEventListener('click', () => closeModal(false));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(false);
        });
    });
}