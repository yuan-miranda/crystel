import { setupOpeningScreen } from "./opening.js";
import { UI_CONSTANTS, getElements, updateMusicPlayerState } from "./utils.js";

function initializeMusicPlayer() {
    const audio = document.querySelector(UI_CONSTANTS.SELECTORS.audio);
    const playBtn = document.querySelector(UI_CONSTANTS.SELECTORS.playBtn);

    if (!audio || !playBtn) return;

    audio.volume = 0.3;
    playBtn.addEventListener('click', toggleMusic);

    setTrackInfo('I Like U', 'NIKI', 'media/I Like U.mp4', 'media/I_Like_U_Cover.jpg');
}

function setTrackInfo(title, artist, audioSrc, coverImage = null) {
    const elements = getElements({
        trackTitle: UI_CONSTANTS.SELECTORS.trackTitle,
        trackArtist: UI_CONSTANTS.SELECTORS.trackArtist,
        albumArt: UI_CONSTANTS.SELECTORS.albumArt,
        audio: UI_CONSTANTS.SELECTORS.audio
    });

    if (!Object.values(elements).every(el => el)) return;

    elements.trackTitle.textContent = title;
    elements.trackArtist.textContent = artist;

    const source = elements.audio.querySelector('source');
    if (source) {
        source.src = audioSrc;
        elements.audio.load();
    }

    elements.albumArt.innerHTML = coverImage
        ? `<img src="${coverImage}" alt="Album Cover for ${title}">`
        : '♪';
}

function toggleMusic() {
    const audio = document.querySelector(UI_CONSTANTS.SELECTORS.audio);

    if (!audio) return;

    const isPlaying = !audio.paused;

    if (isPlaying) {
        audio.pause();
        updateMusicPlayerState(false);
    } else {
        audio.play().catch(console.error);
        updateMusicPlayerState(true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMusicPlayer();
    setupOpeningScreen();
});