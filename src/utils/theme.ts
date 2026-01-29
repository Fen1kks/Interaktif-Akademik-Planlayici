import { ThemeManager as IThemeManager } from '../types';

class ThemeManagerImpl implements IThemeManager {
    private themeBtn: HTMLElement | null = null;
    private modal: HTMLElement | null = null;
    private closeBtn: HTMLElement | null = null;

    init() {
        this.themeBtn = document.getElementById("theme-palette-btn");
        this.modal = document.getElementById("theme-modal-overlay");
        this.closeBtn = document.getElementById("close-theme-modal-btn");
        
        // Load saved theme or system preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            this.setTheme("dark");
        } else {
            this.setTheme("light");
        }

        this.bindEvents();
    }

    private bindEvents() {
        // Open Modal
        if (this.themeBtn) {
            this.themeBtn.addEventListener("click", () => this.openModal());
        }

        // Close Modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.closeModal());
        }

        // Click outside to close
        if (this.modal) {
            this.modal.addEventListener("click", (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        // Theme Options
        document.querySelectorAll(".theme-option").forEach(el => {
            el.addEventListener("click", (e) => {
                const theme = (e.currentTarget as HTMLElement).getAttribute("data-value");
                if (theme) {
                    this.setTheme(theme);
                    this.closeModal();
                }
            });
        });
    }

    openModal() {
        if (this.modal) {
            this.modal.style.display = "flex";
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = "none";
        }
    }

    toggleTheme() {
        // Legacy fallback
        this.openModal();
    }

    setTheme(theme: string) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        this.updateButtonIcon(theme);
    }

    private updateButtonIcon(theme: string) {
        if (!this.themeBtn) return;
        this.themeBtn.dataset.activeTheme = theme;
        window.dispatchEvent(new Event('themeChanged'));
    }
}

export const ThemeManager = new ThemeManagerImpl();
