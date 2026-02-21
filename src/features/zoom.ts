import { draw, getGrid } from '../core/render';

export function calculateOptimalZoom() {
    const grid = getGrid();
    const viewportWidth = window.innerWidth;
    // Mobile breakpoint: skip zoom on small screens
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

export function setupResizeListener() {
    let resizeTimeout: number;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => calculateOptimalZoom(), 200);
    });
}
