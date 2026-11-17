const MIN_FONT = 14;
const MAX_FONT = 22;
const DEFAULT_FONT = 16;
const FONT_STEP = 2;

class SiteSettings {
    constructor(storage) {
        this.storage = storage;
        const saved = storage.load();
        this.theme = saved.theme === "dark" ? "dark" : "light";
        this.fontSize = Number.isInteger(saved.fontSize) && saved.fontSize >= MIN_FONT && saved.fontSize <= MAX_FONT
            ? saved.fontSize
            : DEFAULT_FONT;
    }

    toggleTheme() {
        this.theme = this.theme === "dark" ? "light" : "dark";
        this.save();
    }

    changeFont(step) {
        this.fontSize = Math.min(MAX_FONT, Math.max(MIN_FONT, this.fontSize + step));
        this.save();
    }

    resetFont() {
        this.fontSize = DEFAULT_FONT;
        this.save();
    }

    save() {
        this.storage.save({ theme: this.theme, fontSize: this.fontSize });
    }

    apply() {
        const isDark = this.theme === "dark";
        const themeBtn = document.getElementById("theme-btn");

        document.body.classList.toggle("dark-theme", isDark);
        document.documentElement.style.fontSize = this.fontSize + "px";

        if (themeBtn) {
            themeBtn.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const settings = new SiteSettings(new StorageHelper("siteSettings", {}));
    settings.apply();

    function bind(id, action) {
        const button = document.getElementById(id);
        if (!button) return;
        button.addEventListener("click", function () {
            action();
            settings.apply();
        });
    }

    bind("theme-btn", function () { settings.toggleTheme(); });
    bind("font-down", function () { settings.changeFont(-FONT_STEP); });
    bind("font-up", function () { settings.changeFont(FONT_STEP); });
    bind("font-reset", function () { settings.resetFont(); });
});
