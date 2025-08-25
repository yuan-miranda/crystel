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
    openingScreen.innerHTML = `
        <div class="opening-content">
            <h1 class="opening-title" id="openingTitle">${messages[0]}</h1>
            <p class="click-instruction">Click anywhere</p>
        </div>
    `;
}

function eventListeners() {
    document.getElementById('openingScreen').addEventListener('click', handleClick);
}

function handleClick() {
    if (isCooldown) return;

    isCooldown = true;
    clickCount++;

    updateOpeningMessage();

    if (clickCount >= totalClicksNeeded) {
        closeOpening();
    } else {
        // set cooldown for clicks
        setTimeout(() => {
            isCooldown = false;
        }, 500);
    }
}

function updateOpeningMessage() {
    const titleElement = document.getElementById('openingTitle');
    if (!titleElement) return;

    if (clickCount < totalClicksNeeded) {
        titleElement.textContent = messages[clickCount] || messages[messages.length - 1];
    } else {
        titleElement.textContent = "There we go!! 🎉";
        initMusicPlayer();
    }
}

function closeOpening() {
    setTimeout(() => {
        document.getElementById('openingScreen').classList.add('fade-out');
        document.querySelector('.content').style.display = 'block';
        document.querySelector('.music-player').style.display = 'flex';
        document.querySelector('.footer').style.display = 'flex';
    }, 1000);
}


function initOpeningScreen() {
    createOpeningScreen();
    eventListeners();
}

export { initOpeningScreen };