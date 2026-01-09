const PET_WIDTH = window.innerWidth < 768 ? 24 : 64;
const EDGE_PADDING = window.innerWidth < 768 ? 32 : 128;

const pets = [
    { element: yuan },
    { element: crystel }
];

pets.forEach(pet => {
    const x = EDGE_PADDING + Math.random() * (innerWidth - PET_WIDTH - EDGE_PADDING * 2);
    Object.assign(pet, {
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
        walkSpeed: window.innerWidth < 768 ? 0.06 : 0.08, // slightly faster on larger screens
        walkDistanceFactor: 1
    });
});

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function chooseState(pet) {
    const roll = Math.random();

    if (roll < 0.35) {
        pet.state = "idle";
        pet.vx = 0;
        pet.timer = randomRange(300, 1000);
    } else if (roll < 0.75) {
        pet.state = "walk";
        const walkDistance = randomRange(100, 550) * pet.walkDistanceFactor;
        const direction = Math.random() < 0.5 ? -1 : 1;
        pet.walkTargetX = Math.min(
            innerWidth - PET_WIDTH - EDGE_PADDING,
            Math.max(EDGE_PADDING, pet.x + direction * walkDistance)
        );

        pet.vx = (pet.walkTargetX > pet.x ? pet.walkSpeed : -pet.walkSpeed);
        pet.facing = Math.sign(pet.vx);

        pet.walkThinkX = Math.random() < 0.3
            ? pet.x + (pet.walkTargetX - pet.x) * randomRange(0.2, 0.8)
            : null;
    } else if (roll < 0.9) {
        pet.state = "jump";
        pet.vy = -0.7;
    } else {
        pet.state = "celebrate";
        pet.timer = randomRange(400, 700);
    }
}

let lastTime = performance.now();

function animate(now) {
    const delta = now - lastTime;
    lastTime = now;

    pets.forEach(pet => {
        pet.timer -= delta;

        switch (pet.state) {
            case "idle":
                pet.y = 0;
                pet.rotation = 0;
                if (pet.timer <= 0) chooseState(pet);
                break;

            case "walk":
                pet.y = Math.sin(now / 150);
                pet.rotation = pet.y * 5;

                if (Math.random() < 0.0005 * delta) {
                    pet.state = "jump";
                    pet.vy = -0.7;
                    break;
                }

                if (
                    pet.walkThinkX !== null &&
                    ((pet.vx > 0 && pet.x >= pet.walkThinkX) ||
                        (pet.vx < 0 && pet.x <= pet.walkThinkX))
                ) {
                    pet.walkThinkX = null;
                    if (Math.random() < 0.5) {
                        pet.state = "idle";
                        pet.vx = 0;
                        pet.timer = randomRange(300, 800);
                    } else {
                        pet.state = "jump";
                        pet.vy = -0.7;
                    }
                    break;
                }

                pet.x += pet.vx * delta;
                if (pet.vx > 0) pet.x = Math.min(pet.x, pet.walkTargetX);
                else pet.x = Math.max(pet.x, pet.walkTargetX);

                if (pet.x === pet.walkTargetX) chooseState(pet);
                break;

            case "jump":
                pet.vy += 0.002 * delta;
                pet.y += pet.vy * delta;
                pet.rotation = Math.sin(now / 100) * 10;
                if (pet.y >= 0) {
                    pet.y = 0;
                    chooseState(pet);
                }
                break;

            case "celebrate":
                pet.y = 0;
                pet.rotation = Math.sin(now / 60) * 15;
                pet.x += Math.sin(now / 60) * 0.4;
                if (pet.timer <= 0) chooseState(pet);
                break;
        }

        pet.element.style.transform = `translate(${pet.x}px, ${pet.y}px) rotate(${pet.rotation}deg) scaleX(${pet.facing})`;
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
