window.registerDepartment("CHBE", {
    name: "Chemical Engineering",
    curriculum: [
      // FRESHMAN - TERM 1
      { id: "CHEM111", name: "General Chemistry I", credits: 3, prereqs: [], term: 1 },
      { id: "MATH131", name: "Calculus I", credits: 4, prereqs: [], term: 1 },
      { id: "PHYS101", name: "Physics I", credits: 4, prereqs: [], term: 1 },
      { id: "REXX1", name: "Restricted Elective", credits: 3, prereqs: [], term: 1 },
      { id: "REXX2", name: "Restricted Elective", credits: 3, prereqs: [], term: 1 },

      // FRESHMAN - TERM 2
      { id: "CHBE102", name: "Intro. to CHBE", credits: 2, prereqs: [], term: 2 },
      { id: "CHEM112", name: "General Chemistry II", credits: 3, prereqs: ["CHEM111"], term: 2 },
      { id: "CHEM113", name: "General Chemistry Lab.", credits: 2, prereqs: ["CHEM111"], term: 2 },
      { id: "MATH132", name: "Calculus II", credits: 4, prereqs: ["MATH131"], term: 2 },
      { id: "PHYS102", name: "Physics II", credits: 4, prereqs: ["PHYS101"], term: 2 },
      { id: "REXX7", name: "Restricted Elective", credits: 3, prereqs: [], term: 2 }, // Re-using REXX7 to match order

      // SOPHOMORE - TERM 3
      { id: "CHBE203", name: "Organic Chemistry", credits: 3, prereqs: ["CHEM112"], term: 3 },
      { id: "CHBE211", name: "Physical Chemistry I", credits: 3, prereqs: ["CHEM112", "MATH132"], term: 3 },
      { id: "CHBE215", name: "Mass & Energy Balances", credits: 3, prereqs: ["CHEM112", "MATH132"], term: 3 },
      { id: "HUM103", name: "Humanities", credits: 2, prereqs: [], term: 3 },
      { id: "MATH221", name: "Linear Algebra", credits: 3, prereqs: [], term: 3 },
      { id: "MATH241", name: "Diff. Equations", credits: 4, prereqs: ["MATH132"], term: 3 },

      // SOPHOMORE - TERM 4
      { id: "CHBE204", name: "Bioorganic Chemistry", credits: 3, prereqs: ["CHBE203"], term: 4 },
      { id: "CHBE213", name: "Physical Chem. Lab.", credits: 2, prereqs: ["CHBE211"], term: 4 },
      { id: "CHBE214", name: "CHBE Thermodynamics", credits: 3, prereqs: ["CHBE211", "CHBE215"], term: 4 },
      { id: "CHBE232", name: "Fluid Mechanics", credits: 3, prereqs: ["MATH241", "CHBE215"], term: 4 },
      { id: "FEXX1", name: "Free Elective", credits: 3, prereqs: [], term: 4 },
      { id: "REXX3", name: "Restricted Elective", credits: 3, prereqs: [], term: 4 },

      // JUNIOR - TERM 5
      { id: "CHBE301", name: "Exp. CHBE I", credits: 2, prereqs: ["CHBE204", "CHBE215", "CHBE232"], term: 5 },
      { id: "CHBE311", name: "Comp. App. in CHBE", credits: 3, prereqs: ["MATH221", "MATH241"], term: 5 },
      { id: "CHBE331", name: "Heat Transfer", credits: 3, prereqs: ["CHBE215", "MATH241"], term: 5 },
      { id: "CHBE361", name: "Mat. in CHBE App.", credits: 3, prereqs: ["CHEM111"], term: 5 },
      { id: "REXX4", name: "Restricted Elective", credits: 3, prereqs: [], term: 5 },
      { id: "FEXX2", name: "Free Elective", credits: 3, prereqs: [], term: 5 },
      { id: "REXX5", name: "Restricted Elective", credits: 3, prereqs: [], term: 5 },

      // JUNIOR - TERM 6
      { id: "CHBE302", name: "Exp. CHBE II", credits: 2, prereqs: ["CHBE301", "CHBE331"], term: 6 },
      { id: "CHBE333", name: "Mass Transfer", credits: 3, prereqs: ["CHBE331"], term: 6 },
      { id: "CHBE362", name: "Reactor Design", credits: 3, prereqs: ["CHBE214", "CHBE204"], term: 6 },
      { id: "CHBE386", name: "Math. Modeling in CHBE", credits: 3, prereqs: ["MATH241", "CHBE311"], term: 6 },
      { id: "REXX6", name: "Restricted Elective", credits: 3, prereqs: [], term: 6 },
      { id: "REXX8", name: "Restricted Elective", credits: 3, prereqs: [], term: 6 },

      // SENIOR - TERM 7
      { id: "CHBE400", name: "Summer Practice", credits: 0, prereqs: [], term: 7 },
      { id: "CHBE401", name: "Exp. CHBE III", credits: 2, prereqs: ["CHBE302", "CHBE333", "CHBE362"], term: 7 },
      { id: "CHBE433", name: "Separation Processes", credits: 3, prereqs: ["CHBE333", "CHBE214"], term: 7 },
      { id: "CHBE441", name: "Process Dyn. & Control", credits: 3, prereqs: ["MATH241", "CHBE386"], term: 7 },
      { id: "CHBE463", name: "Process Design I", credits: 4, prereqs: ["CHBE362", "CHBE333", "CHBE331"], term: 7 },
      { id: "HTR301", name: "History of TR I", credits: 2, prereqs: [], term: 7 },
      { id: "REXX9", name: "Restricted Elective", credits: 3, prereqs: [], term: 7 },

      // SENIOR - TERM 8
      { id: "CHBE464", name: "Process Design II", credits: 3, prereqs: ["CHBE463"], term: 8 },
      { id: "CHBE492", name: "Engineering Project", credits: 3, prereqs: ["CHBE463"], term: 8 },
      { id: "HTR302", name: "History of TR II", credits: 2, prereqs: [], term: 8 },
      { id: "FEXX3", name: "Free Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX10", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX11", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX12", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX13", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX14", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX15", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
      { id: "REXX16", name: "Restricted Elective", credits: 3, prereqs: [], term: 8 },
    ]
});
