const CHARACTER_WIDTH = onMobileResize(40, 64);
const EDGE_PADDING = onMobileResize(40, 128);
const GRAVITY = 0.002;
const JUMP_VELOCITY = -0.7;
const BOB_SPEED = 150;

const characters = [
    { name: "Yuan", image: "media/yuan.webp" },
    { name: "Crystel", image: "media/crystel.webp" }
];

const newYearMessages = [
    "Happy New Year!",
    "Cheers sa 2026!",
    "New year, new adventures!",
    "Let's celebrate!",
    "Wishing you joy this year!",
    "Fireworks time ding ding ding!",
    "Good vibes lang!",
    "Fresh start ulit!",
    "Sino ready sa snacks?",
    "Grabe yung confetti!",
    "May party ba dito?",

    "Kaya kong tumalon ng mas mataas sayo, {other}!",
    "Uy {other}, iwasan mo yung confetti!",
    "2026 atin 'to, {other}!",
    "{other}, wag mong i-hug yung fireworks!",
    "Ako na unang sasayaw, {other}!",
    "{other}, kumikinang ka ngayon ah!",
    "Hoy {other}, wag kang mahulog dyan!",
    "New year, same kalokohan parin, {other}!",
    "Uy {other}, mag wish ka na!",
    "{other}, ready ka na ba sa gulo?",
    "Grabe, parang masaya tong year na 'to ah, {other}!",
    "Tumalon talon ka naman {other}!",
];

const container = document.querySelector(".characters");

characters.forEach(character => {
    const characterElement = document.createElement("div");
    characterElement.className = "character";

    const sprite = document.createElement("div");
    sprite.className = "sprite";
    sprite.style.backgroundImage = `url(${character.image})`;

    const nameTag = document.createElement("span");
    nameTag.className = "name";
    nameTag.textContent = character.name;
    nameTag.style.bottom = onMobileResize("48px", "72px");

    characterElement.append(sprite, nameTag);
    container.appendChild(characterElement);

    const x = EDGE_PADDING + Math.random() * (innerWidth - CHARACTER_WIDTH - EDGE_PADDING * 2);

    Object.assign(character, {
        element: characterElement,
        spriteEl: sprite,
        nameEl: nameTag,
        x,
        y: 0,
        vx: 0,
        vy: 0,
        state: "idle",
        timer: 0,
        facing: 1,
        walkTargetX: x,
        walkThinkX: null,
        rotation: 0,
        walkSpeed: onMobileResize(0.06, 0.08),
        walkDistanceFactor: 1,
        jumpCount: 0,
        jumpCooldown: 0
    });
});

function createOpeningScreen() {
    const openingScreen = document.getElementById('openingScreen');
    openingScreen.innerHTML = `
        <div class="opening-content">
            <h1 class="opening-title" id="openingTitle">Happy New Year Crystel!</h1>
            <p class="click-instruction">Click anywhere</p>
        </div>
    `;
}

function closeOpening() {
    const screen = document.getElementById('openingScreen');
    setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
            screen.remove();
            document.querySelector('footer').style.display = 'flex';
        }, 200);
    }, 100);
}

characters.forEach(c => {
    const bubbleEl = document.createElement("div");
    bubbleEl.className = "bubble";

    c.element.appendChild(bubbleEl);
    c.bubbleEl = bubbleEl;
    c.bubbleTimer = 0;
});

function getRandomMessage(currentCharacter) {
    let msg = newYearMessages[Math.floor(Math.random() * newYearMessages.length)];
    if (msg.includes("{other}")) {
        const others = characters.filter(c => c !== currentCharacter);
        const otherCharacter = others[Math.floor(Math.random() * others.length)];
        msg = msg.replace("{other}", otherCharacter.name);
    }
    return msg;
}

function updateBubbles(delta) {
    characters.forEach(c => {
        if (c.bubbleTimer > 0) {
            c.bubbleTimer -= delta;
            if (c.bubbleTimer <= 0) c.bubbleEl.style.opacity = 0;
        } else if (Math.random() < 0.003) { // lower chance for natural timing
            c.bubbleEl.textContent = getRandomMessage(c);
            c.bubbleEl.style.opacity = 1;
            c.bubbleTimer = 3500; // slightly longer display
        }

        c.bubbleEl.style.left = `${CHARACTER_WIDTH / 2}px`;
        c.bubbleEl.style.bottom = onMobileResize("72px", "100px");
    });
}

function spawnRocketParticle(x, y) {
    const p = document.createElement("div");
    Object.assign(p.style, {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        background: "red",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)"
    });
    document.body.appendChild(p);

    const vx = randomRange(-0.15, 0.15);
    const vy = randomRange(0.3, 0.6);
    const life = 300;
    const start = performance.now();

    requestAnimationFrame(function animate(t) {
        const dt = t - start;
        if (dt > life) return p.remove();
        const progress = dt / life;
        p.style.opacity = 1 - progress;
        p.style.transform = `translate(${vx * dt}px, ${vy * dt}px) scale(${1 - progress})`;
        requestAnimationFrame(animate);
    });
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function onMobileResize(mobileValue, desktopValue) {
    return window.innerWidth < 768 ? mobileValue : desktopValue;
}

function chooseState(c) {
    const roll = Math.random();
    const canJump = c.jumpCooldown <= 0 && c.jumpCount < 2;

    if (roll < 0.25) {
        c.state = "idle";
        c.vx = 0;
        c.timer = randomRange(300, 1000);
    } else if (roll < 0.60) {
        c.state = "walk";
        const distance = randomRange(onMobileResize(50, 100), onMobileResize(250, 550)) * c.walkDistanceFactor;
        const direction = Math.random() < 0.5 ? -1 : 1;

        // clamp walkTargetX inside screen bounds
        c.walkTargetX = Math.min(innerWidth - CHARACTER_WIDTH - EDGE_PADDING, Math.max(EDGE_PADDING, c.x + direction * distance));

        c.vx = c.walkTargetX > c.x ? c.walkSpeed : -c.walkSpeed;
        c.facing = Math.sign(c.vx);
        c.walkThinkX = Math.random() < 0.3 ? c.x + (c.walkTargetX - c.x) * randomRange(0.2, 0.8) : null;
    }
    else if (roll < 0.825 && canJump) {
        c.state = "jump";
        c.vy = JUMP_VELOCITY;
        c.jumpCount++;
        if (c.jumpCount >= 2) c.jumpCooldown = 2000;
    } else {
        c.state = "celebrate";
        c.timer = randomRange(400, 700);
    }
}

let lastTime = performance.now();

function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    updateBubbles(delta);

    characters.forEach(c => {
        c.timer -= delta;

        if (c.jumpCooldown > 0) {
            c.jumpCooldown -= delta;
            if (c.jumpCooldown <= 0) c.jumpCount = c.jumpCooldown = 0;
        }

        switch (c.state) {
            case "idle":
                c.y = c.rotation = 0;
                if (c.timer <= 0) chooseState(c);
                break;

            case "walk":
                c.y = Math.sin(now / BOB_SPEED) * 1;
                c.rotation = c.y * 5;

                if (c.walkThinkX !== null && ((c.vx > 0 && c.x >= c.walkThinkX) || (c.vx < 0 && c.x <= c.walkThinkX))) {
                    c.walkThinkX = null;
                    if (Math.random() < 0.5) {
                        c.state = "idle";
                        c.vx = 0;
                        c.timer = randomRange(300, 800);
                    } else {
                        c.state = "jump";
                        c.vy = JUMP_VELOCITY;
                    }
                    break;
                }

                c.x += c.vx * delta;

                // stop at walkTargetX
                if ((c.vx > 0 && c.x >= c.walkTargetX) || (c.vx < 0 && c.x <= c.walkTargetX)) {
                    c.x = c.walkTargetX;
                    chooseState(c);
                }
                break;

            case "jump":
                c.vy += GRAVITY * delta;
                c.y += c.vy * delta;
                c.rotation = Math.sin(now / 100) * 10;
                if (c.y >= 0) { c.y = 0; chooseState(c); }
                break;

            case "celebrate":
                if (!c.celebrateStarted) {
                    c.celebrateStarted = true;
                    const xPos = c.x + CHARACTER_WIDTH / 2;
                    const rocketTargetHeight = 0.6;
                    const duration = 700;
                    const startY = window.innerHeight - 50;
                    const targetY = window.innerHeight * rocketTargetHeight;

                    const rocket = document.createElement("img");
                    rocket.src = "media/Firework_Rocket_JE2_BE2.webp";
                    Object.assign(rocket.style, {
                        position: "absolute",
                        width: onMobileResize("32px", "48px"),
                        height: onMobileResize("32px", "48px"),
                        left: `${xPos - onMobileResize(16, 24)}px`,
                        top: `${startY}px`
                    });
                    document.body.appendChild(rocket);

                    // Play overlapping firework sound
                    new Audio("media/fireworks-13-419033.mp3").play();

                    const startTime = performance.now();
                    requestAnimationFrame(function animateRocket(time) {
                        const progress = Math.min((time - startTime) / duration, 1);
                        const currentY = startY - progress * (startY - targetY);
                        rocket.style.top = `${currentY}px`;
                        spawnRocketParticle(xPos + randomRange(-4, 4), currentY + onMobileResize(32, 48));
                        if (progress < 1) requestAnimationFrame(animateRocket);
                        else {
                            rocket.remove();
                            confetti({
                                particleCount: onMobileResize(36, 80),
                                spread: onMobileResize(50, 80),
                                startVelocity: onMobileResize(30, 50),
                                origin: { x: xPos / window.innerWidth, y: rocketTargetHeight }
                            });
                        }
                    });
                }
                c.y = 0;
                c.rotation = Math.sin(now / 60) * 15;
                c.x += Math.sin(now / 60) * 0.4;
                if (c.timer <= 0) { chooseState(c); c.celebrateStarted = false; }
                break;
        }

        c.element.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
        c.spriteEl.style.transform = `rotate(${c.rotation}deg) scaleX(${c.facing})`;
    });

    requestAnimationFrame(animate);
}


document.addEventListener('DOMContentLoaded', () => {


    createOpeningScreen();
    const openingScreen = document.getElementById('openingScreen');
    openingScreen.addEventListener('click', () => {
        closeOpening();
        requestAnimationFrame(animate);
    });
});
window.addEventListener('resize', () => window.location.reload());
