import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// REXX3, 4, 5, 7, 8: Department Electives (Core EE)
const eeDeptElectives: CourseOption[] = [
    { id: "EE428", name: "Numerical EM", credits: 3 },
    { id: "EE463", name: "ML Fund.", credits: 3 },
    { id: "EE434", name: "Analog IC Design", credits: 3 },
    { id: "EE455", name: "Radar Systems", credits: 3 },
    { id: "EE458", name: "Wireless Comm.", credits: 3 },
    { id: "EE459", name: "Satellite Comm.", credits: 3 },
    { id: "EE469", name: "Image Proc.", credits: 3 },
    { id: "EE470", name: "DL for Comp. Vision", credits: 3 },
    { id: "EE475", name: "High Voltage Tech.", credits: 3 },
    { id: "EE481", name: "Solar & Wind Sys.", credits: 3 },
    { id: "EE489", name: "Digital Ctrl Sys.", credits: 3 },
    { id: "EE421", name: "Antennas & Prop.", credits: 3 },
    { id: "EE429", name: "Biomed. EM", credits: 3 },
    { id: "EE432", name: "Ind. Electronics", credits: 3 },
    { id: "EE433", name: "IC Phys. Design", credits: 3 },
    { id: "EE439", name: "High Freq. Elec.", credits: 3 },
    { id: "EE468", name: "DSP", credits: 3 },
    { id: "EE473", name: "Power Electronics", credits: 3 },
    { id: "EE477", name: "Elec. Dist. Sys.", credits: 3 },
    { id: "EE479", name: "Elec. Machinery", credits: 3 },
    { id: "EE487", name: "Robotics", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX6, 9: Technical Electives (Interdisciplinary + EE Core)
const eeTechnicalElectives: CourseOption[] = [
    // Include all Dept Electives
    ...eeDeptElectives,
    // Common Technical Electives (Deduplicated)
    ...commonTechnicalElectives.filter(c => !eeDeptElectives.some(d => d.id === c.id))
].sort((a, b) => a.id.localeCompare(b.id));

export const EE: Department = {
    name: "Electrical-Electronics Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 1, options: turkishPool1 },
      { id: "CHEM101", name: "Chemistry", credits: 4, prereqs: [], term: 1 },
      { id: "EE102", name: "Intro. to EE", credits: 2, prereqs: [], term: 1 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },

      // FRESHMAN - TERM 2
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 2, options: turkishPool1 },
      { id: "ES112", name: "Algorithms & Prog.", credits: 4, prereqs: [], term: 2 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: [], term: 2, options: englishPool },
      
      // SOPHOMORE - TERM 3
      { id: "ES272", name: "Numerical Analysis", credits: 3, prereqs: ["ES112", "MATH132"], term: 3 },
      { id: "EE211", name: "Circuit Theory I", credits: 4, prereqs: [], term: 3 },
      { id: "EE241", name: "Digital Circuits", credits: 4, prereqs: [], term: 3 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 3, options: freeElectives },
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },
      
      // SOPHOMORE - TERM 4
      { id: "EE242", name: "Microprocessor Sys.", credits: 4, prereqs: ["ES112"], term: 4 },
      { id: "EE212", name: "Circuits & Systems", credits: 3, prereqs: ["EE211"], term: 4 },
      { id: "EE232", name: "Intro. to Electronics", credits: 4, prereqs: ["EE211"], term: 4 },
      { id: "EE226", name: "Fund. of EM Fields", credits: 3, prereqs: [], term: 4 },
      { id: "MATH281", name: "Probability", credits: 3, prereqs: ["MATH132"], term: 4 },
      
      // SOPHOMORE - TERM 5
      { id: "EE361", name: "Intro. to DSP", credits: 4, prereqs: [], term: 5 },
      { id: "EE371", name: "Electromech. Energy", credits: 3, prereqs: ["EE212"], term: 5 },
      { id: "EE333", name: "Analog Electronics", credits: 4, prereqs: ["EE232"], term: 5 },
      { id: "EE323", name: "EM Waves", credits: 4, prereqs: ["EE226"], term: 5 },
      
      // SOPHOMORE - TERM 6
      { id: "EE384", name: "Intro. to Control Sys.", credits: 4, prereqs: ["EE284!"], term: 6 }, // Note: original code had EE284 but that wasn't in list? Maybe typo in original or hidden. Assuming string.
      { id: "EE354", name: "Communication Sys.", credits: 4, prereqs: ["EE361"], term: 6 },
      { id: "EE372", name: "Fund. of Power Sys.", credits: 3, prereqs: ["EE371"], term: 6 },
      { id: "EE334", name: "Digital Electronics", credits: 4, prereqs: ["EE241"], term: 6 },
      
      // JUNIOR - TERM 7
      { id: "EE491", name: "Intro. to Eng. Project", credits: 3, prereqs: [], term: 7 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: eeDeptElectives },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: eeDeptElectives },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: eeDeptElectives },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: eeTechnicalElectives },
      { id: "EE400", name: "Summer Practice", credits: 0, prereqs: [], term: 7 },
      
      // JUNIOR - TERM 8
      { id: "EE492", name: "Engineering Project", credits: 3, prereqs: ["EE491"], term: 8 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 8 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: eeDeptElectives },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: eeDeptElectives },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: eeTechnicalElectives },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
