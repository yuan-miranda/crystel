const conveyor = document.getElementById("conveyor");
const zones = [document.getElementById("zone-left"), document.getElementById("zone-right")];

let block = null;
let x = -120;
const speed = 4;

let dragging = false;
let offsetX = 0;
let offsetY = 0;

/* ================== BLOCK ================== */

function spawnBlock() {
  block = document.createElement("div");
  block.className = "block";
  block.style.background = `hsl(${Math.random() * 360},70%,55%)`;

  x = -120;
  document.body.appendChild(block);

  positionBlockAtConveyor(block);
  enableDrag(block);
}

function positionBlockAtConveyor(el) {
  const rect = conveyor.getBoundingClientRect();
  el.style.left = x + "px";
  el.style.top = rect.top + (rect.height - el.offsetHeight) / 2 + "px";
}

/* ================== DRAG ================== */

function enableDrag(el) {
  el.addEventListener("pointerdown", onDragStart, { passive: false });
  el.addEventListener("pointermove", onDragMove, { passive: false });
  el.addEventListener("pointerup", onDragEnd);
  el.addEventListener("pointercancel", onDragEnd);
}

function onDragStart(e) {
  e.preventDefault();

  dragging = true;
  const rect = block.getBoundingClientRect();

  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  block.setPointerCapture(e.pointerId);
  block.style.cursor = "grabbing";
}

function onDragMove(e) {
  if (!dragging) return;
  e.preventDefault();

  let left = e.clientX - offsetX;
  let top = e.clientY - offsetY;

  // Clamp inside viewport
  left = Math.max(0, Math.min(window.innerWidth - block.offsetWidth, left));
  top = Math.max(0, Math.min(window.innerHeight - block.offsetHeight, top));

  block.style.left = left + "px";
  block.style.top = top + "px";
}

function onDragEnd() {
  if (!dragging) return;
  dragging = false;

  block.style.cursor = "grab";

  if (isOverZone(block)) {
    block.remove();
  } else {
    popBlock(block);
  }

  spawnBlock();
}

/* ================== ZONES ================== */

function isOverZone(el) {
  const rect = el.getBoundingClientRect();
  return zones.some(zone => {
    const z = zone.getBoundingClientRect();
    return !(rect.right < z.left || rect.left > z.right || rect.bottom < z.top || rect.top > z.bottom);
  });
}

function popBlock(el) {
  el.classList.add("pop");
  setTimeout(() => el.remove(), 1000);
}

/* ================== LOOP ================== */

function loop() {
  if (block && !dragging) {
    const centerX = window.innerWidth / 2 - block.offsetWidth / 2;
    const rect = conveyor.getBoundingClientRect();
    const centerY = rect.top + (rect.height - block.offsetHeight) / 2;

    if (x < centerX) {
      x += speed;
      if (x > centerX) x = centerX;
    }

    block.style.left = x + "px";
    block.style.top = centerY + "px";
  }
  requestAnimationFrame(loop);
}

/* ================== INIT ================== */

spawnBlock();
loop();