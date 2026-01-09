const CHARACTER_WIDTH = window.innerWidth < 768 ? 32 : 64;
const EDGE_PADDING = window.innerWidth < 768 ? 32 : 128;

const characters = [
    { element: yuan, image: 'media/yuan.webp' },
    { element: crystel, image: 'media/crystel.webp' }
];

characters.forEach(character => {
        character.element.style.backgroundImage = `url(${character.image})`;
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
        walkSpeed: window.innerWidth < 768 ? 0.06 : 0.08,
        walkDistanceFactor: 1,
        jumpCount: 0,       // track number of jumps
        jumpCooldown: 0     // cooldown timer in ms
    });
});

function randomRange(min, max) {
    return min + Math.random() * (max - min);
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
            window.innerWidth < 768 ? 50 : 100,
            window.innerWidth < 768 ? 250 : 550
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
        if (character.jumpCount >= 2) character.jumpCooldown = 2000; // 2s cooldown
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
                character.jumpCount = 0; // reset jumps after cooldown
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
                    rocket.style.width = window.innerWidth < 768 ? "32px" : "48px";
                    rocket.style.height = window.innerWidth < 768 ? "32px" : "48px";
                    rocket.style.left = `${xPos - (window.innerWidth < 768 ? 16 : 24)}px`;
                    rocket.style.top = `${window.innerHeight - 50}px`;
                    document.body.appendChild(rocket);

                    const startY = window.innerHeight - 50;
                    const startTime = performance.now();

                    function animateRocket(time) {
                        const elapsed = time - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        rocket.style.top = `${startY - progress * (startY - targetY)}px`;

                        if (progress < 1) requestAnimationFrame(animateRocket);
                        else {
                            rocket.remove();
                            confetti({
                                particleCount: window.innerWidth < 768 ? 36 : 80,
                                spread: window.innerWidth < 768 ? 50 : 80,
                                startVelocity: window.innerWidth < 768 ? 30 : 50,
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

        character.element.style.transform = `translate(${character.x}px, ${character.y}px) rotate(${character.rotation}deg) scaleX(${character.facing})`;
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
