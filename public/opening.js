class OpeningScreen {
    constructor() {
        this.clickCount = 0;
        this.totalClicksNeeded = 7;
        this.messages = [
            "Hey Crystel ❤️",
            "loww there",
            "Keep clicking HAHAHA",
            "Oi almost there na!",
            "konti nalang promise",
            "Last na to!!",
            "Ready ka na ba??"
        ];
        this.init();
    }

    init() {
        this.createOpeningScreen();
        this.bindEvents();
    }

    createOpeningScreen() {
        const openingHTML = `
            <div class="opening-screen" id="openingScreen">
                <div class="opening-content">
                    <h1 class="opening-title" id="openingTitle">${this.messages[0]}</h1>
                    <p class="opening-message" id="openingMessage">
                        I made something for you<br>
                        Click ${this.totalClicksNeeded} times to see it
                    </p>
                    <p class="click-instruction">Click anywhere</p>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', openingHTML);
    }

    bindEvents() {
        const openingScreen = document.getElementById('openingScreen');
        openingScreen.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        this.clickCount++;
        
        if (this.clickCount < this.totalClicksNeeded) {
            document.getElementById('openingTitle').textContent = this.messages[this.clickCount - 1] || this.messages[this.messages.length - 1];
            
            if (this.clickCount === Math.floor(this.totalClicksNeeded / 2)) {
                document.getElementById('openingMessage').innerHTML = 
                    `Tuloy mo lang HAHAHA`;
            } else if (this.clickCount === this.totalClicksNeeded - 1) {
                document.getElementById('openingMessage').innerHTML = 
                    `MALAPIT NA!! 🔥`;
            }
        } else {
            document.getElementById('openingTitle').textContent = "AYYYY PERFECT!! 🎉";
            document.getElementById('openingMessage').innerHTML = 
                `Finally!!! HAHAHA 💕`;
            
            setTimeout(() => {
                this.fadeOutAndReveal();
            }, 1000);
        }
    }

    fadeOutAndReveal() {
        const openingScreen = document.getElementById('openingScreen');
        openingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            openingScreen.remove();
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.8s ease';
                document.body.style.opacity = '1';
            }, 100);
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OpeningScreen();
});
