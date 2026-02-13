import { uiTranslations, popupTranslations, departmentNames } from './ui';
import { commonCourseNames } from './courses/common';
import { freeElectiveNames } from './courses/free';
import { deptCourseNames } from './courses/departments';

// Merge all into a single large object
export const courseNameMap: Record<string, string> = {
  ...commonCourseNames,
  ...deptCourseNames,
  ...freeElectiveNames
};

// Active language state
// 1. Check localStorage first (User preference)
const storedLang = localStorage.getItem("appLang") as "en" | "tr" | null;
// 2. Otherwise check browser language
const browserLang = navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";

export let currentLang: "en" | "tr" = storedLang || browserLang;

export function setLanguage(lang: "en" | "tr") {
  currentLang = lang;
  localStorage.setItem("appLang", lang);
}

// Helper Function: Get UI text
export function t(key: keyof typeof uiTranslations): string {
  if (!uiTranslations[key]) return key; // Fallback to key if defined
  return uiTranslations[key][currentLang];
}

// Helper Function: Get Popup text
export function tPopup(key: keyof typeof popupTranslations): string {
  if (!popupTranslations[key]) return key;
  return popupTranslations[key][currentLang];
}

// Helper Function: Get Department name
export function getDepartmentName(deptCode: string, originalName: string): string {
  if (currentLang === "en") return originalName;
  return departmentNames[deptCode] || originalName;
}


// --- UI HELPERS ---

const globeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
let langTimeout: number;

function updateLangButtonVisuals(btn: HTMLElement, showText = false) {
    if (showText) {
        btn.innerHTML = `<span style="font-weight: 800; font-size: 1rem; letter-spacing: -0.02em;">${currentLang === "en" ? "EN" : "TR"}</span>`;
    } else {
        btn.innerHTML = globeIcon;
    }
    
    btn.title = currentLang === "en" ? "Switch Language (EN)" : "Dil Değiştir (TR)";
    btn.ariaLabel = currentLang === "en" ? "Switch to Turkish" : "Switch to English";
}

export function setupLanguageButton(btn: HTMLElement, onLanguageChanged: () => void) {
    updateLangButtonVisuals(btn);
    btn.addEventListener("click", () => {
        const newLang = currentLang === "en" ? "tr" : "en";
        setLanguage(newLang);
        
        // Temporary Text Feedback
        updateLangButtonVisuals(btn, true);
        clearTimeout(langTimeout);
        langTimeout = window.setTimeout(() => {
            updateLangButtonVisuals(btn, false);
        }, 3000);

        onLanguageChanged();
    });
}

let activeDept = "";


export function updateGlobalTranslations(currentDeptCode: string, originalDeptName: string) {
    activeDept = currentDeptCode;
    // Update Metric Labels
    document.querySelectorAll(".metric-card .metric-label").forEach(el => {
        const parent = el.parentElement;
        if(parent?.querySelector("#total-credits")) el.textContent = t("credits");
    });
    
    // Dept Title
    const deptTitle = document.getElementById("dept-title");
    if (deptTitle) {
        const deptName = getDepartmentName(currentDeptCode, originalDeptName);
        if(currentLang === 'tr') {
             deptTitle.textContent = `${deptName} ${t("department")}`;
        } else {
             deptTitle.textContent = `${t("department")} ${deptName}`;
        }
    }

    // App Title
    const appTitle = document.getElementById("app-title");
    if (appTitle) appTitle.textContent = t("appTitle");

    // Tooltips
    const resetBtn = document.getElementById("reset-btn-mobile");
    if(resetBtn) resetBtn.title = t("reset");
    
    const themeBtn = document.getElementById("theme-palette-btn");
    if(themeBtn) themeBtn.title = t("theme");

    const simBtnObj = document.getElementById("sim-mode-btn");
    if(simBtnObj) {
         simBtnObj.title = t("simulation");
         simBtnObj.ariaLabel = t("simulation");
    }

    // --- POPUP TRANSLATIONS ---
    function setText(selector: string, text: string) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    // Reset Modal
    setText("#reset-modal-overlay h3", tPopup("resetTitle"));
    setText("#reset-modal-overlay div[style*='margin-bottom']", tPopup("resetMsg")); 
    setText("#reset-modal-overlay .cancel", tPopup("cancel"));
    setText("#confirm-reset-btn", tPopup("yesReset"));

    // Simulation Modal
    setText("#sim-modal-overlay h3", tPopup("simTitle"));
    setText("#cancel-sim-btn", tPopup("cancel"));
    setText("#manual-sim-btn", tPopup("manualMode"));
    setText("#start-sim-btn", tPopup("autoFill"));
    
    // Labels in Simulation Modal (Target GPA, Course Count)
    const lblTargetGpa = document.getElementById("lbl-target-gpa");
    if (lblTargetGpa) lblTargetGpa.textContent = tPopup("targetGpa");

    const lblCourseCount = document.getElementById("lbl-course-count");
    if (lblCourseCount) lblCourseCount.textContent = tPopup("courseCount");

    // Search Input Placeholder (if exists)
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    if (searchInput) searchInput.placeholder = t("search");

    // Theme Modal
    setText("#theme-modal-overlay h3", tPopup("themeTitle"));
    // Theme options text
    document.querySelectorAll(".theme-option").forEach(opt => {
        const val = (opt as HTMLElement).dataset.value;
        const span = opt.querySelector("span");
        if (span && val && popupTranslations[val]) {
            span.textContent = tPopup(val as keyof typeof popupTranslations);
        }
    });

    // Privacy Modal Download Section
    setText("#download-transcript-label", `📥 ${tPopup("downloadTranscript")}:`);
    setText("#recommended-tag", `(${tPopup("recommended")})`);
}

// Helper Function: Get Course name
export function getCourseName(courseId: string, originalName: string): string {
  if (currentLang === "en") return originalName;
  
  // Check for department-specific override first
  const specificKey = `${activeDept}:${courseId}`;
  if (courseNameMap[specificKey]) return courseNameMap[specificKey];
  
  return courseNameMap[courseId] || originalName; // Returns English (original) if Turkish is not found
}
