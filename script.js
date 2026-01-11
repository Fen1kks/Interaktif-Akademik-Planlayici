const GRADES = {
  AA: 4.0,
  BA: 3.5,
  BB: 3.0,
  CB: 2.5,
  CC: 2.0,
  DC: 1.5,
  DD: 1.0,
  FF: 0.0,
};

const ARROW_MARGIN = 1; 

// DOM Elements
const grid = document.getElementById("grid-container");
const creditsEl = document.getElementById("total-credits");
const gpaEl = document.getElementById("gpa-score");
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.querySelector(".sun-icon");
const moonIcon = document.querySelector(".moon-icon");

// Dept Elements
const deptTitle = document.getElementById("dept-title");
const deptSelector = document.getElementById("dept-selector");
const deptDropdown = document.getElementById("dept-dropdown");

// GLOBAL STATE
let currentDept = localStorage.getItem("lastDept") || "ME";
let curriculum = []; // Will be loaded dynamically
let state = {};      // Will be loaded dynamically

/* =========================================================================
   2. DEPARTMENT & STATE MANAGEMENT
   ========================================================================= */

// Initialize System
function initSystem() {
    // 1. Populate Dropdown
    const codes = Object.keys(window.departments);
    deptDropdown.innerHTML = codes.map(code => 
        `<div class="dropdown-item ${code === currentDept ? 'selected' : ''}" onclick="switchDepartment('${code}')">
            ${window.departments[code].name} (${code})
        </div>`
    ).join("");

    // 2. Load Department
    loadDepartment(currentDept);

    // 3. Setup Dropdown Events
    deptSelector.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown-item")) {
            deptSelector.classList.toggle("active");
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!deptSelector.contains(e.target)) {
            deptSelector.classList.remove("active");
        }
    });
}

function switchDepartment(code) {
    if (!window.departments[code]) return;
    currentDept = code;
    localStorage.setItem("lastDept", code);
    
    // Update Dropdown Selection UI
    document.querySelectorAll(".dropdown-item").forEach(item => {
        item.classList.remove("selected");
        if (item.textContent.includes(`(${code})`)) item.classList.add("selected");
    });
    
    loadDepartment(code);
    
    // Close Dropdown
    deptSelector.classList.remove("active");
}

function loadDepartment(code) {
    const deptData = window.departments[code];
    curriculum = deptData.curriculum; // Shallow copy reference
    
    // Update Title
    deptTitle.textContent = `Department of ${deptData.name}`;

    // Clean Data (Filter unknown prereqs - Scoped to this dept + Allow Credit Reqs)
    const allIds = new Set(curriculum.map((c) => c.id));
    curriculum.forEach((c) => {
      c.prereqs = c.prereqs.filter((p) => {
          const cleanId = p.replace("!", "");
          return allIds.has(cleanId) || /^\d+\s+Credits?$/i.test(p);
      });
    });

    // Load State for this Department
    state = JSON.parse(localStorage.getItem(`gpaState_${code}`)) || {};

    // Re-render
    render();
    
    // Draw immediately (initial pass) to ensure visibility
    try { drawArrows(); } catch(e) { console.error(e); }

    // Recalculate zoom (and redraw) once layout settles
    setTimeout(() => {
        calculateOptimalZoom();
        // Redundant draw to ensure it sticks after zoom
        requestAnimationFrame(drawArrows);
    }, 150);
}

function saveState() {
  localStorage.setItem(`gpaState_${currentDept}`, JSON.stringify(state));
}

function updateState(courseId, isCompleted, grade, skipRender = false) {
  if (!state[courseId]) {
    state[courseId] = { completed: false, grade: "" };
  }
  
  state[courseId].completed = isCompleted;
  if (grade !== undefined) state[courseId].grade = grade;
  
  if (!isCompleted) {
    cascadeUncheck(courseId);
  }
  
  saveState();
  
  if (!skipRender) {
      render();
      scheduleDrawArrows();
  }
}

function cascadeUncheck(courseId) {
  const dependents = curriculum.filter((c) => c.prereqs.some(p => p.replace("!", "") === courseId));

  dependents.forEach((dep) => {
    if (state[dep.id] && state[dep.id].completed) {
      state[dep.id].completed = false;
      state[dep.id].grade = "";
      cascadeUncheck(dep.id);
    }
  });
}


/* =========================================================================
   3. THEME MANAGEMENT
   ========================================================================= */
// Initialization
// Initialization
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
  document.documentElement.setAttribute("data-theme", "dark");
  updateThemeIcon(true);
} else {
    updateThemeIcon(false);
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        updateThemeIcon(false);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        updateThemeIcon(true);
      }
      scheduleDrawArrows();
    });
}

function updateThemeIcon(isDark) {
  if (!sunIcon || !moonIcon) return;
  if (isDark) {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}


/* =========================================================================
   4. LOGIC ENGINE (LOCKING & METRICS)
   ========================================================================= */
function getCourse(id) {
  return curriculum.find((c) => c.id === id);
}

function isLocked(courseId, checkCoreqs = true, ignoreCreditLimit = false) {
  const course = getCourse(courseId);
  if (!course) return false;

  // 1. Check Own Prereqs
  // 1. Check Own Prereqs
  const ownLocked = course.prereqs.some((pString) => {
    // Check for Credit Requirement (e.g. "100 Credits")
    const creditMatch = pString.match(/^(\d+)\s+Credits?$/i);
    if (creditMatch) {
        if (ignoreCreditLimit) return false; // Ignore during calculation phase
        const required = parseInt(creditMatch[1], 10);
        return (window.currentTotalCredits || 0) < required;
    }

    // Check for "Weak" Prerequisite (ends with '!')
    // e.g. "MATH101!" -> FF is allowed (only attendance required)
    let pId = pString;
    let allowFF = false;
    if (pId.endsWith("!")) {
        pId = pId.slice(0, -1);
        allowFF = true;
    }

    const pState = state[pId];
    
    // If not taken at all, it's locked
    if (!pState || pState.grade === "") return true;

    // If weak prereq, any grade (including FF) is fine
    if (allowFF) return false;

    // Standard Prereq: Must be completed and NOT FF
    return !pState.completed || pState.grade === "FF";
  });
  
  if (ownLocked) return true;

  // 2. Check Co-req Prereqs (Mutual Locking)
  if (checkCoreqs && course.coreqs && course.coreqs.length > 0) {
      const coreqLocked = course.coreqs.some(cString => {
          const coreqId = cString.replace("!", "");
          // Call Recursively but disable further coreq checks to avoid infinite loop
          return isLocked(coreqId, false, ignoreCreditLimit);
      });
      if (coreqLocked) return true;
  }

  return false;
}

function toggleCredit(courseId, event) {
    if (event) event.stopPropagation();
    
    const course = getCourse(courseId);
    if (!course || !Array.isArray(course.credits)) return;

    if (!state[courseId]) {
        state[courseId] = { completed: false, grade: "" };
    }

    const current = state[courseId].selectedCredit || course.credits[0];
    const currentIndex = course.credits.indexOf(current);
    const nextIndex = (currentIndex + 1) % course.credits.length;
    
    state[courseId].selectedCredit = course.credits[nextIndex];
    saveState();
    render(); 
}

function calculateMetrics() {
  let totalCredits = 0;
  let weightedSum = 0;
  let earnedCredits = 0;

  Object.keys(state).forEach((id) => {
    const s = state[id];
    const course = getCourse(id);
    // Ignore Credit Limit when summing up credits to avoid cyclical dependency
    if (course && s.completed && !isLocked(id, true, true)) {
      
      const availableCredits = Array.isArray(course.credits) 
          ? (s.selectedCredit || course.credits[0]) 
          : course.credits;

      if (s.grade !== "FF") {
        earnedCredits += availableCredits;
      }
      
      if (s.grade && s.grade !== "" && GRADES[s.grade] !== undefined) {
        weightedSum += availableCredits * GRADES[s.grade];
        totalCredits += availableCredits;
      }
    }
  });

  // Expose for dynamic checks (e.g. ISE400)
  window.currentTotalCredits = earnedCredits;

  const gpa =
    totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";

  creditsEl.textContent = earnedCredits;
  gpaEl.textContent = gpa;

  const val = parseFloat(gpa);
  if (val >= 3.5) gpaEl.style.color = "var(--c-success)";
  else if (val >= 2.0) gpaEl.style.color = "var(--c-primary)";
  else if (val > 0) gpaEl.style.color = "#dc2626";
  else gpaEl.style.color = "var(--c-text-muted)";
}


/* =========================================================================
   5. DOM RENDERING (GRID & CARDS)
   ========================================================================= */
function render() {
  // Pre-calculate metrics so global credits state is fresh for isLocked() checks during rendering
  calculateMetrics();

  grid.innerHTML = "";
  
  // Re-inject the SVG container into the grid
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "arrows-container";
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.overflow = "visible";
  grid.appendChild(svg);
  
  const terms = [1, 2, 3, 4, 5, 6, 7, 8];

  terms.forEach((term) => {
    const courses = curriculum.filter((c) => c.term === term);
    const isFall = term % 2 !== 0; 
    const yearNum = Math.ceil(term / 2);
    const semesterName = isFall ? "Fall" : "Spring";
    
    const suffix = (n) => {
        if (n === 1) return "st";
        if (n === 2) return "nd";
        if (n === 3) return "rd";
        return "th";
    };

    const col = document.createElement("div");
    col.className = "term-column"; 
    
    col.innerHTML = `
            <div class="term-header">
                <div class="term-name" style="font-weight: 700; font-size: 0.9rem; color: var(--c-primary);">${yearNum}${suffix(yearNum)} Year - ${semesterName}</div>
            </div>
        `;

    courses.forEach((course) => {
      const courseEl = createCard(course);
      col.appendChild(courseEl);
    });

    grid.appendChild(col);
  });

  calculateMetrics();
}

function createCard(course) {
  const locked = isLocked(course.id);
  const data = state[course.id] || { completed: false, grade: "" };

  const card = document.createElement("div");
  card.id = `card-${course.id}`;
  card.className = `course-card ${locked ? "locked" : ""} ${
    data.completed ? "completed" : ""
  } ${data.grade === "FF" ? "failed" : ""}`;

  if (course.name === "Summer Practice") {
      card.classList.add("summer-practice");
  }

  const prereqText = course.prereqs.length
    ? `Prereqs: ${course.prereqs.join(", ")}`
    : "No Prerequisites";

  const gradeColor = getGradeColor(data.grade);
  card.style.setProperty(
    "--grade-color",
    data.grade === "FF" ? "#dc2626" : data.completed ? gradeColor : "#cbd5e1"
  );
  
  // Custom Credit Display
  let isVariable = Array.isArray(course.credits);
  let currentCredit = isVariable 
      ? (data.selectedCredit || course.credits[0]) 
      : course.credits;

  let creditDisplay = `${currentCredit} Credit${isVariable ? " ▾" : ""}`;
  const creditReq = course.prereqs.find(p => p.match(/^\d+\s+Credits?$/i));
  
  if (creditReq) {
      const num = creditReq.match(/\d+/)[0];
      if (currentCredit > 0) {
          creditDisplay = `${currentCredit} Cr${isVariable ? " ▾" : ""} | Req: ${num}`;
      } else {
          creditDisplay = `Req: ${num}<br>Credits`;
      }
  }

  // Interactive Logic
  if (locked) {
      card.style.cursor = "pointer";
      card.onclick = () => highlightDependencies(course.id);
  } else {
    card.style.cursor = "default";
    card.onclick = null;
  }

  const selectStyle = `color: ${
    !data.grade || data.grade === "" ? "var(--c-text-muted)" : (data.grade === "FF" || data.completed ? gradeColor : "#9ca3af")
  }; font-weight: bold;`;
  
  const variableCreditStyle = isVariable ? "cursor: pointer; text-decoration: underline dotted;" : "";

  card.innerHTML = `
        <div class="locked-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M12 2C9.243 2 7 4.243 7 7V10H6C4.897 10 4 10.897 4 12V20C4 21.103 4.897 22 6 22H18C19.103 22 20 21.103 20 20V12C20 10.897 19.103 10 18 10H17V7C17 4.243 14.757 2 12 2ZM12 10C12 10 9 10 9 7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V10H12Z" />
          </svg>
        </div>
        <div class="card-header">
            <div style="display: flex; align-items: baseline; gap: 8px; width: 100%;">
                <span class="course-id">${course.id}</span>
                <div class="course-name" title="${course.name}" style="position: relative; top: -1px;">${course.name}</div>
            </div>
            <div class="prereq-hint">${prereqText}</div>
        </div>
        
        <div class="card-controls">
            <label class="checkbox-wrapper">
                <input type="checkbox" ${data.completed ? "checked" : ""} ${locked ? "disabled" : ""}>
                <div class="custom-checkbox">
                    <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </label>

            <div class="course-credits" 
                 ${isVariable ? `onclick="toggleCredit('${course.id}', event)"` : ""}
                 style="font-size: 0.75rem; font-weight: 600; line-height: 1.1; text-align: center; color: ${isVariable || creditReq ? 'var(--c-primary)' : 'var(--c-text-muted)'}; ${variableCreditStyle}">
                 ${creditDisplay}
            </div>

            <select class="grade-select" ${locked ? "disabled" : ""} style="${selectStyle}">
                <option value="" ${data.grade === "" || !data.grade ? "selected" : ""}>--</option>
                ${Object.keys(GRADES).map(g => `<option value="${g}" ${data.grade === g ? "selected" : ""}>${g}</option>`).join("")}
            </select>
        </div>
    `;

  const checkbox = card.querySelector('input[type="checkbox"]');
  const select = card.querySelector("select");

  checkbox.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
        const currentGrade = state[course.id] ? state[course.id].grade : "";
        
        if (!currentGrade || currentGrade === "") {
            e.target.checked = false;
            select.focus();
            select.classList.add("flash-attention");
            setTimeout(() => select.classList.remove("flash-attention"), 1000);
            
            try {
                if (select.showPicker) {
                    select.showPicker();
                }
            } catch (err) {}
            return;
        }

        updateState(course.id, true, currentGrade);
    } else {
        updateState(course.id, false, "");
    }
  });

  select.addEventListener("change", (e) => {
    const val = e.target.value;

    if (val === "") {
        updateState(course.id, false, "");
    } else {
        updateState(course.id, true, val);
    }
  });

  function resetHighlights() {
    const allArrows = document.querySelectorAll(".arrow-path");
    const allCards = document.querySelectorAll(".course-card");

    allArrows.forEach(arrow => {
      const originalColor = arrow.getAttribute("data-original-color");
      const baseOpacity = arrow.getAttribute("data-base-opacity"); // Stateless source of truth
      
      if (originalColor) arrow.setAttribute("stroke", originalColor);
      if (baseOpacity) arrow.style.opacity = baseOpacity;

      // DYNAMIC EXTENSION: Revert to Short Path
      if (arrow.hasAttribute("data-d-short")) {
        arrow.setAttribute("d", arrow.getAttribute("data-d-short"));
      }
    });
    
    allCards.forEach(card => {
      card.classList.remove("dependency-highlight");
      card.removeAttribute("data-was-locked");
      card.style.boxShadow = ""; 
    });
  }

  // Card Hover Effects (for Prereq Highlighting)
  card.addEventListener("mouseenter", () => {
    // Force cleanup first to prevent stuck states from rapid movement
    resetHighlights();

    const allArrows = document.querySelectorAll(".arrow-path");
    
    // ... rest of logic ...
    
    const hasConnections = Array.from(allArrows).some(arrow => 
      arrow.getAttribute("data-source") === course.id || 
      arrow.getAttribute("data-target") === course.id
    );
    
    if (!hasConnections) return;

    const allCards = document.querySelectorAll(".course-card");
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const lightGrayPalette = ['#404040', '#505050', '#606060', '#707070', '#808080', '#909090', '#a0a0a0'];
    const darkGrayPalette = ['#565f89', '#414868', '#787c99', '#a9b1d6', '#c0caf5', '#cfc9c2', '#9aa5ce']; 
    const grayPalette = isDark ? darkGrayPalette : lightGrayPalette;
    
    let grayIndex = 0;
    const connectedCourses = new Map();
    
    allArrows.forEach(arrow => {
      const source = arrow.getAttribute("data-source");
      const target = arrow.getAttribute("data-target");
      const isConnected = source === course.id || target === course.id;
      
      if (isConnected) {
        const arrowColor = arrow.getAttribute("data-original-color");
        if (source === course.id) connectedCourses.set(target, arrowColor);
        if (target === course.id) connectedCourses.set(source, arrowColor);
        
        arrow.style.opacity = "0.9"; 
        
        // DYNAMIC EXTENSION: Switch to Long Path
        if (arrow.hasAttribute("data-d-long")) {
        arrow.setAttribute("d", arrow.getAttribute("data-d-long"));
        }

      } else {
        arrow.setAttribute("stroke", grayPalette[grayIndex % grayPalette.length]);
        grayIndex++;
      }
    });

    allCards.forEach(otherCard => {
      const cardId = otherCard.id.replace("card-", "");
      if (connectedCourses.has(cardId)) {
        const highlightColor = connectedCourses.get(cardId);
        otherCard.setAttribute("data-was-locked", otherCard.classList.contains("locked"));
        otherCard.classList.add("dependency-highlight");
        otherCard.style.boxShadow = `0 0 0 2px ${highlightColor}`;
      }
    });
  });

  card.addEventListener("mouseleave", () => {
    resetHighlights();
  });

  return card;
}

function getGradeColor(grade) {
    if (!grade) return "#64748b"; 
    const colors = {
        "AA": "#1fad66", 
        "BA": "#5fbe6e", 
        "BB": "#9fd077", 
        "CB": "#dfe27f", 
        "CC": "#fbcf77", 
        "DC": "#f0975c", 
        "DD": "#e65f41", 
        "FF": "#dc2626"  
    };
    return colors[grade] || "#64748b";
}


/* =========================================================================
   6. VISUAL ENGINE (ARROW CACHING & DRAWING)
   ========================================================================= */

let drawRequestId = null;

function scheduleDrawArrows() {
    if (drawRequestId) return;
    drawRequestId = requestAnimationFrame(() => {
        drawArrows();
        drawRequestId = null;
    });
}

// Redraw arrows on window resize (orientation change)
window.addEventListener('resize', () => {
    scheduleDrawArrows();
});

function getRelativePos(el, root) {
    let x = 0;
    let y = 0;
    let current = el;
    while (current && current !== root && current !== document.body) {
      x += current.offsetLeft;
      y += current.offsetTop;
      current = current.offsetParent;
    }
    return { x, y };
}

function getCollisionRegions(minX, maxX, cardCache) {
    // Block the top area (Term Headers) to prevent arrows passing between Year Name and First Card
    const regions = [{ y1: 0, y2: 60 }];
    
    cardCache.forEach(card => {
        const x1 = card.x;
        const x2 = card.x + card.w;
        
        if (x2 > minX && x1 < maxX) {
            const y1 = card.y;
            const y2 = card.y + card.h;
            regions.push({ y1: y1 - ARROW_MARGIN, y2: y2 + ARROW_MARGIN }); 
        }
    });
    return regions.sort((a, b) => a.y1 - b.y1);
}

function findBestYGap(collisionRegions, targetY, minY, maxY) {
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

        if (gapSize > 5) { // Threshold reduced from 15 for tighter mobile spacing
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

function generateStableColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorPalette = [
    '#4965CD', '#E1497D', '#9C5B07', '#F9364E', '#20AA6C',
    '#F4315A', '#87D305', '#AD11D5', '#2843F5', '#74ED9F',
    '#1ABC9C', '#E67E22', '#9B59B6', '#4083c5ff', '#D35400', 
    '#C0392B', '#16A085', '#8E44AD', '#dd7b5dff', '#F39C12'
  ];
  
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

function drawArrows() {
  const svg = document.getElementById("arrows-container");
  if (!svg) return;
  svg.innerHTML = "";
  
  // CRITICAL FIX: Reset dimensions to 0 before measuring to prevent feedback loop
  // where the OLD SVG size forces the container to stay wide.
  svg.style.width = "0px";
  svg.style.height = "0px";
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");

  // Measure content *without* the interference of the old SVG
  const scrollWidth = grid.scrollWidth;
  const scrollHeight = grid.scrollHeight;
  
  // Now apply the correct dimensions
  svg.setAttribute("width", scrollWidth);
  svg.setAttribute("height", scrollHeight);
  svg.style.width = `${scrollWidth}px`;
  svg.style.height = `${scrollHeight}px`;

  // 1. CACHE PHASE
  const cardCache = new Map();
  curriculum.forEach(c => {
      const el = document.getElementById(`card-${c.id}`);
      if (el) {
          const pos = getRelativePos(el, grid);
          cardCache.set(c.id, {
              x: pos.x,
              y: pos.y,
              w: el.offsetWidth,
              h: el.offsetHeight,
              cy: pos.y + el.offsetHeight / 2, 
              cx: pos.x + el.offsetWidth 
          });
      }
  });

  const outgoing = new Map();
  const incoming = new Map();

  // 2. LOGIC PHASE
  curriculum.forEach((course) => {
    if (!cardCache.has(course.id)) return;

    course.prereqs.forEach((pString) => {
      if (pString.match(/^\d+\s+Credits?$/i)) return; // Skip Credit Requirements (No visual arrow)
      
      const prereqId = pString.replace("!", "");

      // OPTIMIZATION: If this is also a Co-requisite, skip the standard arrow
      // because the Co-req loop will draw a cleaner, direct vertical line.
      if (course.coreqs && course.coreqs.includes(prereqId)) return;

      if (!cardCache.has(prereqId)) {
          console.warn(`Prerequisite mismatch: ${prereqId} not found for ${course.id}`);
          return;
      }

      if (!outgoing.has(prereqId)) outgoing.set(prereqId, []);
      outgoing.get(prereqId).push(course.id);

      if (!incoming.has(course.id)) incoming.set(course.id, []);
      incoming.get(course.id).push(prereqId);
    });
  });

  const getCachedY = (id) => cardCache.get(id) ? cardCache.get(id).cy : 0;

  outgoing.forEach((targets, sourceId) => {
    targets.sort((a, b) => getCachedY(a) - getCachedY(b));
  });

  incoming.forEach((sources, targetId) => {
    sources.sort((a, b) => getCachedY(a) - getCachedY(b));
  });

  const laneSpacing = 10;
  const verticalLanes = {}; 
  const horizontalLanes = {}; 

  curriculum.forEach((course) => {
    if (!course.prereqs.length) return;
    if (!cardCache.has(course.id)) return;

    const targetMetrics = cardCache.get(course.id);
    const targetX = targetMetrics.x;
    const targetYBase = targetMetrics.cy;

    course.prereqs.forEach((pString) => {
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
      const outIndex = outList.indexOf(course.id);
      const inIndex = inList.indexOf(prereqId);
      
      const outOffset = (outIndex - (outList.length - 1) / 2) * laneSpacing;
      const inOffset = (inIndex - (inList.length - 1) / 2) * laneSpacing;
      
      const sourceY = sourceYBase + outOffset;
      const targetY = targetYBase + inOffset;
      
      let hopY = targetY; 
      
      // Responsive constraints for mobile tightness
      const collisionStartOffset = 10;
      const collisionEndOffset = 10;
      // Threshold must be < (CardWidth + Gap) to detect single-column skips. 
      // Gap is ~30-50px. Card is ~150px. Total ~200px. 
      // So 60px is a safe threshold to distinguish "Adjacent" vs "Skipping".
      const longArrowThreshold = 60; 

      if (gap > longArrowThreshold) {
          const blockStart = sourceX + collisionStartOffset;
          const blockEnd = targetX - collisionEndOffset;
          
          const collisions = getCollisionRegions(blockStart, blockEnd, cardCache);
          const gridHeight = scrollHeight;
          
          // Expand search range: start slightly above and go to bottom
          const searchMinY = Math.min(sourceY, targetY) - 40; 
          const searchMaxY = gridHeight; 
          
          const bestY = findBestYGap(collisions, targetY, searchMinY, searchMaxY);
          
          hopY = bestY;
          
          const gapKey = `G-${Math.round(hopY / 10) * 10}`; 
          if (!horizontalLanes[gapKey]) horizontalLanes[gapKey] = [];
          horizontalLanes[gapKey].push({ id: arrowId, y: targetY }); 
      }

      const gutterKey = Math.round(sourceX); 
      if (!verticalLanes[gutterKey]) verticalLanes[gutterKey] = [];
      
      verticalLanes[gutterKey].push({
          id: arrowId,
          sourceX, sourceY, targetX, targetY, hopY, gap,
          courseId: course.id, prereqId, isWeak
      });
    });
  });

  const gutterAssignments = {}; 
  Object.keys(verticalLanes).forEach(key => {
      const arrows = verticalLanes[key];
      arrows.sort((a, b) => ((a.sourceY + a.targetY) / 2) - ((b.sourceY + b.targetY) / 2));
      const count = arrows.length;
      
      // Responsive constraints for packing lines
      const isMobile = window.innerWidth <= 900;
      const availableWidth = isMobile ? 16 : 24; 
      const maxStep = isMobile ? 4 : 12; 
      
      const step = Math.min(maxStep, availableWidth / count); 
      arrows.forEach((arrow, index) => {
          gutterAssignments[arrow.id] = (index - (count - 1) / 2) * step;
      });
  });

  const gapAssignments = {};
  Object.keys(horizontalLanes).forEach(key => {
      const arrows = horizontalLanes[key];
      arrows.sort((a, b) => a.y - b.y);
      const count = arrows.length;
      const availableHeight = 20; 
      const step = Math.min(8, availableHeight / count); 
      arrows.forEach((arrow, index) => {
          gapAssignments[arrow.id] = (index - (count - 1) / 2) * step;
      });
  });

  // 3. DRAW PHASE
  Object.values(verticalLanes).flat().forEach(arrow => {
       const { sourceX, sourceY, targetX, targetY, hopY, gap, id, courseId, prereqId, isWeak } = arrow;
       
       const channelOffset = gutterAssignments[id] || 0;
       const gapOffset = gapAssignments[id] || 0;
       
       // Responsive Gutter Base & Thresholds
       const isMobile = window.innerWidth <= 900;
       const gutterBase = isMobile ? 18 : 32; // Increased from 10 to 18 for straight exit
       const longArrowThreshold = 60; 
       const r = isMobile ? 8 : 8; // Consistent radius

       let d = "";
       
       if (gap > longArrowThreshold) {
           const crossY = hopY + gapOffset;
           const gutterX1 = sourceX + gutterBase + channelOffset; 
           const gutterX2 = targetX - gutterBase - channelOffset; 
           
            d = `M ${sourceX} ${sourceY} ` +
             `L ${gutterX1 - r} ${sourceY} ` + 
             `Q ${gutterX1} ${sourceY} ${gutterX1} ${sourceY + r * (crossY > sourceY ? 1 : -1)} ` + 
             `L ${gutterX1} ${crossY - r * (crossY > sourceY ? 1 : -1)} ` + 
             `Q ${gutterX1} ${crossY} ${gutterX1 + r} ${crossY} ` + 
             `L ${gutterX2 - r} ${crossY} ` + 
             `Q ${gutterX2} ${crossY} ${gutterX2} ${crossY + r * (targetY > crossY ? 1 : -1)} ` + 
             `L ${gutterX2} ${targetY - r * (targetY > crossY ? 1 : -1)} ` + 
             `Q ${gutterX2} ${targetY} ${gutterX2 + r} ${targetY} ` + 
             `L ${targetX} ${targetY}`;
       } else {
           const actualGap = targetX - sourceX;
           const gutterXBase = sourceX + (actualGap / 2); 
           const gutterX = gutterXBase + channelOffset;
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
      
      // Check for Co-req overlap to sync colors
      const course = curriculum.find(c => c.id === courseId);
      const isCoreq = course && course.coreqs && course.coreqs.includes(prereqId);
      
      let strokeColor = generateStableColor(prereqId);
      
      if (isCoreq) {
          const id1 = courseId < prereqId ? courseId : prereqId;
          const id2 = courseId < prereqId ? prereqId : courseId;
          strokeColor = generateStableColor(id1 + id2);
      }

      let baseOpacity = "0.9";
      let strokeWidth = "3";
      
      if (isWeak) {
          path.setAttribute("stroke-dasharray", "0, 7"); // Slightly wider gap for cleanness
          path.setAttribute("stroke-linecap", "round");
          strokeWidth = "4"; // Reduced from 5
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

 // 4. DRAW CO-REQUISITES (Double Lines)
 // Only draw if source is vertically above target to avoid duplicates
 curriculum.forEach(course => {
     if (!course.coreqs || !course.coreqs.length) return;
     
     const sourceMetrics = cardCache.get(course.id);
     if (!sourceMetrics) return;

     course.coreqs.forEach(cString => {
         const isWeak = cString.endsWith("!");
         const coreqId = cString.replace("!", "");

         // Prevent duplicate drawing for mutual co-reqs
         if (course.id > coreqId) return;

         const targetMetrics = cardCache.get(coreqId);
         if (!targetMetrics) return;

         // FIX: Determine which card is visually higher to draw clean Top->Bottom lines
         // regardless of which ID is alphabetically "first"
         const isSourceHigher = sourceMetrics.y < targetMetrics.y;
         const topMetrics = isSourceHigher ? sourceMetrics : targetMetrics;
         const botMetrics = isSourceHigher ? targetMetrics : sourceMetrics;

         // Connection Points: Bottom of Top Card -> Top of Bottom Card
         const xSource = topMetrics.x + topMetrics.w / 2;
         const ySource = topMetrics.y + topMetrics.h;
         const xTarget = botMetrics.x + botMetrics.w / 2;
         const yTarget = botMetrics.y; 
         
         // Parallel wires
         const offsets = [-3, 3]; 

              const pairColor = generateStableColor(course.id + coreqId);
              const isPairLocked = isLocked(course.id, false) || isLocked(coreqId, false);

              offsets.forEach(off => {
                   
                   // Path: Direct Vertical Line
                   const d = `M ${xSource + off} ${ySource} ` +
                             `L ${xTarget + off} ${yTarget}`;

                 const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                 path.setAttribute("d", d); 
                 path.setAttribute("fill", "none"); 

                 path.setAttribute("stroke", pairColor);
                 let strokeWidth = window.innerWidth <= 900 ? "0.8" : "3";
                 
                 let baseOpacity = "0.9";
                 
                 if (isWeak) { // Weak Co-req Styling
                     path.setAttribute("stroke-dasharray", "0, 7"); 
                     path.setAttribute("stroke-linecap", "round");
                     strokeWidth = "4"; 
                     baseOpacity = isPairLocked ? "0.5" : "0.85";
                 } else if (isPairLocked) {
                     path.setAttribute("stroke-dasharray", "4,4");
                     baseOpacity = "0.5";
                 }

                 path.setAttribute("stroke-width", strokeWidth);
                 path.style.opacity = baseOpacity;
                 path.setAttribute("data-base-opacity", baseOpacity);
                 
                 // Interaction Attributes
                 path.setAttribute("class", "arrow-path coreq-line"); 
                 path.setAttribute("data-source", course.id);
                 path.setAttribute("data-target", coreqId);
                 path.setAttribute("data-original-color", pairColor);
                  
                  svg.appendChild(path);
               });
      });
  });
}


/* =========================================================================
   7. INITIALIZATION & EVENTS
   ========================================================================= */

function calculateOptimalZoom() {
  // Mobile/Tablet: Disable zoom to rely on native scrolling and avoid coordinate shifts
  if (window.innerWidth <= 900) {
      grid.style.zoom = "1";
      scheduleDrawArrows();
      return;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight - 80;
  
  grid.style.zoom = "1";
  
  setTimeout(() => {
    const gridWidth = grid.scrollWidth;
    const gridHeight = grid.scrollHeight;
    
    // Only zoom if content is larger than viewport
    if (gridWidth <= viewportWidth && gridHeight <= viewportHeight) {
        grid.style.zoom = "1";
        scheduleDrawArrows();
        return;
    }
    
    const zoomX = (viewportWidth * 0.98) / gridWidth;
    const zoomY = (viewportHeight * 0.95) / gridHeight;
    
    const optimalZoom = Math.min(zoomX, zoomY);
    // Don't shrink too much on desktop either
    const finalZoom = Math.max(0.6, optimalZoom);
    
    grid.style.zoom = finalZoom;
    
    setTimeout(() => {
        scheduleDrawArrows();
    }, 100);
  }, 20);
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    calculateOptimalZoom();
  }, 200);
});

// START
// START
// Initialize the system once all scripts are loaded
// Initialize the system once all scripts are loaded
window.addEventListener('load', () => {
    initSystem();
    setTimeout(() => {
        calculateOptimalZoom();
    }, 50);
});

// Setup Global Listeners
// Setup Global Listeners (Event Delegation)
document.addEventListener('click', (e) => {
    // Reset Button Logic
    const resetBtn = e.target.closest("#reset-btn");
    
    if (resetBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Reset button clicked (delegated)");
        
        try {
            // Clear all department states
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("gpaState_")) {
                    localStorage.removeItem(key);
                }
            });
            // Also legacy key just in case
            if (localStorage.getItem("courseState")) {
                    localStorage.removeItem("courseState");
            }
            
            // Reset internal state and re-render immediately
            state = {};
            render();
            calculateMetrics();
            
            // Force redraw arrows after DOM update
            setTimeout(() => {
                scheduleDrawArrows();
            }, 50);
            
            console.log("Data cleared successfully");
        } catch (err) {
            console.error("Reset failed:", err);
            alert("Hata: " + err.message);
        }
    }
});
