// 1. Sabit Arayüz Metinleri
export const uiTranslations: Record<string, { en: string; tr: string }> = {
  department: { en: "Department of", tr: "Bölümü" },
  credits: { en: "Credits", tr: "Kredi" },
  reset: { en: "Reset All Data", tr: "Verileri Sıfırla" },
  theme: { en: "Select Theme", tr: "Tema Seç" },
  simulation: { en: "Simulation Mode", tr: "Simülasyon Modu" },
  fall: { en: "Fall", tr: "Güz" },
  spring: { en: "Spring", tr: "Bahar" },
  summer: { en: "Summer Practice", tr: "Yaz Stajı" },
  freshman: { en: "Freshman", tr: "1. Sınıf" },
  sophomore: { en: "Sophomore", tr: "2. Sınıf" },
  junior: { en: "Junior", tr: "3. Sınıf" },
  senior: { en: "Senior", tr: "4. Sınıf" },
  extra: { en: "Extra / Transfer", tr: "Ekstra / Transfer" },
  prereqs: { en: "Prereqs", tr: "Önkoşul" },
  coreqs: { en: "Coreqs", tr: "Eşkoşul" },
  search: { en: "Search...", tr: "Ara..." }
};

// 2. Popup / Modal Metinleri
export const popupTranslations: Record<string, { en: string; tr: string }> = {
  // Reset Modal
  resetTitle: { en: "Confirm Reset", tr: "Sıfırlama Onayı" },
  resetMsg: { en: "Are you sure you want to reset?", tr: "Tüm verileri sıfırlamak istediğinize emin misiniz?" },
  cancel: { en: "Cancel", tr: "İptal" },
  yesReset: { en: "Yes, Reset", tr: "Evet, Sıfırla" },
  
  // Simulation Modal
  simTitle: { en: "Simulation Setup", tr: "Simülasyon Kurulumu" },
  targetGpa: { en: "Target GPA", tr: "Hedef Ortalama" },
  courseCount: { en: "Course Count", tr: "Alınan Ders Sayısı" },
  manualMode: { en: "Manual Mode", tr: "Manuel Mod" },
  autoFill: { en: "Auto-Fill", tr: "Otomatik Doldur" },
  
  // Theme Modal
  themeTitle: { en: "Select Theme", tr: "Tema Seçimi" },
  light: { en: "Light", tr: "Aydınlık" },
  dark: { en: "Dark", tr: "Karanlık" },
  rose: { en: "Rose", tr: "Gül" }
};

// 3. Bölüm İsimleri Sözlüğü
export const departmentNames: Record<string, string> = {
  "BME": "Biyomedikal Mühendisliği",
  "CHBE": "Kimya ve Biyoloji Mühendisliği",
  "CSE": "Bilgisayar Mühendisliği",
  "EE": "Elektrik-Elektronik Mühendisliği",
  "GBE": "Genetik ve Biyomühendislik",
  "ISE": "Endüstri ve Sistem Mühendisliği",
  "ME": "Makine Mühendisliği",
  "MSN": "Malzeme Bilimi ve Nanoteknoloji Müh."
   // ... diğer bölümler eklendikçe
};
