import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// REXX5: Management / Economics
const cseRexxPool5: CourseOption[] = [
    { id: "ECON294", name: "Econ. for Eng.", credits: 3 },
    { id: "ES272", name: "Num. Analysis", credits: 3 },
    { id: "ES301", name: "Eng. Mgmt.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX3, 4, 6, 7, 8: Technical Electives (Interdisciplinary + CSE)
const cseTechnicalElectives: CourseOption[] = [
    // CSE Core Courses that might also be interdisciplinary
    { id: "CSE445", name: "Software Testing", credits: 3 },
    { id: "CSE464", name: "Intro. Data Sci.", credits: 3 },
    { id: "CSE480", name: "Special Topics", credits: 3 },
    { id: "CSE424", name: "Embedded CV", credits: 3 },
    { id: "CSE447", name: "Software Arch.", credits: 3 },
    { id: "CSE457", name: "Compiler Design", credits: 3 },
    { id: "CSE336", name: "OS Practice", credits: 3 },
    // Common Technical Electives (Includes other CSE electives like 315, 326, 421...)
    ...commonTechnicalElectives
].sort((a, b) => a.id.localeCompare(b.id));

export const CSE: Department = {
    name: "Computer Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "CSE101", name: "CSE Concepts & Algo.", credits: 4, prereqs: [], term: 1 },
      { id: "GBE113", name: "General Biology", credits: 4, prereqs: [], term: 1 },
      
      // FRESHMAN - TERM 2
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: ["REXX1"], term: 2, options: englishPool },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "CSE114", name: "Fund. of Comp. Prog.", credits: 5, prereqs: [], term: 2 },
      { id: "MATH154", name: "Discrete Math.", credits: 3, prereqs: [], term: 2 },
      
      // SOPHOMORE - TERM 3
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 3 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 3, options: turkishPool1 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 3 },
      { id: "EE211", name: "Circuit Theory", credits: 4, prereqs: [], term: 3 },
      { id: "CSE211", name: "Data Structures", credits: 4, prereqs: ["CSE114"], term: 3 },
      { id: "CSE221", name: "Princ. of Logic Design", credits: 4, prereqs: [], term: 3 },
      
      // SOPHOMORE - TERM 4
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 4 },
      { id: "MATH281", name: "Probability", credits: 3, prereqs: ["MATH132"], term: 4 },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 4, options: turkishPool1 },
      { id: "CSE212", name: "Software Dev. Method.", credits: 3, prereqs: ["CSE114"], term: 4 },
      { id: "CSE232", name: "System Programming", credits: 3, prereqs: ["CSE114"], term: 4 },
      { id: "CSE224", name: "Intro. to Digital Sys.", credits: 4, prereqs: ["CSE221"], term: 4 },
      
      // JUNIOR - TERM 5
      { id: "CSE311", name: "Algorithm Analysis", credits: 4, prereqs: ["CSE211"], term: 5 },
      { id: "ES224", name: "Signals and Systems", credits: 3, prereqs: [], term: 5 },
      { id: "CSE341", name: "File Organization", credits: 3, prereqs: ["CSE211"], term: 5 },
      { id: "CSE351", name: "Prog. Languages", credits: 3, prereqs: ["CSE114"], term: 5 },
      { id: "CSE323", name: "Computer Org.", credits: 3, prereqs: ["CSE232", "CSE221"], term: 5 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 5 },

      // JUNIOR - TERM 6
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 6, options: freeElectives },
      { id: "CSE344", name: "Software Engineering", credits: 3, prereqs: ["CSE211"], term: 6 },
      { id: "CSE348", name: "Database Management Sys.", credits: 3, prereqs: ["CSE211"], term: 6 },
      { id: "CSE331", name: "Operating Systems Design", credits: 4, prereqs: ["CSE211", "CSE232"], term: 6 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 6 },
      { id: "CSE354", name: "Automata Theory & Formal Lang.", credits: 3, prereqs: ["MATH154"], term: 6 },
    
      // SENIOR - TERM 7
      { id: "CSE471", name: "Data Comm. & Comp. Net.", credits: 4, prereqs: ["CSE311"], term: 7 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 7, options: freeElectives },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: cseTechnicalElectives },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: cseTechnicalElectives },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: cseRexxPool5 },
      { id: "CSE400", name: "Summer Practice", credits: 0, prereqs: [], term: 7 },

      // SENIOR - TERM 8
      { id: "CSE492", name: "Engineering Project", credits: 3, prereqs: [], term: 8 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: cseTechnicalElectives },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: cseTechnicalElectives },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: cseTechnicalElectives },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
