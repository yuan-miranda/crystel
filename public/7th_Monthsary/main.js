const GRID_SIZE = 32;
let board, input, contextMenu, contextNote;

// Load or prompt for board password
function loadPassword() {
    let pw = localStorage.getItem("boardPassword") || prompt("Enter board password (for editing) else ignore this:") || "";
    localStorage.setItem("boardPassword", pw);
    window.boardPassword = pw;
    return pw;
}

// Retry an action if password was incorrect
async function retryWithPassword(action, rollback) {
    localStorage.removeItem("boardPassword");
    const pw = prompt("Incorrect password. Enter again:");
    if (pw === null) {
        if (rollback) rollback(); // Revert changes if user cancels
        alert("Edit canceled. You must have the correct password to make changes.");
        return null;
    }
    window.boardPassword = pw;
    localStorage.setItem("boardPassword", pw);
    return action();
}

// Save a note to the server with password authentication
async function saveNoteToServer(note, id, restorePos = null, restoreText = null) {
    const body = {
        id,
        text: note.textContent,
        left: parseInt(note.style.left),
        top: parseInt(note.style.top),
        inputPassword: window.boardPassword
    };

    const res = await fetch("/api/save_board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (res.status === 403) {
        // Restore note if save failed
        if (restorePos) {
            note.style.left = restorePos.x + "px";
            note.style.top = restorePos.y + "px";
        }
        if (restoreText !== null) note.textContent = restoreText;

        // Retry save after prompting for correct password
        return retryWithPassword(
            () => saveNoteToServer(note, id, restorePos, restoreText),
            () => {
                if (restorePos) {
                    note.style.left = restorePos.x + "px";
                    note.style.top = restorePos.y + "px";
                }
                if (restoreText !== null) note.textContent = restoreText;
            }
        );
    }

    const json = await res.json();
    return json.data?.[0];
}

// Delete note from server with password handling
async function deleteNoteFromServer(id) {
    const res = await fetch("/api/delete_board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, inputPassword: window.boardPassword })
    });

    if (res.status === 403) return retryWithPassword(() => deleteNoteFromServer(id));
}

// Load notes from server
async function loadNotes() {
    const notes = await (await fetch("/api/load_board")).json();
    notes.forEach(n => createNote({ id: n.id, text: n.text, left: n.left_pos, top: n.top_pos }));
}

// Create a note element
function createNote({ id = null, text, left, top }) {
    if (id) {
        const existing = document.querySelector(`.note[data-id='${id}']`);
        if (existing) return existing;
    }

    const note = document.createElement("div");
    note.className = "note";
    note.textContent = text;
    note.dataset.id = id || "";
    note.style.left = left + "px";
    note.style.top = top + "px";

    board.appendChild(note);
    attachDragging(note);
    attachEditing(note);
    attachContextMenu(note);

    if (!id) saveNoteToServer(note, null).then(saved => { if (saved) note.dataset.id = saved.id; });
    return note;
}

// Enable drag-and-drop with grid snapping
function attachDragging(note) {
    let isDragging = false;
    note.dataset.isDragging = "false";

    note.addEventListener("pointerdown", e => {
        if (note.querySelector("textarea")) return;

        note.setPointerCapture(e.pointerId);
        const startX = note.offsetLeft, startY = note.offsetTop;
        const offsetX = e.clientX - startX, offsetY = e.clientY - startY;

        function moveHandler(e) {
            isDragging = true;
            note.dataset.isDragging = "true";
            note.style.left = (e.clientX - offsetX) + "px";
            note.style.top = (e.clientY - offsetY) + "px";
        }

        function upHandler() {
            note.removeEventListener("pointermove", moveHandler);
            note.removeEventListener("pointerup", upHandler);
            note.releasePointerCapture(e.pointerId);

            // Snap note to grid
            let snappedX = Math.min(board.offsetWidth - note.offsetWidth, Math.max(0, Math.round(note.offsetLeft / GRID_SIZE) * GRID_SIZE));
            let snappedY = Math.min(board.offsetHeight - note.offsetHeight, Math.max(0, Math.round(note.offsetTop / GRID_SIZE) * GRID_SIZE));
            note.style.left = snappedX + "px";
            note.style.top = snappedY + "px";

            if (snappedX !== startX || snappedY !== startY) saveNoteToServer(note, note.dataset.id, { x: startX, y: startY });
            isDragging = false;
            note.dataset.isDragging = "false";
        }

        note.addEventListener("pointermove", moveHandler);
        note.addEventListener("pointerup", upHandler);
    });
}

// Enable editing on double click
function attachEditing(note) {
    note.addEventListener("dblclick", () => {
        if (note.querySelector("textarea")) return;
        const originalText = note.textContent;

        const noteWidth = note.offsetWidth;
        const textarea = document.createElement("textarea");
        textarea.classList.add("note-input-textarea");
        textarea.style.width = noteWidth + "px";
        textarea.value = originalText;
        note.innerHTML = "";
        note.appendChild(textarea);
        textarea.focus();

        // Auto resize textarea as user types
        const autoResize = () => {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        };
        autoResize();
        textarea.addEventListener("input", autoResize);

        textarea.addEventListener("blur", async () => {
            note.textContent = textarea.value || " ";
            const saved = await saveNoteToServer(note, note.dataset.id, null, originalText);
            if (saved) note.dataset.id = saved.id;
        });

        textarea.addEventListener("keydown", e => { if (e.key === "Enter") e.stopPropagation(); });
    });
}

// Setup the right-click context menu
function setupContextMenu() {
    contextMenu = document.querySelector(".context-menu");
    const deleteItem = document.getElementById("deleteNote");

    const hoverEffect = e => {
        deleteItem.style.backgroundColor = e.type === "mouseover" ? "#6c63ff" : "transparent";
        deleteItem.style.color = e.type === "mouseover" ? "white" : "#333";
    };
    deleteItem.addEventListener("mouseover", hoverEffect);
    deleteItem.addEventListener("mouseout", hoverEffect);

    deleteItem.addEventListener("click", async () => {
        if (contextNote) { await deleteNoteFromServer(contextNote.dataset.id); contextNote.remove(); hideContextMenu(); }
    });

    document.addEventListener("click", hideContextMenu);
}

// Attach context menu to a note
function attachContextMenu(note) {
    note.addEventListener("contextmenu", e => {
        if (note.querySelector("textarea") || note.dataset.isDragging === "true") return;
        e.preventDefault();
        showContextMenu(note, e.pageX, e.pageY);
    });

    let pressTimer;
    note.addEventListener("touchstart", e => {
        if (!note.querySelector("textarea"))
            pressTimer = setTimeout(() => {
                const touch = e.touches[0];
                showContextMenu(note, touch.pageX, touch.pageY);
            }, 600);
    });
    note.addEventListener("touchend", () => clearTimeout(pressTimer));
    note.addEventListener("touchmove", () => clearTimeout(pressTimer));
}

// Show the context menu at specific coordinates
function showContextMenu(note, x, y) {
    contextNote = note;
    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
}

// Hide the context menu
function hideContextMenu() {
    contextNote = null;
    if (contextMenu) contextMenu.style.display = "none";
}

// Setup real-time updates via Supabase
function setupRealtime(client) {
    const handleChange = (payload) => {
        const n = payload.new || payload.old;
        const existing = document.querySelector(`.note[data-id='${n.id}']`);
        if (payload.eventType === "DELETE") existing?.remove();
        else if (payload.eventType === "INSERT") createNote({ id: n.id, text: n.text, left: n.left_pos, top: n.top_pos });
        else if (payload.eventType === "UPDATE" && existing && !existing.querySelector("textarea")) {
            existing.textContent = n.text;
            existing.style.left = n.left_pos + "px";
            existing.style.top = n.top_pos + "px";
        }
    };

    client.channel("public:board")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "board" }, handleChange)
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board" }, handleChange)
        .subscribe();
}

// Initialize board after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    board = document.getElementById("board");
    input = document.getElementById("noteInput");

    const supabaseClient = supabase.createClient(
        "https://mqgdwchkvbvurppqepnr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2R3Y2hrdmJ2dXJwcHFlcG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDEwODUsImV4cCI6MjA4MDY3NzA4NX0.6VaZkb5mGTCSztqXxBVY8YwHm6kKAHZr_jGD3EyWztQ"
    );

    loadPassword();
    setupContextMenu();

    document.getElementById("addBtn").addEventListener("click", () => {
        const text = input.value;
        if (!text) return;
        createNote({ text, left: Math.random() * (board.offsetWidth - 150), top: Math.random() * (board.offsetHeight - 150) });
        input.value = "";
    });

    document.getElementById("clearBtn").addEventListener("click", async () => {
        if (!confirm("Delete ALL notes?")) return;
        for (const note of document.querySelectorAll(".note")) await deleteNoteFromServer(note.dataset.id);
        board.innerHTML = "";
    });

    setupRealtime(supabaseClient);
    loadNotes();
});

window.addEventListener("focus", loadNotes);
