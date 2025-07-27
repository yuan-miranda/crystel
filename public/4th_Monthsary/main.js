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

let index = 0;

function showCarousel() {
    document.getElementById("carousel").style.display = "block";
    document.querySelector(".heart-button").style.display = "none";

    // confetti explosion
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
    });
}


function next() {
    index = (index + 1) % messages.length;
    document.getElementById("carousel-text").textContent = messages[index];
}

function prev() {
    index = (index - 1 + messages.length) % messages.length;
    document.getElementById("carousel-text").textContent = messages[index];
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
    }, 10000000000);
}