import { Course, CourseId } from '../types';

const TRACK_PAD = 4;       // min px between two lines sharing a channel
const CLUSTER_PX = 20;     // cards whose x differ less than this are one column
const SVG_NS = "http://www.w3.org/2000/svg";

interface ArrowParams {
    grid: HTMLElement;
    curriculum: Course[];
    state: Record<string, any>;
    isLocked: (id: CourseId, checkCoreqs?: boolean, ignoreCreditLimit?: boolean) => boolean;
}

interface CardBox { x: number; y: number; w: number; h: number; cy: number; cx: number; col: number }

interface Route {
    id: string; courseId: string; prereqId: string; isWeak: boolean; color: string;
    sc: number; tc: number; sx: number; sy: number; tx: number; ty: number;
    mode: 'adj' | 'long' | 'back';
    chanY: number; chanH: number;
    vS?: VSeg; vT?: VSeg;
}

// One vertical line in a column gutter. Arrows of the same colour (same prereq) share one line.
interface VSeg { g: number; color: string; a: number; b: number; x: number }

let drawRequestId: number | null = null;

export function scheduleDrawArrows(params: ArrowParams) {
    if (drawRequestId) return;
    drawRequestId = requestAnimationFrame(() => {
        drawArrows(params);
        drawRequestId = null;
    });
}

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

// Greedy interval colouring: items whose [a,b] ranges overlap get different track numbers.
function assignTracks(items: { a: number; b: number }[]) {
    const order = items.map((_, i) => i).sort((i, j) => items[i].a - items[j].a);
    const ends: number[] = [];
    const idx: number[] = new Array(items.length);
    order.forEach(i => {
        let t = ends.findIndex(e => e + TRACK_PAD < items[i].a);
        if (t === -1) { t = ends.length; ends.push(0); }
        ends[t] = items[i].b;
        idx[i] = t;
    });
    return { idx, count: ends.length };
}

// Horizontal corridors between cards, across the columns the arrow flies over.
function freeGaps(cards: CardBox[], x1: number, x2: number, maxY: number) {
    const blocks: [number, number][] = [[0, 60]];
    cards.forEach(c => { if (c.x + c.w > x1 && c.x < x2) blocks.push([c.y - 1, c.y + c.h + 1]); });
    blocks.sort((a, b) => a[0] - b[0]);
    const gaps: { s: number; e: number }[] = [];
    let end = blocks[0][1];
    for (let i = 1; i < blocks.length; i++) {
        if (blocks[i][0] - end >= 6) gaps.push({ s: end, e: blocks[i][0] });
        end = Math.max(end, blocks[i][1]);
    }
    if (maxY - end >= 6) gaps.push({ s: end, e: maxY });
    return gaps;
}

// Polyline with rounded corners; radius shrinks when a segment is short.
function roundedPath(raw: [number, number][], r = 8) {
    const p = raw.filter((q, i) => i === 0 || q[0] !== raw[i - 1][0] || q[1] !== raw[i - 1][1]);
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length - 1; i++) {
        const [px, py] = p[i - 1], [cx, cy] = p[i], [nx, ny] = p[i + 1];
        const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
        const rr = Math.min(r, l1 / 2, l2 / 2);
        d += ` L ${cx - (cx - px) / l1 * rr} ${cy - (cy - py) / l1 * rr}` +
             ` Q ${cx} ${cy} ${cx + (nx - cx) / l2 * rr} ${cy + (ny - cy) / l2 * rr}`;
    }
    const last = p[p.length - 1];
    return d + ` L ${last[0]} ${last[1]}`;
}

function effectivePrereqs(course: Course, state: Record<string, any>) {
    const list: any[] = [...(course.prereqs || [])];
    const s = state[course.id];
    if (course.options && s && s.selectedOption !== undefined && course.options[s.selectedOption]) {
        const opt = course.options[s.selectedOption];
        if (opt.prereqs) list.push(...opt.prereqs);
    }
    return list;
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

    // --- cards & columns ---
    const cardCache = new Map<string, CardBox>();
    curriculum.forEach(c => {
        const el = document.getElementById(`card-${c.id}`);
        if (el) {
            const pos = getRelativePos(el, grid);
            cardCache.set(c.id, {
                x: pos.x, y: pos.y, w: el.offsetWidth, h: el.offsetHeight,
                cy: pos.y + el.offsetHeight / 2, cx: pos.x + el.offsetWidth, col: 0
            });
        }
    });
    const cards = [...cardCache.values()];
    const xs = cards.map(c => c.x).sort((a, b) => a - b);
    const colStarts: number[] = [];
    xs.forEach(x => { if (!colStarts.length || x - colStarts[colStarts.length - 1] > CLUSTER_PX) colStarts.push(x); });
    const colLeft = [...colStarts];
    const colRight = colStarts.map(() => 0);
    cards.forEach(c => {
        let k = colStarts.length - 1;
        while (k > 0 && c.x < colStarts[k] - CLUSTER_PX) k--;
        c.col = k;
        colRight[k] = Math.max(colRight[k], c.x + c.w);
    });
    // gutter g = the free strip right of column g
    const gutterLeft = (g: number) => colRight[g];
    const gutterWidth = (g: number) => g + 1 < colLeft.length ? colLeft[g + 1] - colRight[g] : 28;

    // --- fan-out ordering (unchanged): spread arrows leaving/entering one card ---
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    curriculum.forEach((course) => {
        if (!cardCache.has(course.id)) return;
        effectivePrereqs(course, state).forEach((pString) => {
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
    const getCachedY = (id: string) => cardCache.get(id)?.cy ?? 0;
    outgoing.forEach((targets) => targets.sort((a, b) => getCachedY(a) - getCachedY(b)));
    incoming.forEach((sources) => sources.sort((a, b) => getCachedY(a) - getCachedY(b)));

    // --- 1. describe every arrow ---
    const laneSpacing = 10;
    const routes: Route[] = [];
    curriculum.forEach((course) => {
        const target = cardCache.get(course.id);
        if (!target) return;
        effectivePrereqs(course, state).forEach((pString) => {
            if (typeof pString !== 'string') return;
            const prereqId = pString.replace("!", "");
            const source = cardCache.get(prereqId);
            if (!source) return;
            const outList = outgoing.get(prereqId) || [];
            const inList = incoming.get(course.id) || [];
            const outOffset = (outList.indexOf(course.id) - (outList.length - 1) / 2) * laneSpacing;
            const inOffset = (inList.indexOf(prereqId) - (inList.length - 1) / 2) * laneSpacing;
            const isCoreq = !!(course.coreqs && course.coreqs.includes(prereqId));
            const color = isCoreq
                ? generateStableColor(course.id < prereqId ? course.id + prereqId : prereqId + course.id)
                : generateStableColor(prereqId);
            const sc = source.col, tc = target.col;
            routes.push({
                id: `${prereqId}-${course.id}`, courseId: course.id, prereqId,
                isWeak: pString.endsWith("!"), color, sc, tc,
                sx: source.cx, sy: source.cy + outOffset,
                // same-column / backwards arrows enter the target from its right side
                tx: tc > sc ? target.x : target.cx, ty: target.cy + inOffset,
                mode: tc > sc + 1 ? 'long' : tc === sc + 1 ? 'adj' : 'back',
                chanY: 0, chanH: 0
            });
        });
    });

    // --- 2. long arrows: pick a corridor between cards of the columns they fly over ---
    routes.filter(r => r.mode === 'long').forEach(r => {
        const gaps = freeGaps(cards, colRight[r.sc] + 1, colLeft[r.tc] - 1, scrollHeight);
        let best = { s: r.ty - 3, e: r.ty + 3 }, bestDist = Infinity;
        gaps.forEach(g => {
            const dist = Math.abs((g.s + g.e) / 2 - r.ty);
            if (dist < bestDist) { bestDist = dist; best = g; }
        });
        r.chanY = (best.s + best.e) / 2;
        r.chanH = best.e - best.s;
    });

    // --- 3. vertical lines in gutters; same gutter + same colour = one shared line ---
    const vSegs = new Map<string, VSeg>();
    const addV = (g: number, color: string, y1: number, y2: number) => {
        const key = `${g}|${color}`;
        const a = Math.min(y1, y2) - 6, b = Math.max(y1, y2) + 6;
        const seg = vSegs.get(key);
        if (seg) { seg.a = Math.min(seg.a, a); seg.b = Math.max(seg.b, b); return seg; }
        const created = { g, color, a, b, x: 0 };
        vSegs.set(key, created);
        return created;
    };
    routes.forEach(r => {
        if (r.mode === 'long') {
            r.vS = addV(r.sc, r.color, r.sy, r.chanY);
            r.vT = addV(r.tc - 1, r.color, r.chanY, r.ty);
        } else {
            r.vS = addV(r.sc, r.color, r.sy, r.ty);
        }
    });
    const byGutter = new Map<number, VSeg[]>();
    vSegs.forEach(s => { if (!byGutter.has(s.g)) byGutter.set(s.g, []); byGutter.get(s.g)!.push(s); });
    byGutter.forEach((segs, g) => {
        const { idx, count } = assignTracks(segs);
        segs.forEach((s, i) => { s.x = gutterLeft(g) + gutterWidth(g) * (idx[i] + 1) / (count + 1); });
    });

    // --- 4. horizontal runs: arrows sharing a corridor get separate lanes ---
    const byChannel = new Map<number, Route[]>();
    routes.filter(r => r.mode === 'long').forEach(r => {
        const key = Math.round(r.chanY / 8);
        if (!byChannel.has(key)) byChannel.set(key, []);
        byChannel.get(key)!.push(r);
    });
    byChannel.forEach(list => {
        const { idx, count } = assignTracks(list.map(r => ({
            a: Math.min(r.vS!.x, r.vT!.x), b: Math.max(r.vS!.x, r.vT!.x)
        })));
        const step = Math.min(6, (Math.min(...list.map(r => r.chanH)) - 2) / count);
        list.forEach((r, i) => { r.chanY += (idx[i] - (count - 1) / 2) * step; });
    });

    // --- 5. draw ---
    routes.forEach(route => {
        const { sx, sy, tx, ty, courseId, prereqId, isWeak, color: strokeColor } = route;
        const pts: [number, number][] = route.mode === 'long'
            ? [[sx, sy], [route.vS!.x, sy], [route.vS!.x, route.chanY], [route.vT!.x, route.chanY], [route.vT!.x, ty], [tx, ty]]
            : [[sx, sy], [route.vS!.x, sy], [route.vS!.x, ty], [tx, ty]];

        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", roundedPath(pts));
        path.setAttribute("fill", "none");
        path.setAttribute("class", "arrow-path");
        path.setAttribute("data-source", prereqId);
        path.setAttribute("data-target", courseId);

        const prereqState = state[prereqId];
        const isPrereqCompleted = prereqState && prereqState.completed && prereqState.grade !== "FF";

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


export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "";
    if (type === 'success') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-success)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    else if (type === 'error') icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-danger)"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    else icon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--c-primary)"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    toast.innerHTML = `
        ${icon}
        <span class="toast-message">${message}</span>
        <button class="toast-close">✕</button>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    closeBtn?.addEventListener("click", () => removeToast(toast));

    container.appendChild(toast);

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
