import { showNotification } from '../utils/visuals';
import { currentLang, tPopup } from '../i18n';
import { parseTranscript } from '../utils/transcript-parser';
import { Course } from '../types';
import { getCurriculum, setState, updateState, saveState } from '../core/state';
import { render, draw } from '../core/render';
import { calculateOptimalZoom } from './zoom';

const transcriptInput = document.getElementById("transcript-input") as HTMLInputElement;
const importBtn = document.getElementById("import-transcript-btn") as HTMLButtonElement;

export function setupTranscriptImport() {
    const privacyModal = document.getElementById("privacy-modal-overlay") as HTMLDivElement;
    const closePrivacyBtn = document.getElementById("close-privacy-modal-btn") as HTMLButtonElement;
    const cancelPrivacyBtn = document.getElementById("cancel-privacy-btn") as HTMLButtonElement;
    const confirmPrivacyBtn = document.getElementById("confirm-privacy-btn") as HTMLButtonElement;
    const privacyTitle = document.getElementById("privacy-title") as HTMLHeadingElement;
    const privacyText = document.getElementById("privacy-text") as HTMLParagraphElement;
    const privacyWarning = document.getElementById("privacy-warning") as HTMLParagraphElement;

    if (!importBtn || !transcriptInput || !privacyModal) return;

    importBtn.addEventListener("click", () => {
         if (privacyTitle) privacyTitle.textContent = tPopup("privacyTitle");
         if (privacyText) privacyText.textContent = tPopup("privacyText");
         if (privacyWarning) privacyWarning.textContent = tPopup("privacyWarning");
         if (cancelPrivacyBtn) cancelPrivacyBtn.textContent = tPopup("cancel");
         if (confirmPrivacyBtn) confirmPrivacyBtn.textContent = tPopup("selectFile");
         privacyModal.style.display = "flex";
    });
    const closePrivacy = () => { privacyModal.style.display = "none"; };
    closePrivacyBtn?.addEventListener("click", closePrivacy);
    cancelPrivacyBtn?.addEventListener("click", closePrivacy);
    confirmPrivacyBtn?.addEventListener("click", () => {
        closePrivacy();
        setTimeout(() => {
             transcriptInput.click();
        }, 100);
    });
    transcriptInput.addEventListener("change", async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
            try {
            const results = await parseTranscript(file);
            const invalidGrades = ['NC', 'W', 'I', 'P', 'X', 'T', 'ND', 'R', 'L', 'RR'];
            const validResults = results.filter(r => {
                const grade = r.grade.toUpperCase();
                return !invalidGrades.includes(grade);
            });
            
            if (validResults.length === 0) {
                showNotification(
                    currentLang === 'tr' ? "Transkriptten geçerli ders okunamadı." : "No valid courses found in transcript.",
                    'error'
                );
                return;
            }
            setState({});
            saveState();
            const curriculum = getCurriculum();
            const courseMap = new Map<string, {course: Course, grade: string, optionIndex?: number}>();
            validResults.forEach(parsed => {
                const cleanId = parsed.id.replace(/\s+/g, ""); 
                const upperId = cleanId.toUpperCase();
                let targetCourse: Course | undefined;
                let selectedOptionIndex: number | undefined = undefined;
                targetCourse = curriculum.find(c => c.id.replace(/\s+/g, "").toUpperCase() === upperId);
                if (!targetCourse) {
                    // AFE courses (AFEA131, AFE132, etc.) can fill REXX or FEXX slots
                    const isAFECourse = /^AFE(A)?1(31|32|11|12)$/.test(upperId);
                    let candidates = curriculum.filter(c => 
                        c.options && c.options.some(opt => opt.id.replace(/\s+/g, "").toUpperCase() === upperId)
                    );
                    if (isAFECourse) {
                        const rexxSlots = candidates.filter(c => c.id.startsWith('REXX') && (c.id === 'REXX1' || c.id === 'REXX2'));
                        const fexxSlots = candidates.filter(c => c.id === 'FEXX1');
                        const rexxFilled = rexxSlots.filter(c => courseMap.has(c.id)).length;
                        // When both REXX slots are filled, overflow AFE courses into FEXX1
                        if (rexxFilled >= 2 && fexxSlots.length > 0) {
                            candidates = fexxSlots;
                        } else {
                            candidates = rexxSlots.length > 0 ? rexxSlots : candidates;
                        }
                    }
                    // REXX6-10 are departmental elective slots (e.g., ME432, CE301)
                    const isDeptElective = /^[A-Z]{2,4}\d{3}$/.test(upperId) && 
                        candidates.some(c => /^REXX(6|7|8|9|10)$/.test(c.id));
                    if (isDeptElective) {
                        const deptElectiveSlots = candidates.filter(c => /^REXX(6|7|8|9|10)$/.test(c.id));
                        if (deptElectiveSlots.length > 0) {
                            deptElectiveSlots.sort((a, b) => a.term - b.term);
                            candidates = deptElectiveSlots;
                        }
                    }
                    for (const cand of candidates) {
                         if (!courseMap.has(cand.id)) {
                              targetCourse = cand;
                              selectedOptionIndex = cand.options!.findIndex(opt => opt.id.replace(/\s+/g, "").toUpperCase() === upperId);
                              break;
                         }
                    }
                }
                if (targetCourse) {
                    courseMap.set(targetCourse.id, {
                        course: targetCourse,
                        grade: parsed.grade,
                        optionIndex: selectedOptionIndex
                    });
                }
            });
            let updatedCount = 0;
            courseMap.forEach(({course, grade, optionIndex}) => {
                updateState(course.id, true, grade, true, optionIndex);
                updatedCount++;
            });
            if (updatedCount > 0) {
                 saveState();
                 render();
                 setTimeout(() => {
                    calculateOptimalZoom();
                    requestAnimationFrame(() => draw());
                 }, 150);
                 showNotification(
                    currentLang === 'tr' 
                    ? `${updatedCount} ders başarıyla güncellendi!`
                    : `${updatedCount} courses successfully updated!`,
                    'success'
                 );
            } else {
                 showNotification(
                    currentLang === 'tr' ? "Transkript okundu ancak eşleşen ders bulunamadı." : "Transcript parsed but no matching courses found.",
                    'info'
                 );
            }
            transcriptInput.value = "";
        } catch (error) {
            console.error(error);
            showNotification(
                currentLang === 'tr' ? "Transkript işlenirken bir hata oluştu." : "An error occurred while processing the transcript.",
                'error'
            );
        }
    });
}
