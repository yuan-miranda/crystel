const UI_CONSTANTS = {
    SELECTORS: {
        audio: '#backgroundMusic',
        playBtn: '#playBtn',
        musicPlayer: '.music-player',
        albumArt: '.album-art',
        trackTitle: '.track-title',
        trackArtist: '.track-artist'
    },

    ICONS: {
        play: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
    }
};

function getElements(selectorMap) {
    const elements = {};
    for (const [key, selector] of Object.entries(selectorMap)) {
        elements[key] = document.querySelector(selector);
    }
    return elements;
}

function updateMusicPlayerState(isPlaying) {
    const elements = getElements(UI_CONSTANTS.SELECTORS);
    if (!Object.values(elements).every(el => el)) return false;

    if (isPlaying) {
        elements.playBtn.innerHTML = UI_CONSTANTS.ICONS.pause;
        elements.musicPlayer.classList.add('playing');
        elements.albumArt.classList.add('playing');
    } else {
        elements.playBtn.innerHTML = UI_CONSTANTS.ICONS.play;
        elements.musicPlayer.classList.remove('playing');
        elements.albumArt.classList.remove('playing');
    }

    return true;
}

export { UI_CONSTANTS, getElements, updateMusicPlayerState };