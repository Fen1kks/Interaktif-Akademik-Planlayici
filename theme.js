const ThemeManager = {
    // Theme Definitions
    THEMES: {
        light: {
            id: 'light',
            name: 'Light',
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
            colors: {
                primary: '#4083c5', 
                bg: '#ffffff'
            }
        },
        dark: {
            id: 'dark',
            name: 'Dark',
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
            colors: {
                primary: '#60a5fa',
                bg: '#1a1b26'
            }
        },
        rose: {
            id: 'rose',
            name: 'Rose',
            icon: '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>',
            colors: {
                primary: '#fdcddb',
                bg: '#fff0f5'
            }
        }
    },

    currentTheme: 'light',

    init() {
        // Load from storage or default
        const saved = localStorage.getItem('app-theme') || 'light';
        // Validate
        this.currentTheme = this.THEMES[saved] ? saved : 'light';
        
        this.applyTheme(this.currentTheme);
        this.renderModal();
        this.setupEventListeners();
    },

    applyTheme(themeId) {
        if (!this.THEMES[themeId]) return;

        this.currentTheme = themeId;
        localStorage.setItem('app-theme', themeId);
        
        // Remove all theme classes
        document.documentElement.className = ''; 
        // Add new theme class
        document.documentElement.classList.add(`theme-${themeId}`);
        // For compatibility with CSS generic variables
        document.documentElement.setAttribute('data-theme', themeId);
        
        // Update Chart/UI colors if needed (force redraws)
        if (typeof render === 'function') render();
    },

    openModal() {
        const modal = document.getElementById('theme-modal-overlay');
        if (modal) modal.style.display = 'flex';
    },

    closeModal() {
        const modal = document.getElementById('theme-modal-overlay');
        if (modal) modal.style.display = 'none';
    },

    setupEventListeners() {
        const btn = document.getElementById('theme-palette-btn');
        if (btn) btn.addEventListener('click', () => this.openModal());

        const modal = document.getElementById('theme-modal-overlay');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    },

    renderModal() {
        // Check if modal container exists, if not create it
        let overlay = document.getElementById('theme-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'theme-modal-overlay';
            overlay.className = 'theme-modal-overlay';
            document.body.appendChild(overlay);
        }

        const themesHTML = Object.values(this.THEMES).map(t => `
            <div class="theme-option" onclick="ThemeManager.selectTheme('${t.id}')">
                <div class="theme-preview" style="background-color: ${t.colors.bg}; border: 2px solid ${t.colors.primary}">
                    <div style="color: ${t.colors.primary}">${t.icon}</div>
                </div>
                <span>${t.name}</span>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="theme-modal">
                <div class="theme-modal-header">
                    <h3>Select Theme</h3>
                    <button class="close-btn" onclick="ThemeManager.closeModal()">✕</button>
                </div>
                <div class="theme-grid">
                    ${themesHTML}
                </div>
            </div>
        `;
    },

    selectTheme(id) {
        this.applyTheme(id);
        this.closeModal();
    }
};

window.ThemeManager = ThemeManager;
