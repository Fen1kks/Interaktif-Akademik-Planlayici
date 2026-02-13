import { Department, CourseOption } from '../../types';
import { turkishPool1, englishPool, programmingPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

// REXX3: GBE Intro
const gbeRexxPool3: CourseOption[] = [
    { id: "GBE102", name: "Biology II", credits: 3 },
    { id: "GBE104", name: "Intro. to GBE", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX5: Management / Economics
const gbeRexxPool5: CourseOption[] = [
    { id: "BBA412", name: "Entrepreneurship", credits: 3 },
    { id: "ECON294", name: "Econ. for Eng.", credits: 3 },
    { id: "BBA101", name: "Intro. to Business", credits: 3 },
    { id: "BBA204", name: "Entrep. Princ.", credits: 3 },
    { id: "BBA244", name: "Fin. Accounting", credits: 3 },
    { id: "BBA261", name: "Marketing Princ.", credits: 3 },
    { id: "BBA341", name: "Manag. ACCT", credits: 3 },
    { id: "ISE435", name: "Entrep. & Innov.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX6, 7: Departmental Electives (Core GBE)
const gbeDeptElectives: CourseOption[] = [
    { id: "GBE312", name: "Immunology", credits: 3 },
    { id: "GBE324", name: "Neurobiology", credits: 3 },
    { id: "GBE356", name: "Plant Genetics", credits: 3 },
    { id: "GBE357", name: "Human Genetics", credits: 3 },
    { id: "GBE373", name: "Plant Tissue Eng.", credits: 3 },
    { id: "GBE376", name: "Forensic Tech.", credits: 3 },
    { id: "GBE405", name: "Protein Chem.", credits: 3 },
    { id: "GBE414", name: "Cancer Biology", credits: 3 },
    { id: "GBE424", name: "Biotech. Quality", credits: 3 },
    { id: "GBE431", name: "Stem Cell", credits: 3 },
    { id: "GBE432", name: "Cell & Tissue Culture", credits: 3 },
    { id: "GBE433", name: "Biomaterials", credits: 3 },
    { id: "GBE434", name: "Entrep. in Biotech", credits: 3 },
    { id: "GBE435", name: "Gene Therapy", credits: 3 },
    { id: "GBE442", name: "Genomics", credits: 3 },
    { id: "GBE444", name: "Intro Bioinfo.", credits: 3 },
    { id: "GBE472", name: "Tissue Eng. Innov.", credits: 3 },
    { id: "GBE482", name: "Bioanalytical Tech.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX8: Management II (Similar to REXX5 but fewer options)
const gbeRexxPool8: CourseOption[] = [
    { id: "BBA102", name: "Fund. of Mgmt.", credits: 3 },
    { id: "BBA101", name: "Intro. to Business", credits: 3 },
    { id: "ES301", name: "Eng. Mgmt.", credits: 3 },
    { id: "ISE435", name: "Entrep. & Innov.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// REXX9: Technical Electives (Interdisciplinary + GBE Core)
const gbeTechnicalElectives: CourseOption[] = [
    // Include all Dept Electives
    ...gbeDeptElectives,
    // Explicit GBE Technicals
    { id: "BTEC536", name: "Stem Cell Bio.", credits: 3 },
    // Common Technical Electives (Deduplicated)
    ...commonTechnicalElectives.filter(c => !gbeDeptElectives.some(d => d.id === c.id))
].sort((a, b) => a.id.localeCompare(b.id));

export const GBE: Department = {
    name: "Genetics and Bioengineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "CHEM111", name: "General Chemistry I", credits: 3, prereqs: [], term: 1 },
      { id: "GBE111", name: "Biology", credits: 4, prereqs: [], term: 1 },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },

      // FRESHMAN - TERM 2
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: ["REXX1"], term: 2, options: englishPool },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "CHEM112", name: "General Chemistry II", credits: 3, prereqs: ["CHEM111"], term: 2, coreqs: ["CHEM113"] },
      { id: "CHEM113", name: "General Chemistry Lab.", credits: 2, prereqs: [], term: 2, coreqs: ["CHEM112"] },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 2, options: gbeRexxPool3 },

      // SOPHOMORE - TERM 3
      { id: "CHEM205", name: "Intro. Organic Chem.", credits: 3, prereqs: [], term: 3 },
      { id: "GBE203", name: "Microbiology", credits: 4, prereqs: [], term: 3 },
      { id: "GBE205", name: "Cell Biology", credits: 4, prereqs: [], term: 3 },
      { id: "GBE222", name: "Biometry", credits: 3, prereqs: ["MATH131"], term: 3 },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 3, options: programmingPool },

      // SOPHOMORE - TERM 4
      { id: "GBE212", name: "Genetics", credits: 3, prereqs: [], term: 4, coreqs: ["GBE216"] },
      { id: "GBE216", name: "Genetics Lab.", credits: 2, prereqs: [], term: 4, coreqs: ["GBE212"] },
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 4 },
      { id: "CHEM215", name: "Analytical Chemistry", credits: 4, prereqs: [], term: 4 },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 4, options: gbeRexxPool5 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 4 },

      // JUNIOR - TERM 5
      { id: "GBE301", name: "Biochemistry I", credits: 4, prereqs: ["CHEM205"], term: 5 },
      { id: "GBE341", name: "Gene Eng. Tech. I", credits: 3, prereqs: ["GBE212", "GBE216"], term: 5 },
      { id: "GBE361", name: "Biotransport Phenomena", credits: 3, prereqs: ["GBE222"], term: 5 },
      { id: "GBE321", name: "Biothermodynamics", credits: 3, prereqs: [], term: 5 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 5, options: freeElectives },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 5, options: turkishPool1 },

      // JUNIOR - TERM 6
      { id: "GBE302", name: "Biochemistry II", credits: 4, prereqs: ["GBE301"], term: 6 },
      { id: "GBE342", name: "Gene Eng. Tech. II", credits: 4, prereqs: ["GBE341"], term: 6 },
      { id: "GBE326", name: "Exp. GBE I", credits: 3, prereqs: [], term: 6 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 6, options: gbeDeptElectives },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 6, options: turkishPool1 },

      // SENIOR - TERM 7
      { id: "GBE400", name: "Summer Practice", credits: 0, prereqs: ["GBE301", "GBE341"], term: 7 },
      { id: "GBE403", name: "Molecular Biology I", credits: 3, prereqs: [], term: 7 },
      { id: "GBE492", name: "Engineering Project", credits: 3, prereqs: [], term: 8 },
      { id: "GBE415", name: "Exp. GBE II", credits: 3, prereqs: ["GBE326"], term: 7 },
      { id: "GBE451", name: "Bioprocess Eng.", credits: 3, prereqs: [], term: 7 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: gbeDeptElectives },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: gbeRexxPool8 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },

      // SENIOR - TERM 8
      { id: "GBE404", name: "Molecular Biology II", credits: 4, prereqs: [], term: 8 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: gbeTechnicalElectives },
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
