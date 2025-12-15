const GRID_SIZE = 32;
let board, input, contextMenu, colorDropdown, contextNote;
let isEditing = false;
let idleTimeout = null;
const IDLE_TIME = 1 * 60 * 1000;

function resetIdleTimer() {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => alert(`Ayo bro you still there? You have been idle for ${IDLE_TIME / 1000 / 60} minutes.`), IDLE_TIME);
}

function loadPassword() {
    const password =
        localStorage.getItem("boardPassword")
        || prompt("Enter board password (for editing) else ignore this:")
        || "";
    localStorage.setItem("boardPassword", password);
    window.boardPassword = password;
    return password;
}

async function retryWithPassword(action, rollback) {
    localStorage.removeItem("boardPassword");
    const password = prompt("Incorrect password. Enter again:");

    if (password === null) {
        if (rollback) rollback();
        alert("Edit canceled. You must have the correct password to make changes.");
        return null;
    }

    window.boardPassword = password;
    localStorage.setItem("boardPassword", password);
    return action();
}

async function saveNoteToServer(note, id, restorePos = null, restoreContent = null) {
    const body = {
        id: id,
        refId: note.dataset.refId,
        text: note.dataset.text,
        left: parseInt(note.style.left),
        top: parseInt(note.style.top),
        width: parseInt(note.dataset.width) || 256,
        height: parseInt(note.dataset.height) || 64,
        color: note.dataset.color || "#FFF8A6",
        inputPassword: window.boardPassword || "",
    }

    const response = await fetch("/api/save_board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (response.status === 403) {
        if (restorePos) {
            note.style.left = restorePos.left + "px";
            note.style.top = restorePos.top + "px";
        }
        if (restoreContent !== null) note.dataset.text = restoreContent;

        return retryWithPassword(
            () => saveNoteToServer(note, id, restorePos, restoreContent),
            () => {
                if (restorePos) {
                    note.style.left = restorePos.left + "px";
                    note.style.top = restorePos.top + "px";
                }
                if (restoreContent !== null) note.dataset.text = restoreContent;
            });
    }

    const json = await response.json();
    return json.data?.[0];
}

async function deleteNoteFromServer(id) {
    const response = await fetch("/api/delete_board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inputPassword: window.boardPassword || "" }),
    });
    if (response.status === 403) return retryWithPassword(() => deleteNoteFromServer(id));
}

async function loadNotes() {
    const notes = await fetch("/api/load_board").then(res => res.json());
    notes.forEach(note => {
        let existingNote = document.querySelector(`.note[data-id='${note.id}']`);
        if (existingNote) return;

        createNote({
            id: note.id,
            refId: note.ref_id,
            text: note.text,
            left: note.left,
            top: note.top,
            width: note.width,
            height: note.height,
            color: note.color
        });
    });
}

function createNote({ id = null, refId = null, text, left, top, width, height, color }) {
    const newNote = document.createElement("div");
    newNote.className = "note";
    newNote.dataset.text = text || "";
    newNote.style.left = left + "px";
    newNote.style.top = top + "px";
    newNote.dataset.width = width;
    newNote.dataset.height = height;
    newNote.style.backgroundColor = color || "#FFF8A6";

    newNote.dataset.refId = refId || crypto.randomUUID();
    newNote.dataset.id = id;
    newNote.dataset.color = color || "#FFF8A6";

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    newNote.appendChild(overlay);
    board.appendChild(newNote);
    makeNoteDraggable(newNote);
    makeNoteEditable(newNote);
    makeNoteContextMenu(newNote);

    if (!id) saveNoteToServer(newNote, null).then(res => {
        if (res) {
            newNote.dataset.id = res.id;
            newNote.dataset.refId = res.ref_id;
        }
    });
    return newNote;
}

const enableEditing = (note) => {
    const textarea = note.querySelector("textarea");
    const overlay = note.querySelector(".overlay");

    isEditing = true;
    textarea.disabled = false;
    textarea.style.resize = "both";
    overlay.style.pointerEvents = "none";
    textarea.focus();
}

const disableEditing = (note) => {
    const textarea = note.querySelector("textarea");
    const overlay = note.querySelector(".overlay");

    isEditing = false;
    textarea.disabled = true;
    textarea.style.resize = "none";
    overlay.style.pointerEvents = "auto";
}

function makeNoteEditable(note) {
    const textarea = document.createElement("textarea");
    textarea.value = note.dataset.text;
    textarea.style.width = (note.dataset.width || 256) + "px";
    textarea.style.height = (note.dataset.height || 64) + "px";
    textarea.spellcheck = false;

    note.appendChild(textarea);
    disableEditing(note);

    const resizeHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    };
    requestAnimationFrame(resizeHeight);
    textarea.addEventListener("input", resizeHeight);

    const observer = new ResizeObserver(() => {
        if (textarea.scrollHeight > textarea.offsetHeight) {
            textarea.style.height = textarea.scrollHeight + "px";
        }
    });
    observer.observe(textarea);

    textarea.addEventListener("blur", () => {
        if (!isEditing) return;

        // no changes in text, but also check if size changed
        if (note.dataset.text === textarea.value
            && parseInt(note.dataset.width) === textarea.offsetWidth
            && parseInt(note.dataset.height) === textarea.offsetHeight)
            return disableEditing(note);

        note.dataset.text = textarea.value;
        note.dataset.width = textarea.offsetWidth;
        note.dataset.height = textarea.offsetHeight;
        disableEditing(note);

        saveNoteToServer(note, note.dataset.id, null, textarea.value)
            .then(saved => { if (saved) note.dataset.id = saved.id; });
    });

    textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) textarea.blur();
    });
}

function makeNoteDraggable(note) {
    const overlay = note.querySelector(".overlay");

    let isDragging = false;
    let startX, startY;
    let originLeft, originTop;
    let offsetX, offsetY;
    let activePointerId = null;
    const DRAG_THRESHOLD = 8;

    overlay.addEventListener("pointerdown", e => {
        if (isEditing) return;

        activePointerId = e.pointerId;

        startX = e.clientX;
        startY = e.clientY;

        originLeft = note.offsetLeft;
        originTop = note.offsetTop;

        offsetX = e.clientX - originLeft;
        offsetY = e.clientY - originTop;

        isDragging = false;
        note.dataset.isDragging = "false";

        overlay.setPointerCapture(activePointerId);
    });

    overlay.addEventListener("pointermove", e => {
        if (activePointerId !== e.pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!isDragging) {
            if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
            isDragging = true;
            note.dataset.isDragging = "true";
        }

        note.style.left = (e.clientX - offsetX) + "px";
        note.style.top = (e.clientY - offsetY) + "px";
    });

    const endDrag = e => {
        if (activePointerId !== e.pointerId) return;
        if (overlay.hasPointerCapture(activePointerId)) overlay.releasePointerCapture(activePointerId);
        activePointerId = null;

        if (!isDragging) {
            note.dataset.isDragging = "false";
            return;
        }

        isDragging = false;
        note.dataset.isDragging = "false";

        const snap = (v, max) =>
            Math.min(max, Math.max(0, Math.round(v / GRID_SIZE) * GRID_SIZE));

        const snappedX = snap(note.offsetLeft, board.offsetWidth - note.offsetWidth);
        const snappedY = snap(note.offsetTop, board.offsetHeight - note.offsetHeight);

        const moved =
            snappedX !== originLeft ||
            snappedY !== originTop;

        note.style.left = snappedX + "px";
        note.style.top = snappedY + "px";

        if (moved) saveNoteToServer(note, note.dataset.id, { left: originLeft, top: originTop });
    };

    overlay.addEventListener("pointerup", endDrag);
    overlay.addEventListener("pointercancel", endDrag);
}

function setupContextMenu() {
    contextMenu = document.getElementById("contextMenu");
    const editNote = document.getElementById("editNote");
    const changeColor = document.getElementById("changeColor");
    const deleteContext = document.getElementById("contextDelete");

    const colors = ["#FFFFFF", "#FFF8A6", "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];
    colorDropdown = document.createElement("div");
    colorDropdown.className = "color-dropdown";

    colors.forEach(color => {
        const colorOption = document.createElement("div");
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;

        colorOption.addEventListener("click", async () => {
            if (!contextNote) return;

            contextNote.style.backgroundColor = color;
            contextNote.dataset.color = color;

            await saveNoteToServer(contextNote, contextNote.dataset.id);
            colorDropdown.style.display = "none";
        });
        colorDropdown.appendChild(colorOption);
    });
    document.body.appendChild(colorDropdown);

    deleteContext.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        // for some reason this works better than passing contextNote directly
        // what the fuck
        const noteToDelete = contextNote;
        if (!noteToDelete) return;

        await deleteNoteFromServer(noteToDelete.dataset.id);
        noteToDelete.remove();
    });

    changeColor.addEventListener("click", (e) => {
        e.stopPropagation();
        changeColorDropdown(changeColor);
    });

    editNote.addEventListener("click", () => {
        if (contextNote) enableEditing(contextNote);
    });

    document.addEventListener("click", hideContextMenu);
}

function changeColorDropdown(button) {
    const colorDropdown = document.querySelector(".color-dropdown");

    // align dropdown to the right of the button
    const rect = button.getBoundingClientRect();
    colorDropdown.style.left = (rect.right + 2) + "px";
    colorDropdown.style.top = (rect.top - 2) + "px";
    colorDropdown.style.display = "flex";
}

function makeNoteContextMenu(note) {
    const overlay = note.querySelector(".overlay");

    let pressTimer;
    const LONG_PRESS = 600;

    overlay.addEventListener("pointerdown", e => {
        if (isEditing) return;

        pressTimer = setTimeout(() => {
            if (note.dataset.isDragging === "true") return;
            showContextMenu(e.pageX, e.pageY, note);
        }, LONG_PRESS);
    });

    overlay.addEventListener("pointermove", () => {
        clearTimeout(pressTimer);
    });

    overlay.addEventListener("pointerup", () => {
        clearTimeout(pressTimer);
    });

    overlay.addEventListener("pointercancel", () => {
        clearTimeout(pressTimer);
    });

    // desktop right click
    overlay.addEventListener("contextmenu", e => {
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY, note);
    });
}

function showContextMenu(x, y, note) {
    contextNote = note;

    // force reset state
    note.dataset.isDragging = "false";
    const textarea = note.querySelector("textarea");
    if (textarea) {
        textarea.blur();
    }

    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
    if (colorDropdown) colorDropdown.style.display = "none";
}

function hideContextMenu() {
    if (!contextNote) return;
    contextNote = null;
    if (contextMenu) contextMenu.style.display = "none";
    if (colorDropdown) colorDropdown.style.display = "none";
}

function setupRealtime(client) {
    const handleChange = (payload) => {
        if (payload.eventType === "DELETE" && payload.old) {
            const existingNote = document.querySelector(`.note[data-id='${payload.old.id}']`);
            existingNote?.remove();

        } else if (payload.eventType === "INSERT" && payload.new) {
            let existingNote = document.querySelector(`.note[data-id='${payload.new.id}']`);
            if (existingNote) return;

            existingNote = document.querySelector(`.note[data-ref-id='${payload.new.ref_id}']`);
            if (existingNote) {
                existingNote.dataset.id = payload.new.id;
                return;
            }

            createNote({
                id: payload.new.id,
                refId: payload.new.ref_id,
                text: payload.new.text,
                left: payload.new.left,
                top: payload.new.top,
                width: payload.new.width,
                height: payload.new.height,
                color: payload.new.color
            })

        } else if (payload.eventType === "UPDATE" && payload.new) {
            const existingNote =
                document.querySelector(`.note[data-id='${payload.new.id}']`)
                || document.querySelector(`.note[data-ref-id='${payload.new.ref_id}']`);
            if (!existingNote) return;

            const textarea = existingNote.querySelector("textarea");

            existingNote.dataset.text = payload.new.text;
            if (textarea) textarea.value = payload.new.text;

            existingNote.style.left = payload.new.left + "px";
            existingNote.style.top = payload.new.top + "px";
            existingNote.dataset.width = payload.new.width;
            existingNote.dataset.height = payload.new.height;
            existingNote.style.backgroundColor = payload.new.color;
            existingNote.dataset.color = payload.new.color;
        }
    };
    client.channel("public:board")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board" }, handleChange)
        .subscribe();
}

document.addEventListener("DOMContentLoaded", () => {
    board = document.getElementById("board");
    input = document.getElementById("noteInputField");

    const supabaseClient = supabase.createClient(
        "https://mqgdwchkvbvurppqepnr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2R3Y2hrdmJ2dXJwcHFlcG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDEwODUsImV4cCI6MjA4MDY3NzA4NX0.6VaZkb5mGTCSztqXxBVY8YwHm6kKAHZr_jGD3EyWztQ"
    );

    loadPassword();
    setupContextMenu();

    document.getElementById("addNote").addEventListener("click", () => {
        const text = input.value;
        if (!text.trim()) return;

        createNote({ text, left: 32, top: 32, width: 256, height: 64, color: "#FFF8A6" });
        input.value = "";
    });

    document.getElementById("clearNotes").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete all notes?")) return;
        for (const note of document.querySelectorAll(".note")) {
            await deleteNoteFromServer(note.dataset.id);
        }
        board.innerHTML = "";
    });

    setupRealtime(supabaseClient);
    loadNotes();
});

window.addEventListener("focus", () => loadNotes());

resetIdleTimer();
['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove'].forEach(e => {
    window.addEventListener(e, resetIdleTimer, { passive: true });
});