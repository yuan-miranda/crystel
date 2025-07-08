class OpeningScreen {
    constructor() {
        this.clickCount = 0;
        this.totalClicksNeeded = 7;
        this.isProcessing = false;
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
        openingScreen.addEventListener('click', () => this.handleClick());
    }

    handleClick() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.clickCount++;
        
        if (this.clickCount === 1) {
            this.enableAudio();
        }
        
        this.updateMessage();
        
        if (this.clickCount >= this.totalClicksNeeded) {
            this.completeOpening();
        } else {
            setTimeout(() => {
                this.isProcessing = false;
            }, 500);
        }
    }

    updateMessage() {
        const titleElement = document.getElementById('openingTitle');
        const messageElement = document.getElementById('openingMessage');
        
        if (this.clickCount < this.totalClicksNeeded) {
            titleElement.textContent = this.messages[this.clickCount - 1] || this.messages[this.messages.length - 1];
            
            if (this.clickCount === Math.floor(this.totalClicksNeeded / 2)) {
                messageElement.innerHTML = 'Tuloy mo lang';
            } else if (this.clickCount === this.totalClicksNeeded - 1) {
                messageElement.innerHTML = 'MALAPIT NA!! 🔥';
            }
        } else {
            titleElement.textContent = "There we go!! 🎉";
            messageElement.innerHTML = 'Finally!!! HAHAHA 💕';
        }
    }

    completeOpening() {
        setTimeout(() => {
            this.fadeOutAndReveal();
        }, 1000);
    }

    enableAudio() {
        const audio = document.querySelector(UI_CONSTANTS.SELECTORS.audio);
        if (audio) {
            audio.play().then(() => {
                updateMusicPlayerState(true);
            }).catch(() => {
                // Audio permission denied, continue anyway
            });
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
                if (window.startAutoplay) {
                    window.startAutoplay();
                }
            }, 100);
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OpeningScreen();
});
