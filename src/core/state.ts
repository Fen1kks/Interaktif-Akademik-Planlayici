import { Course } from '../types';

let currentDept = localStorage.getItem("lastDept") || "ME";
let curriculum: Course[] = [];
let state: Record<string, any> = {};
let realState: Record<string, any> | null = null;
let isSimulationMode = false;
let currentlyHighlighted: string | null = null;
let pendingCreditOpen: string | null = null;

export function getCurrentDept() { return currentDept; }
export function getCurriculum() { return curriculum; }
export function getState() { return state; }
export function getRealState() { return realState; }
export function getIsSimulationMode() { return isSimulationMode; }
export function getCurrentlyHighlighted() { return currentlyHighlighted; }
export function getPendingCreditOpen() { return pendingCreditOpen; }
export function setCurrentDept(dept: string) { currentDept = dept; }
export function setCurriculum(c: Course[]) { curriculum = c; }
export function setState(s: Record<string, any>) { state = s; }
export function setRealState(s: Record<string, any> | null) { realState = s; }
export function setIsSimulationMode(v: boolean) { isSimulationMode = v; }
export function setCurrentlyHighlighted(id: string | null) { currentlyHighlighted = id; }
export function setPendingCreditOpen(id: string | null) { pendingCreditOpen = id; }

// --- Render Callback (avoids circular dependency: render -> card -> state -> render) ---
let _renderFn: (() => void) | null = null;
export function setRenderCallback(fn: () => void) { _renderFn = fn; }
export function triggerRender() { if (_renderFn) _renderFn(); }
export function updateState(courseId: string, isCompleted: boolean, grade?: string, skipRender = false, selectedOptionIndex?: number) {
    if (!state[courseId]) state[courseId] = { completed: false, grade: "" };
    state[courseId].completed = isCompleted;
    if (grade !== undefined) state[courseId].grade = grade;
    if (selectedOptionIndex !== undefined) state[courseId].selectedOption = selectedOptionIndex;
    if (isSimulationMode) {
        state[courseId].isSimulation = isCompleted;
    }
    if (!isCompleted) cascadeUncheck(courseId);
    saveState();
    if (!skipRender) {
        triggerRender();
    }
}

export function cascadeUncheck(courseId: string) {
    const dependents = curriculum.filter(c => {
        // Check main prereqs
        if (c.prereqs.some(p => typeof p === 'string' && p.replace("!", "") === courseId)) return true;
        
        // Check selected option prereqs
        const s = state[c.id];
        if (c.options && s && s.selectedOption !== undefined && c.options[s.selectedOption]) {
             const opt = c.options[s.selectedOption];
             if (opt.prereqs && opt.prereqs.some(p => typeof p === 'string' && p.replace("!", "") === courseId)) {
                 return true;
             }
        }
        return false;
    });
    dependents.forEach(dep => {
        if (state[dep.id] && state[dep.id].completed) {
            state[dep.id].completed = false;
            state[dep.id].grade = "";
            cascadeUncheck(dep.id);
        }
    });
}

export function saveState() {
    if (isSimulationMode) return;
    const cleanState = { ...state };
    for (const courseId in cleanState) {
        if (!cleanState[courseId].completed) {
            delete cleanState[courseId].selectedCreditIndex;
            delete cleanState[courseId].selectedCredit;
        }
    }
    localStorage.setItem(`gpaState_${currentDept}`, JSON.stringify(cleanState));
}
