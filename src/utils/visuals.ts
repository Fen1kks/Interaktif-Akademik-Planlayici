import { Course, CourseId } from '../types';

// Constants
const ARROW_MARGIN = 1;

interface ArrowParams {
    grid: HTMLElement;
    curriculum: Course[];
    state: Record<string, any>;
    isLocked: (id: CourseId, checkCoreqs?: boolean, ignoreCreditLimit?: boolean) => boolean;
}

let drawRequestId: number | null = null;

export function scheduleDrawArrows(params: ArrowParams) {
    if (drawRequestId) return;
    drawRequestId = requestAnimationFrame(() => {
        drawArrows(params);
        drawRequestId = null;
    });
}

// Helpers
function getRelativePos(el: HTMLElement, root: HTMLElement) {
    let x = 0;
    let y = 0;
    let current = el as HTMLElement | null;
    while (current && current !== root && current !== document.body) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent as HTMLElement;
    }
    return { x, y };
}

function generateStableColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorPalette = [
        '#4965CD', '#E1497D', '#9C5B07', '#F9364E', '#20AA6C',
        '#F4315A', '#87D305', '#AD11D5', '#2843F5', '#74ED9F',
        '#1ABC9C', '#E67E22', '#a81d91ff', '#4083c5ff', '#D35400', 
        '#C0392B', '#16A085', '#8E44AD', '#dd7b5dff', '#F39C12'
    ];
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
}

function getCollisionRegions(minX: number, maxX: number, cardCache: Map<string, any>) {
    const regions: { y1: number; y2: number }[] = [{ y1: 0, y2: 60 }];
    cardCache.forEach(card => {
        const x1 = card.x;
        const x2 = card.x + card.w;
        if (x2 > minX && x1 < maxX) {
            regions.push({ y1: card.y - ARROW_MARGIN, y2: card.y + card.h + ARROW_MARGIN });
        }
    });
    return regions.sort((a, b) => a.y1 - b.y1);
}

function findBestYGap(collisionRegions: any[], targetY: number, minY: number, maxY: number) {
    if (collisionRegions.length === 0) return targetY;
    const regions = [{ y1: minY, y2: minY }].concat(collisionRegions).concat([{ y1: maxY, y2: maxY }]);
    let bestGapY = -1;
    let minDist = Infinity;
    for (let i = 0; i < regions.length - 1; i++) {
        const current = regions[i];
        const next = regions[i+1];
        const gapStart = current.y2;
        const gapEnd = next.y1;
        const gapSize = gapEnd - gapStart;
        if (gapSize > 5) {
            const gapCenter = gapStart + gapSize / 2;
            const dist = Math.abs(gapCenter - targetY);
            if (dist < minDist) {
                minDist = dist;
                bestGapY = gapCenter;
            }
        }
    }
    return bestGapY !== -1 ? bestGapY : targetY;
}

export function drawArrows({ grid, curriculum, state, isLocked }: ArrowParams) {
    const svg = document.getElementById("arrows-container");
    if (!svg) return;
    svg.innerHTML = "";
    
    svg.style.width = "0px";
    svg.style.height = "0px";
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");

    const scrollWidth = grid.scrollWidth;
    const scrollHeight = grid.scrollHeight;
    
    svg.setAttribute("width", String(scrollWidth));
    svg.setAttribute("height", String(scrollHeight));
    svg.style.width = `${scrollWidth}px`;
    svg.style.height = `${scrollHeight}px`;

    const cardCache = new Map();
    curriculum.forEach(c => {
        const el = document.getElementById(`card-${c.id}`);
        if (el) {
            const pos = getRelativePos(el, grid);
            cardCache.set(c.id, {
                x: pos.x, y: pos.y, w: el.offsetWidth, h: el.offsetHeight,
                cy: pos.y + el.offsetHeight / 2, cx: pos.x + el.offsetWidth
            });
        }
    });

    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();

    curriculum.forEach((course) => {
        if (!cardCache.has(course.id)) return;
        course.prereqs.forEach((pString) => {
            if (typeof pString !== 'string') return;
            if (pString.match(/^\d+\s+Credits?$/i)) return;
            const prereqId = pString.replace("!", "");
            if (course.coreqs && course.coreqs.includes(prereqId)) return;
            if (!cardCache.has(prereqId)) return;

            if (!outgoing.has(prereqId)) outgoing.set(prereqId, []);
            outgoing.get(prereqId)!.push(course.id);
            if (!incoming.has(course.id)) incoming.set(course.id, []);
            incoming.get(course.id)!.push(prereqId);
        });
    });

    const getCachedY = (id: string) => cardCache.get(id) ? cardCache.get(id).cy : 0;
    outgoing.forEach((targets) => targets.sort((a, b) => getCachedY(a) - getCachedY(b)));
    incoming.forEach((sources) => sources.sort((a, b) => getCachedY(a) - getCachedY(b)));

    const laneSpacing = 10;
    const verticalLanes: Record<number, any[]> = {};
    const horizontalLanes: Record<string, any[]> = {};

    curriculum.forEach((course) => {
        if (!course.prereqs.length || !cardCache.has(course.id)) return;
        const targetMetrics = cardCache.get(course.id);
        const targetX = targetMetrics.x;
        const targetYBase = targetMetrics.cy;

        course.prereqs.forEach((pString) => {
            if (typeof pString !== 'string') return;
            const isWeak = pString.endsWith("!");
            const prereqId = pString.replace("!", "");
            if (!cardCache.has(prereqId)) return;

            const sourceMetrics = cardCache.get(prereqId);
            const sourceX = sourceMetrics.cx;
            const sourceYBase = sourceMetrics.cy;

            const gap = targetX - sourceX;
            const arrowId = `${prereqId}-${course.id}`;
            const outList = outgoing.get(prereqId) || [];
            const inList = incoming.get(course.id) || [];
            
            const outOffset = (outList.indexOf(course.id) - (outList.length - 1) / 2) * laneSpacing;
            const inOffset = (inList.indexOf(prereqId) - (inList.length - 1) / 2) * laneSpacing;

            const sourceY = sourceYBase + outOffset;
            const targetY = targetYBase + inOffset;
            let hopY = targetY;

            if (gap > 60) {
                const blockStart = sourceX + 10;
                const blockEnd = targetX;
                const collisions = getCollisionRegions(blockStart, blockEnd, cardCache);
                hopY = findBestYGap(collisions, targetY, Math.min(sourceY, targetY) - 40, scrollHeight);
                const gapKey = `G-${Math.round(hopY / 10) * 10}`;
                if (!horizontalLanes[gapKey]) horizontalLanes[gapKey] = [];
                horizontalLanes[gapKey].push({ id: arrowId, y: targetY });
            }

            const gutterKey = Math.round(sourceX);
            if (!verticalLanes[gutterKey]) verticalLanes[gutterKey] = [];
            verticalLanes[gutterKey].push({
                id: arrowId, sourceX, sourceY, targetX, targetY, hopY, gap,
                courseId: course.id, prereqId, isWeak
            });
        });
    });

    const gutterAssignments: Record<string, number> = {};
    Object.keys(verticalLanes).forEach(key => {
        const k = Number(key);
        const arrows = verticalLanes[k];
        arrows.sort((a, b) => ((a.sourceY + a.targetY) / 2) - ((b.sourceY + b.targetY) / 2));
        const count = arrows.length;
        const isMobile = window.innerWidth <= 900;
        const availableWidth = isMobile ? 16 : 24;
        const step = Math.min(isMobile ? 4 : 12, availableWidth / count);
        arrows.forEach((arrow, index) => {
            gutterAssignments[arrow.id] = (index - (count - 1) / 2) * step;
        });
    });

    const gapAssignments: Record<string, number> = {};
    Object.keys(horizontalLanes).forEach(key => {
        const arrows = horizontalLanes[key];
        arrows.sort((a, b) => a.y - b.y);
        const count = arrows.length;
        const step = Math.min(8, 20 / count);
        arrows.forEach((arrow, index) => {
            gapAssignments[arrow.id] = (index - (count - 1) / 2) * step;
        });
    });

    // DRAW PHASE
    Object.values(verticalLanes).flat().forEach(arrow => {
        const { sourceX, sourceY, targetX, targetY, hopY, gap, id, courseId, prereqId, isWeak } = arrow;
        const channelOffset = gutterAssignments[id] || 0;
        const gapOffset = gapAssignments[id] || 0;
        
        const isMobile = window.innerWidth <= 900;
        const gutterBase = isMobile ? 18 : 32;
        const r = 8;
        let d = "";

        if (gap > 60) {
            const crossY = hopY + gapOffset;
            const gutterX1 = sourceX + gutterBase + channelOffset;
            const gutterX2 = targetX - gutterBase - channelOffset;
            const dir1 = crossY > sourceY ? 1 : -1;
            const dir2 = targetY > crossY ? 1 : -1;

            d = `M ${sourceX} ${sourceY} ` +
                `L ${gutterX1 - r} ${sourceY} ` + 
                `Q ${gutterX1} ${sourceY} ${gutterX1} ${sourceY + r * dir1} ` + 
                `L ${gutterX1} ${crossY - r * dir1} ` + 
                `Q ${gutterX1} ${crossY} ${gutterX1 + r} ${crossY} ` + 
                `L ${gutterX2 - r} ${crossY} ` + 
                `Q ${gutterX2} ${crossY} ${gutterX2} ${crossY + r * dir2} ` + 
                `L ${gutterX2} ${targetY - r * dir2} ` + 
                `Q ${gutterX2} ${targetY} ${gutterX2 + r} ${targetY} ` + 
                `L ${targetX + 5} ${targetY}`;
        } else {
            const actualGap = targetX - sourceX;
            const gutterX = sourceX + (actualGap / 2) + channelOffset;
            const dirY = targetY > sourceY ? 1 : -1;
            d = `M ${sourceX} ${sourceY} ` +
                `L ${gutterX - r} ${sourceY} ` +
                `Q ${gutterX} ${sourceY} ${gutterX} ${sourceY + r * dirY} ` +
                `L ${gutterX} ${targetY - r * dirY} ` +
                `Q ${gutterX} ${targetY} ${gutterX + r} ${targetY} ` +
                `L ${targetX} ${targetY}`;
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("class", "arrow-path");
        path.setAttribute("data-source", prereqId);
        path.setAttribute("data-target", courseId);

        const prereqState = state[prereqId];
        const isPrereqCompleted = prereqState && prereqState.completed && prereqState.grade !== "FF";
        
        // Co-req Sync Check
        const course = curriculum.find(c => c.id === courseId);
        const isCoreq = course && course.coreqs && course.coreqs.includes(prereqId);
        let strokeColor = generateStableColor(prereqId);
        if (isCoreq && courseId && prereqId) {
             const id1 = courseId < prereqId ? courseId : prereqId;
             const id2 = courseId < prereqId ? prereqId : courseId;
             strokeColor = generateStableColor(id1 + id2);
        }

        let baseOpacity = "0.9";
        let strokeWidth = "3";

        if (isWeak) {
            path.setAttribute("stroke-dasharray", "0, 7");
            path.setAttribute("stroke-linecap", "round");
            strokeWidth = "4";
            baseOpacity = "0.85";
        } else if (!isPrereqCompleted) {
            path.setAttribute("stroke-dasharray", "5,5");
            baseOpacity = "0.5";
        }

        path.style.opacity = baseOpacity;
        path.setAttribute("data-base-opacity", baseOpacity);
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", strokeWidth);
        path.setAttribute("data-original-color", strokeColor);
        
        svg.appendChild(path);
    });

    // CO-REQUISITES (Double Lines)
    curriculum.forEach(course => {
        if (!course.coreqs || !course.coreqs.length) return;
        const sourceMetrics = cardCache.get(course.id);
        if (!sourceMetrics) return;

        course.coreqs.forEach(cString => {
            const isWeak = cString.endsWith("!");
            const coreqId = cString.replace("!", "");
            if (course.id > coreqId) return; // Draw only once

            const targetMetrics = cardCache.get(coreqId);
            if (!targetMetrics) return;

            const isSourceHigher = sourceMetrics.y < targetMetrics.y;
            const top = isSourceHigher ? sourceMetrics : targetMetrics;
            const bot = isSourceHigher ? targetMetrics : sourceMetrics;

            const xSource = top.x + top.w / 2;
            const ySource = top.y + top.h;
            const xTarget = bot.x + bot.w / 2;
            const yTarget = bot.y;
            const pairColor = generateStableColor(course.id + coreqId);
            const isPairLocked = isLocked(course.id, false) || isLocked(coreqId, false);
            
            const offsets = [-3, 3];
            offsets.forEach(off => {
                const d = `M ${xSource + off} ${ySource} L ${xTarget + off} ${yTarget}`;
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", d);
                path.setAttribute("fill", "none");
                path.setAttribute("stroke", pairColor);
                path.setAttribute("class", "arrow-path coreq-line");
                
                let w = window.innerWidth <= 900 ? "0.8" : "3";
                let op = "0.9";
                
                if (isWeak) {
                    path.setAttribute("stroke-dasharray", "0, 7");
                    path.setAttribute("stroke-linecap", "round");
                    w = "4"; op = isPairLocked ? "0.5" : "0.85";
                } else if (isPairLocked) {
                     path.setAttribute("stroke-dasharray", "4,4"); op = "0.5";
                } else if (!(state[course.id]?.completed && state[coreqId]?.completed)) {
                     path.setAttribute("stroke-dasharray", "4,4");
                }

                path.setAttribute("stroke-width", w);
                path.style.opacity = op;
                svg.appendChild(path);
            });
        });
    });
}

// Toast Notifications
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Icon based on type
    let icon = "";
    if (type === 'success') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    else if (type === 'error') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-danger)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    else icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-primary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
        <button class="toast-close">✕</button>
    `;

    // Close logic
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn?.addEventListener("click", () => removeToast(toast));

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        removeToast(toast);
    }, duration);
}

function removeToast(toast: HTMLElement) {
    toast.style.animation = "fadeOut 0.3s forwards";
    toast.addEventListener("animationend", () => {
        toast.remove();
    });
}
