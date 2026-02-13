import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// REXX2: Drawing
const iseRexxPool2: CourseOption[] = [
    { id: "CE161", name: "CAD Tech.", credits: 2 },
    { id: "ES161", name: "Eng. Drawing", credits: 2 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX3: Management / Economics / Comm
const iseRexxPool3: CourseOption[] = [
    { id: "BBA412", name: "Entrepreneurship", credits: 3 },
    { id: "ECON461", name: "Econ. Strategy", credits: 3 },
    { id: "HRM221", name: "Comm. Tech. in Org.", credits: 3 },
    { id: "HRM332", name: "Business Ethics", credits: 3 },
    { id: "HRM342", name: "Tech. in Business", credits: 3 },
    { id: "SUST301", name: "Sust. Dev.", credits: 3 },
    { id: "AFN311", name: "Business Fin.", credits: 3 },
    { id: "AFN314", name: "Invest. Analysis", credits: 3 },
    { id: "BBA102", name: "Fund. of Mgmt.", credits: 3 },
    { id: "BBA245", name: "Fin. Accounting", credits: 3 },
    { id: "BBA363", name: "Brand Mgmt.", credits: 3 },
    { id: "BBA364", name: "Marketing Mgmt.", credits: 3 },
    { id: "BBA462", name: "Sales Mgmt.", credits: 3 },
    { id: "ECON122", name: "Fund. Macroecon.", credits: 3 },
    { id: "ECON222", name: "Macroeconomics", credits: 3 },
    { id: "ECON291", name: "Economics", credits: 3 },
    { id: "ECON352", name: "Econometrics", credits: 3 },
    { id: "ECON422", name: "Economy of TR", credits: 3 },
    { id: "HRM112", name: "HR Mgmt. in Org.", credits: 3 },
    { id: "HRM211", name: "Fund. Behav. Sci.", credits: 3 },
    { id: "HRM232", name: "Recruitment Tech.", credits: 3 },
    { id: "HRM322", name: "Occ. Health & Safety", credits: 3 },
    { id: "HRM434", name: "Bus. Info. Sys.", credits: 3 },
    { id: "AFN214", name: "Fund. of Finance", credits: 3 },
    { id: "BBA101", name: "Intro. to Business", credits: 3 },
    { id: "BBA204", name: "Entrep. Princ.", credits: 3 },
    { id: "BBA261", name: "Marketing Princ.", credits: 3 },
    { id: "BBA341", name: "Manag. ACCT", credits: 3 },
    { id: "ECON111", name: "Fund. Microecon.", credits: 3 },
    { id: "ECON211", name: "Microeconomics", credits: 3 },
    { id: "ECON351", name: "Fund. Econometrics", credits: 3 },
    { id: "ECON365", name: "Capital Markets", credits: 3 },
    { id: "HRM431", name: "Training in Bus.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX4, 6: ISE Core Electives
const iseRexxPool4: CourseOption[] = [
    { id: "ISE428", name: "Graph Theory", credits: 3 },
    { id: "ISE365", name: "Prod. Analysis", credits: 3 },
    { id: "ISE367", name: "Scheduling", credits: 3 },
    { id: "ISE368", name: "Ergonomics", credits: 3 },
    { id: "ISE417", name: "Comp. Intel.", credits: 3 },
    { id: "ISE424", name: "OR in Health", credits: 3 },
    { id: "ISE425", name: "Nonlinear Prog.", credits: 3 },
    { id: "ISE426", name: "Logistics Sys.", credits: 3 },
    { id: "ISE427", name: "Math. Modeling", credits: 3 },
    { id: "ISE429", name: "Pricing & Rev.", credits: 3 },
    { id: "ISE435", name: "Entrep. & Innov.", credits: 3 },
    { id: "ISE464", name: "CAD/CAM", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX5: Systems Engineering
const iseRexxPool5: CourseOption[] = [
    { id: "ISE304", name: "Sys. Eng. w/ DHL", credits: 3 },
    { id: "ISE302", name: "Sys. Eng. Meth.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX7: Advanced ISE Electives (Subset of Pool 4)
const iseRexxPool7: CourseOption[] = [
    { id: "ISE428", name: "Graph Theory", credits: 3 },
    { id: "ISE367", name: "Scheduling", credits: 3 },
    { id: "ISE424", name: "OR in Health", credits: 3 },
    { id: "ISE425", name: "Nonlinear Prog.", credits: 3 },
    { id: "ISE426", name: "Logistics Sys.", credits: 3 },
    { id: "ISE427", name: "Math. Modeling", credits: 3 },
    { id: "ISE429", name: "Pricing & Rev.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX8, 9: Technical Electives (Wide Range)
const iseTechnicalElectives: CourseOption[] = [
    ...iseRexxPool4,
    // Extra ISE Electives not in Pool 4
    { id: "ISE455", name: "Exp. Design", credits: 3 },
    { id: "ISE456", name: "Risk Analysis", credits: 3 },
    { id: "ISE457", name: "Forecasting", credits: 3 },
    // Common Technical Electives (Deduplicated)
    ...commonTechnicalElectives.filter(c => !iseRexxPool4.some(d => d.id === c.id))
].sort((a, b) => a.id.localeCompare(b.id));

export const ISE: Department = {
    name: "Industrial Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "CHEM101", name: "Chemistry", credits: 4, prereqs: [], term: 1 },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 1 },
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },
      { id: "REXX2", name: "Restricted Elective", credits: 2, prereqs: [], term: 1, options: iseRexxPool2 },

      // FRESHMAN - TERM 2
      { id: "ISE101", name: "Intro. to ISE", credits: 3, prereqs: [], term: 2 },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 2, options: freeElectives },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 2, options: freeElectives },

      // SOPHOMORE - TERM 3
      { id: "ES112", name: "Algorithms & Prog.", credits: 4, prereqs: [], term: 3 },
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 3 },
      { id: "MATH281", name: "Probability", credits: 3, prereqs: ["MATH132"], term: 3 },
      { id: "ECON294", name: "Engineering Economy", credits: 3, prereqs: [], term: 3 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 3, options: turkishPool1 },

      // SOPHOMORE - TERM 4
      { id: "ISE214", name: "Comp. Methods", credits: 4, prereqs: ["ES112"], term: 4 },
      { id: "ISE222", name: "Operations Research I", credits: 4, prereqs: ["MATH221"], term: 4 },
      { id: "ISE256", name: "Statistics for ISE", credits: 4, prereqs: ["MATH281"], term: 4 },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 4, options: turkishPool1 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 4, options: iseRexxPool3 },

      // JUNIOR - TERM 5
      { id: "ISE311", name: "Info. Technologies", credits: 4, prereqs: ["ECON294"], term: 5 },
      { id: "ISE323", name: "Operations Research II", credits: 4, prereqs: ["MATH281"], term: 5 },
      { id: "ISE331", name: "Finance for Engineers", credits: 3, prereqs: ["ES112"], term: 5 },
      { id: "ISE361", name: "Prod. Sys. Design", credits: 3, prereqs: [], term: 5 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 5 },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 5, options: iseRexxPool4 },

      // JUNIOR - TERM 6
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: ["ISE101"], term: 6, options: iseRexxPool5 },
      { id: "ISE316", name: "Comp. App. for ISE", credits: 3, prereqs: ["ISE214", "ISE222"], term: 6 },
      { id: "ISE344", name: "Simulation", credits: 3, prereqs: ["ISE323", "ISE256"], term: 6 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 6, options: iseRexxPool4 },
      { id: "ISE362", name: "Supply Chain Mgmt.", credits: 4, prereqs: ["ISE361"], term: 6 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 6 },

      // SENIOR - TERM 7
      { id: "ISE401", name: "System Dynamics", credits: 4, prereqs: ["REXX5", "MATH241"], term: 7 },
      { id: "ISE412", name: "Data Science", credits: 3, prereqs: ["ISE2140", "ISE256"], term: 7 }, // Fixed ISE2140 to ISE214? Assuming string as per original JS
      { id: "ISE451", name: "Stat. Quality Control", credits: 3, prereqs: ["ISE256"], term: 7 },
      { id: "ISE400", name: "Summer Practice", credits: 0, prereqs: ["100 Credits"], term: 7 },
      { id: "ISE491", name: "Intro. to Eng. Project", credits: 0, prereqs: ["ISE361", "ISE214", "ISE222"], term: 7 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: iseRexxPool7 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 7, options: freeElectives },

      // SENIOR - TERM 8
      { id: "ISE402", name: "System Design", credits: 3, prereqs: ["REXX5"], term: 8 },
      { id: "ISE432", name: "Decision Analysis", credits: 3, prereqs: ["ISE323", "ISE256"], term: 8 },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: iseTechnicalElectives },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: iseTechnicalElectives },
      { id: "ISE492", name: "Graduation Project", credits: 3, prereqs: ["ISE491"], term: 8 },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
