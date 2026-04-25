import { globalVariables } from "./utils.js";

let isInitialized = false;

function initMusicPlayer() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    const playBtn = document.querySelector(globalVariables.musicPlayerElement.playBtn);
    if (!audio || !playBtn) return;

    if (isInitialized) {
        return;
    }

    isInitialized = true;

    audio.volume = 0.3;
    playBtn.addEventListener('click', toggleMusic);
    audio.addEventListener('play', () => updateMusicPlayerState(true));
    audio.addEventListener('pause', () => updateMusicPlayerState(false));
    audio.addEventListener('ended', () => updateMusicPlayerState(false));

    setTrackInfo('I Like U', 'NIKI', 'media/I_Like_U.mp4', 'media/I_Like_U_Cover.jpg');
    enableAudio();
}

function setTrackInfo(title, artist, audioSrc, coverImage = null) {
    const elements = {
        audio: document.querySelector(globalVariables.musicPlayerElement.audio),
        albumArt: document.querySelector(globalVariables.musicPlayerElement.albumArt),
        trackTitle: document.querySelector(globalVariables.musicPlayerElement.trackTitle),
        trackArtist: document.querySelector(globalVariables.musicPlayerElement.trackArtist)
    };

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

    elements.albumArt.classList.toggle('has-cover', Boolean(coverImage));
}

function toggleMusic() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    if (!audio) return;

    if (audio.paused) {
        audio.play().catch(() => {
            updateMusicPlayerState(false);
        });
    } else {
        audio.pause();
    }
}

function updateMusicPlayerState(isPlaying) {
    const elements = {
        playBtn: document.querySelector(globalVariables.musicPlayerElement.playBtn),
        musicPlayer: document.querySelector(globalVariables.musicPlayerElement.musicPlayer)
    };

    if (isPlaying) {
        elements.playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        elements.musicPlayer.classList.add('playing');
    } else {
        elements.playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        elements.musicPlayer.classList.remove('playing');
    }

    return true;
}

function enableAudio() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    if (!audio) return;

    audio.play()
        .then(() => {
            // play event listener will update visual state.
        })
        .catch(() => {
            updateMusicPlayerState(false);
        });
}

export { initMusicPlayer };