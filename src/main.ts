import { departments } from './data/registry';
import { ThemeManager } from './utils/theme';
import { getDepartmentName, setupLanguageButton, updateGlobalTranslations } from './i18n';
import { getCurrentDept, setRenderCallback } from './core/state';
import { switchDepartment, loadDepartment } from './core/department';
import { render } from './core/render';
import { setupSimulationListeners } from './features/simulation';
import { setupResizeListener } from './features/zoom';
import { setupResetListeners } from './features/reset';
import { setupTranscriptImport } from './features/transcript-import';

const deptSelector = document.getElementById("dept-selector") as HTMLDivElement;
const deptDropdown = document.getElementById("dept-dropdown") as HTMLDivElement;
const langBtn = document.getElementById("lang-toggle-btn") as HTMLButtonElement;

// Wire render callback to avoid circular dependencies
setRenderCallback(render);
setupResizeListener();
setupSimulationListeners();
setupResetListeners();

function initSystem() {
    ThemeManager.init();
    const isStandalone = 
        (window.navigator as any).standalone === true || 
        window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
        document.body.classList.add('pwa-standalone');
    }
    const currentDept = getCurrentDept();
    const codes = Object.keys(departments).sort((a, b) => a.localeCompare(b));
    if (deptDropdown) {
        deptDropdown.innerHTML = codes.map(code => 
            `<div class="dropdown-item ${code === currentDept ? 'selected' : ''}" data-code="${code}">
                ${getDepartmentName(code, departments[code].name)} (${code})
            </div>`
        ).join("");
        deptDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const code = (e.currentTarget as HTMLElement).dataset.code;
                if (code) switchDepartment(code);
            });
        });
    }
    loadDepartment(currentDept);
    deptSelector.addEventListener("click", (e) => {
        if (!(e.target as HTMLElement).closest(".dropdown-item")) {
            deptSelector.classList.toggle("active");
        }
    });
    document.addEventListener("click", (e) => {
        if (!deptSelector.contains(e.target as Node)) {
            deptSelector.classList.remove("active");
        }
    });
    if (langBtn) {
        setupLanguageButton(langBtn, () => {
            if (deptDropdown) {
                const currentDept = getCurrentDept();
                const codes = Object.keys(departments).sort((a, b) => a.localeCompare(b));
                deptDropdown.innerHTML = codes.map(code => 
                    `<div class="dropdown-item ${code === currentDept ? 'selected' : ''}" data-code="${code}">
                        ${getDepartmentName(code, departments[code].name)} (${code})
                    </div>`
                ).join("");
                 deptDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const code = (e.currentTarget as HTMLElement).dataset.code;
                        if (code) switchDepartment(code);
                    });
                });
            }
            const dept = getCurrentDept();
            updateGlobalTranslations(dept, departments[dept]?.name || "");
            loadDepartment(dept); 
        });
    }
    updateGlobalTranslations(currentDept, departments[currentDept]?.name || "");
    setupTranscriptImport();
}

window.addEventListener('load', initSystem);
