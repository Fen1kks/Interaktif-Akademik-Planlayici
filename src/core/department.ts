import { departments } from '../data/registry';
import { updateGlobalTranslations } from '../i18n';
import { setCurrentDept, setCurriculum, setState, getCurrentDept } from './state';
import { render, draw } from './render';
import { calculateOptimalZoom } from '../features/zoom';

export function switchDepartment(code: string) {
    if (!departments[code]) return;
    setCurrentDept(code);
    localStorage.setItem("lastDept", code);
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.remove("selected");
        if (item.textContent?.includes(`(${code})`)) item.classList.add("selected");
    });
    loadDepartment(code);
    const deptSelector = document.getElementById("dept-selector");
    if (deptSelector) deptSelector.classList.remove("active");
}

export function loadDepartment(code: string) {
    if (!departments[code]) {
        const available = Object.keys(departments);
        if (available.length > 0) return loadDepartment(available[0]);
        return;
    }
    const deptData = departments[code];
    updateGlobalTranslations(getCurrentDept(), deptData.name);
    setCurriculum(deptData.curriculum);
    if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'view_department', {
            'department_code': code
        });
    }
    try {
        setState(JSON.parse(localStorage.getItem(`gpaState_${code}`) || "{}"));
    } catch {
        setState({});
    }
    render();
    setTimeout(() => {
        calculateOptimalZoom();
        requestAnimationFrame(() => draw());
    }, 150);
}
