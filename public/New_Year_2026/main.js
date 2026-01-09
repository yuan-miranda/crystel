const CHARACTER_WIDTH = window.innerWidth < 768 ? 24 : 64;
const EDGE_PADDING = window.innerWidth < 768 ? 32 : 128;

const characters = [
    { element: yuan },
    { element: crystel }
];

characters.forEach(character => {
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
        walkDistanceFactor: 1
    });
});

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function chooseState(character) {
    const roll = Math.random();

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

        character.vx = (character.walkTargetX > character.x ? character.walkSpeed : -character.walkSpeed);
        character.facing = Math.sign(character.vx);

        character.walkThinkX = Math.random() < 0.3
            ? character.x + (character.walkTargetX - character.x) * randomRange(0.2, 0.8)
            : null;
    } else if (roll < 0.825) {   
        character.state = "jump";
        character.vy = -0.7;
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

        switch (character.state) {
            case "idle":
                character.y = 0;
                character.rotation = 0;
                if (character.timer <= 0) chooseState(character);
                break;

            case "walk":
                character.y = Math.sin(now / 150);
                character.rotation = character.y * 5;

                // jump cooldown during walk
                if (!character.jumpCooldown && Math.random() < 0.0002 * delta) {
                    character.state = "jump";
                    character.vy = -0.7;
                    character.jumpCooldown = 1000;
                }
                if (character.jumpCooldown) character.jumpCooldown -= delta;

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
                // trigger confetti/firework once per celebration
                if (!character.celebrateStarted) {
                    character.celebrateStarted = true;

                    setTimeout(() => {
                        const xPos = character.x + CHARACTER_WIDTH / 2;
                        const yPos = 0.6;

                        confetti({
                            particleCount: 72,
                            spread: 72,
                            origin: { x: xPos / window.innerWidth, y: yPos }
                        });
                    }, 300);
                }

                // wiggle animation
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
