(() => {
    'use strict';

    /* ── CONFIG ── */
    const isMobile = window.innerWidth < 600;
    const CFG = {
        wordCount: isMobile ? 40 : 100,
        maxImagesOnScreen: isMobile ? 3 : 6,
        minSpeed: isMobile ? 1.8 : 2.4,
        maxSpeed: isMobile ? 3.2 : 5.0,
        minFontSize: isMobile ? 20 : 28,
        maxFontSize: isMobile ? 44 : 72,
        minDepth: isMobile ? -1200 : -3000,
        maxDepth: isMobile ? 600 : 1400,
        widthPadding: isMobile ? 800 : 2400,
        minZoom: 0.25, maxZoom: 3,
        frameTarget: 16.67,
    };

    const TEXTS = shuffle([
        "I lovee youuuuu", "Hii supp", "Pogi ni yuan", "Mahal kita", "Ingat ka palagi",
        "you meant alot to me", "Hii bebiii kooooooo", "Forever bagay", "Laging ikaw lang!!", "Asawa ko",
        "Kiss kiss muahh", "Dionelaaaa", "Love", "Ganda mo crystel", "Crystel", "Tutel", "Yuan", "YxC",
        "Crysan", "Wattpad", "Prom", "4th monthsary", "03.27.25", "No bingot allowed!!", "Hailey", "Miaaaaa",
        "Scissors", "BL", "Wonwon", "Wonton", "Hwuang", "Eli", "Rhy", "Armpits", "Happy National Girlfriend Day",
        "Miss na miss na kita", "Hug pls 🥺", "Goodmorning mahal", "Ikaw lang sapat na", "Puro ikaw nasa isip ko",
        "Cutiee mo always", "Dito lang ako", "Sama tayo forever", "Uwi ka na pls", "Balik ka na",
        "Hawak kamay", "Gigil kita eh", "Smile mo cure ko", "Kwentuhan tayo ulit", "Iloveyou always always",
        "Lambing pls", "Tulog na love", "Proud of youuu", "You're my peace", "Di ako magsasawa",
        "Yung boses mo 😭", "Kahit kailan ikaw", "Sabay tayo kumain", "Tara na love", "Kahit saan basta ikaw",
        "May date tayo mamaya", "Pa-kiss dyan", "Yakapin mo ako", "Wala nang iba", "Ikaw lang talaga",
        "My safe place", "My baby", "Soft hours", "Iyakin kong love", "Chika mo sakin lahat",
        "Wag ka na tampo pls", "I-ready mo na cheeks mo", "Grabe ka maka-miss", "My person 🫶"
    ]);

    const IMAGES = [
        "media/startofall.png", "media/IMG_20250707_220134_775.jpg", "media/IMG_20250707_220147_271.jpg",
        "media/IMG_20250707_220156_793.jpg", "media/IMG_20250707_220308_684.jpg", "media/IMG_20250707_220404_419.jpg",
        "media/IMG_20250707_220439_401.jpg", "media/IMG_20250707_222802_345.jpg", "media/IMG_20250707_233534_418.jpg",
        "media/IMG_20250801_192839_257.jpg", "media/IMG_20250801_192851_118.jpg", "media/IMG_20250801_192859_657.jpg",
        "media/IMG_20250801_192926_393.jpg", "media/IMG_20250801_192934_237.jpg", "media/IMG_20250801_192956_794.jpg",
        "media/IMG_20250801_193017_835.jpg", "media/IMG_20250801_193024_312.jpg", "media/IMG_20250801_193034_238.jpg",
        "media/IMG_20250801_193054_305.jpg", "media/IMG_20250801_193101_123.jpg", "media/IMG_20250801_193103_577.jpg",
        "media/IMG_20250801_193115_716.jpg", "media/IMG_20250801_193125_430.jpg", "media/IMG_20250801_193138_800.jpg",
        "media/IMG_20250801_193146_478.jpg", "media/IMG_20250801_193159_292.jpg", "media/IMG_20250801_193206_740.jpg",
        "media/IMG_20250801_193218_857.jpg", "media/IMG_20250801_193225_751.jpg", "media/IMG_20250801_193239_573.jpg",
        "media/IMG_20250801_193301_698.jpg", "media/IMG_20250801_193312_418.jpg", "media/IMG_20250801_193315_911.jpg",
        "media/IMG_20250801_193328_496.jpg", "media/IMG_20250801_193354_524.jpg", "media/IMG_20250802_082912_316.jpg",
        "media/IMG_20250802_082912_411.jpg", "media/IMG_20250802_082912_459.jpg", "media/IMG_20250802_082912_547.jpg",
        "media/IMG_20250802_082912_549.jpg", "media/IMG_20250802_082912_710.jpg", "media/IMG_20250802_082912_733.jpg",
        "media/IMG_20250802_082912_750.jpg", "media/IMG_20250802_082912_955.jpg", "media/IMG_20250802_082913_024.jpg",
        "media/IMG_20250802_082938_686.jpg", "media/IMG_20250802_082938_805.jpg", "media/IMG_20250802_082938_851.jpg",
        "media/IMG_20250802_082938_966.jpg", "media/IMG_20250802_082939_003.jpg", "media/IMG_20250802_082939_194.jpg",
        "media/IMG_20250802_082939_254.jpg", "media/IMG_20250802_082939_257.jpg", "media/IMG_20250802_082939_259.jpg",
        "media/IMG_20250802_082939_280.jpg"
    ];

    /* ── STATE ── */
    const words = [];
    const activeImages = new Set();
    let imageCount = 0;
    let imagesEnabled = true;
    let paused = false;
    let isDragging = false;
    let isRightClick = false;
    let lastX = 0, lastY = 0;
    let rotX = 0, rotY = 0, tRotX = 0, tRotY = 0;
    let scale = 1, tScale = 1;
    let panX = 0, panY = 0, tPanX = 0, tPanY = 0;
    let fallThreshold = 0, resetStartY = 0;
    let lastFrame = performance.now();

    const scene = document.getElementById('scene');

    /* ── UTILS ── */
    function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

    function vh() {
        fallThreshold = window.innerHeight + 1500;
        resetStartY = -(window.innerHeight * 0.5);
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function updateSceneTransform() {
        scene.style.transform = `translate(${panX}px,${panY}px) scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    /* ── WORD POOL ── */
    function resetWord(w) {
        const el = w.element;

        // 1. Release image slot (Existing logic)
        if (w.isImage && w.imgSrc) {
            activeImages.delete(w.imgSrc);
            imageCount--;
            w.isImage = false;
            w.imgSrc = null;
        }

        // 2. Determine if it should be an image or text (Existing logic)
        const canImg = imagesEnabled && imageCount < CFG.maxImagesOnScreen;
        const avail = canImg ? IMAGES.filter(s => !activeImages.has(s)) : [];
        const doImg = canImg && avail.length > 0 && Math.random() < 0.15;

        el.innerHTML = '';

        if (doImg) {
            const src = avail[Math.floor(Math.random() * avail.length)];
            const img = document.createElement('img');
            img.src = src;
            img.loading = 'lazy';
            img.decoding = 'async';
            el.appendChild(img);
            activeImages.add(src);
            imageCount++;
            w.isImage = true;
            w.imgSrc = src;
        } else {
            const sp = document.createElement('span');
            sp.textContent = TEXTS[Math.floor(Math.random() * TEXTS.length)];
            const fs = CFG.minFontSize + Math.random() * (CFG.maxFontSize - CFG.minFontSize);
            sp.style.fontSize = fs + 'px';
            el.appendChild(sp);
            w.isImage = false;
        }

        // 3. Set Position
        const pad = CFG.widthPadding;
        w.x = Math.random() * (window.innerWidth + pad) - pad / 2;
        w.y = resetStartY - Math.random() * 200;

        // --- NEW ENTRY ANIMATION LOGIC ---
        // Set variables so the CSS knows where to start the animation
        el.style.setProperty('--tx', `${w.x}px`);
        el.style.setProperty('--ty', `${w.y}px`);
        el.style.setProperty('--tz', `${w.depth}px`);

        // Add the entering class
        el.classList.add('item-entering');

        // Remove the class after animation ends so it doesn't interfere with falling
        setTimeout(() => {
            el.classList.remove('item-entering');
        }, 600);
    }

    function initWords() {
        for (let i = 0; i < CFG.wordCount; i++) {
            const el = document.createElement('div');
            el.className = 'word';
            scene.appendChild(el);

            const w = {
                element: el,
                y: Math.random() * fallThreshold,
                x: 0,
                speed: CFG.minSpeed + Math.random() * (CFG.maxSpeed - CFG.minSpeed),
                depth: CFG.minDepth + Math.random() * (CFG.maxDepth - CFG.minDepth),
                isImage: false,
                imgSrc: null,
            };

            resetWord(w);
            words.push(w);

            // Spread initial y across the whole fall range
            w.y = Math.random() * fallThreshold;
            el.style.transform = `translate3d(${w.x}px,${w.y}px,${w.depth}px)`;
        }
    }

    /* ── ANIMATION LOOP ── */
    function animateWords(now) {
        requestAnimationFrame(animateWords);
        if (paused) return;
        const delta = now - lastFrame;
        if (delta < CFG.frameTarget) return;
        lastFrame = now - (delta % CFG.frameTarget);

        for (let i = 0; i < words.length; i++) {
            const w = words[i];

            // If already exiting, skip the movement logic
            if (w.isExiting) continue;

            w.y += w.speed;

            // Check if it hit the bottom
            if (w.y > fallThreshold) {
                w.isExiting = true;
                // Pass current coordinates to CSS variables for smooth animation start
                w.element.style.setProperty('--tx', `${w.x}px`);
                w.element.style.setProperty('--ty', `${w.y}px`);
                w.element.style.setProperty('--tz', `${w.depth}px`);
                w.element.classList.add('item-exiting');

                // Wait for animation to finish before resetting to top
                setTimeout(() => {
                    w.element.classList.remove('item-exiting');
                    resetWord(w);
                    w.isExiting = false;
                }, 400);
            }

            w.element.style.transform = `translate3d(${w.x}px,${w.y}px,${w.depth}px)`;
        }
    }

function animateScene() {
        requestAnimationFrame(animateScene);
        
        // Use a consistent lerp factor for PC/High Refresh Rate monitors
        // Decreasing these numbers makes it "heavier" and smoother
        const rotationSmooth = 0.08;
        const movementSmooth = 0.12;

        rotX = lerp(rotX, tRotX, rotationSmooth);
        rotY = lerp(rotY, tRotY, rotationSmooth);
        panX = lerp(panX, tPanX, movementSmooth);
        panY = lerp(panY, tPanY, movementSmooth);
        scale = lerp(scale, tScale, movementSmooth);
        
        updateSceneTransform();
    }

    /* ── EVENTS ── */
    const btnPause = document.getElementById('btnPause');
    const btnPhotos = document.getElementById('btnPhotos');
    const iconPause = document.getElementById('iconPause');
    const iconPlay = document.getElementById('iconPlay');
    const iconPhotoOn = document.getElementById('iconPhotoOn');
    const iconPhotoOff = document.getElementById('iconPhotoOff');

    btnPause.addEventListener('click', () => {
        paused = !paused;
        iconPause.style.display = paused ? 'none' : '';
        iconPlay.style.display = paused ? '' : 'none';
    });

    btnPhotos.addEventListener('click', () => {
        imagesEnabled = !imagesEnabled;
        iconPhotoOn.style.display = imagesEnabled ? '' : 'none';
        iconPhotoOff.style.display = imagesEnabled ? 'none' : '';

        if (!imagesEnabled) {
            for (const w of words) {
                if (w.isImage && !w.isExiting) {
                    w.isExiting = true;
                    w.element.style.setProperty('--tx', `${w.x}px`);
                    w.element.style.setProperty('--ty', `${w.y}px`);
                    w.element.style.setProperty('--tz', `${w.depth}px`);
                    w.element.classList.add('item-exiting');

                    setTimeout(() => {
                        w.element.classList.remove('item-exiting');
                        // Use the logic you already had to switch to text
                        w.element.innerHTML = '';
                        const sp = document.createElement('span');
                        sp.textContent = TEXTS[Math.floor(Math.random() * TEXTS.length)];
                        sp.style.fontSize = (CFG.minFontSize + Math.random() * (CFG.maxFontSize - CFG.minFontSize)) + 'px';
                        w.element.appendChild(sp);
                        activeImages.delete(w.imgSrc);
                        imageCount--;
                        w.isImage = false;
                        w.imgSrc = null;
                        w.isExiting = false;
                    }, 400);
                }
            }
        }
    });

    document.addEventListener('contextmenu', e => e.preventDefault());

    // Mouse — left drag = rotate, right drag = pan
    document.addEventListener('mousedown', e => {
        isDragging = true;
        isRightClick = e.button === 2;
        lastX = e.clientX; lastY = e.clientY;
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        if (isRightClick) {
            tPanX += dx; tPanY += dy;
        } else {
            tRotY += dx * 0.3;
            tRotX -= dy * 0.3;
        }
        lastX = e.clientX; lastY = e.clientY;
    });
    document.addEventListener('mouseup', () => { isDragging = false; isRightClick = false; });

    // Touch — single finger = rotate, two fingers = pan + pinch simultaneously (natural)
    let lastTX = 0, lastTY = 0;
    let pinchActive = false, pinchDist = 0, lastMidX = 0, lastMidY = 0;

    function getTouchDist(t) {
        return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    }
    function getTouchMid(t) {
        return [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2];
    }

    document.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            lastTX = e.touches[0].clientX;
            lastTY = e.touches[0].clientY;
            pinchActive = false;
        } else if (e.touches.length >= 2) {
            pinchActive = true;
            pinchDist = getTouchDist(e.touches);
            [lastMidX, lastMidY] = getTouchMid(e.touches);
        }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (e.touches.length === 1 && !pinchActive) {
            const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
            tRotY += (tx - lastTX) * 0.3;
            tRotX -= (ty - lastTY) * 0.3;
            lastTX = tx; lastTY = ty;

        } else if (e.touches.length >= 2 && pinchActive) {
            const newDist = getTouchDist(e.touches);
            const [midX, midY] = getTouchMid(e.touches);

            // Write to target — rAF lerps to it
            const ratio = newDist / pinchDist;
            tScale = Math.min(CFG.maxZoom, Math.max(CFG.minZoom, tScale * ratio));
            tPanX += midX - lastMidX;
            tPanY += midY - lastMidY;

            pinchDist = newDist;
            lastMidX = midX; lastMidY = midY;
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (e.touches.length < 2) pinchActive = false;
        if (e.touches.length === 1) {
            lastTX = e.touches[0].clientX;
            lastTY = e.touches[0].clientY;
        }
    });

document.addEventListener('wheel', e => {
        e.preventDefault();
        // Normalize delta across different browsers/hardware
        const delta = Math.sign(e.deltaY) * 0.15; 
        tScale = Math.min(CFG.maxZoom, Math.max(CFG.minZoom, tScale - (delta * tScale * 0.5)));
    }, { passive: false });

    window.addEventListener('resize', vh);

    /* ── INIT ── */
    vh();
    initWords();
    animateWords(performance.now());
    animateScene();
})();