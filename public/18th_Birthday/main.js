// target: December 21, 2025, 1:00 AM Manila Time (UTC+8)
const targetTimeUTC = Date.UTC(2025, 11, 20, 17, 0, 0);
const countdownEl = document.getElementById("countdown");
const overlayEl = document.getElementById("overlay");

const pad = v => String(v).padStart(2, "0");

function updateCountdown() {
    let diff = targetTimeUTC - Date.now();

    if (diff <= 0) {
        overlayEl.style.display = "none";
        return;
    }

    let seconds = Math.floor(diff / 1000);

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    countdownEl.textContent = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);
});