import { Course, CourseId, ComplexPrerequisite } from '../types';

export const GRADES: Record<string, number> = {
  AA: 4.0, 
  BA: 3.5, 
  BB: 3.0, 
  CB: 2.5, 
  CC: 2.0, 
  DC: 1.5, 
  DD: 1.0, 
  FF: 0.0,
};

export function getCourse(id: CourseId, curriculum: Course[]): Course | undefined {
    return curriculum.find((c) => c.id === id);
}

function checkPrerequisiteList(
    prereqs: (string | ComplexPrerequisite)[], 
    curriculum: Course[], 
    state: Record<string, any>, 
    ignoreCreditLimit: boolean, 
    currentTotalCredits: number
): boolean {
    return prereqs.some((p) => {
        // Complex Prereq (Object)
        if (typeof p === "object" && p.type === "count_pattern") {
             const { pattern, exclude, minCount } = p;
             const regex = new RegExp(pattern);
             
             const completedCount = curriculum.filter(targetCourse => {
                 if (!regex.test(targetCourse.id)) return false;
                 if (exclude && exclude.includes(targetCourse.id)) return false;
                 const s = state[targetCourse.id];
                 return s && s.completed && s.grade !== "FF";
             }).length;
             
             return completedCount < minCount;
        }
    
        if (typeof p !== "string") return false;
    
        // Credit Req
        const creditMatch = p.match(/^(\d+)\s+Credits?$/i);
        if (creditMatch) {
            if (ignoreCreditLimit) return false;
            const required = parseInt(creditMatch[1], 10);
            return currentTotalCredits < required;
        }
    
        // Standard String Prereq
        let pId = p;
        let allowFF = false;
        if (pId.endsWith("!")) {
            pId = pId.slice(0, -1);
            allowFF = true;
        }
    
        const pState = state[pId];
        if (!pState || pState.grade === "") return true;
        if (allowFF) return false;
        return !pState.completed || pState.grade === "FF";
      });
}

export function isLocked(
    courseId: CourseId, 
    curriculum: Course[],
    state: Record<string, any>,
    checkCoreqs: boolean = true,
    ignoreCreditLimit: boolean = false,
    currentTotalCredits: number = 0
): boolean {
  const course = getCourse(courseId, curriculum);
  if (!course) return false;

  const s = state[courseId];

  // 1. Check Main Course Prereqs
  if (checkPrerequisiteList(course.prereqs, curriculum, state, ignoreCreditLimit, currentTotalCredits)) {
      return true;
  }

  // 2. Check Option Prereqs (if selected)
  if (course.options && s && s.selectedOption !== undefined && course.options[s.selectedOption]) {
      const selectedOpt = course.options[s.selectedOption];
      if (selectedOpt.prereqs && checkPrerequisiteList(selectedOpt.prereqs, curriculum, state, ignoreCreditLimit, currentTotalCredits)) {
          return true;
      }
  }

  // 3. Check Co-reqs
  if (checkCoreqs && course.coreqs && course.coreqs.length > 0) {
      const coreqLocked = course.coreqs.some(cString => {
          const coreqId = cString.replace("!", "");
          return isLocked(coreqId, curriculum, state, false, ignoreCreditLimit, currentTotalCredits);
      });
      if (coreqLocked) return true;
  }

  return false;
}

export function calculateMetrics(curriculum: Course[], state: Record<string, any>) {
  let totalCredits = 0;
  let weightedSum = 0;
  let earnedCredits = 0;

  // Calculate Earned & Weighted
  Object.keys(state).forEach((id) => {
    const s = state[id];
    const course = getCourse(id, curriculum);
    
    if (course && s.completed && !isLocked(id, curriculum, state, true, true, 0)) {
      
      let finalCredits = course.credits;
      if (course.options && s.selectedOption !== undefined && course.options[s.selectedOption]) {
           const opt = course.options[s.selectedOption];
           if (opt.credits !== undefined) finalCredits = opt.credits;
      }
      
      const availableCredits = Array.isArray(finalCredits) 
          ? (s.selectedCredit ?? finalCredits[0]) 
          : finalCredits;

      if (s.grade !== "FF") {
        earnedCredits += availableCredits;
      }
      
      if (s.grade && s.grade !== "" && GRADES[s.grade] !== undefined) {
        // Only count towards GPA if credit > 0
        if (availableCredits > 0) {
            weightedSum += availableCredits * GRADES[s.grade];
            totalCredits += availableCredits;
        }
      }
    }
  });

  const gpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";
  return { earnedCredits, gpa };
}

// Simulation Logic
export function getSimulationCandidates(
    curriculum: Course[], 
    state: Record<string, any>, 
    courseCount: number,
    realState: Record<string, any>
) {
    // 1. Calculate Current Metrics (as baseline) -- Using realState (pre-simulation)
    let currentPoints = 0;
    let currentCredits = 0;
    
    Object.keys(realState).forEach(id => {
        const s = realState[id];
        const course = getCourse(id, curriculum);
        if (course && s.completed && !isLocked(id, curriculum, realState, true, true, 0)) {
             if (s.grade && s.grade !== "" && GRADES[s.grade] !== undefined) {
                 let finalCredits = course.credits;
                 if (course.options && s.selectedOption !== undefined && course.options[s.selectedOption]) {
                      const opt = course.options[s.selectedOption];
                      if (opt.credits !== undefined) finalCredits = opt.credits;
                 }
                 const cr = Array.isArray(finalCredits) ? (s.selectedCredit ?? finalCredits[0]) : finalCredits;
                 
                 currentPoints += cr * GRADES[s.grade];
                 currentCredits += cr;
             }
        }
    });

    // 2. Filter Candidates
    const candidates = curriculum.filter(c => {
        if (c.name && c.name.toLowerCase().includes("summer practice")) return false;
        if (isLocked(c.id, curriculum, state, true, false, currentCredits)) return false;  
        
        const s = state[c.id];
        if (!s || !s.completed) return true;
        if (s.completed && s.grade === "FF") return true; 
        return false;
    });

    // 3. Sort
    candidates.sort((a, b) => {
        const stateA = state[a.id];
        const stateB = state[b.id];
        const isFFA = stateA && stateA.completed && stateA.grade === "FF";
        const isFFB = stateB && stateB.completed && stateB.grade === "FF";
        if (isFFA && !isFFB) return -1;
        if (!isFFA && isFFB) return 1;
        return a.term - b.term;
    });

    // 4. Select N
    const selectedCourses: any[] = [];
    const selectedIds = new Set<string>();

    for (const course of candidates) {
        if (selectedCourses.length >= courseCount) break;
        if (selectedIds.has(course.id)) continue;
        
        const neededCoreqs: Course[] = [];
        if (course.coreqs) {
            course.coreqs.forEach(coreqId => {
                const cleanId = coreqId.replace('!', '');
                const isPassed = realState[cleanId] && realState[cleanId].completed && realState[cleanId].grade !== "FF";
                const isSelected = selectedIds.has(cleanId);
                if (!isPassed && !isSelected) {
                    const c = getCourse(cleanId, curriculum);
                    if (c) neededCoreqs.push(c);
                }
            });
        }
        
        if (1 + neededCoreqs.length <= courseCount - selectedCourses.length) {
            selectedCourses.push(course);
            selectedIds.add(course.id);
            neededCoreqs.forEach(cq => {
                selectedCourses.push(cq);
                selectedIds.add(cq.id);
            });
        }
    }
    
    return { selectedCourses, currentPoints, currentCredits };
}

export function calculateSimulationGrades(
    selectedCourses: any[], 
    currentPoints: number, 
    currentCredits: number, 
    targetGPA: number
) {
    let newCredits = 0;
    selectedCourses.forEach(c => {
        const cr = Array.isArray(c.credits) ? c.credits[0] : c.credits;
        c._simCredits = cr;
        newCredits += cr;
    });

    const totalCredits = currentCredits + newCredits;
    const requiredTotalPoints = targetGPA * totalCredits;
    const requiredNewPoints = requiredTotalPoints - currentPoints;
    const requiredAvg = newCredits > 0 ? requiredNewPoints / newCredits : 0;

    const gradeKeys = Object.keys(GRADES).sort((a,b) => GRADES[a] - GRADES[b]);
    const gradeScores = gradeKeys.map(k => GRADES[k]);

    // Initial Floor
    let initialGrade = "DD";
    let initialScore = 1.0;
    for (let i = 0; i < gradeKeys.length; i++) {
        if (gradeScores[i] <= requiredAvg) {
            initialGrade = gradeKeys[i];
            initialScore = gradeScores[i];
        } else { break; }
    }

    selectedCourses.forEach(c => {
        c._simGrade = initialGrade;
        c._simScore = initialScore;
    });

    // Optimization
    const getCurrentNewPoints = () => selectedCourses.reduce((acc, c) => acc + (c._simScore * c._simCredits), 0);
    
    let safety = 0;
    while (getCurrentNewPoints() < requiredNewPoints && safety < 100) {
        safety++;
        let bestCandidate = null;
        let minOvershoot = Infinity;
        
        for (const c of selectedCourses) {
            const currentIdx = gradeKeys.indexOf(c._simGrade);
            if (currentIdx >= gradeKeys.length - 1) continue;
            
            const nextScore = gradeScores[currentIdx + 1];
            const diff = (nextScore - c._simScore) * c._simCredits;
            const predicted = getCurrentNewPoints() + diff;
            const overshoot = predicted - requiredNewPoints;
            
            // Prefer moves that barely cross the threshold (minOvershoot)
            if (predicted >= requiredNewPoints) {
                 if (overshoot < minOvershoot) {
                     minOvershoot = overshoot;
                     bestCandidate = c;
                 }
            } else {
                 if (!bestCandidate) bestCandidate = c;
                 else if (c._simScore < bestCandidate._simScore) bestCandidate = c;
            }
        }
        
        if (bestCandidate) {
            const idx = gradeKeys.indexOf(bestCandidate._simGrade);
            bestCandidate._simGrade = gradeKeys[idx + 1];
            bestCandidate._simScore = gradeScores[idx + 1];
        } else {
            break; 
        }
    }
    
    return selectedCourses;
}
