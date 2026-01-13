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
    // 0. Initialize Theme Manager
    if (window.ThemeManager) {
        window.ThemeManager.init();
    }

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
    // GUARD: Check if data exists
    if (!window.departments || !window.departments[code]) {
        console.warn(`Department '${code}' not found or data missing.`);
        
        // Attempt Fallback
        const available = window.departments ? Object.keys(window.departments) : [];
        if (available.length > 0) {
            console.log(`Falling back to '${available[0]}'`);
            if (code !== available[0]) {
                localStorage.setItem("lastDept", available[0]);
                loadDepartment(available[0]);
                return;
            }
        } else {
            console.error("CRITICAL: No department data available to load.");
            return;
        }
    }

    const deptData = window.departments[code];
    curriculum = deptData.curriculum; // Shallow copy reference
    
    // Update Title
    deptTitle.textContent = `Department of ${deptData.name}`;

    // Clean Data (Filter unknown prereqs - Scoped to this dept + Allow Credit Reqs)
    const allIds = new Set(curriculum.map((c) => c.id));
    curriculum.forEach((c) => {
      c.prereqs = c.prereqs.filter((p) => {
          if (typeof p === 'object' && p.type === 'count_pattern') return true;
          const cleanId = p.replace("!", "");
          return allIds.has(cleanId) || /^\d+\s+Credits?$/i.test(p);
      });
    });

    // Load State for this Department
    try {
        state = JSON.parse(localStorage.getItem(`gpaState_${code}`)) || {};
    } catch (e) {
        console.warn("Resetting corrupt state for", code);
        state = {};
    }

    // Re-render
    render();
    
    // Draw immediately (initial pass) to ensure visibility
    try { drawArrows(); } catch(e) { console.error("Draw error:", e); }

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
  const dependents = curriculum.filter((c) => c.prereqs.some(p => typeof p === 'string' && p.replace("!", "") === courseId));

  dependents.forEach((dep) => {
    if (state[dep.id] && state[dep.id].completed) {
      state[dep.id].completed = false;
      state[dep.id].grade = "";
      cascadeUncheck(dep.id);
    }
  });
}


/* =========================================================================
   3. THEME MANAGEMENT (Handled by theme.js)
   ========================================================================= */
// Logic migrated to ThemeManager


// 3. Bind Reset Buttons (Desktop & Mobile)
const resetBtns = document.querySelectorAll(".reset-btn");
resetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all grades and progress?")) {
            state = {};
            saveState();
            render();
            // Force reload to clear visual artifacts
            location.reload(); 
        }
    });
});


/* =========================================================================
   4. LOGIC ENGINE (LOCKING & METRICS)
   ========================================================================= */
function getCourse(id) {
    if (!curriculum) return undefined;
    return curriculum.find((c) => c.id === id);
}

function isLocked(courseId, checkCoreqs = true, ignoreCreditLimit = false) {
  const course = getCourse(courseId);
  if (!course) return false;

  // 1. Check Own Prereqs
  const ownLocked = course.prereqs.some((pString) => {
    // 0. GUARD: Check for Complex Object Prereqs FIRST (Prevent crash on .match)
    if (typeof pString === "object" && pString.type === "count_pattern") {
         const { pattern, exclude, minCount } = pString;
         const regex = new RegExp(pattern);
         
         const completedCount = curriculum.filter(targetCourse => {
             // Match Pattern (e.g. starts with ME3)
             if (!regex.test(targetCourse.id)) return false;
             // Check Excludes
             if (exclude && exclude.includes(targetCourse.id)) return false;
             // Check if Completed
             const s = state[targetCourse.id];
             return s && s.completed && s.grade !== "FF";
         }).length;
         
         return completedCount < minCount;
    }

    // GUARD: Ensure pString is actually a string before proceeding
    if (typeof pString !== "string") return false;

    // Check for Credit Requirement (e.g. "100 Credits")
    const creditMatch = pString.match(/^(\d+)\s+Credits?$/i);
    if (creditMatch) {
        if (ignoreCreditLimit) return false; // Ignore during calculation phase
        const required = parseInt(creditMatch[1], 10);
        return (window.currentTotalCredits || 0) < required;
    }

    // Check for "Weak" Prerequisite (ends with '!')
    // e.g. "MATH101!" -> FF is allowed (only attendance required)
    
    // B) Handle Standard String Prereqs

    // B) Handle Standard String Prereqs
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
  
  // Re-draw arrows after DOM update
  setTimeout(() => {
      scheduleDrawArrows();
  }, 50);
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

  // 1. Analyze Prerequisites Once
  const stringPrereqs = course.prereqs.filter(p => typeof p === "string");
  const complexPrereqs = course.prereqs.filter(p => typeof p === "object" && p.type === "count_pattern");
  
  const creditReqObj = stringPrereqs.find(p => p.match(/^\d+\s+Credits?$/i));
  const standardPrereqs = stringPrereqs.filter(p => !p.match(/^\d+\s+Credits?$/i));
  
  // 2. Prepare Display Components
  const isSummerPractice = course.name === "Summer Practice";
  let prereqHTML = "";
  let creditDisplayParts = [];

  // 3. Logic: Header (Prereq Text)
  if (!isSummerPractice) {
      if (standardPrereqs.length > 0) {
          prereqHTML = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; text-align: right;">
                <div class="prereq-hint">Prereqs: ${standardPrereqs.join(", ")}</div>
            </div>`;
      } else {
          prereqHTML = `<div class="prereq-hint">No Prerequisites</div>`;
      }
  } else {
      // Summer Practice: Header Empty
      prereqHTML = "";
  }

  const gradeColor = getGradeColor(data.grade);
  card.style.setProperty(
    "--grade-color",
    data.grade === "FF" ? "#dc2626" : data.completed ? gradeColor : "#cbd5e1"
  );

  // 4. Logic: Footer (Credits & Requirements)
  let isVariable = Array.isArray(course.credits);
  let currentCredit = isVariable 
      ? (data.selectedCredit || course.credits[0]) 
      : course.credits;

  // A) Credit Line
  let showCreditLine = false;
  let crText = "";
  
  if (currentCredit > 0) {
      showCreditLine = true;
      // "3 Credit" (Standard) vs "3 CR" (Summer Practice)
      crText = isSummerPractice 
          ? `${currentCredit} CR${isVariable ? " ▾" : ""}`
          : `${currentCredit} Credit${isVariable ? " ▾" : ""}`;
  }

  if (showCreditLine) {
       creditDisplayParts.push(`<span style="font-size: 0.75rem;">${crText}</span>`);
  }

  // B) Requirements (Stacked Logic)
  if (isSummerPractice) {
      // Summer Practice: Stack Everything Here
      
      // Req: ME363 - ONLY SHOW IF COMPLEX RULES ALSO EXIST (User Request)
      if (standardPrereqs.length > 0 && complexPrereqs.length > 0) {
          // Changed to bright blue (primary) as requested
          creditDisplayParts.push(`<span style="color: var(--c-primary); font-size: 0.7rem; font-weight: 600;">Req: ${standardPrereqs.join(", ")}</span>`);
      }
      
      // Credit Req (if exists)
      if (creditReqObj) {
           const num = creditReqObj.match(/\d+/)[0];
           creditDisplayParts.push(`<span style="font-size:0.75rem; opacity:1;">Req: ${num}<br>Credits</span>`);
      }

      // Complex Rules (ME3xx)
      complexPrereqs.forEach(p => {
             const { pattern, exclude, minCount, message } = p;
             const regex = new RegExp(pattern);
             const currentCount = curriculum.filter(c => 
                 regex.test(c.id) && 
                 (!exclude || !exclude.includes(c.id)) && 
                 state[c.id] && state[c.id].completed && state[c.id].grade !== "FF"
             ).length;
             creditDisplayParts.push(`<span style="color: var(--c-primary); font-size:0.65rem; font-weight:700;">${message} (${currentCount}/${minCount})</span>`);
      });

  } else {
    
      // Legacy Credit Req
      if (creditReqObj) {
          const num = creditReqObj.match(/\d+/)[0];
          if (currentCredit > 0) {
              creditDisplayParts.push(`<span style="font-size:0.65em; opacity:0.8;">Req: ${num} CR</span>`);
          } else {
              creditDisplayParts.push(`<span style="font-size:0.7rem;">Req: ${num} CR<br>Credits</span>`);
          }
      }

      // Complex (Fallback - if any standard course has complex rules, show them)
      complexPrereqs.forEach(p => {
             const { pattern, exclude, minCount, message } = p;
             const regex = new RegExp(pattern);
             const currentCount = curriculum.filter(c => 
                 regex.test(c.id) && 
                 (!exclude || !exclude.includes(c.id)) && 
                 state[c.id] && state[c.id].completed && state[c.id].grade !== "FF"
             ).length;
             const color = currentCount >= minCount ? "var(--c-success)" : "var(--c-text-muted)";
             creditDisplayParts.push(`<span style="color:${color}; font-size:0.65rem; font-weight:700;">${message} (${currentCount}/${minCount})</span>`);
      });
  }

  // Fallback for 0 credit courses with no other info
  if (creditDisplayParts.length === 0 && currentCredit === 0) {
       creditDisplayParts.push("0 Credit");
  }

  let creditDisplay = creditDisplayParts.join("<br>");

  // Interactive Logic
  if (locked) {
      card.style.cursor = "pointer";
  } else {
    card.style.cursor = "default";
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
            ${prereqHTML}
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
                 style="font-size: 0.75rem; font-weight: 600; line-height: 1.1; text-align: center; color: ${isVariable || creditReqObj ? 'var(--c-primary)' : 'var(--c-text-muted)'}; ${variableCreditStyle}">
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
    window.activeHighlightCardId = null; 
    const allArrows = document.querySelectorAll(".arrow-path");
    const allCards = document.querySelectorAll(".course-card");

    allArrows.forEach(arrow => {
      const originalColor = arrow.getAttribute("data-original-color");
      const baseOpacity = arrow.getAttribute("data-base-opacity"); 
      
      if (originalColor) arrow.setAttribute("stroke", originalColor);
      if (baseOpacity) arrow.style.opacity = baseOpacity;

      if (arrow.hasAttribute("data-d-short")) {
        arrow.setAttribute("d", arrow.getAttribute("data-d-short"));
      }
    });
    
    allCards.forEach(card => {
      card.classList.remove("dependency-highlight");
      card.classList.remove("highlight-source");
      card.removeAttribute("data-was-locked");
      card.style.boxShadow = ""; 
    });
  }

  // Helper Logic for Highlighting
  const updateHighlights = () => {
    resetHighlights(); 

    const allArrows = document.querySelectorAll(".arrow-path");
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

    // 4. COMPLEX PREREQUISITE HIGHLIGHTING (Regex-based)
    const complexPrereqs = (course.prereqs || []).filter(p => typeof p === "object" && p.type === "count_pattern");
    
    // Store forced colors for courses matching complex rules
    const forcedColors = new Map();

    complexPrereqs.forEach(p => {
        const { pattern, exclude } = p;
        const regex = new RegExp(pattern);

        curriculum.forEach(c => {
             // If matches pattern AND is not excluded AND is not the source itself
             if (regex.test(c.id) && (!exclude || !exclude.includes(c.id)) && c.id !== course.id) {
                 
                 const cState = state[c.id];
                 const isCompleted = cState && cState.completed && cState.grade !== "FF";
                 
                 // If taken: Blue (Primary). If not taken: Orange/Red (Warning)
                 const highlightColor = isCompleted ? "var(--c-primary)" : "#f59e0b"; // Amber-500 equivalent
                 
                 forcedColors.set(c.id, highlightColor);

                 // Pre-populate connectedCourses for those without arrows
                 if (!connectedCourses.has(c.id)) {
                      connectedCourses.set(c.id, highlightColor);
                 }
             }
        });
    });
    
    allArrows.forEach(arrow => {
      const source = arrow.getAttribute("data-source");
      const target = arrow.getAttribute("data-target");
      const isConnected = source === course.id || target === course.id;
      
      if (isConnected) {
        let arrowColor = arrow.getAttribute("data-original-color");
        
        // OVERRIDE: If this arrow connects to a "Forced Color" node (e.g. ME363), use that color
        const otherId = source === course.id ? target : source;
        if (forcedColors.has(otherId)) {
            arrowColor = forcedColors.get(otherId);
        }

        if (source === course.id) connectedCourses.set(target, arrowColor);
        if (target === course.id) connectedCourses.set(source, arrowColor);
        
        arrow.style.opacity = "1"; // Full opacity for highlighted path
        arrow.setAttribute("stroke", arrowColor); // Apply the color (Blue or Orange)

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
  };

  // DESKTOP: Hover Effects
  card.addEventListener("mouseenter", () => {
    if (window.innerWidth > 900) updateHighlights();
  });

  card.addEventListener("mouseleave", () => {
    if (window.innerWidth > 900) resetHighlights();
  });

  // MOBILE: Click Toggle
  card.addEventListener("click", (e) => {
    // Only engage if mobile/tablet
    if (window.innerWidth <= 900) {
        // Prevent interfering with controls
        if (['INPUT', 'SELECT', 'LABEL'].includes(e.target.tagName) || 
            e.target.closest('.checkbox-wrapper') || 
            e.target.closest('.grade-select') || 
            e.target.closest('.course-credits')) return;
        
        e.stopPropagation();

        if (card.classList.contains("highlight-source")) {
            resetHighlights();
        } else {
            updateHighlights();
            card.classList.add("highlight-source");
        }
    }
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

function generateStableColor(str) {
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
      // FIX: Skip object-based prerequisites (e.g. { type: 'count_pattern' })
      if (typeof pString !== 'string') return;

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
      // FIX: Skip object-based prerequisites here too
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

               // Check completion status for dash logic
               const c1State = state[course.id];
               const c2State = state[coreqId];
               const isC1Done = c1State && c1State.completed && c1State.grade !== "FF";
               const isC2Done = c2State && c2State.completed && c2State.grade !== "FF";
               const isPairCompleted = isC1Done && isC2Done;

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
                  } else {
                      // Standard Co-req Logic
                      if (isPairLocked) {
                          path.setAttribute("stroke-dasharray", "4,4");
                          baseOpacity = "0.5";
                      } else if (!isPairCompleted) {
                          // Unlocked but not taken -> Dashed
                          path.setAttribute("stroke-dasharray", "4,4");
                          baseOpacity = "0.9";
                      }
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
  const viewportWidth = window.innerWidth;
  // Dynamic header calculation
  const headerHeight = document.querySelector(".stats-bar").offsetHeight || 80;
  const viewportHeight = window.innerHeight - headerHeight;
  
  // Reset zoom to measure real dimensions
  grid.style.zoom = "1";
  
  setTimeout(() => {
    const gridWidth = grid.scrollWidth;
    const gridHeight = grid.scrollHeight;
    
    // MOBILE / TABLET LOGIC
    if (viewportWidth <= 900) {
        // User prefers standard layout. We will handle density via CSS.
        grid.style.zoom = "1";
        grid.style.transform = "";
        grid.style.width = "";
        
        scheduleDrawArrows();
        return;
    }

    // DESKTOP LOGIC (Existing)
    grid.style.width = ""; 
    grid.style.transform = "";
    
    if (gridWidth <= viewportWidth && gridHeight <= viewportHeight) {
        grid.style.zoom = "1";
        scheduleDrawArrows();
        return;
    }
    
    const zoomX = (viewportWidth * 0.98) / gridWidth;
    const zoomY = (viewportHeight * 0.95) / gridHeight;
    
    const optimalZoom = Math.min(zoomX, zoomY);
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
// Initialize the system once all scripts are loaded
window.addEventListener('load', () => {
    initSystem();
    setTimeout(() => {
        calculateOptimalZoom();
    }, 50);
});

// Setup Global Listeners
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


/* =========================================================================
   8. FOOTER & DONATION WIDGET
   ========================================================================= */

function injectFooter() {
    const footerHtml = `
    <div class="attribution">
        <div>Created by <span class="author-name">Hızır Ketenci</span></div>
        <a href="https://donate.bynogame.com/fen1kks" target="_blank" style="text-decoration: none; pointer-events: auto;">
            <div style="
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.75rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                ByNoGame ile Destekle
            </div>
        </a>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', footerHtml);
}

// Initial Call
injectFooter();
