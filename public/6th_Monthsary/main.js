let targetSpeed = innerWidth < 800 ? 3 : 5;
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
let messagePool = [...messages];

function getRandomMessage() {
    if (messagePool.length === 0) messagePool = [...messages];
    const index = Math.floor(Math.random() * messagePool.length);
    return messagePool.splice(index, 1)[0];
}

function startBgMusicOnce(bgMusic, bgMusicStarted) {
    if (!bgMusicStarted) {
        bgMusic.play().then(() => bgMusicStarted = true)
            .catch(err => console.warn('Background music failed to play:', err));
    }
}

function resetTargetPosition(target) {
    target.style.left = window.innerWidth + 'px';
}

function updateHoles(target, holes) {
    const rect = target.getBoundingClientRect();
    holes.forEach(hole => {
        hole.style.left = rect.left + parseFloat(hole.dataset.localX) + 'px';
        hole.style.top = rect.top + parseFloat(hole.dataset.localY) + 'px';
    });
}

function moveTarget(target, holes) {
    let x = parseFloat(target.style.left);

    if (x + target.offsetWidth < 0) {
        resetTargetPosition(target);
        holes.forEach(hole => hole.remove());
        holes.length = 0;
    } else {
        target.style.left = (x - targetSpeed) + 'px';
    }

    updateHoles(target, holes);
    requestAnimationFrame(() => moveTarget(target, holes));
}

function createBulletHole(cx, cy, target, holes) {
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

    holes.push(hole);
}

function fire(crosshair, target, captionBox, gun, gunSound, holes) {
    const chRect = crosshair.getBoundingClientRect();
    const cx = chRect.left + chRect.width / 2;
    const cy = chRect.top + chRect.height / 2;

    const hit = document.elementFromPoint(cx, cy);
    if (!hit || !hit.closest('.target-img')) return;

    captionBox.innerHTML = `<h3>${getRandomMessage()}</h3>`;

    gun.classList.add('recoil');
    gunSound.cloneNode(true).play();
    createBulletHole(cx, cy, target, holes);

    setTimeout(() => gun.classList.remove('recoil'), 100);
}

document.addEventListener('DOMContentLoaded', () => {
    const target = document.querySelector('.target-img');
    const crosshair = document.querySelector('.crosshair');
    const captionBox = document.querySelector('.caption-box');
    const initialOverlay = document.getElementById('initialOverlay');

    let holes = [];
    let overlayActive = true;

    const gun = document.querySelector('.pointing-gun');
    const gunSound = new Audio('media/pistolShot.mp3');
    gunSound.volume = 1.0;

    const bgMusic = new Audio('media/Tensionado_Soapdish.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    let bgMusicStarted = false;

    const handleShoot = () => {
        console.log('Shoot attempted');
        if (overlayActive) return;
        startBgMusicOnce(bgMusic, bgMusicStarted);
        fire(crosshair, target, captionBox, gun, gunSound, holes);
    };

    const hideOverlay = () => {
        initialOverlay.classList.add('hidden');
        setTimeout(() => {
            initialOverlay.style.display = 'none';
            overlayActive = false;
            captionBox.innerHTML = `<h3>${getRandomMessage()}</h3>`;
            startBgMusicOnce(bgMusic, bgMusicStarted);
        }, 500);
    }
    initialOverlay.addEventListener('click', hideOverlay);
    initialOverlay.addEventListener('touchstart', hideOverlay);

    target.style.position = 'absolute';
    resetTargetPosition(target);
    moveTarget(target, holes);

    window.addEventListener('resize', () => {
        targetSpeed = innerWidth < 800 ? 3 : 5;
    });

    gun.addEventListener('click', handleShoot);
    gun.addEventListener('touchstart', e => {
        e.preventDefault();
        handleShoot();
    }, { passive: false });
});