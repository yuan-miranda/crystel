const messages = [
    { text: "Hi" },
    { text: "Nasaan ako??!" },
    { text: "Ahh eto pala yung-" },
    { text: "5th monthsary entry" },
    { text: "AHAAHHAHAH" },
    { text: "Anyways," },
    { text: "Might be familiar tong prompt na to" },
    { text: "Yeah its from the first entry here" },
    { text: "Wala akong maisip eh :D" },
    { text: "So just read my monologues!!" },
    { text: "But first," },
    {
        text: "Can you click this button for me?",
        button: {
            text: "Etooo!",
            onClick: () => {
                console.log("Hello, World!");
            }
        }
    },
    { text: "Ayunn its working" },
    { text: "So as I was saying," },
    { text: "I was thinking of unique ways-" },
    { text: "To make this entry more interesting" },
    { text: "So naisip ko why not make it yapteractive?" },
    { text: "Yung babasahin mo lahat AAHHAHAHAH" },



    { text: "Going back, its been five months" },
    { text: "Cant imagine how fast time flies" },
    { text: "Yeah its been fun~" },
    { text: "May mga away, bati, and many more LOL" },
    { text: "Imbis na mag review ako for prelims" },
    { text: "Ni rrush ko ereng entry na to" },
    { text: "Haupp daig pa late submissions ko sa ELMS" },
    { text: "AHAAHHAHAH" },
    { text: "im soo cooked🔥" },
    {
        text: "Pero kaya this, cu'z ive got you!!",
        effects: [
            "hearts-background"
        ],
        lockScreen: { enabled: true, duration: 2000 }
    },
    {
        text: "aluhhh rizz ∞",
        effects: [
            "rizz-background",
            "rizz-title"
        ],
        lockScreen: { enabled: true, duration: 2000 }
    },
    { text: "Anyways, I love you!!" },
    { text: "Thanks for being there for me" },
    {
        text: "Happy 5th monthsary!",
        button: {
            text: "Celebrate!",
            onClick: () => {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        }
    },
];

const totalClicksNeeded = messages.length;
let clickCount = 0;
let isCooldown = false;

function createOpeningScreen() {
    const openingScreen = document.getElementById('openingScreen');
    openingScreen.innerHTML = `
        <div class="opening-content">
            <h1 class="opening-title" id="openingTitle">${messages[0].text}</h1>
            <p class="click-instruction">Click anywhere</p>
        </div>
    `;
}

function eventListeners() {
    document.getElementById('openingScreen').addEventListener('click', handleClick);
}

function handleClick() {
    if (isCooldown) return;
    if (messages[clickCount] && messages[clickCount].button) return;
    toNextMessage();
}

function toNextMessage() {
    isCooldown = true;
    clickCount++;

    updateOpeningMessage();

    if (clickCount >= totalClicksNeeded) {
        closeOpening();
    } else {
        // set cooldown for clicks
        setTimeout(() => {
            isCooldown = false;
        }, 400);
    }
}

function updateOpeningMessage() {
    const title = document.getElementById('openingTitle');
    const instruction = document.querySelector('.click-instruction');
    const currentMessage = messages[clickCount];
    if (!title || !currentMessage) return;

    renderMessage(title, instruction, currentMessage);
    currentMessage.effects?.forEach(applyEffects);

    if (currentMessage.lockScreen) lockInteraction(instruction, currentMessage.lockScreen.duration);
}

function renderMessage(title, instruction, message) {
    if (message.button) {
        instruction.style.display = 'none';
        title.innerHTML = `${message.text} <br><button id="dynamicButton">${message.button.text}</button>`;
        document.getElementById('dynamicButton').addEventListener('click', () => {
            message.button.onClick();
            document.getElementById('dynamicButton').remove();
            toNextMessage();
        });
    } else {
        instruction.style.display = 'block';
        title.textContent = message.text;
    }
}

function lockInteraction(instruction, duration = 2000) {
    const screen = document.getElementById('openingScreen');
    instruction.style.display = 'none';
    screen.style.pointerEvents = 'none';
    setTimeout(() => {
        screen.style.pointerEvents = 'auto';
        instruction.style.display = 'block';
    }, duration);
}

function applyEffects(effect) {
    const effectsMap = {
        "rizz-background": () => rizzBackground(),
        "rizz-title": () => rizzTitle(),
        "hearts-background": () => heartsBackground()
    };
    effectsMap[effect]?.();
}

function rizzBackground() {
    const screen = document.getElementById('openingScreen');
    const overlay = document.createElement('div');
    overlay.classList.add('rizz-overlay');
    screen.appendChild(overlay);

    const title = document.getElementById('openingTitle');
    title.style.color = "#fff";

    setTimeout(() => overlay.classList.add('grow'), 100);
    setTimeout(() => {
        overlay.classList.remove('grow');
        setTimeout(() => {
            overlay.remove();
            title.style.color = "#666";
        }, 700);
    }, 2000);
}

function rizzTitle() {
    const title = document.getElementById('openingTitle');
    const fonts = [
        "'Brush Script MT', cursive", "'Papyrus', fantasy",
        "'Copperplate', serif", "'Lucida Handwriting', cursive",
        "'Courier New', monospace", "'Arial Black', sans-serif",
        "'Impact', sans-serif", "'Times New Roman', serif", "'Georgia', serif"
    ];
    title.style.fontSize = "3rem";

    let index = 0;
    const interval = setInterval(() => {
        title.style.fontFamily = fonts[index];
        index = (index + 1) % fonts.length;
    }, 150);

    setTimeout(() => {
        clearInterval(interval);
        title.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        title.style.fontSize = "";
    }, 2000);
}

function heartsBackground() {
    const container = document.getElementById('openingScreen');
    Array.from({ length: 30 }).forEach(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${10 + Math.random() * 20}px`;
        heart.style.setProperty('--delay', `${Math.random() * 1.5}s`);
        heart.style.setProperty('--float-distance', `${60 + Math.random() * 40}vh`);
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 2500);
    });
}

function closeOpening() {
    const screen = document.getElementById('openingScreen');
    setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
            screen.remove();
            document.querySelector('footer').style.display = 'flex';
        }, 500);
    }, 1000);
}

function initOpeningScreen() {
    createOpeningScreen();
    eventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    initOpeningScreen();
});