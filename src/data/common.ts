import { CourseOption } from '../types';

// Turkish Language Pools
export const turkishPool1: CourseOption[] = [
    { id: "TKL201", name: "Turkish I", credits: 2 },
    { id: "AFYA101", name: "Trk. for Foreigners I", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

export const turkishPool2: CourseOption[] = [
    { id: "TKL202", name: "Turkish II", credits: 2 },
    { id: "AFYA102", name: "Trk. for Foreigners II", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// Academic English Pool (REXX1/REXX2)
// Note: AFE courses are also in freeElectives for overflow handling (3rd AFE -> FEXX1)
export const englishPool: CourseOption[] = [
    { id: "AFE131", name: "Academic English I", credits: 3 },
    { id: "AFE132", name: "Academic English II", credits: 3 },
    { id: "AFEA111", name: "English Speaking I", credits: 3 },
    { id: "AFEA112", name: "English Speaking II", credits: 3 },
    { id: "ES176", name: "Research & Tech. Writing", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// Programming / Computational
export const programmingPool: CourseOption[] = [
    { id: "ES112", name: "Algo. & Prog.", credits: 4 },
    { id: "ES117", name: "Sci. Comp. w/ Octave", credits: 3 },
    { id: "ES118", name: "Sci. Comp. w/ Python", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));

// Common Technical Electives (Interdisciplinary)
// Shared across CSE, EE, ME, CHBE, BME, ISE, MSN, GBE
export const commonTechnicalElectives: CourseOption[] = [
    { id: "ES310", name: "Res. Orient. Inn.", credits: 3 },
    { id: "ES411", name: "Vehicle Electrif.", credits: 3 },
    { id: "ES415", name: "Smart Vehicles", credits: 3 },
    { id: "MSN486", name: "Funct. Thin Films", credits: 3 },
    { id: "MTH424", name: "Gen. AI Models", credits: 3 },
    { id: "CSE315", name: "Internet Tech.", credits: 3 },
    { id: "CSE426", name: "Voice Proc.", credits: 3 },
    { id: "CSE472", name: "Concurrent Prog.", credits: 3 },
    { id: "CSE483", name: "Comp. Graphics", credits: 3 },
    { id: "CSE489", name: "HCI", credits: 3 },
    { id: "ISE402", name: "System Design", credits: 3 },
    { id: "ME482", name: "Mech. Sys. Design", credits: 3 },
    { id: "MTH423", name: "CV in Smart Veh.", credits: 3 },
    { id: "BME332", name: "Noise Red. Techn.", credits: 3 },
    { id: "BME412", name: "MR Spect. Imag.", credits: 3 },
    { id: "BME421", name: "Medical Imaging", credits: 3 },
    { id: "BME444", name: "MRI", credits: 3 },
    { id: "BME462", name: "Medical Robotics", credits: 3 },
    { id: "CHBE431", name: "World Energy Res.", credits: 3 },
    { id: "CSE326", name: "Embedded Sys. Prog.", credits: 3 },
    { id: "CSE421", name: "Embedded ML", credits: 3 },
    { id: "CSE427", name: "Comp. Arch.", credits: 3 },
    { id: "CSE462", name: "Intro. AI", credits: 3 },
    { id: "CSE471", name: "Data Comm.", credits: 3 },
    { id: "CSE476", name: "Mobile App Dev.", credits: 3 },
    { id: "CSE487", name: "Image Proc.", credits: 3 },
    { id: "GBE444", name: "Intro Bioinfo.", credits: 3 },
    { id: "ISE401", name: "Sys. Dyn. & Mod.", credits: 3 },
    { id: "ISE417", name: "Comp. Intel.", credits: 3 },
    { id: "ISE425", name: "Nonlinear Prog.", credits: 3 },
    { id: "ISE427", name: "Math. Modeling", credits: 3 },
    { id: "ISE464", name: "CAD/CAM", credits: 3 },
    { id: "ME411", name: "Renewable Energy", credits: 3 },
    { id: "ME451", name: "Num. Ctrl. Mech.", credits: 3 },
    { id: "ME453", name: "Mobile Robotics", credits: 3 },
    { id: "ME455", name: "Vehicle Dyn.", credits: 3 },
    { id: "ME456", name: "Mechatronics", credits: 3 },
    { id: "ME457", name: "Control Sys.", credits: 3 },
    { id: "ME459", name: "Robot Mech.", credits: 3 },
    { id: "ME462", name: "MEMS", credits: 3 },
    { id: "ME485", name: "Music Eng.", credits: 3 }
].sort((a, b) => a.id.localeCompare(b.id));


export { freeElectives } from './free-electives';
