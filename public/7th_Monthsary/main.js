const GRID_SIZE = 32;
let board, input, contextMenu, colorDropdown, contextNote;

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
        createNote({ id: note.id, text: note.text, left: note.left, top: note.top, color: note.color });
    });
}

function createNote({ id = null, text, left, top, color }) {
    const tempId = id || `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existingNote = document.querySelector(`#board [data-id='${id || tempId}']`);
    if (existingNote) return existingNote;

    const note = document.createElement("div");
    note.className = "note";
    note.textContent = text || "";
    note.style.left = left + "px";
    note.style.top = top + "px";
    note.style.backgroundColor = color || "#FFF8A6";

    note.dataset.id = id || tempId;
    note.dataset.color = color || "#FFF8A6";

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

            isDragging = false;
            note.dataset.isDragging = "false";

            if (snappedX !== startX || snappedY !== startY) {
                saveNoteToServer(note, note.dataset.id, { left: startX, top: startY })
            }
        }

        note.addEventListener("pointermove", moveHandler);
        note.addEventListener("pointerup", upHandler);
    });
}

function makeNoteEditable(note) {
    note.addEventListener("dblclick", () => {
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
            saveNoteToServer(note, note.dataset.id, null, textarea.value).then(saved => {
                if (saved) note.dataset.id = saved.id;
            });
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
        if (!confirm("Are you sure you want to delete this note?")) {
            hideContextMenu();
            return;
        }

        // for some reason this works better than passing contextNote directly
        // what the fuck
        const noteToDelete = contextNote;
        if (!noteToDelete) return;

        await deleteNoteFromServer(noteToDelete.dataset.id);
        noteToDelete.remove();
        hideContextMenu();
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

    // force reset state
    note.dataset.isDragging = "false";
    const textarea = note.querySelector("textarea");
    if (textarea) {
        note.textContent = textarea.value;
        textarea.remove();
    }

    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
    if (colorDropdown) colorDropdown.style.display = "none";
}

function hideContextMenu() {
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
            createNote({ id: payload.new.id, text: payload.new.text, left: payload.new.left, top: payload.new.top, color: payload.new.color });
        } else if (payload.eventType === "UPDATE" && payload.new) {
            const existingNote = document.querySelector(`.note[data-id='${payload.new.id}']`);
            if (existingNote && !existingNote.querySelector("textarea")) {
                existingNote.textContent = payload.new.text;
                existingNote.style.left = payload.new.left + "px";
                existingNote.style.top = payload.new.top + "px";
                existingNote.style.backgroundColor = payload.new.color;
                existingNote.dataset.color = payload.new.color;
            }
        }
    };
    client.channel("public:board")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board" }, handleChange)
        .subscribe();
}

function setupChangeColorDropdown() {
    const changeColorBtn = document.getElementById("changeColor"); // inside context menu
    const colors = ["#FFFFFF", "#FFF8A6", "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];

    colorDropdown = document.createElement("div");
    colorDropdown.className = "color-dropdown";

    colors.forEach(color => {
        const colorOption = document.createElement("div");
        colorOption.className = "color-option";
        colorOption.style.backgroundColor = color;

        colorOption.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!contextNote) return;

            contextNote.style.backgroundColor = color;
            contextNote.dataset.color = color;

            await saveNoteToServer(contextNote, contextNote.dataset.id);
            hideContextMenu();
            colorDropdown.style.display = "none";
        });

        colorDropdown.appendChild(colorOption);
    });

    document.body.appendChild(colorDropdown);

    changeColorBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent document click
        if (!contextNote) return;

        const rect = changeColorBtn.getBoundingClientRect();
        colorDropdown.style.left = (rect.right + 2) + "px"; // show to the right of the button
        colorDropdown.style.top = (rect.top - 2) + "px";    // align top
        colorDropdown.style.display = "flex";
    });

    document.addEventListener("click", () => {
        colorDropdown.style.display = "none";
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
    setupChangeColorDropdown();

    document.getElementById("addNote").addEventListener("click", () => {
        const text = input.value;
        if (!text.trim()) return;

        createNote({ text, left: 50, top: 50 });
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