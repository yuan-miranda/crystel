import { globalVariables } from "./utils.js";

function initMusicPlayer() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    const playBtn = document.querySelector(globalVariables.musicPlayerElement.playBtn);
    if (!audio || !playBtn) return;

    audio.volume = 0.3;
    playBtn.addEventListener('click', toggleMusic);
    setTrackInfo('I Like U', 'NIKI', 'media/I Like U.mp4', 'media/I_Like_U_Cover.jpg');
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
}

function toggleMusic() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    if (!audio) return;

    if (audio.paused) {
        audio.play().catch(console.error);
        updateMusicPlayerState(true);
    } else {
        audio.pause();
        updateMusicPlayerState(false);
    }
}

function updateMusicPlayerState(isPlaying) {
    const elements = {
        playBtn: document.querySelector(globalVariables.musicPlayerElement.playBtn),
        musicPlayer: document.querySelector(globalVariables.musicPlayerElement.musicPlayer),
        albumArt: document.querySelector(globalVariables.musicPlayerElement.albumArt)
    };
    
    if (isPlaying) {
        elements.playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        elements.musicPlayer.classList.add('playing');
        elements.albumArt.classList.add('playing');
    } else {
        elements.playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        elements.musicPlayer.classList.remove('playing');
        elements.albumArt.classList.remove('playing');
    }

    return true;
}

function enableAudio() {
    const audio = document.querySelector(globalVariables.musicPlayerElement.audio);
    if (!audio) return;

    audio.play()
        .then(() => updateMusicPlayerState(true))
        .catch(() => {
            // user denied autoplay
        });
}

export { initMusicPlayer };