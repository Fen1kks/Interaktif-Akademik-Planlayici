import { getCurriculum, getState, getPendingCreditOpen, setPendingCreditOpen } from './state';
import { scheduleDrawArrows } from '../utils/visuals';
import { isLocked, calculateMetrics } from '../utils/logic';
import { currentLang, t } from '../i18n';
import { createCard } from '../features/card';

const grid = document.getElementById("grid-container") as HTMLDivElement;
const creditsEl = document.getElementById("total-credits") as HTMLSpanElement;
const gpaEl = document.getElementById("gpa-score") as HTMLSpanElement;

export const draw = () => scheduleDrawArrows({ grid, curriculum: getCurriculum(), state: getState(), isLocked: (id: string, c: any, i: any) => isLocked(id, getCurriculum(), getState(), c, i) });

export function render() {
    const curriculum = getCurriculum();
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
        // Ordinal suffix used only in English locale (1st, 2nd, 3rd, 4th)
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
    // Wait for DOM layout to settle before drawing SVG arrows
    setTimeout(() => draw(), 50);

    const pendingCreditOpen = getPendingCreditOpen();
    if (pendingCreditOpen) {
        setTimeout(() => {
            const creditWrapper = document.querySelector(`#card-${pendingCreditOpen} .credit-selector-wrapper`) as HTMLElement;
            const creditSelect = document.querySelector(`#card-${pendingCreditOpen} .credit-select`) as HTMLSelectElement;
            if (creditWrapper && creditSelect && !creditSelect.disabled) {

                creditWrapper.classList.add("flash-credit-attention");
                creditSelect.focus();
                setTimeout(() => creditWrapper.classList.remove("flash-credit-attention"), 1500);
            }
            setPendingCreditOpen(null);
        }, 150);
    }
}

export function calculateMetricsAndUpdateUI() {
    const { earnedCredits, gpa } = calculateMetrics(getCurriculum(), getState());
    creditsEl.textContent = String(earnedCredits);
    gpaEl.textContent = gpa;

    const val = parseFloat(gpa);
    if (val >= 3.5) gpaEl.style.color = "var(--c-success)";
    else if (val >= 2.0) gpaEl.style.color = "var(--c-primary)";
    else if (val > 0) gpaEl.style.color = "#dc2626";
    else gpaEl.style.color = "var(--c-text-muted)";
}


export function getGrid() { return grid; }
