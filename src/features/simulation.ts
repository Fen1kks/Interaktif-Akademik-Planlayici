import { getState, setState, getCurriculum, getRealState, setRealState, getIsSimulationMode, setIsSimulationMode, triggerRender } from '../core/state';
import { getSimulationCandidates, calculateSimulationGrades } from '../utils/logic';

const simBtn = document.getElementById("sim-mode-btn") as HTMLButtonElement;
const simModal = document.getElementById("sim-modal-overlay") as HTMLDivElement;
const simTargetInput = document.getElementById("sim-target-gpa") as HTMLInputElement;
const simCountInput = document.getElementById("sim-course-count") as HTMLInputElement;
const startSimBtn = document.getElementById("start-sim-btn") as HTMLButtonElement;
const manualSimBtn = document.getElementById("manual-sim-btn") as HTMLButtonElement;
const cancelSimBtn = document.getElementById("cancel-sim-btn") as HTMLButtonElement;
const closeSimModalBtn = document.getElementById("close-sim-modal-btn") as HTMLButtonElement;

export function toggleSimulationMode() {
    if (getIsSimulationMode()) {
        setIsSimulationMode(false);
        setState(JSON.parse(JSON.stringify(getRealState())));
        setRealState(null);
        document.body.classList.remove("simulation-active");
        if (simBtn) simBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`; // Calc Icon
        triggerRender();
    } else {
        setRealState(JSON.parse(JSON.stringify(getState())));
        setIsSimulationMode(true);
        document.body.classList.add("simulation-active");
        if (simBtn) simBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`; // X Icon
        simModal.style.display = "flex";
        simTargetInput.value = "3.00";
        simCountInput.value = "6";
    }
}

export function setupSimulationListeners() {
    if (simBtn) simBtn.addEventListener("click", toggleSimulationMode);
    if (cancelSimBtn) cancelSimBtn.addEventListener("click", () => {
        simModal.style.display = "none";
        if (getIsSimulationMode()) toggleSimulationMode();
    });
    if (closeSimModalBtn) closeSimModalBtn.addEventListener("click", () => {
        simModal.style.display = "none";
        if (getIsSimulationMode()) toggleSimulationMode();
    });
    if (manualSimBtn) manualSimBtn.addEventListener("click", () => simModal.style.display = "none");

    if (startSimBtn) startSimBtn.addEventListener("click", () => {
        const gpa = parseFloat(simTargetInput.value);
        const count = parseInt(simCountInput.value);
        if (!isNaN(gpa) && !isNaN(count) && count > 0 && gpa >= 0 && gpa <= 4.0) {
            simModal.style.display = "none";
            const state = getState();
            const curriculum = getCurriculum();
            const { selectedCourses, currentPoints, currentCredits } = getSimulationCandidates(curriculum, state, count, getRealState()!);
            if (selectedCourses.length === 0) {
                alert("No available courses found!");
                return;
            }        
            calculateSimulationGrades(selectedCourses, currentPoints, currentCredits, gpa);
            selectedCourses.forEach(c => {
                if (!state[c.id]) state[c.id] = {};
                state[c.id].grade = c._simGrade;
                state[c.id].completed = true;
                state[c.id].isSimulation = true;
            });
            triggerRender();
        } else {
            alert("Invalid inputs");
        }
    });
}
