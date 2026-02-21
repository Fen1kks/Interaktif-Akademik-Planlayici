import { getCurriculum, getState } from '../core/state';

export function highlightRelated(courseId: string) {
    resetHighlights();
    const curriculum = getCurriculum();
    const state = getState();
    const allArrows = document.querySelectorAll(".arrow-path");
    const hasConnections = Array.from(allArrows).some(arrow => 
      arrow.getAttribute("data-source") === courseId || 
      arrow.getAttribute("data-target") === courseId
    );
    const connectedCourses = new Map<string, string>();
    const forcedColors = new Map<string, string>();

    // 1. COMPLEX PREREQUISITE HIGHLIGHTING
    const course = curriculum.find(c => c.id === courseId);
    let effectivePrereqs = course ? [...(course.prereqs || [])] : [];

    // Merge Option Prereqs if selected
    if (course && course.options) {
         const s = state[course.id];
         if (s && s.selectedOption !== undefined && course.options[s.selectedOption]) {
              const opt = course.options[s.selectedOption];
              if (opt.prereqs) {
                  effectivePrereqs = [...effectivePrereqs, ...opt.prereqs];
              }
         }
    }

    if (effectivePrereqs.length > 0) {
        effectivePrereqs.forEach(p => {
             if (typeof p === "object" && p.type === "count_pattern") {
                 const { pattern, exclude } = p;
                 const regex = new RegExp(pattern);
                 curriculum.forEach(c => {
                     if (regex.test(c.id) && (!exclude || !exclude.includes(c.id)) && c.id !== courseId) {
                         const cState = state[c.id];
                         const isCompleted = cState && cState.completed && cState.grade !== "FF";
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
            if (hasConnections || connectedCourses.size > 0) {
                 arrowEl.setAttribute("stroke", grayPalette[grayIndex % grayPalette.length]);
                 grayIndex++;
                 arrowEl.style.opacity = "0.2";
            }
        }
    });

    connectedCourses.forEach((highlightColor, cId) => {
        const otherCard = document.getElementById(`card-${cId}`);
        if (otherCard) {
            otherCard.classList.add("dependency-highlight");
            otherCard.style.boxShadow = `0 0 0 2px ${highlightColor}`;
        }
    });
    const selfCard = document.getElementById(`card-${courseId}`);
    if (selfCard) {
        selfCard.classList.add("dependency-highlight");
    }
}

export function removeHighlights() {
    resetHighlights();
}

export function resetHighlights() {
    const allArrows = document.querySelectorAll(".arrow-path");
    allArrows.forEach(arrow => {
        const arrowEl = arrow as SVGPathElement;
        const originalColor = arrow.getAttribute("data-original-color");
        if (originalColor) arrowEl.setAttribute("stroke", originalColor);
        arrowEl.style.opacity = "";
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
