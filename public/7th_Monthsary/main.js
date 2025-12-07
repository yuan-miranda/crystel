document.addEventListener("DOMContentLoaded", () => {

    const addBtn = document.getElementById("addBtn");
    const clearBtn = document.getElementById("clearBtn");
    const input = document.getElementById("noteInput");
    const board = document.getElementById("board");

    const GRID_SIZE = 32;

    // Ask for password once (you can style this later)
    window.boardPassword = prompt("Enter board password (for editing):") || "";

    /* ---------------- SAVE NOTE TO SERVER ---------------- */
    async function saveNoteToServer(note, id = null) {
        const body = {
            id: id,
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

        const data = await res.json();
        return data.data?.[0]; // returns the inserted/updated row
    }

    /* ---------------- DELETE NOTE FROM SERVER ---------------- */
    async function deleteNoteFromServer(id) {
        await fetch("/api/delete_board", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id,
                inputPassword: window.boardPassword
            })
        });
    }

    /* ---------------- LOAD NOTES FROM SERVER ---------------- */
    async function loadNotes() {
        const res = await fetch("/api/load_board");
        const notes = await res.json();

        notes.forEach(data => {
            createNote({
                id: data.id,
                text: data.text,
                left: data.left_pos,
                top: data.top_pos
            });
        });
    }

    /* ---------------- DRAG HANDLER ---------------- */
    function attachDragging(note) {
        note.addEventListener("pointerdown", (e) => {
            note.setPointerCapture(e.pointerId);

            let offsetX = e.clientX - note.offsetLeft;
            let offsetY = e.clientY - note.offsetTop;

            function moveHandler(e) {
                note.style.left = (e.clientX - offsetX) + "px";
                note.style.top = (e.clientY - offsetY) + "px";
            }

            async function upHandler() {
                let x = parseInt(note.style.left);
                let y = parseInt(note.style.top);

                x = Math.round(x / GRID_SIZE) * GRID_SIZE;
                y = Math.round(y / GRID_SIZE) * GRID_SIZE;

                const maxX = board.offsetWidth - note.offsetWidth;
                const maxY = board.offsetHeight - note.offsetHeight;

                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (x > maxX) x = maxX;
                if (y > maxY) y = maxY;

                note.style.left = x + "px";
                note.style.top = y + "px";

                await saveNoteToServer(note, note.dataset.id);

                note.removeEventListener("pointermove", moveHandler);
                note.removeEventListener("pointerup", upHandler);
            }

            note.addEventListener("pointermove", moveHandler);
            note.addEventListener("pointerup", upHandler);
        });

        /* ---------------- DOUBLE-CLICK TO EDIT ---------------- */
        note.addEventListener("dblclick", () => {
            if (note.querySelector("textarea")) return;

            const originalText = note.textContent;

            const textarea = document.createElement("textarea");
            textarea.value = originalText;
            textarea.style.width = "100%";
            textarea.style.boxSizing = "border-box";
            textarea.style.border = "none";
            textarea.style.outline = "none";
            textarea.style.resize = "none";
            textarea.style.background = "transparent";
            textarea.style.fontSize = "14px";
            textarea.style.fontFamily = "inherit";
            textarea.style.overflow = "hidden";

            note.innerHTML = "";
            note.appendChild(textarea);

            textarea.focus();

            /* ---------- AUTO RESIZE ---------- */
            function autoResize() {
                textarea.style.height = "auto";
                textarea.style.height = textarea.scrollHeight + "px";
            }

            autoResize();
            textarea.addEventListener("input", autoResize);

            textarea.addEventListener("blur", async () => {
                note.textContent = textarea.value.trim() || " ";
                const saved = await saveNoteToServer(note, note.dataset.id);
                if (saved) note.dataset.id = saved.id;
            });

            textarea.addEventListener("keydown", (e) => {
                if (e.key === "Enter") e.stopPropagation();
            });
        });
    }

    /* ---------------- CREATE NOTE ELEMENT ---------------- */
    function createNote({ id = null, text, left, top }) {
        const note = document.createElement("div");
        note.className = "note";
        note.textContent = text;
        note.dataset.id = id || "";

        note.style.left = left + "px";
        note.style.top = top + "px";

        board.appendChild(note);
        attachDragging(note);

        // save new notes
        if (!id) {
            saveNoteToServer(note).then(saved => {
                if (saved) note.dataset.id = saved.id;
            });
        }
    }

    /* ---------------- BUTTONS ---------------- */
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

        // Delete one-by-one at server level
        const notes = document.querySelectorAll(".note");
        for (let note of notes) {
            await deleteNoteFromServer(note.dataset.id);
        }

        board.innerHTML = "";
    });

    /* ---------------- START ---------------- */
    loadNotes();
});
