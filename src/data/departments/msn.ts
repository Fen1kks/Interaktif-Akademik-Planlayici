import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool } from '../common';
import { freeElectives } from '../free-electives';

// REXX3: Management / Economics
const msnRexxPool3: CourseOption[] = [
    { id: "ECON294", name: "Econ. for Eng.", credits: 3 },
    { id: "BBA101", name: "Intro. to Business", credits: 3 },
    { id: "BBA261", name: "Marketing Princ.", credits: 3 },
    { id: "ES301", name: "Eng. Mgmt.", credits: 3 },
    { id: "ISE435", name: "Entrep. & Innov.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX4: Nano & Textiles
const msnRexxPool4: CourseOption[] = [
    { id: "MSN430", name: "Fiber Sci. & Nano Textiles", credits: 3 },
    { id: "MSN455", name: "Smart Nanomat.", credits: 3 },
    { id: "MSN405", name: "Nanomat. & Nanotech.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX5: Metals & Manufacturing
const msnRexxPool5: CourseOption[] = [
    { id: "MSN407", name: "Metallic Mat. & Alloys", credits: 3 },
    { id: "MSN471", name: "Casting Tech.", credits: 3 },
    { id: "MSN409", name: "Manuf. Tech. of Metals", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX6: Bio / Glass / Energy
const msnRexxPool6: CourseOption[] = [
    { id: "MSN420", name: "Fund. of Biomat.", credits: 3 },
    { id: "MSN453", name: "Glass Sci. & Tech.", credits: 3 },
    { id: "MSN487", name: "Energy Mat.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX7: Surface / Thin Films
const msnRexxPool7: CourseOption[] = [
    { id: "MSN486", name: "Funct. Thin Films", credits: 3 },
    { id: "MSN484", name: "Surface Sci. & Eng.", credits: 3 },
    { id: "MSN477", name: "Corrosion & Protection", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX8, 9: Technical Electives
const msnTechnicalElectives: CourseOption[] = [
    { id: "MSN407", name: "Metallic Mat. & Alloys", credits: 3 },
    { id: "MSN420", name: "Fund. of Biomat.", credits: 3 },
    { id: "MSN430", name: "Fiber Sci. & Nano Textiles", credits: 3 },
    { id: "MSN453", name: "Glass Sci. & Tech.", credits: 3 },
    { id: "MSN455", name: "Smart Nanomat.", credits: 3 },
    { id: "MSN462", name: "Mod. & Sim. in Mat.", credits: 3 },
    { id: "MSN471", name: "Casting Tech.", credits: 3 },
    { id: "MSN486", name: "Funct. Thin Films", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

export const MSN: Department = {
    name: "Material Science and Nanotechnology Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "MSN101", name: "Intro. to MSN", credits: 3, prereqs: [], term: 1 },
      { id: "ES161", name: "Engineering Drawing", credits: 2, prereqs: [], term: 1 },
      { id: "CHEM111", name: "General Chemistry I", credits: 3, prereqs: [], term: 1 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 1 },

      // FRESHMAN - TERM 2
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "MSN112", name: "Statics & Strength of Mat.", credits: 3, prereqs: ["PHYS101"], term: 2 },
      { id: "MSN102", name: "Fund. of Material Sci.", credits: 3, prereqs: [], term: 2 },
      { id: "CHEM112", name: "General Chemistry II", credits: 3, prereqs: ["CHEM111"], term: 2 },
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 2, options: englishPool },

      // SOPHOMORE - TERM 3
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },
      { id: "MSN205", name: "Material Physics", credits: 3, prereqs: ["PHYS102"], term: 3 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 3 },
      { id: "MSN213", name: "Material Thermo.", credits: 3, prereqs: [], term: 3 },
      { id: "MSN223", name: "Mech. Behavior of Mat.", credits: 2, prereqs: [], term: 3 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 3, options: turkishPool1 },
      { id: "REXX2", name: "Restricted Elective", credits: [3, 4], prereqs: [], term: 3, options: englishPool }, // credits: [3, 4] is handled as array in types? Yes, Course['credits'] is number | number[]

      // SOPHOMORE - TERM 4
      { id: "MSN230", name: "Transport Phenomena", credits: 3, prereqs: ["MATH241"], term: 4 },
      { id: "MSN220", name: "Mat. Characterization I", credits: 3, prereqs: [], term: 4 },
      { id: "MSN240", name: "Phase Diagrams", credits: 3, prereqs: ["MSN213"], term: 4 },
      { id: "MSN218", name: "Fund. of Nanoscience", credits: 3, prereqs: ["CHEM112"], term: 4 },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 4, options: turkishPool1 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 4, options: freeElectives },

      // JUNIOR - TERM 5
      { id: "MSN301", name: "Primary Metal Prod.", credits: 3, prereqs: [], term: 5 },
      { id: "MSN305", name: "Polymer Science & Tech.", credits: 3, prereqs: [], term: 5 },
      { id: "MSN307", name: "Exp. Methods in Nano.", credits: 2, prereqs: [], term: 5 },
      { id: "MSN321", name: "Mat. Characterization II", credits: 3, prereqs: [], term: 5 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 5, options: msnRexxPool3 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 5, options: freeElectives },

      // JUNIOR - TERM 6
      { id: "MSN306", name: "Composite Materials", credits: 3, prereqs: [], term: 6 },
      { id: "MSN304", name: "Comp. Material Science", credits: 3, prereqs: ["MATH221"], term: 6 },
      { id: "MSN316", name: "Material Lab.", credits: 3, prereqs: [], term: 6 },
      { id: "MSN340", name: "Ceramic Science & Tech.", credits: 3, prereqs: [], term: 6 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 6, options: freeElectives },

      // SENIOR - TERM 7
      { id: "MSN400", name: "Summer Practice", credits: 0, prereqs: [], term: 7 },
      { id: "MSN403", name: "Design & Mat. Selection", credits: 3, prereqs: [], term: 7 },
      { id: "MSN491", name: "Intro. to Eng. Project", credits: 3, prereqs: ["92 Credits"], term: 7 },
      { id: "MSN405", name: "Nano. Devices & Tech.", credits: 3, prereqs: [], term: 7 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: msnRexxPool4 },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: msnRexxPool5 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: msnRexxPool6 },

      // SENIOR - TERM 8
      { id: "MSN484", name: "Surface Sci. and Eng.", credits: 3, prereqs: [], term: 8 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 8 },
      { id: "MSN492", name: "Engineering Project", credits: 3, prereqs: ["MSN491"], term: 8 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: msnRexxPool7 },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: msnTechnicalElectives },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: msnTechnicalElectives },
      { id: "FEXX4", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
