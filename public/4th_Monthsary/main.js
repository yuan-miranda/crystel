let index = 0;
let sidePhraseIndex = 0;
const messages = [
    "I loveee youuuuu 😄",
    "AHHAHAHHAA",
    "Crystel my love, soo sweet~ 💖",
    "Amor meus amplior quam verba est.",
    "Ikaw yung pinaka cute sa whoooole universe!🥰",
    "I'm so proud of us and how far we've come! ✨",
    "Tumira ng tres, whooohooo sya yung mahal ko! 🎉",
    "Tutel, Tel, Crystel, my love! 💕",
    "Ikaw lang mahal, Laman ng tula, Tunog ng gitara't, Himig ng kanta - Dionela🎶",
    "Ich liebe dich sehr, Crystel! 💞",
    "Happy 4th Monthsary,",
    "Here's to forever - one month at a time 🥂"
];
const sidePhrases = [
    "Still my best decision.",
    "My safest place is with you.",
    "Love you more every month.",
    "Forever sounds better with you."
];

function animateMessageChange(newText) {
    const textEl = document.getElementById("carousel-text");
    textEl.classList.remove("text-swap");
    textEl.textContent = newText;

    // Force reflow so rapid next/prev clicks can retrigger the animation.
    void textEl.offsetWidth;
    textEl.classList.add("text-swap");
}

function showCarousel() {
    const carousel = document.getElementById("carousel");
    carousel.style.display = "block";
    carousel.classList.remove("is-visible");

    // Force reflow so the pop animation always plays when revealed.
    void carousel.offsetWidth;
    carousel.classList.add("is-visible");

    document.querySelector(".heart-button").style.display = "none";
    animateMessageChange(messages[index]);

    // confetti explosion
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
    });
}

function next() {
    index = (index + 1) % messages.length;
    animateMessageChange(messages[index]);
}

function prev() {
    index = (index - 1 + messages.length) % messages.length;
    animateMessageChange(messages[index]);
}

function startHearts() {
    const container = document.getElementById("heartContainer");
    const interval = setInterval(() => {
        const heart = document.createElement("div");
        heart.className = "heart";

        // 1/16 chance for eggplant emoji AHAHHAHAHHA
        heart.textContent = Math.random() < 1 / 16 ? "🍆" : "💖";
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.fontSize = 1 + Math.random() * 1.5 + "rem";
        container.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 5000);
    }, 800);

    setTimeout(() => {
        clearInterval(interval);
    }, 10000000000); // lol
}

function triggerInteractiveHeart() {
    const heartButton = document.getElementById("interactiveHeart");
    const sideTitle = document.getElementById("sideTitle");

    if (!heartButton || !sideTitle) {
        return;
    }

    heartButton.classList.remove("is-bursting");
    void heartButton.offsetWidth;
    heartButton.classList.add("is-bursting");

    sidePhraseIndex = (sidePhraseIndex + 1) % sidePhrases.length;
    sideTitle.classList.remove("text-pop");
    sideTitle.textContent = sidePhrases[sidePhraseIndex];
    void sideTitle.offsetWidth;
    sideTitle.classList.add("text-pop");

    if (typeof confetti === "function") {
        const rect = heartButton.getBoundingClientRect();
        confetti({
            particleCount: 24,
            spread: 58,
            startVelocity: 24,
            scalar: 0.82,
            origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
            }
        });
    }
}

function setupHeartInteraction() {
    const heartButton = document.getElementById("interactiveHeart");

    if (!heartButton) {
        return;
    }

    heartButton.addEventListener("click", triggerInteractiveHeart);
}

setupHeartInteraction();