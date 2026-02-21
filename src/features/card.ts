import { Course } from '../types';
import { getState, getCurriculum, getCurrentlyHighlighted, setCurrentlyHighlighted, setPendingCreditOpen, updateState, saveState, triggerRender } from '../core/state';
import { isLocked, GRADES } from '../utils/logic';
import { t, getCourseName } from '../i18n';
import { highlightRelated, removeHighlights } from './highlights';

export function createCard(course: Course) {
    const curriculum = getCurriculum();
    const state = getState();
    const locked = isLocked(course.id, curriculum, state);
    const data = state[course.id] || { completed: false, grade: "" };
    const card = document.createElement("div");
    card.id = `card-${course.id}`;
    card.className = `course-card ${locked ? "locked" : ""} ${data.completed ? "completed" : ""} ${data.grade === "FF" ? "failed" : ""} ${data.isSimulation ? "simulation-added" : ""}`;
    if (course.name === "Summer Practice") card.classList.add("summer-practice");
    // --- PREREQUISITE ANALYSIS ---
    let effectivePrereqs = [...(course.prereqs || [])];

    // Merge with Option Prereqs if selected
    if (course.options && data.selectedOption !== undefined && course.options[data.selectedOption]) {
        const opt = course.options[data.selectedOption];
        if (opt.prereqs) {
            effectivePrereqs = [...effectivePrereqs, ...opt.prereqs];
        }
    }

    const stringPrereqs = effectivePrereqs.filter(p => typeof p === "string") as string[];
    const complexPrereqs = effectivePrereqs.filter(p => typeof p === "object" && p.type === "count_pattern") as any[];
    const creditReqObj = stringPrereqs.find(p => p.match(/^\d+\s+Credits?$/i));
    const standardPrereqs = stringPrereqs.filter(p => !p.match(/^\d+\s+Credits?$/i));
    const isSummerPractice = course.name === "Summer Practice";
    let prereqHTML = "";
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
        selectedOptionIdx = data.selectedOption;
        displayId = course.options[selectedOptionIdx].id;
        displayName = getCourseName(displayId, course.options[selectedOptionIdx].name);
    }
    const displayCredit = Array.isArray(currentCredit) 
        ? currentCredit[data.selectedCreditIndex ?? 0] 
        : currentCredit;
    const creditDisplayParts: string[] = [];
    let showCreditLine = false;
    let crText = "";
    if (isVariable && !data.completed) {
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
    const getGradeColor = (g: string) => {
        const colors: Record<string, string> = { "AA": "#1fad66", "BA": "#5fbe6e", "BB": "#9fd077", "CB": "#dfe27f", "CC": "#fbcf77", "DC": "#f0975c", "DD": "#e65f41", "FF": "#dc2626" };
        return colors[g] || "#64748b";
    };
    const finalGradeColor = data.grade === "FF" ? "#dc2626" : data.completed ? getGradeColor(data.grade) : "#cbd5e1";
    card.style.setProperty("--grade-color", finalGradeColor);
    const lockedIcon = document.createElement("div");
    lockedIcon.className = "locked-icon";
    lockedIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM12 10C12 10 9 10 9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H12Z"/></svg>`;
    card.appendChild(lockedIcon);
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
        optionsSelect.addEventListener("change", (e) => {
            const val = parseInt((e.target as HTMLSelectElement).value);
            const st = getState();
            if (!st[course.id]) st[course.id] = {};
            st[course.id].selectedOption = val;
            saveState();
            triggerRender();
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
    const cardControls = document.createElement("div");
    cardControls.className = "card-controls";
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
        creditSelect.addEventListener("change", (e) => {
            e.stopPropagation();
            const idx = parseInt((e.target as HTMLSelectElement).value);
            const st = getState();
            if (!st[course.id]) st[course.id] = {};
            st[course.id].selectedCreditIndex = idx;
            const creditsArr = Array.isArray(course.credits) ? course.credits : [course.credits];
            st[course.id].selectedCredit = creditsArr[idx];
            saveState();
            triggerRender();
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
        staticCredits.innerHTML = creditFinalHtml;
        cardControls.appendChild(staticCredits);
    }
    cardControls.appendChild(gradeSelect);
    card.appendChild(cardControls);
    checkbox.addEventListener("change", (e) => {
        const isChecked = (e.target as HTMLInputElement).checked;
        const currentGrade = getState()[course.id]?.grade || "";
        if (isChecked && !currentGrade) {
            (e.target as HTMLInputElement).checked = false;
            gradeSelect.focus();
            gradeSelect.classList.add("flash-attention");
            setTimeout(() => gradeSelect.classList.remove("flash-attention"), 1000);
            return;
        }
        updateState(course.id, isChecked, currentGrade);
    });
    gradeSelect.addEventListener("change", (e) => {
        const val = (e.target as HTMLSelectElement).value;
        if (val !== "" && isVariable) {
            setPendingCreditOpen(course.id);
        }
        updateState(course.id, val !== "", val);
    });
    card.addEventListener("mouseenter", () => highlightRelated(course.id));
    card.addEventListener("mouseleave", removeHighlights);
    card.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).closest('input, select, .checkbox-wrapper, .course-options-wrapper, .credit-selector-wrapper')) return;
        if (getCurrentlyHighlighted() === course.id) {
            removeHighlights();
            setCurrentlyHighlighted(null);
        } else {
            highlightRelated(course.id);
            setCurrentlyHighlighted(course.id);
        }
    });
    return card;
}
