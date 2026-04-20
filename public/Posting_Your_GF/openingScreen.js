import { initMusicPlayer } from "./musicPlayer.js";

const messages = [
    "Hey Crystel ❤️",
    "I made something for you.",
    "I know this is sudden",
    "But trust me, you'll love it!",
    "Keep clicking HAHAHA",
    "Konti nalang",
    "Last na to!!",
    "Ready ka na??"
];

const totalClicksNeeded = messages.length;
let clickCount = 0;
let isCooldown = false;

function createOpeningScreen() {
    const openingScreen = document.getElementById('openingScreen');
    if (!openingScreen) return;

    openingScreen.innerHTML = `
        <div class="opening-content">
            <h1 class="opening-title" id="openingTitle">${messages[0]}</h1>
            <p class="click-instruction">Click anywhere</p>
        </div>
    `;
}

function eventListeners() {
    const openingScreen = document.getElementById('openingScreen');
    if (!openingScreen) return;

    openingScreen.addEventListener('click', handleClick);
}

function handleClick() {
    if (isCooldown) return;

    isCooldown = true;
    clickCount++;

    pulseOpeningContent();

    updateOpeningMessage();

    if (clickCount >= totalClicksNeeded) {
        closeOpening();
    } else {
        // Keep transitions readable and prevent accidental double taps.
        setTimeout(() => {
            isCooldown = false;
        }, 500);
    }
}

function updateOpeningMessage() {
    const titleElement = document.getElementById('openingTitle');
    if (!titleElement) return;

    const nextMessage = clickCount < totalClicksNeeded
        ? messages[clickCount] || messages[messages.length - 1]
        : "There we go!! 🎉";

    titleElement.classList.remove('title-swap-in');
    titleElement.classList.add('title-swap-out');

    setTimeout(() => {
        titleElement.textContent = nextMessage;
        titleElement.classList.remove('title-swap-out');
        titleElement.classList.add('title-swap-in');

        if (clickCount >= totalClicksNeeded) {
            initMusicPlayer();
        }
    }, 180);
}

function pulseOpeningContent() {
    const openingContent = document.querySelector('.opening-content');
    if (!openingContent) return;

    openingContent.classList.remove('click-pop');
    // Restart CSS animation on every click.
    void openingContent.offsetWidth;
    openingContent.classList.add('click-pop');
}

function revealMainContent() {
    const content = document.querySelector('.content');
    const musicPlayer = document.querySelector('.music-player');
    const footer = document.querySelector('footer');

    if (!content || !musicPlayer || !footer) return;

    content.style.display = 'flex';
    musicPlayer.style.display = 'flex';
    footer.style.display = 'flex';

    requestAnimationFrame(() => {
        content.classList.add('is-visible');
        musicPlayer.classList.add('entered');
        footer.classList.add('entered');
    });
}

function closeOpening() {
    setTimeout(() => {
        const openingScreen = document.getElementById('openingScreen');
        if (openingScreen) {
            openingScreen.classList.add('fade-out');
        }

        revealMainContent();
    }, 700);
}

function initOpeningScreen() {
    createOpeningScreen();
    eventListeners();
}

export { initOpeningScreen };