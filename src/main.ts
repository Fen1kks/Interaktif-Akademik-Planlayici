import { departments } from './data/registry';
import { ThemeManager } from './theme';
import { scheduleDrawArrows } from './visuals';
import { isLocked, calculateMetrics, GRADES, getSimulationCandidates, calculateSimulationGrades } from './logic';
import { Course } from './types';
import { currentLang, t, getCourseName, getDepartmentName, setupLanguageButton, updateGlobalTranslations } from './i18n';

// DOM Elements
const grid = document.getElementById("grid-container") as HTMLDivElement;
const creditsEl = document.getElementById("total-credits") as HTMLSpanElement;
const gpaEl = document.getElementById("gpa-score") as HTMLSpanElement;

const deptSelector = document.getElementById("dept-selector") as HTMLDivElement;
const deptDropdown = document.getElementById("dept-dropdown") as HTMLDivElement;
const langBtn = document.getElementById("lang-toggle-btn") as HTMLButtonElement;

// Simulation UI
const simBtn = document.getElementById("sim-mode-btn") as HTMLButtonElement;
const simModal = document.getElementById("sim-modal-overlay") as HTMLDivElement;
const simTargetInput = document.getElementById("sim-target-gpa") as HTMLInputElement;
const simCountInput = document.getElementById("sim-course-count") as HTMLInputElement;
const startSimBtn = document.getElementById("start-sim-btn") as HTMLButtonElement;
const manualSimBtn = document.getElementById("manual-sim-btn") as HTMLButtonElement;
const cancelSimBtn = document.getElementById("cancel-sim-btn") as HTMLButtonElement;
const closeSimModalBtn = document.getElementById("close-sim-modal-btn") as HTMLButtonElement;

// STATE
let currentDept = localStorage.getItem("lastDept") || "ME";
let curriculum: Course[] = [];
let state: Record<string, any> = {};
let realState: Record<string, any> | null = null;
let isSimulationMode = false;
let currentlyHighlighted: string | null = null;
let pendingCreditOpen: string | null = null; // Track course needing credit dropdown auto-open

// Initialization
function initSystem() {
    ThemeManager.init();

    // PWA Standalone Detection (iOS + Android)
    const isStandalone = 
        (window.navigator as any).standalone === true || 
        window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
        document.body.classList.add('pwa-standalone');
    }

    // Populate Dropdown (Alphabetically Sorted)
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

    // Language Button Listener
    if (langBtn) {
        setupLanguageButton(langBtn, () => {
             // Re-populate Dropdown to update names
            if (deptDropdown) {
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

            updateGlobalTranslations(currentDept, departments[currentDept]?.name || "");
            loadDepartment(currentDept); 
        });
    }
    updateGlobalTranslations(currentDept, departments[currentDept]?.name || ""); // Initial text update
}



function switchDepartment(code: string) {
    if (!departments[code]) return;
    currentDept = code;
    localStorage.setItem("lastDept", code);
    
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.remove("selected");
        if (item.textContent?.includes(`(${code})`)) item.classList.add("selected");
    });
    
    loadDepartment(code);
    deptSelector.classList.remove("active");
}

function loadDepartment(code: string) {
    if (!departments[code]) {
        const available = Object.keys(departments);
        if (available.length > 0) return loadDepartment(available[0]);
        return;
    }

    const deptData = departments[code];
    updateGlobalTranslations(currentDept, deptData.name);
    curriculum = deptData.curriculum;

    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'view_department', {
            'department_code': code
        });
    }

    // Load State
    try {
        state = JSON.parse(localStorage.getItem(`gpaState_${code}`) || "{}");
    } catch {
        state = {};
    }

    render();
    setTimeout(() => {
        calculateOptimalZoom();
        requestAnimationFrame(() => draw()); // Initial draw
    }, 150);
}

function updateState(courseId: string, isCompleted: boolean, grade?: string, skipRender = false) {
    if (!state[courseId]) state[courseId] = { completed: false, grade: "" };
    
    state[courseId].completed = isCompleted;
    if (grade !== undefined) state[courseId].grade = grade;
    
    if (isSimulationMode) {
        state[courseId].isSimulation = isCompleted;
    }

    if (!isCompleted) cascadeUncheck(courseId);
    
    saveState();
    
    if (!skipRender) {
        render();
    }
}

function cascadeUncheck(courseId: string) {
    const dependents = curriculum.filter(c => 
        c.prereqs.some(p => typeof p === 'string' && p.replace("!", "") === courseId)
    );
    dependents.forEach(dep => {
        if (state[dep.id] && state[dep.id].completed) {
            state[dep.id].completed = false;
            state[dep.id].grade = "";
            cascadeUncheck(dep.id); // Recurse
        }
    });
}

function saveState() {
    if (isSimulationMode) return;
    
    // Clean up credit selections for incomplete courses (reset to default on reload)
    const cleanState = { ...state };
    for (const courseId in cleanState) {
        if (!cleanState[courseId].completed) {
            delete cleanState[courseId].selectedCreditIndex;
            delete cleanState[courseId].selectedCredit;
        }
    }
    
    localStorage.setItem(`gpaState_${currentDept}`, JSON.stringify(cleanState));
}

function render() {
    const draw = () => scheduleDrawArrows({ grid, curriculum, state, isLocked: (id, c, i) => isLocked(id, curriculum, state, c, i) });

    calculateMetricsAndUpdateUI();
    
    grid.innerHTML = "";
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "arrows-container";
    Object.assign(svg.style, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" });
    grid.appendChild(svg);

    const terms = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    terms.forEach(term => {
        const courses = curriculum.filter(c => c.term === term);
        const col = document.createElement("div");
        col.className = "term-column";
        
        const yearNum = Math.ceil(term / 2);
        // Suffix logic only for English
        const suffix = (n: number) => n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
        
        let headerText = "";
        
        if (term === 9) {
            headerText = t("extra");
        } else {
            const season = term % 2 !== 0 ? t("fall") : t("spring");
            const yearLabel = currentLang === 'tr' 
                ? `${yearNum}. Sınıf` 
                : `${yearNum}${suffix(yearNum)} Year`;
                
            headerText = `${yearLabel} - ${season}`;
        }
            
        col.innerHTML = `<div class="term-header"><div class="term-name" style="font-weight: 700; font-size: 0.9rem; color: var(--c-primary);">${headerText}</div></div>`;
        
        courses.forEach(c => col.appendChild(createCard(c)));
        grid.appendChild(col);
    });

    setTimeout(() => draw(), 50);
    
    // Auto-open credit dropdown if pending
    if (pendingCreditOpen) {
        setTimeout(() => {
            const creditWrapper = document.querySelector(`#card-${pendingCreditOpen} .credit-selector-wrapper`) as HTMLElement;
            const creditSelect = document.querySelector(`#card-${pendingCreditOpen} .credit-select`) as HTMLSelectElement;
            if (creditWrapper && creditSelect && !creditSelect.disabled) {
                // Flash attention animation
                creditWrapper.classList.add("flash-credit-attention");
                creditSelect.focus();
                setTimeout(() => creditWrapper.classList.remove("flash-credit-attention"), 1500);
            }
            pendingCreditOpen = null;
        }, 150);
    }
}

function createCard(course: Course) {
    const locked = isLocked(course.id, curriculum, state);
    const data = state[course.id] || { completed: false, grade: "" };
    
    const card = document.createElement("div");
    card.id = `card-${course.id}`;
    card.className = `course-card ${locked ? "locked" : ""} ${data.completed ? "completed" : ""} ${data.grade === "FF" ? "failed" : ""} ${data.isSimulation ? "simulation-added" : ""}`;
    if (course.name === "Summer Practice") card.classList.add("summer-practice");

    // --- PREREQUISITE ANALYSIS ---
    const stringPrereqs = (course.prereqs || []).filter(p => typeof p === "string") as string[];
    const complexPrereqs = (course.prereqs || []).filter(p => typeof p === "object" && p.type === "count_pattern") as any[];
    
    const creditReqObj = stringPrereqs.find(p => p.match(/^\d+\s+Credits?$/i));
    const standardPrereqs = stringPrereqs.filter(p => !p.match(/^\d+\s+Credits?$/i));
    
    const isSummerPractice = course.name === "Summer Practice";
    let prereqHTML = "";

    // Header Logic (Prereqs)
    if (!isSummerPractice) {
        if (standardPrereqs.length > 0) {
            prereqHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
                <div class="prereq-hint" style="font-size: 0.7rem; color: var(--c-text-muted);">Prereqs: ${standardPrereqs.join(", ")}</div>
            </div>`;
        } else {
            prereqHTML = `<div class="prereq-hint" style="font-size: 0.7rem; color: var(--c-text-muted);">No Prerequisites</div>`;
        }
    }

    // --- CREDITS & REQUIREMENTS DISPLAY LOGIC ---
    let currentCredit = course.credits;
    let isVariable = Array.isArray(course.credits);
    
    let displayId = course.id;
    let displayName = getCourseName(course.id, course.name);
    let selectedOptionIdx = -1;

    if (course.options && data.selectedOption !== undefined && course.options[data.selectedOption]) {
        const opt = course.options[data.selectedOption];
        if (opt.credits !== undefined) {
            currentCredit = opt.credits;
            if (!Array.isArray(opt.credits)) {
                isVariable = false;
            }
        }
        // Option Name Translation
        selectedOptionIdx = data.selectedOption;
        displayId = course.options[selectedOptionIdx].id;
        displayName = getCourseName(displayId, course.options[selectedOptionIdx].name);
    }
    const displayCredit = Array.isArray(currentCredit) 
        ? currentCredit[data.selectedCreditIndex ?? 0] 
        : currentCredit;
    
    const creditDisplayParts: string[] = [];
    
    // A) Credit Line - Variable credits show "X Credit" until grade is selected
    let showCreditLine = false;
    let crText = "";
    if (isVariable && !data.completed) {
        // Show "X Credit" placeholder for variable credits without grade
        showCreditLine = true;
        crText = isSummerPractice ? "X CR" : "X Credit";
    } else if (displayCredit > 0 || (isVariable && data.completed)) {
        showCreditLine = true;
        crText = isSummerPractice 
            ? `${displayCredit} CR`
            : `${displayCredit} ${t("credits")}`;
    }
    if (showCreditLine) {
        creditDisplayParts.push(`<span style="font-size: 0.75rem;">${crText}</span>`);
    }

    // B) Requirements (Stacked Logic)
    if (isSummerPractice) {
        if (standardPrereqs.length > 0 && complexPrereqs.length > 0) {
            creditDisplayParts.push(`<span style="color: var(--c-primary); font-size: 0.7rem; font-weight: 600;">Req: ${standardPrereqs.join(", ")}</span>`);
        }
        if (creditReqObj) {
            const match = creditReqObj.match(/\d+/);
            const num = match ? match[0] : "?";
            creditDisplayParts.push(`<span style="font-size:0.75rem; opacity:1;">Req: ${num}<br>Credits</span>`);
        }
        complexPrereqs.forEach(p => {
             const { pattern, exclude, minCount, message } = p;
             const regex = new RegExp(pattern);
             const currentCount = curriculum.filter(c => 
                 regex.test(c.id) && 
                 (!exclude || !exclude.includes(c.id)) && 
                 state[c.id] && state[c.id].completed && state[c.id].grade !== "FF"
             ).length;
             creditDisplayParts.push(`<span style="color: var(--c-primary); font-size:0.65rem; font-weight:700;">${message} (${currentCount}/${minCount})</span>`);
        });
    } else {
        if (creditReqObj) {
            const match = creditReqObj.match(/\d+/);
            const num = match ? match[0] : "?";
            if (displayCredit > 0) {
                creditDisplayParts.push(`<span style="font-size:0.65em; opacity:0.8;">Req: ${num} CR</span>`);
            } else {
                creditDisplayParts.push(`<span style="font-size:0.7rem;">Req: ${num} CR<br>Credits</span>`);
            }
        }
        // Complex Fallback
        complexPrereqs.forEach(p => {
             const { pattern, exclude, minCount, message } = p;
             const regex = new RegExp(pattern);
             const currentCount = curriculum.filter(c => 
                 regex.test(c.id) && 
                 (!exclude || !exclude.includes(c.id)) && 
                 state[c.id] && state[c.id].completed && state[c.id].grade !== "FF"
             ).length;
             const color = currentCount >= minCount ? "var(--c-success)" : "var(--c-text-muted)";
             creditDisplayParts.push(`<span style="color:${color}; font-size:0.65rem; font-weight:700;">${message} (${currentCount}/${minCount})</span>`);
        });
    }

    if (creditDisplayParts.length === 0 && displayCredit === 0) {
         creditDisplayParts.push("0 Credit");
    }

    const creditFinalHtml = creditDisplayParts.join("<br>");

    // Grade Color
    const getGradeColor = (g: string) => {
        const colors: Record<string, string> = { "AA": "#1fad66", "BA": "#5fbe6e", "BB": "#9fd077", "CB": "#dfe27f", "CC": "#fbcf77", "DC": "#f0975c", "DD": "#e65f41", "FF": "#dc2626" };
        return colors[g] || "#64748b";
    };
    const finalGradeColor = data.grade === "FF" ? "#dc2626" : data.completed ? getGradeColor(data.grade) : "#cbd5e1";
    card.style.setProperty("--grade-color", finalGradeColor);

    // 1. Locked Icon
    const lockedIcon = document.createElement("div");
    lockedIcon.className = "locked-icon";
    lockedIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM12 10C12 10 9 10 9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H12Z"/></svg>`;
    card.appendChild(lockedIcon);

    // 2. Card Header
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    Object.assign(cardHeader.style, { position: "relative" });

    const headerContent = document.createElement("div");
    Object.assign(headerContent.style, { display: "flex", alignItems: "baseline", gap: "8px", width: "100%" });

    const idSpan = document.createElement("span");
    idSpan.className = "course-id";
    idSpan.textContent = displayId;
    headerContent.appendChild(idSpan);

    const nameDiv = document.createElement("div");
    nameDiv.className = "course-name";
    nameDiv.title = displayName;
    nameDiv.textContent = displayName;
    headerContent.appendChild(nameDiv);

    // Options (if any)
    if (course.options) {
        const optionsWrapper = document.createElement("div");
        optionsWrapper.className = "course-options-wrapper";
        Object.assign(optionsWrapper.style, { position: "absolute", inset: "0", opacity: "0", cursor: "pointer" });

        const optionsSelect = document.createElement("select");
        optionsSelect.className = "course-options-select";
        Object.assign(optionsSelect.style, { width: "100%", height: "100%", cursor: "pointer" });

        if (!course.options.some(o => o.name === course.name)) {
            const defaultOpt = document.createElement("option");
            defaultOpt.value = "-1";
            defaultOpt.textContent = course.name;
            if (selectedOptionIdx === -1) defaultOpt.selected = true;
            optionsSelect.appendChild(defaultOpt);
        }

        course.options.forEach((opt, idx) => {
            const option = document.createElement("option");
            option.value = String(idx);
            option.textContent = `${opt.id} - ${getCourseName(opt.id, opt.name)}`;
            if (selectedOptionIdx === idx) option.selected = true;
            optionsSelect.appendChild(option);
        });

        // Event Listener for Options
        optionsSelect.addEventListener("change", (e) => {
            const val = parseInt((e.target as HTMLSelectElement).value);
            if (!state[course.id]) state[course.id] = {};
            state[course.id].selectedOption = val;
            saveState();
            render();
        });
        optionsSelect.addEventListener("click", e => e.stopPropagation());

        optionsWrapper.appendChild(optionsSelect);
        headerContent.appendChild(optionsWrapper);

        const chevron = document.createElement("div");
        chevron.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="margin-left: auto; color: var(--c-text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        Object.assign(chevron.style, { marginLeft: "auto" });
        headerContent.appendChild(chevron);
    }

    cardHeader.appendChild(headerContent);

    if (prereqHTML) {
        const prereqContainer = document.createElement("div");
        prereqContainer.innerHTML = prereqHTML;
        cardHeader.appendChild(prereqContainer);
    }
    card.appendChild(cardHeader);


    // 3. Card Controls
    const cardControls = document.createElement("div");
    cardControls.className = "card-controls";

    // Checkbox
    const label = document.createElement("label");
    label.className = "checkbox-wrapper";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data.completed;
    if (locked) checkbox.disabled = true;

    const customCheckbox = document.createElement("div");
    customCheckbox.className = "custom-checkbox";
    customCheckbox.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    label.appendChild(checkbox);
    label.appendChild(customCheckbox);
    cardControls.appendChild(label);

    // Grade Select (Declared early for reference)
    const gradeSelect = document.createElement("select");
    gradeSelect.className = "grade-select";
    if (locked) gradeSelect.disabled = true;
    Object.assign(gradeSelect.style, { fontWeight: "bold", color: (!data.grade || data.grade === "") ? 'var(--c-text-muted)' : finalGradeColor });

    const defaultGradeOpt = document.createElement("option");
    defaultGradeOpt.value = "";
    defaultGradeOpt.textContent = "--";
    if (!data.grade) defaultGradeOpt.selected = true;
    gradeSelect.appendChild(defaultGradeOpt);

    Object.keys(GRADES).forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        if (data.grade === g) opt.selected = true;
        gradeSelect.appendChild(opt);
    });

    // Credits Display / Selector
    if (isVariable) {
        const creditWrapper = document.createElement("div");
        creditWrapper.className = "credit-selector-wrapper";
        Object.assign(creditWrapper.style, { display: "flex", alignItems: "center", gap: "2px", position: "relative" });

        const creditDisplay = document.createElement("span");
        creditDisplay.className = "credit-display";
        Object.assign(creditDisplay.style, { fontSize: "0.75rem", fontWeight: "600", color: data.completed ? 'var(--c-primary)' : 'var(--c-text-muted)' });
        
        const currentArr = Array.isArray(currentCredit) ? currentCredit : [currentCredit];
        const displayVal = currentArr[data.selectedCreditIndex ?? 0];
        creditDisplay.textContent = data.completed ? `${displayVal} Credit` : 'X Credit';
        
        const chevron = document.createElement("div");
        chevron.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" style="color: var(--c-text-muted);"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

        const creditSelect = document.createElement("select");
        creditSelect.className = "credit-select";
        if (!data.completed || locked) creditSelect.disabled = true;
        creditSelect.dataset.autoOpen = (data.grade && !data.selectedCreditIndex) ? 'true' : 'false';
        Object.assign(creditSelect.style, { position: "absolute", inset: "0", opacity: "0", cursor: (data.completed && !locked) ? 'pointer' : 'not-allowed', width: "100%", height: "100%" });

        if (!data.completed) {
            const xOpt = document.createElement("option");
            xOpt.value = "";
            xOpt.textContent = "X Credit";
            creditSelect.appendChild(xOpt);
        }
        
        currentArr.forEach((cr, idx) => {
            const opt = document.createElement("option");
            opt.value = String(idx);
            opt.textContent = `${cr} Credit`;
            if ((data.selectedCreditIndex ?? 0) === idx && data.completed) opt.selected = true;
            creditSelect.appendChild(opt);
        });

        // Credit Select Event Listener
        creditSelect.addEventListener("change", (e) => {
            e.stopPropagation();
            const idx = parseInt((e.target as HTMLSelectElement).value);
            if (!state[course.id]) state[course.id] = {};
            state[course.id].selectedCreditIndex = idx;
            const creditsArr = Array.isArray(course.credits) ? course.credits : [course.credits];
            state[course.id].selectedCredit = creditsArr[idx];
            saveState();
            render();
        });
        creditSelect.addEventListener("click", e => e.stopPropagation());

        creditWrapper.appendChild(creditDisplay);
        creditWrapper.appendChild(chevron);
        creditWrapper.appendChild(creditSelect);
        cardControls.appendChild(creditWrapper);

    } else {
        const staticCredits = document.createElement("div");
        staticCredits.className = "course-credits";
        Object.assign(staticCredits.style, { fontSize: "0.75rem", fontWeight: "600", lineHeight: "1.1", textAlign: "center", color: (creditReqObj || isSummerPractice) ? 'var(--c-primary)' : 'var(--c-text-muted)' });
        staticCredits.innerHTML = creditFinalHtml; // Kept as innerHTML for multiline BRs
        cardControls.appendChild(staticCredits);
    }

    cardControls.appendChild(gradeSelect);
    card.appendChild(cardControls);

    // --- EVENT LISTENERS (Attaching directly to variables) ---
    
    // Checkbox Listener
    checkbox.addEventListener("change", (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        const currentGrade = state[course.id]?.grade || "";
        if (isChecked && !currentGrade) {
            (e.target as HTMLInputElement).checked = false;
            gradeSelect.focus();
            gradeSelect.classList.add("flash-attention");
            setTimeout(() => gradeSelect.classList.remove("flash-attention"), 1000);
            return; // Force grade selection
        }
        updateState(course.id, isChecked, currentGrade);
    });

    // Grade Select Listener
    gradeSelect.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        
        if (val !== "" && isVariable) {
            pendingCreditOpen = course.id;
        }
        
        updateState(course.id, val !== "", val);
    });

    // Card Hover/Click
    card.addEventListener("mouseenter", () => highlightRelated(course.id));
    card.addEventListener("mouseleave", removeHighlights);
    
    // Touch/Click toggle for mobile
    card.addEventListener("click", (e) => {
        // Ignore clicks on interactive elements
        if ((e.target as HTMLElement).closest('input, select, .checkbox-wrapper, .course-options-wrapper, .credit-selector-wrapper')) return;
        
        if (currentlyHighlighted === course.id) {
            removeHighlights();
            currentlyHighlighted = null;
        } else {
            highlightRelated(course.id);
            currentlyHighlighted = course.id;
        }
    });

    return card;
}

function highlightRelated(courseId: string) {
    resetHighlights(); // Clear previous first

    const allArrows = document.querySelectorAll(".arrow-path");
    const hasConnections = Array.from(allArrows).some(arrow => 
      arrow.getAttribute("data-source") === courseId || 
      arrow.getAttribute("data-target") === courseId
    );
    
    const connectedCourses = new Map<string, string>();
    const forcedColors = new Map<string, string>();

    // 1. COMPLEX PREREQUISITE HIGHLIGHTING
    const course = curriculum.find(c => c.id === courseId);
    if (course && course.prereqs) {
        course.prereqs.forEach(p => {
             if (typeof p === "object" && p.type === "count_pattern") {
                 const { pattern, exclude } = p;
                 const regex = new RegExp(pattern);
                 curriculum.forEach(c => {
                     if (regex.test(c.id) && (!exclude || !exclude.includes(c.id)) && c.id !== courseId) {
                         const cState = state[c.id];
                         const isCompleted = cState && cState.completed && cState.grade !== "FF";
                         // Blue (Primary) if done, Orange/Red if not
                         const highlightColor = isCompleted ? "var(--c-primary)" : "#f59e0b"; 
                         forcedColors.set(c.id, highlightColor);
                         if (!connectedCourses.has(c.id)) {
                              connectedCourses.set(c.id, highlightColor);
                         }
                     }
                 });
             }
        });
    }

    // 2. ARROW HIGHLIGHTING & GRAY OUT
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const lightGrayPalette = ['#404040', '#505050', '#606060', '#707070', '#808080', '#909090', '#a0a0a0'];
    const darkGrayPalette = ['#565f89', '#414868', '#787c99', '#a9b1d6', '#c0caf5', '#cfc9c2', '#9aa5ce']; 
    const grayPalette = isDark ? darkGrayPalette : lightGrayPalette;
    let grayIndex = 0;

    allArrows.forEach((arrow) => {
        const source = arrow.getAttribute("data-source");
        const target = arrow.getAttribute("data-target");
        const isConnected = source === courseId || target === courseId;
        
        const arrowEl = arrow as SVGPathElement;

        if (isConnected) {
            let arrowColor = arrow.getAttribute("data-original-color") || "var(--c-primary)";
            
            // Override if target/source is in specific color map
            const otherId = source === courseId ? target : source;
            if (otherId && forcedColors.has(otherId)) {
                arrowColor = forcedColors.get(otherId)!;
            }

            if (otherId) connectedCourses.set(otherId, arrowColor);
            
            arrowEl.style.opacity = "1";
            arrowEl.setAttribute("stroke", arrowColor);
            arrowEl.classList.add("active");

            if (arrow.hasAttribute("data-d-long")) {
                 arrow.setAttribute("d", arrow.getAttribute("data-d-long")!);
            }
        } else {
            // Gray out unrelated arrows if we are highlighting something
            if (hasConnections || connectedCourses.size > 0) {
                 arrowEl.setAttribute("stroke", grayPalette[grayIndex % grayPalette.length]);
                 grayIndex++;
                 arrowEl.style.opacity = "0.2"; // Dim unrelated
            }
        }
    });

    // 3. CARD HIGHLIGHTING
    connectedCourses.forEach((highlightColor, cId) => {
        const otherCard = document.getElementById(`card-${cId}`);
        if (otherCard) {
            otherCard.classList.add("dependency-highlight");
            otherCard.style.boxShadow = `0 0 0 2px ${highlightColor}`;
        }
    });
    
    // Highlight SELF
    const selfCard = document.getElementById(`card-${courseId}`);
    if (selfCard) {
        selfCard.classList.add("dependency-highlight");
    }
}

function removeHighlights() {
    resetHighlights();
}

function resetHighlights() {
    const allArrows = document.querySelectorAll(".arrow-path");
    allArrows.forEach(arrow => {
        const arrowEl = arrow as SVGPathElement;
        const originalColor = arrow.getAttribute("data-original-color");
        if (originalColor) arrowEl.setAttribute("stroke", originalColor);
        arrowEl.style.opacity = ""; // Reset opacity
        arrowEl.classList.remove("active");
        
        if (arrow.hasAttribute("data-d-short")) {
             arrow.setAttribute("d", arrow.getAttribute("data-d-short")!);
        }
    });

    const allCards = document.querySelectorAll(".course-card");
    allCards.forEach(card => {
        const c = card as HTMLElement;
        c.classList.remove("dependency-highlight");
        c.style.boxShadow = ""; 
    });
}

function calculateMetricsAndUpdateUI() {
    const { earnedCredits, gpa } = calculateMetrics(curriculum, state);
    creditsEl.textContent = String(earnedCredits);
    gpaEl.textContent = gpa;
    
    // Style GPA
    const val = parseFloat(gpa);
    if (val >= 3.5) gpaEl.style.color = "var(--c-success)";
    else if (val >= 2.0) gpaEl.style.color = "var(--c-primary)";
    else if (val > 0) gpaEl.style.color = "#dc2626";
    else gpaEl.style.color = "var(--c-text-muted)";
}

// ZOOM
function calculateOptimalZoom() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 900) {
        (grid.style as any).zoom = "1";
        draw();
        return;
    }
    const headerHeight = document.querySelector(".stats-bar")?.clientHeight || 80;
    const viewportHeight = window.innerHeight - headerHeight;
    
    grid.style.width = ""; 
    (grid.style as any).zoom = "1"; 
    
    const gridWidth = grid.scrollWidth;
    const gridHeight = grid.scrollHeight;
    
    if (gridWidth <= viewportWidth && gridHeight <= viewportHeight) {
        draw();
        return;
    }
    
    const zoomX = (viewportWidth * 0.98) / gridWidth;
    const zoomY = (viewportHeight * 0.95) / gridHeight;
    (grid.style as any).zoom = String(Math.max(0.6, Math.min(zoomX, zoomY)));
    setTimeout(() => draw(), 100);
}

// Arrow Draw Helper
const draw = () => scheduleDrawArrows({ grid, curriculum, state, isLocked: (id, c, i) => isLocked(id, curriculum, state, c, i) });

let resizeTimeout: number;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => calculateOptimalZoom(), 200);
});

// SIMULATION
function toggleSimulationMode() {
    if (isSimulationMode) {
        isSimulationMode = false;
        state = JSON.parse(JSON.stringify(realState));
        realState = null;
        document.body.classList.remove("simulation-active");
        if (simBtn) simBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`; // Calc Icon
        render();
    } else {
        realState = JSON.parse(JSON.stringify(state));
        isSimulationMode = true;
        document.body.classList.add("simulation-active");
        if (simBtn) simBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; // X Icon
        
        simModal.style.display = "flex";
        simTargetInput.value = "3.00";
        simCountInput.value = "6";
    }
}

if (simBtn) simBtn.addEventListener("click", toggleSimulationMode);
if (cancelSimBtn) cancelSimBtn.addEventListener("click", () => {
    simModal.style.display = "none";
    if (isSimulationMode) toggleSimulationMode();
});
if (closeSimModalBtn) closeSimModalBtn.addEventListener("click", () => {
    simModal.style.display = "none";
    if (isSimulationMode) toggleSimulationMode();
});
if (manualSimBtn) manualSimBtn.addEventListener("click", () => simModal.style.display = "none");

if (startSimBtn) startSimBtn.addEventListener("click", () => {
    const gpa = parseFloat(simTargetInput.value);
    const count = parseInt(simCountInput.value);
    if (!isNaN(gpa) && !isNaN(count) && count > 0 && gpa >= 0 && gpa <= 4.0) {
        simModal.style.display = "none";
        
        const { selectedCourses, currentPoints, currentCredits } = getSimulationCandidates(curriculum, state, count, realState!);
        
        if (selectedCourses.length === 0) {
            alert("No available courses found!");
            return;
        }
        
        calculateSimulationGrades(selectedCourses, currentPoints, currentCredits, gpa);
        
        // Apply Changes
        selectedCourses.forEach(c => {
            if (!state[c.id]) state[c.id] = {};
            state[c.id].grade = c._simGrade;
            state[c.id].completed = true;
            state[c.id].isSimulation = true;
        });
        render();
    } else {
        alert("Invalid inputs");
    }
});

// Reset
const resetBtns = document.querySelectorAll(".reset-btn");
const resetModal = document.getElementById("reset-modal-overlay");
const confirmResetBtn = document.getElementById("confirm-reset-btn");

resetBtns.forEach(btn => btn.addEventListener("click", () => { if (resetModal) resetModal.style.display = "flex"; }));
if (confirmResetBtn) confirmResetBtn.addEventListener("click", () => {
    state = {};
    saveState();
    render();
    if (resetModal) resetModal.style.display = "none";
});
if (resetModal) resetModal.addEventListener("click", (e) => { if (e.target === resetModal) resetModal.style.display = "none"; });
(window as any).closeResetModal = () => { if (resetModal) resetModal.style.display = "none"; };

// Boot
window.addEventListener('load', initSystem);
