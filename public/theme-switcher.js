(function () {
    const STORAGE_KEY = 'crystel-theme';
    const DEFAULT_THEME = 'forest';
    const SUPPORTED_THEMES = new Set(['forest', 'crimson']);

    function normalizeTheme(theme) {
        return SUPPORTED_THEMES.has(theme) ? theme : DEFAULT_THEME;
    }

    function readStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function writeStoredTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore write failures (private mode/storage restrictions).
        }
    }

    function resolveInitialTheme() {
        const storedTheme = readStoredTheme();
        if (SUPPORTED_THEMES.has(storedTheme)) {
            return storedTheme;
        }

        const bodyTheme = document.body?.dataset?.theme;
        if (SUPPORTED_THEMES.has(bodyTheme)) {
            return bodyTheme;
        }

        return DEFAULT_THEME;
    }

    function syncSelects(theme) {
        const selects = document.querySelectorAll('[data-theme-select]');
        selects.forEach((select) => {
            if (select.value !== theme) {
                select.value = theme;
            }
        });
    }

    function applyTheme(theme, shouldPersist) {
        const nextTheme = normalizeTheme(theme);
        if (document.body) {
            document.body.dataset.theme = nextTheme;
        }
        syncSelects(nextTheme);

        if (shouldPersist) {
            writeStoredTheme(nextTheme);
        }
    }

    function bindThemeSelects() {
        const selects = document.querySelectorAll('[data-theme-select]');
        selects.forEach((select) => {
            if (!select.dataset.themeBound) {
                select.addEventListener('change', (event) => {
                    applyTheme(event.target.value, true);
                });
                select.dataset.themeBound = 'true';
            }
        });
    }

    function initializeTheme() {
        const initialTheme = resolveInitialTheme();
        applyTheme(initialTheme, true);
        bindThemeSelects();
    }

    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
            applyTheme(event.newValue, false);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
    }
})();