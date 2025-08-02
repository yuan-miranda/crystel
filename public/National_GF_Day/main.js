const words = [];
let currentImageCount = 0;
const activeImages = new Set();
let imagesEnabled = true;

const config = {
    wordCount: 256,
    maxImageOnScreen: 16,
    minSpeed: 2.4,
    maxSpeed: 3.2,
    minFontSize: 24,
    maxFontSize: 32,
    minDepth: -2048,
    maxDepth: 1024,
    resetStartY: -1024,
    widthPadding: 1024,
    minZoom: 0.1,
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

function updateViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    config.minStartY = -window.innerHeight;
    config.fallThreshold = window.innerHeight + 512;
}

function updateMaxStuffOnScreen() {
    if (window.innerWidth < 800) {
        config.wordCount = 48;
        config.maxImageOnScreen = 6;
    }
}

window.addEventListener('resize', updateViewportHeight);
window.addEventListener('orientationchange', updateViewportHeight);
window.addEventListener('resize', updateMaxStuffOnScreen);
window.addEventListener('orientationchange', updateMaxStuffOnScreen);

updateViewportHeight();
updateMaxStuffOnScreen();

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function resetWord(element) {
    if (element.firstChild && element.firstChild.tagName === "IMG") {
        const prevImgSrc = element.firstChild.src;
        const imgFile = prevImgSrc.substring(prevImgSrc.lastIndexOf("media/"));
        activeImages.delete(imgFile);
        currentImageCount--;
    }

    element.innerHTML = "";

    const canAddImage = currentImageCount < config.maxImageOnScreen;
    const availableImages = config.images.filter(img => !activeImages.has(img));
    const isImage = imagesEnabled && canAddImage && availableImages.length > 0 && Math.random() < 0.2;

    if (isImage) {
        const randomImg = availableImages[Math.floor(Math.random() * availableImages.length)];
        const img = document.createElement("img");
        img.src = randomImg;
        element.appendChild(img);
        activeImages.add(randomImg);
        currentImageCount++;
    } else {
        element.textContent = config.texts[Math.random() * config.texts.length | 0];
        element.style.fontSize = config.minFontSize + Math.random() * (config.maxFontSize - config.minFontSize) + 'px';
    }

    const paddedWidth = window.innerWidth + config.widthPadding;
    const x = Math.random() * paddedWidth - config.widthPadding / 2;
    element.style.left = `${x}px`;

    const depth = config.minDepth + Math.random() * (config.maxDepth - config.minDepth);
}

function animate() {
    for (let w of words) {
        w.y += w.speed;
        if (w.y > config.fallThreshold) {
            w.y = config.resetStartY - Math.random() * 100;
            resetWord(w.element);
        }
        w.element.style.transform = `translateY(${w.y}px) translateZ(${w.depth}px)`;
    }
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.getElementById('scene');
    const toggleImagesButton = document.getElementById('toggleImages');
    let suppressSingleTouchUntil = 0;

    toggleImagesButton.addEventListener('click', () => {
        imagesEnabled = !imagesEnabled;

        for (let word of words) {
            const img = word.element.querySelector('img');
            if (img) {
                if (!imagesEnabled) {
                    img.remove();
                    currentImageCount--;
                    activeImages.delete(img.src.substring(img.src.lastIndexOf("media/")));
                }
            }
        }

        toggleImagesButton.textContent = imagesEnabled ? 'Disable Images' : 'Enable Images';
    });

    for (let i = 0; i < config.wordCount; i++) {
        const element = document.createElement('div');
        element.className = 'word';
        scene.appendChild(element);

        const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
        const startY = Math.random() * config.fallThreshold;
        resetWord(element);

        const depth = config.minDepth + Math.random() * (config.maxDepth - config.minDepth);
        words.push({ element, y: startY, speed, depth });
        element.style.transform = `translateY(${startY}px) translateZ(${depth}px)`;
    }

    animate();

    // mouse and touch rotation
    let isDragging = false, lastX = 0, lastY = 0, rotX = 0, rotY = 0;
    let scale = 1;

    function updateSceneTransform() {
        scene.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('mousedown', e => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        rotY += (e.clientX - lastX) * 0.3;
        rotX -= (e.clientY - lastY) * 0.3;
        updateSceneTransform();
        lastX = e.clientX;
        lastY = e.clientY;
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // 1-finger touch rotation
    let lastTouchX = 0, lastTouchY = 0;

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (e.touches.length === 1 && Date.now() > suppressSingleTouchUntil) {
            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            rotY += (touchX - lastTouchX) * 0.3;
            rotX -= (touchY - lastTouchY) * 0.3;
            updateSceneTransform();

            lastTouchX = touchX;
            lastTouchY = touchY;
        }
    }, { passive: true });

    // mouse wheel zoom
    document.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        scale = Math.min(config.maxZoom, Math.max(config.minZoom, scale + delta));
        updateSceneTransform();
    }, { passive: false });

    // 2-finger pinch zoom
    let pinchStartDistance = null;

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            pinchStartDistance = getTouchDistance(e.touches);
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && pinchStartDistance !== null) {
            const pinchCurrentDistance = getTouchDistance(e.touches);
            const pinchDelta = pinchCurrentDistance - pinchStartDistance;
            scale = Math.min(config.maxZoom, Math.max(config.minZoom, scale + pinchDelta * 0.002));
            pinchStartDistance = pinchCurrentDistance;
            updateSceneTransform();
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (e.touches.length < 2) {
            pinchStartDistance = null;

            // suppress 1-finger rotate for 500ms
            suppressSingleTouchUntil = Date.now() + 200;
        }
    });
});
