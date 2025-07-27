import { UI_CONSTANTS, updateMusicPlayerState } from "./utils.js";

let clickCount = 0;
const totalClicksNeeded = 7;
let isCooldown = false;

const messages = [
    "Hey Crystel ❤️",
    "loww there",
    "Keep clicking HAHAHA",
    "Oi almost there na!",
    "konti nalang",
    "Last na to!!",
    "Ready ka na ba bebii??"
];

function createOpeningScreen() {
    const openingHTML = `
        <div class="opening-screen" id="openingScreen">
            <div class="opening-content">
                <h1 class="opening-title" id="openingTitle">${messages[0]}</h1>
                <p class="opening-message" id="openingMessage">
                    I made something for you<br>
                    Click ${totalClicksNeeded} times to see it
                </p>
                <p class="click-instruction">Click anywhere</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', openingHTML);
}

function eventListeners() {
    document.getElementById('openingScreen').addEventListener('click', openingClicks);
}

function openingClicks() {
    if (isCooldown) return;

    isCooldown = true;
    clickCount++;

    enableOpeningAudio();
    updateOpeningMessage();

    if (clickCount >= totalClicksNeeded) {
        completeOpening();
    } else {
        setTimeout(() => {
            isCooldown = false;
        }, 500);
    }
}

function updateOpeningMessage() {
    const titleElement = document.getElementById('openingTitle');
    const messageElement = document.getElementById('openingMessage');
    if (!titleElement || !messageElement) return;

    if (clickCount < totalClicksNeeded) {
        titleElement.textContent = messages[clickCount] || messages[messages.length - 1];

        if (clickCount === Math.floor(totalClicksNeeded / 2)) {
            messageElement.innerHTML = 'Tuloy mo lang';
        } else if (clickCount === totalClicksNeeded - 1) {
            messageElement.innerHTML = 'One more!!';
        }
    } else {
        titleElement.textContent = "There we go!! 🎉";
        messageElement.innerHTML = 'Finally!!! HAHAHA 💕';
    }
}

function completeOpening() {
    setTimeout(() => {
        document.getElementById('openingScreen').classList.add('fade-out');
        document.querySelector('.content').style.display = 'block';
        document.querySelector('.music-player').style.display = 'flex';
        document.querySelector('.footer').style.display = 'flex';
    }, 1000);
}

function enableOpeningAudio() {
    const audio = document.querySelector(UI_CONSTANTS.SELECTORS.audio);
    if (audio) {
        audio.play()
            .then(() => updateMusicPlayerState(true))
            .catch(() => {
                // user denied autoplay
            });
    }
}

function setupOpeningScreen() {
    createOpeningScreen();
    eventListeners();
}

export { setupOpeningScreen };