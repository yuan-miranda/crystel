const CHARACTER_WIDTH = onMobileResize(40, 64);
const EDGE_PADDING = onMobileResize(40, 128);

const characters = [
    { element: yuan, name: "Yuan", image: 'media/yuan.webp' },
    { element: crystel, name: "Crystel", image: 'media/crystel.webp' }
];

characters.forEach(character => {
    const spriteEl = character.element.querySelector('.sprite');
    const nameEl = character.element.querySelector('.name');

    spriteEl.style.backgroundImage = `url(${character.image})`;
    nameEl.textContent = character.name;
    nameEl.style.bottom = onMobileResize('48px', '72px');
    character.spriteEl = spriteEl;

    const x = EDGE_PADDING + Math.random() * (innerWidth - CHARACTER_WIDTH - EDGE_PADDING * 2);
    Object.assign(character, {
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

function spawnRocketParticle(x, y) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "4px";
    p.style.height = "4px";
    p.style.borderRadius = "50%";
    p.style.background = "red";
    p.style.pointerEvents = "none";
    p.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(p);

    const vx = randomRange(-0.15, 0.15);
    const vy = randomRange(0.3, 0.6);
    const life = 300;
    const start = performance.now();

    function animate(t) {
        const dt = t - start;
        if (dt > life) {
            p.remove();
            return;
        }

        p.style.opacity = `${1 - dt / life}`;
        p.style.transform =
            `translate(${vx * dt}px, ${vy * dt}px) scale(${1 - dt / life})`;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function onMobileResize(mobileValue, desktopValue) {
    return window.innerWidth < 768 ? mobileValue : desktopValue;
}

function chooseState(character) {
    const roll = Math.random();
    const canJump = character.jumpCooldown <= 0 && character.jumpCount < 2;

    if (roll < 0.25) {
        character.state = "idle";
        character.vx = 0;
        character.timer = randomRange(300, 1000);
    } else if (roll < 0.60) {
        character.state = "walk";
        const walkDistance = randomRange(
            onMobileResize(50, 100),
            onMobileResize(250, 550)
        ) * character.walkDistanceFactor;

        const direction = Math.random() < 0.5 ? -1 : 1;
        character.walkTargetX = Math.min(
            innerWidth - CHARACTER_WIDTH - EDGE_PADDING,
            Math.max(EDGE_PADDING, character.x + direction * walkDistance)
        );

        character.vx = character.walkTargetX > character.x ? character.walkSpeed : -character.walkSpeed;
        character.facing = Math.sign(character.vx);

        character.walkThinkX = Math.random() < 0.3
            ? character.x + (character.walkTargetX - character.x) * randomRange(0.2, 0.8)
            : null;
    } else if (roll < 0.825 && canJump) {
        character.state = "jump";
        character.vy = -0.7;
        character.jumpCount += 1;
        if (character.jumpCount >= 2) character.jumpCooldown = 2000;
    } else {
        character.state = "celebrate";
        character.timer = randomRange(400, 700);
    }
}

let lastTime = performance.now();

function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    characters.forEach(character => {
        character.timer -= delta;

        // reduce jump cooldown
        if (character.jumpCooldown > 0) {
            character.jumpCooldown -= delta;
            if (character.jumpCooldown <= 0) {
                character.jumpCooldown = 0;
                character.jumpCount = 0;
            }
        }

        switch (character.state) {
            case "idle":
                character.y = 0;
                character.rotation = 0;
                if (character.timer <= 0) chooseState(character);
                break;

            case "walk":
                character.y = Math.sin(now / 150);
                character.rotation = character.y * 5;

                if (
                    character.walkThinkX !== null &&
                    ((character.vx > 0 && character.x >= character.walkThinkX) ||
                        (character.vx < 0 && character.x <= character.walkThinkX))
                ) {
                    character.walkThinkX = null;
                    if (Math.random() < 0.5) {
                        character.state = "idle";
                        character.vx = 0;
                        character.timer = randomRange(300, 800);
                    } else {
                        character.state = "jump";
                        character.vy = -0.7;
                    }
                    break;
                }

                character.x += character.vx * delta;
                if (character.vx > 0) character.x = Math.min(character.x, character.walkTargetX);
                else character.x = Math.max(character.x, character.walkTargetX);

                if (character.x === character.walkTargetX) chooseState(character);
                break;

            case "jump":
                character.vy += 0.002 * delta;
                character.y += character.vy * delta;
                character.rotation = Math.sin(now / 100) * 10;
                if (character.y >= 0) {
                    character.y = 0;
                    chooseState(character);
                }
                break;

            case "celebrate":
                if (!character.celebrateStarted) {
                    character.celebrateStarted = true;

                    const xPos = character.x + CHARACTER_WIDTH / 2;
                    // 0.00 = top, 1.00 = bottom
                    const rocketTargetHeight = 0.60;
                    const duration = 700;
                    const targetY = window.innerHeight * rocketTargetHeight;

                    const rocket = document.createElement("img");
                    rocket.src = "media/Firework_Rocket_JE2_BE2.webp";
                    rocket.style.position = "absolute";
                    rocket.style.width = onMobileResize("32px", "48px");
                    rocket.style.height = onMobileResize("32px", "48px");
                    rocket.style.left = `${xPos - (onMobileResize(16, 24))}px`;
                    rocket.style.top = `${window.innerHeight - 50}px`;
                    document.body.appendChild(rocket);

                    const startY = window.innerHeight - 50;
                    const startTime = performance.now();

                    function animateRocket(time) {
                        const elapsed = time - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        const currentY = startY - progress * (startY - targetY);
                        rocket.style.top = `${currentY}px`;

                        // spawn exhaust particles (Minecraft-style trail)
                        const rocketX =
                            xPos;
                        const rocketY =
                            currentY + (onMobileResize(32, 48));

                        spawnRocketParticle(
                            rocketX + randomRange(-4, 4),
                            rocketY
                        );

                        if (progress < 1) {
                            requestAnimationFrame(animateRocket);
                        } else {
                            rocket.remove();
                            confetti({
                                particleCount: onMobileResize(36, 80),
                                spread: onMobileResize(50, 80),
                                startVelocity: onMobileResize(30, 50),
                                origin: { x: xPos / window.innerWidth, y: rocketTargetHeight }
                            });
                        }
                    }

                    requestAnimationFrame(animateRocket);
                }

                character.y = 0;
                character.rotation = Math.sin(now / 60) * 15;
                character.x += Math.sin(now / 60) * 0.4;

                if (character.timer <= 0) {
                    chooseState(character);
                    character.celebrateStarted = false;
                }
                break;
        }

        // move character
        character.element.style.transform =
            `translate(${character.x}px, ${character.y}px)`;

        // animate sprite only
        character.spriteEl.style.transform =
            `rotate(${character.rotation}deg) scaleX(${character.facing})`;

    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
