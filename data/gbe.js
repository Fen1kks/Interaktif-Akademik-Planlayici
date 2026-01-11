window.registerDepartment("GBE", {
    name: "Genetics and Bioengineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "CHEM111", name: "General Chemistry I", credits: 3, prereqs: [], term: 1 },
      { id: "GBE111", name: "Biology", credits: 4, prereqs: [], term: 1 },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },

      // FRESHMAN - TERM 2
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: ["REXX1"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "CHEM112", name: "General Chemistry II", credits: 3, prereqs: ["CHEM111"], term: 2, coreqs: ["CHEM113"] },
      { id: "CHEM113", name: "General Chemistry Lab.", credits: 2, prereqs: [], term: 2, coreqs: ["CHEM112"] },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 2 },

      // SOPHOMORE - TERM 3
      { id: "CHEM205", name: "Intro. Organic Chem.", credits: 3, prereqs: ["CHEM112"], term: 3 },
      { id: "GBE203", name: "Microbiology", credits: 4, prereqs: ["GBE111"], term: 3 },
      { id: "GBE205", name: "Cell Biology", credits: 4, prereqs: ["GBE111"], term: 3 },
      { id: "GBE222", name: "Biometry", credits: 3, prereqs: ["MATH131"], term: 3 },
      { id: "REXX4", name: "Restricted Elective", credits: [3, 4], prereqs: [], term: 3 },

      // SOPHOMORE - TERM 4
      { id: "GBE212", name: "Genetics", credits: 3, prereqs: ["GBE205"], term: 4, coreqs: ["GBE216"] },
      { id: "GBE216", name: "Genetics Lab.", credits: 2, prereqs: ["GBE205"], term: 4, coreqs: ["GBE212"] },
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 4 },
      { id: "CHEM215", name: "Analytical Chemistry", credits: 4, prereqs: ["CHEM112"], term: 4 },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 4 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 4 },

      // JUNIOR - TERM 5
      { id: "GBE301", name: "Biochemistry I", credits: 4, prereqs: ["CHEM205", "GBE205"], term: 5 },
      { id: "GBE341", name: "Gene Eng. Tech. I", credits: 3, prereqs: ["GBE212", "GBE216"], term: 5 },
      { id: "GBE361", name: "Biotransport Phenomena", credits: 3, prereqs: ["GBE222"], term: 5 },
      { id: "GBE321", name: "Biothermodynamics", credits: 3, prereqs: ["CHEM112", "MATH132"], term: 5 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 5 },
      { id: "TKL201", name: "Turkish I", credits: 2, prereqs: [], term: 5 },

      // JUNIOR - TERM 6
      { id: "GBE302", name: "Biochemistry II", credits: 4, prereqs: ["GBE301"], term: 6 },
      { id: "GBE342", name: "Gene Eng. Tech. II", credits: 4, prereqs: ["GBE341"], term: 6 },
      { id: "GBE326", name: "Exp. GBE I", credits: 3, prereqs: ["GBE321"], term: 6 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 6 },
      { id: "TKL202", name: "Turkish II", credits: 2, prereqs: [], term: 6 },

      // SENIOR - TERM 7
      { id: "GBE400", name: "Summer Practice", credits: 0, prereqs: ["GBE301", "GBE341"], term: 7 },
      { id: "GBE403", name: "Molecular Biology I", credits: 3, prereqs: ["GBE212"], term: 7 },
      { id: "GBE492", name: "Engineering Project", credits: 3, prereqs: ["GBE415"], term: 8 },
      { id: "GBE415", name: "Exp. GBE II", credits: 3, prereqs: ["GBE326"], term: 7 },
      { id: "GBE451", name: "Bioprocess Eng.", credits: 3, prereqs: ["GBE361"], term: 7 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 7 },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 7 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },

      // SENIOR - TERM 8
      { id: "GBE404", name: "Molecular Biology II", credits: 4, prereqs: ["GBE403"], term: 8 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 8 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 8 },
    ]
});
