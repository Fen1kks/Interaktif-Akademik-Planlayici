import { Department, CourseOption } from '../../types';
import { turkishPool1, turkishPool2, englishPool, programmingPool, commonTechnicalElectives } from '../common';
import { freeElectives } from '../free-electives';

const bmeRexxPool4: CourseOption[] = [
    { id: "BME372", name: "Mod. Drug Delivery", credits: 3 },
    { id: "BME413", name: "Biomed. & Dental Mat.", credits: 3 },
    { id: "BME414", name: "Ortho. Cements", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

const bmeRexxPool5: CourseOption[] = [
    { id: "BME372", name: "Mod. Drug Delivery", credits: 3 },
    { id: "BME412", name: "MR Spect. Imaging", credits: 3 },
    { id: "BME413", name: "Biomed. & Dental Mat.", credits: 3 },
    { id: "BME414", name: "Ortho. Cements", credits: 3 },
    { id: "BME442", name: "AI in Medicine", credits: 3 },
    { id: "BME444", name: "MRI", credits: 3 },
    { id: "BME462", name: "Medical Robotics", credits: 3 },
    { id: "BME482", name: "Laser-Tissue Inter.", credits: 3 },
    { id: "BME483", name: "Sci. of Light Therapy", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

const bmeTechnicalElectives: CourseOption[] = [
    // BME Specific Technicals
    { id: "BME473", name: "Prob. & Biostats", credits: 3 },
    // Dept Pools
    ...bmeRexxPool4,
    ...bmeRexxPool5,
    // Common Technical Electives (Deduplicated)
    ...commonTechnicalElectives.filter(c => !bmeRexxPool4.some(d => d.id === c.id) && !bmeRexxPool5.some(d => d.id === c.id))
].sort((a, b) => a.id.localeCompare(b.id));

export const BME: Department = {
    name: "Biomedical Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1, options: englishPool },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "CHEM101", name: "Chemistry", credits: 4, prereqs: [], term: 1 },
      { id: "BME102", name: "Intro. to BME", credits: 3, prereqs: [], term: 1 },
      { id: "ES161", name: "Engineering Drawing", credits: 2, prereqs: [], term: 1 },

      // FRESHMAN - TERM 2
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: ["REXX1"], term: 2, options: englishPool },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 2 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 2 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 2, options: programmingPool },

      // SOPHOMORE - TERM 3
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },
      { id: "CHBE203", name: "Organic Chemistry", credits: 3, prereqs: ["CHEM101"], term: 3 },
      { id: "BME211", name: "Bio. & Med. Physics", credits: 3, prereqs: [], term: 3 },
      { id: "BME213", name: "Biology in BME", credits: 3, prereqs: [], term: 3 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 3, options: turkishPool1 },

      // SOPHOMORE - TERM 4
      { id: "BME214", name: "Electrical Circuits in BME", credits: 3, prereqs: ["PHYS102"], term: 4 },
      { id: "BME222", name: "EM Fields & Waves in BME", credits: 3, prereqs: ["PHYS102", "MATH132"], term: 4 },
      { id: "BME252", name: "Biomechanics", credits: 3, prereqs: [], term: 4 },
      { id: "BME262", name: "Biomaterials", credits: 3, prereqs: ["CHBE203"], term: 4 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 4, options: freeElectives },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 4, options: turkishPool2 },

      // JUNIOR - TERM 5
      { id: "BME301", name: "Biomedical Electronics I", credits: 4, prereqs: ["BME214"], term: 5 },
      { id: "BME313", name: "Human Physiology", credits: 3, prereqs: [], term: 5 },
      { id: "BME351", name: "Modeling & Control of BME Sys.", credits: 3, prereqs: [], term: 5 },
      { id: "ES224", name: "Signals & Systems", credits: 3, prereqs: [], term: 5 },
      { id: "ES272", name: "Numerical Analysis", credits: 3, prereqs: ["MATH132"], term: 5 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 5 },

      // JUNIOR - TERM 6
      { id: "BME302", name: "Biomedical Electronics II", credits: 4, prereqs: ["BME301"], term: 6 },
      { id: "BME314", name: "Biomedical Instrumentation", credits: 4, prereqs: ["BME301"], term: 6 },
      { id: "BME324", name: "BME Sensors & Transducers", credits: 3, prereqs: ["BME301"], term: 6 },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 6, options: bmeRexxPool4 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 6 },

      // SENIOR - TERM 7
      { id: "BME400", name: "Summer Practice", credits: 0, prereqs: ["BME214"], term: 7 },
      { id: "BME421", name: "Medical Imaging", credits: 3, prereqs: [], term: 7 },
      { id: "BME441", name: "Microprocessors in BME", credits: 4, prereqs: ["BME302"], term: 7 },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: bmeRexxPool5 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 7, options: bmeTechnicalElectives },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 7, options: freeElectives },

      // SENIOR - TERM 8
      { id: "BME492", name: "Engineering Project", credits: 3, prereqs: [], term: 8 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8, options: freeElectives },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: bmeTechnicalElectives },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: bmeRexxPool5 },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8, options: bmeTechnicalElectives },

      // EXTRA COURSES - TERM 9
      { id: "EXTRA-1", name: "Extra Course 1", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-2", name: "Extra Course 2", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-3", name: "Extra Course 3", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-4", name: "Extra Course 4", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-5", name: "Extra Course 5", credits: [0, 2, 3, 4], prereqs: [], term: 9 },
      { id: "EXTRA-6", name: "Extra Course 6", credits: [0, 2, 3, 4], prereqs: [], term: 9 }
    ]
};
