const GRID_SIZE = 32;
let board, input, contextMenu, contextNote;

function loadPassword() {
    const password = localStorage.getItem("boardPassword") || prompt("Enter board password (for editing) else ignore this:") || "";
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
        text: note.textContent,
        left: parseInt(note.style.left),
        top: parseInt(note.style.top),
        color: note.dataset.color || "#ffff88",
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
        if (restoreContent !== null) note.textContent = restoreContent;

        return retryWithPassword(
            () => saveNoteToServer(note, id, restorePos, restoreContent),
            () => {
                if (restorePos) {
                    note.style.left = restorePos.left + "px";
                    note.style.top = restorePos.top + "px";
                }
                if (restoreContent !== null) note.textContent = restoreContent;
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
        createNote(note.id, note.text, note.left, note.top, note.color);
    });
}

function createNote(id = null, text, left, top, color) {
    if (id) {
        const existingNote = document.querySelector(`#board [data-id='${id}']`);
        if (existingNote) return existingNote;
    }

    const note = document.createElement("div");
    note.className = "note";
    note.textContent = text || "";
    note.style.left = left + "px";
    note.style.top = top + "px";
    note.style.backgroundColor = color || "#fff8a6";

    note.dataset.id = id || "";
    note.dataset.color = color || "#fff8a6";

    board.appendChild(note);
    makeNoteDraggable(note);
    makeNoteEditable(note);
    makeNoteContextMenu(note);

    if (!id) saveNoteToServer(note, null).then(res => {
        if (res) note.dataset.id = res.id;
    });
    return note;
}

function makeNoteDraggable(note) {
    let isDragging = false;
    note.dataset.isDragging = "false";

    note.addEventListener("pointerdown", (e) => {
        if (note.querySelector("textarea")) return;

        note.setPointerCapture(e.pointerId);

        const startX = note.offsetLeft;
        const startY = note.offsetTop;
        const offsetX = e.clientX - startX;
        const offsetY = e.clientY - startY;

        function moveHandler(e) {
            isDragging = true;
            note.dataset.isDragging = "true";
            note.style.left = (e.clientX - offsetX) + "px";
            note.style.top = (e.clientY - offsetY) + "px";
        }

        function upHandler(e) {
            note.removeEventListener("pointermove", moveHandler);
            note.removeEventListener("pointerup", upHandler);
            note.releasePointerCapture(e.pointerId);

            const snap = (v, max) =>
                Math.min(max, Math.max(0, Math.round(v / GRID_SIZE) * GRID_SIZE));

            const snappedX = snap(note.offsetLeft, board.offsetWidth - note.offsetWidth);
            const snappedY = snap(note.offsetTop, board.offsetHeight - note.offsetHeight);

            note.style.left = snappedX + "px";
            note.style.top = snappedY + "px";

            if (snappedX !== startX || snappedY !== startY) {
                saveNoteToServer(
                    note,
                    note.dataset.id,
                    { left: startX, top: startY }
                ).then(() => {
                    isDragging = false;
                    note.dataset.isDragging = "false";
                });
            }
        }

        note.addEventListener("pointermove", moveHandler);
        note.addEventListener("pointerup", upHandler);
    });
}

function makeNoteEditable(note) {
    note.addEventListener("dblclick", () => {
        if (note.dataset.isDragging === "true") return;
        if (note.querySelector("textarea")) return;

        const noteWidth = note.offsetWidth;
        const textarea = document.createElement("textarea");
        textarea.classList.add("note-input-textarea");
        textarea.style.width = noteWidth + "px";
        textarea.value = note.textContent;
        note.textContent = "";
        note.appendChild(textarea);
        textarea.focus();

        const autoResize = () => {
            textarea.style.height = "auto";
            textarea.style.height = (textarea.scrollHeight) + "px";
        };
        autoResize();
        textarea.addEventListener("input", autoResize);

        textarea.addEventListener("blur", () => {
            note.textContent = textarea.value;
            const saved = saveNoteToServer(note, note.dataset.id, null, textarea.value);
            if (saved) note.dataset.id = saved.id;
        });

        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                textarea.blur();
            }
        });
    });
}

function setupContextMenu() {
    contextMenu = document.getElementById("contextMenu");
    const deleteContext = document.getElementById("contextDelete");

    const hoverEffect = e => {
        deleteContext.style.backgroundColor = e.type === "mouseover" ? "#6c63ff" : "transparent";
        deleteContext.style.color = e.type === "mouseover" ? "white" : "#333";
    };
    deleteContext.addEventListener("mouseover", hoverEffect);
    deleteContext.addEventListener("mouseout", hoverEffect);

    deleteContext.addEventListener("click", async () => {
        if (contextNote) {
            await deleteNoteFromServer(contextNote.dataset.id);
            contextNote.remove();
            hideContextMenu();
        }
    });
    document.addEventListener("click", hideContextMenu);
}

function makeNoteContextMenu(note) {
    note.addEventListener("contextmenu", (e) => {
        if (note.querySelector("textarea") || note.dataset.isDragging === "true") return;
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY, note);
    });

    let pressTimer;
    note.addEventListener("touchstart", (e) => {
        if (note.querySelector("textarea")) return;
        pressTimer = setTimeout(() => {
            const touch = e.touches[0];
            showContextMenu(touch.pageX, touch.pageY, note);
        }, 600);
    });

    note.addEventListener("touchend", () => clearTimeout(pressTimer));
    note.addEventListener("touchmove", () => clearTimeout(pressTimer));
}


function showContextMenu(x, y, note) {
    contextNote = note;
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
}

function hideContextMenu() {
    contextNote = null;
    if (contextMenu) contextMenu.style.display = "none";
}

function setupRealtime(client) {
    const handleChange = (payload) => {
        const note = payload.new || payload.old;
        const existingNote = document.querySelector(`.note[data-id='${note.id}']`);

        if (payload.eventType === "DELETE") existingNote?.remove();
        else if (payload.eventType === "INSERT") createNote(note.id, note.text, note.left, note.top, note.color);
        else if (payload.eventType === "UPDATE" && existingNote && !existingNote.querySelector("textarea")) {
            existingNote.textContent = note.text;
            existingNote.style.left = note.left + "px";
            existingNote.style.top = note.top + "px";
            existingNote.style.backgroundColor = note.color;
            existingNote.dataset.color = note.color;
        }
    };
    client.channel("public:board")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board" }, handleChange)
        .subscribe();
}

function setupChangeColorDropdown() {
    const changeColorBtn = document.getElementById("changeColor");
    const colors = ["#FFFFFF", "#FFF8A6", "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF",];

    const dropdown = document.createElement("div");
    dropdown.className = "color-dropdown";

    colors.forEach(color => {
        const colorOption = document.createElement("div");
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;

        colorOption.addEventListener("click", async () => {
            if (!contextNote) return;

            contextNote.style.backgroundColor = color;
            contextNote.dataset.color = color;

            const body = {
                id: contextNote.dataset.id,
                color: color,
                inputPassword: window.boardPassword || "",
            }

            const response = await fetch("/api/save_board", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.status === 403) {
                contextNote.style.backgroundColor = contextNote.dataset.color;
                return retryWithPassword(() => {
                    contextNote.style.backgroundColor = color;
                    contextNote.dataset.color = color;
                    return fetch("/api/save_board", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    });
                });
            }

            hideContextMenu();
        });
        dropdown.appendChild(colorOption);
    });
    changeColorBtn.appendChild(dropdown);

    changeColorBtn.addEventListener("click", (e) => {
        if (!contextNote) return;
        dropdown.style.left = e.clientX + "px";
        dropdown.style.top = e.clientY + "px";
        dropdown.style.display = "block";
    });

    document.addEventListener("click", () => {
        dropdown.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    board = document.getElementById("board");
    input = document.getElementById("noteInput");

    const supabaseClient = supabase.createClient(
        "https://mqgdwchkvbvurppqepnr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2R3Y2hrdmJ2dXJwcHFlcG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDEwODUsImV4cCI6MjA4MDY3NzA4NX0.6VaZkb5mGTCSztqXxBVY8YwHm6kKAHZr_jGD3EyWztQ"
    );

    loadPassword();
    setupContextMenu();
    // setupChangeColorDropdown();

    document.getElementById("addNote").addEventListener("click", () => {
        const text = input.value;
        if (!text.trim()) return;

        createNote(null, text, 50, 50);
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