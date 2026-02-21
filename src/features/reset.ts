import { setState, saveState, triggerRender } from '../core/state';

export function setupResetListeners() {
    const resetBtns = document.querySelectorAll(".reset-btn");
    const resetModal = document.getElementById("reset-modal-overlay");
    const confirmResetBtn = document.getElementById("confirm-reset-btn");

    resetBtns.forEach(btn => btn.addEventListener("click", () => { if (resetModal) resetModal.style.display = "flex"; }));
    if (confirmResetBtn) confirmResetBtn.addEventListener("click", () => {
        setState({});
        saveState();
        triggerRender();
        if (resetModal) resetModal.style.display = "none";
    });
    if (resetModal) resetModal.addEventListener("click", (e) => { if (e.target === resetModal) resetModal.style.display = "none"; });
    (window as any).closeResetModal = () => { if (resetModal) resetModal.style.display = "none"; };
}
