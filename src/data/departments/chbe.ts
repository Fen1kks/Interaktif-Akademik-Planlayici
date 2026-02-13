import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// REXX2: Intro to Computing
const chbeRexxPool2: CourseOption[] = [
    { id: "ES118", name: "Sci. Comp. w/ Python", credits: 3 },
    { id: "ACM114", name: "Intro. Comp. Sci.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX4: Economics
const chbeRexxPool4: CourseOption[] = [
    { id: "ECON294", name: "Econ. for Eng.", credits: 3 },
    { id: "ECON122", name: "Fund. Macroecon.", credits: 3 },
    { id: "ECON111", name: "Fund. Microecon.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX5: Management
const chbeRexxPool5: CourseOption[] = [
    { id: "BBA102", name: "Intro. to Mgmt.", credits: 3 },
    { id: "BBA244", name: "Fin. Accounting", credits: 3 },
    { id: "ES301", name: "Eng. Mgmt.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX6, 7: Departmental Electives (CHBE Core)
const chbeDeptElectives: CourseOption[] = [
    { id: "CHBE351", name: "Inorganic Tech.", credits: 3 },
    { id: "CHBE477", name: "Fuel Cells & Corr.", credits: 3 },
    { id: "CHBE352", name: "Organic Tech.", credits: 3 },
    { id: "CHBE357", name: "Process Safety", credits: 3 },
    { id: "CHBE368", name: "Fluid Thermophys.", credits: 3 },
    { id: "CHBE373", name: "Intro. Biochem. Eng.", credits: 3 },
    { id: "CHBE378", name: "Sust. Chem. Eng.", credits: 3 },
    { id: "CHBE381", name: "Polymer Chem.", credits: 3 },
    { id: "CHBE415", name: "Instrumental Anal.", credits: 3 },
    { id: "CHBE431", name: "World Energy Res.", credits: 3 },
    { id: "CHBE443", name: "Chem. & Bio. Proc.", credits: 3 },
    { id: "CHBE452", name: "Pollution Ctrl.", credits: 3 },
    { id: "CHBE456", name: "Hetero. Catalysis", credits: 3 },
    { id: "CHBE457", name: "Phase Equilibrium", credits: 3 },
    { id: "CHBE458", name: "Process Opt.", credits: 3 },
    { id: "CHBE466", name: "Ceramic Eng.", credits: 3 },
    { id: "CHBE467", name: "Composite Mat.", credits: 3 },
    { id: "CHBE468", name: "Surface Chem.", credits: 3 },
    { id: "CHBE475", name: "Bio-Reactors", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX8, 9: Technical Electives (Interdisciplinary + CHBE Core)
const chbeTechnicalElectives: CourseOption[] = [
    // Include all Departmental Electives
    ...chbeDeptElectives,
    // Common Technical Electives (Deduplicated)
    ...commonTechnicalElectives.filter(c => !chbeDeptElectives.some(d => d.id === c.id))
].sort((a, b) => a.id.localeCompare(b.id));

export const CHBE: Department = {
    name: "Chemical and Bioprocess Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "CHEM111", name: "General Chemistry I", credits: 3, prereqs: [], term: 1 },
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: chbeRexxPool2 },

      // FRESHMAN - TERM 2
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "CHEM113", name: "General Chemistry Lab.", credits: 2, prereqs: [], term: 2, coreqs: ["CHEM112!"] },
      { id: "CHEM112", name: "General Chemistry II", credits: 3, prereqs: ["CHEM111"], term: 2, coreqs: ["CHEM113!"] },
      { id: "CHBE102", name: "Intro. to CHBE", credits: 2, prereqs: [], term: 2 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 2, options: englishPool },
      
      // SOPHOMORE - TERM 3
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },
      { id: "CHBE203", name: "Organic Chemistry", credits: 3, prereqs: ["CHEM111"], term: 3 },
      { id: "CHBE211", name: "Physical Chemistry I", credits: 3, prereqs: ["CHEM112"], term: 3 },
      { id: "CHBE215", name: "Mass & Energy Balances", credits: 3, prereqs: ["CHBE102"], term: 3 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 3 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 3 },

      // SOPHOMORE - TERM 4
      { id: "CHBE232", name: "Fluid Mechanics", credits: 3, prereqs: ["MATH241"], term: 4 },
      { id: "CHBE204", name: "Bioorganic Chemistry", credits: 3, prereqs: ["CHBE203"], term: 4 },
      { id: "CHBE213", name: "Physical Chem. Lab.", credits: 2, prereqs: ["CHEM113", "CHBE211!"], term: 4 },
      { id: "CHBE214", name: "CHBE Thermodynamics", credits: 3, prereqs: ["CHBE211"], term: 4 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 4, options: freeElectives },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 4, options: chbeRexxPool4 },

      // JUNIOR - TERM 5
      { id: "CHBE301", name: "Exp. CHBE I", credits: 2, prereqs: ["CHBE232"], term: 5 },
      { id: "CHBE331", name: "Heat Transfer", credits: 3, prereqs: ["CHBE232"], term: 5 },
      { id: "CHBE311", name: "Comp. App. in CHBE", credits: 3, prereqs: [], term: 5 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 5, options: freeElectives },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 5, options: chbeRexxPool5 },
      { id: "CHBE361", name: "Mat. in CHBE App.", credits: 3, prereqs: [], term: 5 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 5, options: turkishPool1 },

      // JUNIOR - TERM 6
      { id: "CHBE302", name: "Exp. CHBE II", credits: 2, prereqs: ["CHBE301"], term: 6 },
      { id: "CHBE386", name: "Math. Modeling in CHBE", credits: 3, prereqs: ["CHBE331!", "CHBE311"], term: 6, coreqs: ["CHBE362!"] },
      { id: "CHBE362", name: "Reactor Design", credits: 3, prereqs: ["CHBE213"], term: 6, coreqs: ["CHBE386!"] },
      { id: "CHBE333", name: "Mass Transfer", credits: 3, prereqs: ["CHBE214!", "CHBE215"], term: 6 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 6, options: chbeDeptElectives },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 6, options: turkishPool1 },

      // SENIOR - TERM 7
      { id: "CHBE400", name: "Summer Practice", credits: 0, prereqs: ["CHBE102"], term: 7 },
      { id: "CHBE401", name: "Exp. CHBE III", credits: 2, prereqs: ["CHBE302!", "CHBE333", "CHBE362!"], term: 7 },
      { id: "CHBE441", name: "Process Dyn. & Control", credits: 3, prereqs: ["CHBE386"], term: 7 },
      { id: "CHBE463", name: "Process Design I", credits: 4, prereqs: [], term: 7 },
      { id: "CHBE433", name: "Separation Processes", credits: 3, prereqs: ["CHBE333!"], term: 7 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: chbeDeptElectives },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },

      // SENIOR - TERM 8
      { id: "CHBE492", name: "Engineering Project", credits: 3, prereqs: [], term: 8 },
      { id: "CHBE464", name: "Process Design II", credits: 4, prereqs: ["CHBE463"], term: 8 },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: chbeTechnicalElectives },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: chbeTechnicalElectives },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 8 },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
