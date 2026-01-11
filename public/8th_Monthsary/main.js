const conveyor = document.getElementById("conveyor");
const zones = [document.getElementById("zone-left"), document.getElementById("zone-right")];

let block = null;
let x = -120;
const speed = 4;
let dragging = false;
let offsetX = 0;
let offsetY = 0;

/* ===== Modular Functions ===== */

// Spawn a new block
function spawnBlock() {
    block = document.createElement("div");
    block.className = "block";
    block.style.background = `hsl(${Math.random() * 360},70%,55%)`;
    x = -120;

    document.body.appendChild(block);
    positionBlockAtConveyor(block);
    enableDrag(block);
}

// Position block at conveyor center vertically
function positionBlockAtConveyor(el) {
    const rect = conveyor.getBoundingClientRect();
    el.style.top = rect.top + (rect.height - el.offsetHeight) / 2 + "px";
    el.style.left = x + "px";
}

// Enable dragging behavior
function enableDrag(el) {
    el.addEventListener("pointerdown", e => startDrag(e, el));
    el.addEventListener("pointermove", e => dragMove(e, el));
    el.addEventListener("pointerup", e => endDrag(e, el));
}

// Start dragging
function startDrag(e, el) {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.cursor = "grabbing";
}

// Drag move
function dragMove(e, el) {
    if (!dragging) return;

    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    // Clamp block inside viewport
    newLeft = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, newTop));

    el.style.left = newLeft + "px";
    el.style.top = newTop + "px";
}

// End drag
function endDrag(e, el) {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = "grab";

    if (isOverZone(el)) {
        el.remove();
    } else {
        popBlock(el);
    }

    spawnBlock();
}

// Check if block is over any zone
function isOverZone(el) {
    const rect = el.getBoundingClientRect();
    return zones.some(z => {
        const zRect = z.getBoundingClientRect();
        return !(rect.right < zRect.left || rect.left > zRect.right || rect.bottom < zRect.top || rect.top > zRect.bottom);
    });
}

// Pop animation for blocks not dropped on a zone
function popBlock(el) {
    el.classList.add("pop");
    setTimeout(() => el.remove(), 1000);
}

// Main animation loop
function loop() {
    if (block && !dragging) {
        const centerX = window.innerWidth / 2 - block.offsetWidth / 2;
        const conveyorRect = conveyor.getBoundingClientRect();
        const conveyorCenterY = conveyorRect.top + (conveyorRect.height - block.offsetHeight) / 2;

        if (x < centerX) {
            x += speed;
            if (x > centerX) x = centerX;
        }

        block.style.left = x + "px";
        block.style.top = conveyorCenterY + "px";
    }
    requestAnimationFrame(loop);
}

/* ===== Initialize Game ===== */
spawnBlock();
loop();