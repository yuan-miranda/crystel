// Global Variables
const words = [];
let currentImageCount = 0;
const activeImages = new Set();
let imagesEnabled = true;
let isDragging = false;
let lastX = 0, lastY = 0;
let rotX = 0, rotY = 0;
let targetRotX = 0, targetRotY = 0;
let scale = 1;

// Configuration
const config = {
    wordCount: 256,
    maxImageOnScreen: 16,
    minSpeed: 3.2,
    maxSpeed: 6.4,
    minFontSize: 48,
    maxFontSize: 96,
    minDepth: -4096,
    maxDepth: 2048,
    resetStartY: -1024,
    widthPadding: 3072,
    minZoom: 0.2,
    maxZoom: 3,
    texts: shuffle([
        "I lovee youuuuu", "Hii supp", "Pogi ni yuan", "Mahal kita", "Ingat ka palagi",
        "you meant alot to me", "Hii bebiii kooooooo", "Forever bagay", "Laging ikaw lang!!", "Asawa ko",
        "Kiss kiss muahh", "Dionelaaaa", "Love", "Ganda mo crystal", "Crystel", "Tutel", "Yuan", "YxC",
        "Crysan", "Wattpad", "Prom", "4th monthsary", "03.27.25", "No bingot allowed!!", "Hailey", "Miaaaaa",
        "Scissors", "BL", "Wonwon", "Wonton", "Hwuang", "Eli", "Rhy", "Armpits", "Happy National Girlfriend Day"
    ]),
    images: [
        "media/startofall.png",
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
        "media/IMG_20250802_082912_316.jpg",
        "media/IMG_20250802_082912_411.jpg",
        "media/IMG_20250802_082912_459.jpg",
        "media/IMG_20250802_082912_547.jpg",
        "media/IMG_20250802_082912_549.jpg",
        "media/IMG_20250802_082912_710.jpg",
        "media/IMG_20250802_082912_733.jpg",
        "media/IMG_20250802_082912_750.jpg",
        "media/IMG_20250802_082912_955.jpg",
        "media/IMG_20250802_082913_024.jpg",
        "media/IMG_20250802_082938_686.jpg",
        "media/IMG_20250802_082938_805.jpg",
        "media/IMG_20250802_082938_851.jpg",
        "media/IMG_20250802_082938_966.jpg",
        "media/IMG_20250802_082939_003.jpg",
        "media/IMG_20250802_082939_194.jpg",
        "media/IMG_20250802_082939_254.jpg",
        "media/IMG_20250802_082939_257.jpg",
        "media/IMG_20250802_082939_259.jpg",
        "media/IMG_20250802_082939_280.jpg"
    ]
};

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

function updateSceneTransform() {
    const scene = document.getElementById('scene');
    scene.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
}

function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    config.minStartY = -window.innerHeight;
    config.fallThreshold = window.innerHeight + 2048;
}

function updateMaxStuffOnScreen() {
    if (window.innerWidth < 800) {
        config.wordCount = 48;
        config.maxImageOnScreen = 6;
    }
}

function resetWord(element) {
    // remove existing image if present
    const img = element.querySelector("img");
    if (img) {
        const src = img.src.substring(img.src.lastIndexOf("media/"));
        activeImages.delete(src);
        currentImageCount--;
    }

    element.innerHTML = "";

    const canAddImage = currentImageCount < config.maxImageOnScreen;
    const availableImages = config.images.filter(img => !activeImages.has(img));
    const isImage = imagesEnabled && canAddImage && availableImages.length > 0 && Math.random() < 0.2;

    if (isImage) {
        const randomImg = availableImages[Math.floor(Math.random() * availableImages.length)];
        const imgElement = document.createElement("img");
        imgElement.src = randomImg;
        element.appendChild(imgElement);
        activeImages.add(randomImg);
        currentImageCount++;
    } else {
        element.textContent = config.texts[Math.floor(Math.random() * config.texts.length)];
        element.style.fontSize = `${config.minFontSize + Math.random() * (config.maxFontSize - config.minFontSize)}px`;
    }

    const paddedWidth = window.innerWidth + config.widthPadding;
    element.style.left = `${Math.random() * paddedWidth - config.widthPadding / 2}px`;
}

function animate() {
    for (const word of words) {
        word.y += word.speed;
        if (word.y > config.fallThreshold) {
            word.y = config.resetStartY - Math.random() * 100;
            resetWord(word.element);
        }
        word.element.style.transform = `translateY(${word.y}px) translateZ(${word.depth}px)`;
    }
    requestAnimationFrame(animate);
}

function animateSceneTransform() {
    rotX += (targetRotX - rotX) * 0.1;
    rotY += (targetRotY - rotY) * 0.1;
    updateSceneTransform();
    requestAnimationFrame(animateSceneTransform);
}

function eventListeners() {
    const toggleImagesButton = document.getElementById('toggleImages');
    let suppressSingleTouchUntil = 0;
    let pinchStartDistance = null;
    let lastTouchX = 0, lastTouchY = 0;

    window.addEventListener('resize', () => {
        updateViewportHeight();
        updateMaxStuffOnScreen();
    });

    window.addEventListener('orientationchange', () => {
        updateViewportHeight();
        updateMaxStuffOnScreen();
    });

    toggleImagesButton.addEventListener('click', () => {
        imagesEnabled = !imagesEnabled;
        for (const word of words) {
            const img = word.element.querySelector("img");
            if (img && !imagesEnabled) {
                img.remove();
                activeImages.delete(img.src.substring(img.src.lastIndexOf("media/")));
                currentImageCount--;
            }
        }
        toggleImagesButton.textContent = imagesEnabled ? "Disable Images" : "Enable Images";
    });

    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('mousedown', e => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        targetRotY += (e.clientX - lastX) * 0.3;
        targetRotX -= (e.clientY - lastY) * 0.3;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mouseup', () => isDragging = false);

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            pinchStartDistance = getTouchDistance(e.touches);
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (e.touches.length === 1 && Date.now() > suppressSingleTouchUntil) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;
            targetRotY += (touchX - lastTouchX) * 0.3;
            targetRotX -= (touchY - lastTouchY) * 0.3;
            lastTouchX = touchX;
            lastTouchY = touchY;
        } else if (e.touches.length === 2 && pinchStartDistance !== null) {
            const currentDistance = getTouchDistance(e.touches);
            const delta = currentDistance - pinchStartDistance;
            scale = Math.min(config.maxZoom, Math.max(config.minZoom, scale + delta * 0.002));
            pinchStartDistance = currentDistance;
            updateSceneTransform();
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (e.touches.length < 2) {
            pinchStartDistance = null;
            suppressSingleTouchUntil = Date.now() + 200;
        }
    });

    document.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        scale = Math.min(config.maxZoom, Math.max(config.minZoom, scale + delta));
        updateSceneTransform();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('scene');

    updateViewportHeight();
    updateMaxStuffOnScreen();
    animateSceneTransform();

    for (let i = 0; i < config.wordCount; i++) {
        const el = document.createElement('div');
        el.className = 'word';
        scene.appendChild(el);

        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        const startY = Math.random() * config.fallThreshold;
        resetWord(el);

        const depth = config.minDepth + Math.random() * (config.maxDepth - config.minDepth);
        words.push({ element: el, y: startY, speed, depth });
        el.style.transform = `translateY(${startY}px) translateZ(${depth}px)`;
    }

    animate();
    eventListeners();
});
