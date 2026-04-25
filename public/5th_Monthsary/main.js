import { initOpeningScreen } from './openingScreen.js';

function initReasonChips() {
    const chips = Array.from(document.querySelectorAll('.reason-chip'));
    const output = document.getElementById('reasonOutput');
    if (!chips.length || !output) return;

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            chips.forEach((node) => node.classList.remove('is-active'));
            chip.classList.add('is-active');

            output.classList.remove('is-updated');
            void output.offsetWidth;
            output.textContent = chip.dataset.reason || 'You are my favorite reason.';
            output.classList.add('is-updated');
        });
    });
}

function initCelebrateButton() {
    const button = document.getElementById('celebrateBtn');
    if (!button) return;

    button.addEventListener('click', () => {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 170,
                spread: 88,
                origin: { y: 0.65 }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initOpeningScreen();
    initReasonChips();
    initCelebrateButton();
});
