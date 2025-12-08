function loadPassword() {
    let pw = localStorage.getItem("boardPassword");
    if (!pw) {
        pw = prompt("Enter board password (for editing) else ignore this:") || "";
        localStorage.setItem("boardPassword", pw);
    }
    return pw;
}

// Retry a failed action if password was incorrect, rollback if cancelled
async function retryWithPassword(action, rollback) {
    localStorage.removeItem("boardPassword");
    const pw = prompt("Incorrect password. Enter again:");

    if (pw === null) {
        if (rollback) rollback();
        alert("Edit canceled. You must have the correct password to make changes.");
        return null;
    }

    window.boardPassword = pw;
    localStorage.setItem("boardPassword", pw);

    return action();
}

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
        // rollback position/text if password failed
        if (restorePos) {
            note.style.left = restorePos.x + "px";
            note.style.top = restorePos.y + "px";
        }
        if (restoreText !== null) note.textContent = restoreText;

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

async function deleteNoteFromServer(id) {
    const res = await fetch("/api/delete_board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id,
            inputPassword: window.boardPassword
        })
    });

    if (res.status === 403) {
        return retryWithPassword(() => deleteNoteFromServer(id));
    }
}

async function loadNotes() {
    const res = await fetch("/api/load_board");
    const notes = await res.json();

    notes.forEach(n => {
        createNote({
            id: n.id,
            text: n.text,
            left: n.left_pos,
            top: n.top_pos
        });
    });
}

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

    if (!id) {
        saveNoteToServer(note, null).then(saved => {
            if (saved) note.dataset.id = saved.id;
        });
    }

    return note;
}

function attachDragging(note) {
    note.addEventListener("pointerdown", (e) => {
        note.setPointerCapture(e.pointerId);

        const startX = note.offsetLeft;
        const startY = note.offsetTop;

        let offsetX = e.clientX - startX;
        let offsetY = e.clientY - startY;

        function moveHandler(e) {
            note.style.left = (e.clientX - offsetX) + "px";
            note.style.top = (e.clientY - offsetY) + "px";
        }

        function upHandler(e) {
            note.removeEventListener("pointermove", moveHandler);
            note.removeEventListener("pointerup", upHandler);
            note.releasePointerCapture(e.pointerId);

            // snap to grid
            let snappedX = Math.round(note.offsetLeft / GRID_SIZE) * GRID_SIZE;
            let snappedY = Math.round(note.offsetTop / GRID_SIZE) * GRID_SIZE;

            // constrain within board
            const maxX = board.offsetWidth - note.offsetWidth;
            const maxY = board.offsetHeight - note.offsetHeight;

            snappedX = Math.min(maxX, Math.max(0, snappedX));
            snappedY = Math.min(maxY, Math.max(0, snappedY));

            note.style.left = snappedX + "px";
            note.style.top = snappedY + "px";

            if (snappedX !== startX || snappedY !== startY) {
                saveNoteToServer(
                    note,
                    note.dataset.id,
                    { x: startX, y: startY },
                    null
                );
            }
        }

        note.addEventListener("pointermove", moveHandler);
        note.addEventListener("pointerup", upHandler);
    });
}

function attachEditing(note) {
    note.addEventListener("dblclick", () => {
        if (note.querySelector("textarea")) return;

        const originalText = note.textContent;

        const textarea = document.createElement("textarea");
        textarea.value = originalText;
        textarea.style.width = "100%";
        textarea.style.boxSizing = "border-box";
        textarea.style.border = "none";
        textarea.style.background = "transparent";
        textarea.style.resize = "none";
        textarea.style.fontSize = "14px";
        textarea.style.fontFamily = "inherit";
        textarea.style.overflow = "hidden";

        note.innerHTML = "";
        note.appendChild(textarea);
        textarea.focus();

        function autoResize() {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }

        autoResize();
        textarea.addEventListener("input", autoResize);

        textarea.addEventListener("blur", async () => {
            const newText = textarea.value.trim() || " ";
            note.textContent = newText;

            // rollback text if save fails due to wrong password
            const saved = await saveNoteToServer(
                note,
                note.dataset.id,
                null,
                originalText
            );

            if (saved) note.dataset.id = saved.id;
        });

        // prevent Enter key from propagating (for newlines)
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter") e.stopPropagation();
        });
    });
}

function setupRealtime(supabaseClient) {
    supabaseClient
        .channel("public:board")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "board" }, payload => {
            createNote({
                id: payload.new.id,
                text: payload.new.text,
                left: payload.new.left_pos,
                top: payload.new.top_pos
            });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "board" }, payload => {
            const n = payload.new;
            const existing = document.querySelector(`.note[data-id='${n.id}']`);
            if (existing && !existing.querySelector("textarea")) {
                existing.textContent = n.text;
                existing.style.left = n.left_pos + "px";
                existing.style.top = n.top_pos + "px";
            }
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "board" }, payload => {
            document.querySelector(`.note[data-id='${payload.old.id}']`)?.remove();
        })
        .subscribe();
}

const GRID_SIZE = 32;
let board, input;

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    const clearBtn = document.getElementById("clearBtn");
    input = document.getElementById("noteInput");
    board = document.getElementById("board");

    const supabaseClient = supabase.createClient(
        "https://mqgdwchkvbvurppqepnr.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2R3Y2hrdmJ2dXJwcHFlcG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDEwODUsImV4cCI6MjA4MDY3NzA4NX0.6VaZkb5mGTCSztqXxBVY8YwHm6kKAHZr_jGD3EyWztQ"
    );

    window.boardPassword = loadPassword();

    addBtn.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) return;

        createNote({
            text,
            left: Math.random() * (board.offsetWidth - 150),
            top: Math.random() * (board.offsetHeight - 150)
        });

        input.value = "";
    });

    clearBtn.addEventListener("click", async () => {
        if (!confirm("Delete ALL notes?")) return;

        const notes = document.querySelectorAll(".note");
        for (let note of notes) {
            await deleteNoteFromServer(note.dataset.id);
        }

        board.innerHTML = "";
    });

    setupRealtime(supabaseClient);
    loadNotes();
});

window.addEventListener("focus", async () => {
    await loadNotes();
});