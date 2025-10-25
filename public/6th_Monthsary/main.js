const targets = [...document.querySelectorAll('.target-img')];
const speed = innerWidth < 800 ? 2 : 5;
const crosshair = document.querySelector('.crosshair');

const messages = [
    "Pinahiram ko lang yung jacket ko kasi nilalamig siya.",
    "Mahal, nag-wave lang ako pabalik. Ang awkward kung hindi ko babatiin.",
    "Nag-share lang kami ng payong. Umuulan kasi.",
    "Nasa tabi ko lang siya sa picture, hindi ko yun sinadya.",
    "Nag-drive lang ako pauwi kasi gabi na.",
    "Mahal, nag-reply lang ako agad kasi baka important.",
    "Pinulot ko lang yung buhok sa damit niya, may dumikit lang talaga.",
    "Naupo lang ako dun kasi wala nang ibang upuan.",
    "Sabay lang kami kumain kasi pareho kaming wala pang lunch.",
    "Mahal, tumawa lang ako sa joke niya. Nakakatawa lang talaga.",
    "Nag-goodnight lang ako. Normal yun.",
    "Nag-sabay lang kami umuwi kasi isang direction lang.",
    "Pinahiram ko lang yung ballpen ko, wala na siyang tinta sa kanya.",
    "Mahal, nakinig lang ako kasi nagkukwento siya. Hindi rin ako sumingit.",
    "Nag-'haha' lang ako. Hindi 'hehe'. May difference yun."
];

const captionBox = document.querySelector('.caption-box');
let messagePool = [...messages];
let firstClick = true;

function getRandomMessage() {
    if (messagePool.length === 0) {
        messagePool = [...messages];
    }
    const index = Math.floor(Math.random() * messagePool.length);
    return messagePool.splice(index, 1)[0];
}

// Sound
const gunSound = new Audio('media/pistolShot.mp3');
gunSound.volume = 1.0;

// Store holes per target
const holes = new Map();

// Start targets off-screen right
targets.forEach(img => {
    img.style.position = 'absolute';
    img.style.left = window.innerWidth + 'px';
    img.style.top = '0px';
});

function moveTargets() {
    targets.forEach((img, i) => {
        let x = parseFloat(img.style.left);

        if (x + img.width < 0) {
            img.style.left = window.innerWidth + 'px';

            if (holes.has(i)) {
                holes.get(i).forEach(h => h.remove());
                holes.delete(i);
            }
        } else {
            img.style.left = (x - speed) + 'px';
        }

        if (holes.has(i)) {
            const rect = img.getBoundingClientRect();
            holes.get(i).forEach(hole => {
                hole.style.left = rect.left + parseFloat(hole.dataset.localX) + 'px';
                hole.style.top = rect.top + parseFloat(hole.dataset.localY) + 'px';
            });
        }
    });

    requestAnimationFrame(moveTargets);
}
moveTargets();

function fire() {
    captionBox.innerHTML = `<h1>${getRandomMessage()}</h1>`;
    firstClick = false;

    const chRect = crosshair.getBoundingClientRect();
    const cx = chRect.left + chRect.width / 2;
    const cy = chRect.top + chRect.height / 2;

    const hit = document.elementFromPoint(cx, cy);
    if (!hit) return;

    const target = hit.closest('.target-img');
    if (!target) return;

    gunSound.cloneNode(true).play();

    const index = targets.indexOf(target);
    const rect = target.getBoundingClientRect();
    const localX = cx - rect.left;
    const localY = cy - rect.top;

    const hole = document.createElement('img');
    hole.src = 'media/bulletHole.png';
    hole.className = 'bullet-hole';
    hole.dataset.localX = localX;
    hole.dataset.localY = localY;
    document.body.appendChild(hole);

    hole.style.left = cx + 'px';
    hole.style.top = cy + 'px';

    if (!holes.has(index)) holes.set(index, []);
    holes.get(index).push(hole);

    // Gun recoil
    const gun = document.querySelector('.pointing-gun');
    gun.classList.add('recoil');
    setTimeout(() => gun.classList.remove('recoil'), 100);
}


window.addEventListener('click', fire);
window.addEventListener('touchstart', e => {
    e.preventDefault();
    fire();
}, { passive: false });

window.addEventListener('click', e => {
    startMusicOnce();
    fire();
});

const bgMusic = new Audio('media/Tensionado_Soapdish.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;
let musicStarted = false;

function startMusicOnce() {
    if (!musicStarted) {
        bgMusic.play().catch(() => { });
        musicStarted = true;
    }
}

window.addEventListener('touchstart', e => {
    e.preventDefault();
    startMusicOnce();
    fire();
}, { passive: false });

// resize handler for speed adjustment
window.addEventListener('resize', () => {
    speed = innerWidth < 800 ? 2 : 5;
});