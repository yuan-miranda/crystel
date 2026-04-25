const messages = [
    { text: 'Hi' },
    { text: 'Nasaan ako??!' },
    { text: 'Ahh eto pala yung-' },
    { text: '5th monthsary entry' },
    { text: 'AHAAHHAHAH' },
    { text: 'Anyways,' },
    { text: 'Might be familiar tong prompt na to' },
    { text: 'Yeah its from the first entry here' },
    { text: 'Wala akong maisip eh :D' },
    { text: 'So just read my monologues!!' },
    { text: 'But first,' },
    {
        text: 'Can you click this button for me?',
        button: {
            text: 'Etooo!',
            onClick: () => {
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 70,
                        spread: 70,
                        origin: { y: 0.72 }
                    });
                }
            }
        }
    },
    { text: 'Ayunn its working' },
    { text: 'So as I was saying,' },
    { text: 'I was thinking of unique ways-' },
    { text: 'To make this entry more interesting' },
    { text: 'So naisip ko why not make it yapteractive?' },
    { text: 'Yung babasahin mo lahat AAHHAHAHAH' },
    { text: 'Going back, its been five months' },
    { text: 'Cant imagine how fast time flies' },
    { text: 'Yeah its been fun~' },
    { text: 'May mga away, bati, and many more LOL' },
    { text: 'Imbis na mag review ako for prelims' },
    { text: 'Ni rrush ko ereng entry na to' },
    { text: 'Haupp daig pa late submissions ko sa ELMS' },
    { text: 'AHAAHHAHAH' },
    { text: 'im soo cooked🔥' },
    {
        text: "Pero kaya this, cu'z ive got you!!",
        effects: ['hearts-background'],
        lockScreen: { enabled: true, duration: 2000 }
    },
    {
        text: 'aluh rizz ∞',
        effects: ['rizz-background', 'rizz-title'],
        lockScreen: { enabled: true, duration: 2000 }
    },
    { text: 'Anyways, I love you!!' },
    { text: 'Thanks for being there for me' },
    {
        text: 'Happy 5th monthsary!',
        button: {
            text: 'Celebrate!',
            onClick: () => {
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 }
                    });
                }
            }
        }
    }
];

const totalClicksNeeded = messages.length;
let clickCount = 0;
let isCooldown = false;
let isFinished = false;

function createOpeningScreen() {
    const openingScreen = document.getElementById('openingScreen');
    if (!openingScreen) return;

    openingScreen.innerHTML = `
        <div class="opening-content">
            <h1 class="opening-title" id="openingTitle">${messages[0].text}</h1>
            <p class="click-instruction" id="openingHint">Click anywhere</p>
        </div>
    `;
}

function eventListeners() {
    const openingScreen = document.getElementById('openingScreen');
    if (!openingScreen) return;

    openingScreen.addEventListener('click', handleClick);
}

function handleClick() {
    if (isCooldown || isFinished) return;
    if (messages[clickCount] && messages[clickCount].button) return;

    advanceToNextMessage();
}

function advanceToNextMessage(force = false) {
    if (isCooldown && !force) return;

    isCooldown = true;
    clickCount++;

    pulseOpeningContent();
    updateOpeningMessage();

    if (clickCount >= totalClicksNeeded) {
        showEnding();
        return;
    }

    setTimeout(() => {
        isCooldown = false;
    }, 500);
}

function pulseOpeningContent() {
    const openingContent = document.querySelector('.opening-content');
    if (!openingContent) return;

    openingContent.classList.remove('click-pop');
    void openingContent.offsetWidth;
    openingContent.classList.add('click-pop');
}

function updateOpeningMessage() {
    const title = document.getElementById('openingTitle');
    const hint = document.getElementById('openingHint');
    const currentMessage = messages[clickCount];

    if (!title || !hint || !currentMessage) return;

    title.classList.remove('title-swap-in');
    title.classList.add('title-swap-out');

    setTimeout(() => {
        title.classList.remove('title-swap-out');
        title.classList.add('title-swap-in');
        renderMessage(title, hint, currentMessage);

        currentMessage.effects?.forEach(applyEffect);
        if (currentMessage.lockScreen?.enabled) {
            lockInteraction(hint, currentMessage.lockScreen.duration);
        }
    }, 180);
}

function renderMessage(title, hint, message) {
    if (message.button) {
        hint.style.display = 'none';
        title.innerHTML = `${message.text}<br><button type="button" class="opening-action-btn" id="dynamicButton">${message.button.text}</button>`;

        const dynamicButton = document.getElementById('dynamicButton');
        if (!dynamicButton) return;

        dynamicButton.addEventListener('click', (event) => {
            event.stopPropagation();
            message.button.onClick();
            dynamicButton.remove();
            hint.style.display = 'block';
            advanceToNextMessage(true);
        });
        return;
    }

    hint.style.display = 'block';
    title.textContent = message.text;
}

function lockInteraction(hint, duration = 1800) {
    const screen = document.getElementById('openingScreen');
    if (!screen) return;

    hint.style.display = 'none';
    screen.style.pointerEvents = 'none';

    setTimeout(() => {
        screen.style.pointerEvents = 'auto';
        hint.style.display = 'block';
    }, duration);
}

function applyEffect(effect) {
    const map = {
        'rizz-background': rizzBackground,
        'rizz-title': rizzTitle,
        'hearts-background': heartsBackground
    };

    map[effect]?.();
}

function rizzBackground() {
    const screen = document.getElementById('openingScreen');
    const title = document.getElementById('openingTitle');
    if (!screen || !title) return;

    const overlay = document.createElement('div');
    overlay.className = 'rizz-overlay';
    screen.appendChild(overlay);

    title.classList.add('rizz-text');

    setTimeout(() => overlay.classList.add('grow'), 80);
    setTimeout(() => {
        overlay.classList.remove('grow');
        setTimeout(() => {
            overlay.remove();
            title.classList.remove('rizz-text');
        }, 680);
    }, 1800);
}

function rizzTitle() {
    const title = document.getElementById('openingTitle');
    if (!title) return;

    const fonts = [
        "'Fraunces', Georgia, serif",
        "'DM Serif Display', Georgia, serif",
        "'Bricolage Grotesque', 'Segoe UI', sans-serif",
        "'Lucida Handwriting', cursive",
        "'Brush Script MT', cursive",
        "'Copperplate', serif",
        "'Arial Black', sans-serif",
        "'Impact', sans-serif",
        "'Georgia', serif",
        "'Times New Roman', serif",
        "'Verdana', sans-serif",
        "'Trebuchet MS', sans-serif",
        "'Gill Sans', sans-serif",
        "'Courier New', monospace",
        "'Palatino Linotype', 'Book Antiqua', Palatino, serif"
    ];

    let index = 0;
    const interval = setInterval(() => {
        title.style.fontFamily = fonts[index];
        index = (index + 1) % fonts.length;
    }, 140);

    setTimeout(() => {
        clearInterval(interval);
        title.style.fontFamily = "'DM Serif Display', Georgia, serif";
    }, 1700);
}

function heartsBackground() {
    const container = document.getElementById('openingScreen');
    if (!container) return;

    Array.from({ length: 30 }).forEach(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${10 + Math.random() * 20}px`;
        heart.style.setProperty('--delay', `${Math.random() * 1.4}s`);
        heart.style.setProperty('--float-distance', `${58 + Math.random() * 38}vh`);

        container.appendChild(heart);
        setTimeout(() => heart.remove(), 2400);
    });
}

function showEnding() {
    const openingScreen = document.getElementById('openingScreen');
    if (!openingScreen) return;

    isFinished = true;
    openingScreen.removeEventListener('click', handleClick);
    openingScreen.classList.remove('fade-out');
    openingScreen.style.cursor = 'default';
    openingScreen.innerHTML = `
        <div class="opening-content ending-content">
            <h1 class="opening-title">Happy 5th Monthsary, Love</h1>
            <p class="click-instruction">Ayunnn lang po ^^.</p>
            <a class="opening-action-btn" href="../index.html">Go back to selection</a>
        </div>
    `;

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.66 }
        });
    }
}

function initOpeningScreen() {
    createOpeningScreen();
    eventListeners();
}

export { initOpeningScreen };
