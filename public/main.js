const selectors = {
    audio: '#backgroundMusic',
    playBtn: '#playBtn',
    musicPlayer: '.music-player',
    albumArt: '.album-art',
    trackTitle: '.track-title',
    trackArtist: '.track-artist'
};

const icons = {
    play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
};

document.addEventListener('DOMContentLoaded', initializeMusicPlayer);

function initializeMusicPlayer() {
    const audio = document.querySelector(selectors.audio);
    const playBtn = document.querySelector(selectors.playBtn);

    if (!audio || !playBtn) return;

    audio.volume = 0.3;
    playBtn.addEventListener('click', toggleMusic);

    setTrackInfo('I Like U', 'NIKI', 'I Like U.mp4', 'I_Like_U_Cover.jpg');
}

function setTrackInfo(title, artist, audioSrc, coverImage = null) {
    const elements = {
        trackTitle: document.querySelector(selectors.trackTitle),
        trackArtist: document.querySelector(selectors.trackArtist),
        albumArt: document.querySelector(selectors.albumArt),
        audio: document.querySelector(selectors.audio)
    };

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
    const elements = {
        audio: document.querySelector(selectors.audio),
        playBtn: document.querySelector(selectors.playBtn),
        musicPlayer: document.querySelector(selectors.musicPlayer),
        albumArt: document.querySelector(selectors.albumArt)
    };

    if (!Object.values(elements).every(el => el)) return;

    const isPlaying = !elements.audio.paused;

    if (isPlaying) {
        elements.audio.pause();
        elements.playBtn.innerHTML = icons.play;
        elements.musicPlayer.classList.remove('playing');
        elements.albumArt.classList.remove('playing');
        elements.playBtn.setAttribute('aria-label', 'Play music');
    } else {
        elements.audio.play().catch(console.error);
        elements.playBtn.innerHTML = icons.pause;
        elements.musicPlayer.classList.add('playing');
        elements.albumArt.classList.add('playing');
        elements.playBtn.setAttribute('aria-label', 'Pause music');
    }
}