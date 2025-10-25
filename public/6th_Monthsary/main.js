const targets = [...document.querySelectorAll('.target-img')];
let speed = innerWidth < 800 ? 2 : 5;
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

function getRandomMessage() {
    if (messagePool.length === 0) messagePool = [...messages];
    const index = Math.floor(Math.random() * messagePool.length);
    return messagePool.splice(index, 1)[0];
}

// Sounds
const gunSound = new Audio('media/pistolShot.mp3');
gunSound.volume = 1.0;

const bgMusic = new Audio('media/Tensionado_Soapdish.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;
let bgMusicStarted = false;

function startBgMusicOnce() {
    if (!bgMusicStarted) {
        bgMusic.play().then(() => {
            bgMusicStarted = true;
        }).catch((err) => {
            console.warn('Background music failed to play:', err);
        });
    }
}

// --- INITIAL OVERLAY LOGIC ---
const initialOverlay = document.getElementById('initialOverlay');
let overlayActive = true;

function hideInitialOverlay() {
    initialOverlay.classList.add('hidden');
    setTimeout(() => {
        initialOverlay.style.display = 'none';
        overlayActive = false;
        captionBox.innerHTML = `<h3>${getRandomMessage()}</h3>`;
        startBgMusicOnce();
    }, 500);
}

initialOverlay.addEventListener('click', hideInitialOverlay);
initialOverlay.addEventListener('touchstart', hideInitialOverlay);

// Track bullet holes
const holes = new Map();

// Start targets off-screen right
targets.forEach(img => {
    img.style.position = 'absolute';
    img.style.left = window.innerWidth + 'px';
    img.style.top = '0px';
});

// Movement loop
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

// Fire action
function fire() {
    const chRect = crosshair.getBoundingClientRect();
    const cx = chRect.left + chRect.width / 2;
    const cy = chRect.top + chRect.height / 2;

    const hit = document.elementFromPoint(cx, cy);
    if (!hit) return; // nothing under crosshair → NO sound, NO caption

    const target = hit.closest('.target-img');
    if (!target) return; // not a target → NO sound, NO caption

    // ✅ Only update caption when there is a REAL hit
    captionBox.innerHTML = `<h3>${getRandomMessage()}</h3>`;

    // ✅ Only play gun sound if it actually hit
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

    const gun = document.querySelector('.pointing-gun');
    gun.classList.add('recoil');
    setTimeout(() => gun.classList.remove('recoil'), 100);
}

// Controls - unified click & touch handling
function handleShoot() {
    if (overlayActive) return; // prevent shooting until overlay is gone
    startBgMusicOnce();
    fire();
}

window.addEventListener('click', handleShoot);

window.addEventListener('touchstart', e => {
    e.preventDefault(); // ensures no double execution
    handleShoot();
}, { passive: false });
