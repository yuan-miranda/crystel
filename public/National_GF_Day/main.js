const words = [];
let currentImageCount = 0;
const activeImages = new Set();

const config = {
    wordCount: 96,
    maxImageOnScreen: 16,
    minSpeed: 2.4,
    maxSpeed: 3.2,
    minFontSize: 24,
    maxFontSize: 32,
    minDepth: -1024,
    maxDepth: 1024,
    resetStartY: -256,
    widthPadding: 516,
    texts: shuffle([
        "I lovee youuuuu", "Hii supp", "Pogi ni yuan", "Mahal kita", "Ingat ka palagi",
        "you meant alot to me", "Hii bebiii kooooooo", "Forever bagay", "Laging ikaw lang!!", "Asawa ko",
        "Kiss kiss muahh", "Dionelaaaa", "Love", "Ganda mo crystal", "Crystel", "Tutel", "Yuan", "YxC",
        "Crysan", "Wattpad", "Prom", "4th monthsary", "03.27.25", "No bingot allowed!!", "Hailey", "Miaaaaa",
        "Scissors", "BL", "Wonwon", "Wonton", "Hwuang", "Eli", "Rhy", "Armpits", "Happy National Girlfriend Day"
    ]),
    images: [
        "media/IMG_20250707_220134_775.jpg",
        "media/IMG_20250707_220147_271.jpg",
        "media/IMG_20250707_220156_793.jpg",
        "media/IMG_20250707_220308_684.jpg",
        "media/IMG_20250707_220404_419.jpg",
        "media/IMG_20250707_220439_401.jpg",
        "media/IMG_20250707_222802_345.jpg",
        "media/IMG_20250707_233534_418.jpg",
        "media/IMG_20250801_192839_257.jpg",
        "media/IMG_20250801_192851_118.jpg",
        "media/IMG_20250801_192859_657.jpg",
        "media/IMG_20250801_192926_393.jpg",
        "media/IMG_20250801_192934_237.jpg",
        "media/IMG_20250801_192956_794.jpg",
        "media/IMG_20250801_193017_835.jpg",
        "media/IMG_20250801_193024_312.jpg",
        "media/IMG_20250801_193034_238.jpg",
        "media/IMG_20250801_193054_305.jpg",
        "media/IMG_20250801_193101_123.jpg",
        "media/IMG_20250801_193103_577.jpg",
        "media/IMG_20250801_193115_716.jpg",
        "media/IMG_20250801_193125_430.jpg",
        "media/IMG_20250801_193138_800.jpg",
        "media/IMG_20250801_193146_478.jpg",
        "media/IMG_20250801_193159_292.jpg",
        "media/IMG_20250801_193206_740.jpg",
        "media/IMG_20250801_193218_857.jpg",
        "media/IMG_20250801_193225_751.jpg",
        "media/IMG_20250801_193239_573.jpg",
        "media/IMG_20250801_193301_698.jpg",
        "media/IMG_20250801_193312_418.jpg",
        "media/IMG_20250801_193315_911.jpg",
        "media/IMG_20250801_193328_496.jpg",
        "media/IMG_20250801_193354_524.jpg",
        "media/startofall.png"
    ]
};

let cachedWidth = window.innerWidth;
let cachedHeight = window.innerHeight;

function updateViewportHeight() {
    cachedWidth = window.innerWidth;
    cachedHeight = window.innerHeight;
    const vh = cachedHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    config.minStartY = -cachedHeight;
    config.fallThreshold = cachedHeight + 512;
}

function updateMaxStuffOnScreen() {
    if (cachedWidth < 800) {
        config.maxImageOnScreen = 8;
        config.wordCount = 64;
    }
}

function throttle(fn, limit) {
    let inThrottle;
    return function () {
        if (!inThrottle) {
            fn.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

window.addEventListener('resize', throttle(updateViewportHeight, 200));
window.addEventListener('orientationchange', throttle(updateViewportHeight, 200));
window.addEventListener('resize', throttle(updateMaxStuffOnScreen, 200));
window.addEventListener('orientationchange', throttle(updateMaxStuffOnScreen, 200));

updateViewportHeight();
updateMaxStuffOnScreen();

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function resetWord(element) {
    element.textContent = "";
    element.innerHTML = "";

    const canAddImage = currentImageCount < config.maxImageOnScreen;
    const availableImages = config.images.filter(img => !activeImages.has(img));
    const isImage = canAddImage && availableImages.length > 0 && Math.random() < 0.2;

    if (isImage) {
        const randomImg = availableImages[Math.floor(Math.random() * availableImages.length)];
        const img = document.createElement("img");
        img.src = randomImg;
        element.appendChild(img);
        activeImages.add(randomImg);
        currentImageCount++;
        img.onload = () => { img.dataset.loaded = "true"; };
    } else {
        element.textContent = config.texts[Math.random() * config.texts.length | 0];
        element.style.fontSize = config.minFontSize + Math.random() * (config.maxFontSize - config.minFontSize) + 'px';
    }

    const paddedWidth = cachedWidth + config.widthPadding;
    const x = Math.random() * paddedWidth - config.widthPadding / 2;
    element.style.left = `${x}px`;
}

function animate() {
    for (let w of words) {
        w.y += w.speed;
        if (w.y > config.fallThreshold) {
            w.y = config.resetStartY - Math.random() * 100;
            resetWord(w.element);
        }
        w.element.style.transform = `translate3d(0, ${w.y}px, ${w.depth}px)`;
    }
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('scene');

    for (let i = 0; i < config.wordCount; i++) {
        const element = document.createElement('div');
        element.className = 'word';
        scene.appendChild(element);

        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        const startY = config.minStartY * Math.random();
        const depth = config.minDepth + Math.random() * (config.maxDepth - config.minDepth);

        resetWord(element);
        words.push({ element, y: startY, speed, depth });
        element.style.transform = `translate3d(0, ${startY}px, ${depth}px)`;
    }

    animate();

    // mouse rotate
    let isDragging = false, lastX = 0, lastY = 0, rotX = 0, rotY = 0;

    document.addEventListener('mousedown', e => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        rotY += (e.clientX - lastX) * 0.3;
        rotX -= (e.clientY - lastY) * 0.3;
        scene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // 1 finger touch rotate
    let lastTouchX = 0, lastTouchY = 0;

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (e.touches.length === 1) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            rotY += (touchX - lastTouchX) * 0.3;
            rotX -= (touchY - lastTouchY) * 0.3;
            scene.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

            lastTouchX = touchX;
            lastTouchY = touchY;
        }
    }, { passive: true });
});