const conveyor = document.getElementById("conveyor");
const zones = [
    document.getElementById("zone-left"),
    document.getElementById("zone-right")
];

const blocks = [];
const speed = 4;
const spawnInterval = 1200;
const MAX_BLOCKS = 4;
const BLOCK_GAP = 16;

function spawnBlock() {
    if (blocks.length >= MAX_BLOCKS) return;

    const el = document.createElement("div");
    el.className = "block";
    el.style.background = `hsl(${Math.random() * 360},70%,55%)`;
    document.body.appendChild(el);

    const block = {
        el,
        x: -el.offsetWidth,
        dragging: false,
        offsetX: 0,
        offsetY: 0,
        placeholder: null
    };

    positionBlockAtConveyor(block);
    enableDrag(block);
    blocks.push(block);
}

function positionBlockAtConveyor(block) {
    const rect = conveyor.getBoundingClientRect();
    block.el.style.left = block.x + "px";
    block.el.style.top =
        rect.top + (rect.height - block.el.offsetHeight) / 2 + "px";
}

function enableDrag(block) {
    const el = block.el;

    el.addEventListener("pointerdown", e => onDragStart(e, block), { passive: false });
    el.addEventListener("pointermove", e => onDragMove(e, block), { passive: false });
    el.addEventListener("pointerup", () => onDragEnd(block));
    el.addEventListener("pointercancel", () => onDragEnd(block));
}

function onDragStart(e, block) {
    e.preventDefault();
    block.dragging = true;

    const rect = block.el.getBoundingClientRect();
    block.offsetX = e.clientX - rect.left;
    block.offsetY = e.clientY - rect.top;

    block.el.setPointerCapture(e.pointerId);
    block.el.classList.add("dragging");

    const ph = document.createElement("div");
    ph.className = "block placeholder";
    ph.style.width = block.el.offsetWidth + "px";
    ph.style.height = block.el.offsetHeight + "px";
    ph.x = block.x;

    document.body.appendChild(ph);
    block.placeholder = ph;
}

function onDragMove(e, block) {
    if (!block.dragging) return;
    e.preventDefault();

    let left = e.clientX - block.offsetX;
    let top = e.clientY - block.offsetY;

    left = clamp(left, 0, window.innerWidth - block.el.offsetWidth);
    top = clamp(top, 0, window.innerHeight - block.el.offsetHeight);

    block.el.style.left = left + "px";
    block.el.style.top = top + "px";
}

function onDragEnd(block) {
    if (!block.dragging) return;
    block.dragging = false;
    block.el.classList.remove("dragging");

    if (block.placeholder) {
        block.placeholder.classList.add("fade-out");
        setTimeout(() => {
            block.placeholder?.remove();
            block.placeholder = null;
        }, 600);
    }

    const index = blocks.indexOf(block);
    if (index !== -1) blocks.splice(index, 1);

    if (isOverZone(block.el)) {
        block.el.remove();
    } else {
        popBlock(block);
    }
}

function isOverZone(el) {
    const rect = el.getBoundingClientRect();
    return zones.some(zone => {
        const z = zone.getBoundingClientRect();
        return !(rect.right < z.left ||
            rect.left > z.right ||
            rect.bottom < z.top ||
            rect.top > z.bottom);
    });
}

function popBlock(block) {
    block.el.classList.add("pop");
    setTimeout(() => block.el.remove(), 1000);
}

function loop() {
    const rect = conveyor.getBoundingClientRect();
    const centerY = rect.top + (rect.height - getBlockHeight()) / 2;

    blocks.forEach((block, index) => {
        const w = block.el.offsetWidth;
        const targetX = window.innerWidth / 2 - w / 2 - index * (w + BLOCK_GAP);

        if (!block.dragging) {
            if (block.x < targetX) {
                block.x += speed;
                if (block.x > targetX) block.x = targetX;
            }
            block.el.style.left = block.x + "px";
            block.el.style.top = centerY + "px";
        }

        if (block.dragging && block.placeholder) {
            if (block.placeholder.x < targetX) {
                block.placeholder.x += speed;
                if (block.placeholder.x > targetX) block.placeholder.x = targetX;
            }
            block.placeholder.style.left = block.placeholder.x + "px";
            block.placeholder.style.top = centerY + "px";
        }
    });

    requestAnimationFrame(loop);
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function getBlockHeight() {
    return blocks[0]?.el.offsetHeight || 0;
}

loop();
setInterval(spawnBlock, spawnInterval);
