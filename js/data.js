/**
 * PANGKALAN DATA RASMI PENGURUSAN GURU & RELIEF
 * SEKOLAH KEBANGSAAN RANGGU, TAWAU (XBA3037)
 * Peti Surat 842, 91008 Tawau, Sabah
 */

const SK_RANGGU_CONFIG = {
  school: {
    name: "SEKOLAH KEBANGSAAN RANGGU",
    shortName: "SK Ranggu",
    code: "XBA3037",
    address: "Peti Surat 842, 91008 Tawau, Sabah",
    zone: "Zon Balung, PPD Tawau",
    session: "Sesi Persekolahan 2026",
    grade: "Gred A Luar Bandar",
    phone: "089-921000",
    email: "xba3037@moe.edu.my",
    logo: "assets/logo-skrg.png",
    logoSvg: "assets/logo-sk-ranggu.svg",
    logoKpm: "assets/logo-kpm.svg",
    logoKpmPng: "assets/logo-kpm.png"
  },
  adminProfile: {
    name: "PUAN HAJAH RAHMATIAH BINTI MOHD JUDA",
    role: "Penolong Kanan Pentadbiran (PK 1)",
    email: "rahmatiah@skranggu.edu.my",
    avatar: "assets/logo-skrg.png"
  },
  reliefReasons: [
    { code: "CRK", label: "Cuti Rehat Khas (CRK)", color: "bg-purple-100 text-purple-700 border-purple-300" },
    { code: "MC", label: "Cuti Sakit (MC)", color: "bg-rose-100 text-rose-700 border-rose-300" },
    { code: "KURSUS", label: "Kursus / Bengkel / LDP", color: "bg-blue-100 text-blue-700 border-blue-300" },
    { code: "TUGAS_LUAR", label: "Tugas Luar / PPD / JPN", color: "bg-amber-100 text-amber-700 border-amber-300" },
    { code: "BERSALIN", label: "Cuti Bersalin", color: "bg-pink-100 text-pink-700 border-pink-300" },
    { code: "HAJI", label: "Cuti Haji / Umrah", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { code: "KUARANTIN", label: "Cuti Kuarantin", color: "bg-orange-100 text-orange-700 border-orange-300" },
    { code: "MESYUARAT", label: "Mesyuarat Rasmi", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
    { code: "LAIN", label: "Hal-Hal Rasmi Lain", color: "bg-slate-100 text-slate-700 border-slate-300" }
  ]
};

// Senarai 54 Guru Aktif SK Ranggu Tawau
const SK_RANGGU_TEACHERS = [
  { id: 1, name: "YUNUS BIN PATARAI", shortName: "YUNUS PATARAI", role: "Guru Besar", session: "Pagi", major: "PI/PM", maxRelief: 1 },
  { id: 2, name: "PUAN HAJAH RAHMATIAH BINTI MOHD JUDA", shortName: "RAHMATIAH MOHD JUDA", role: "GPK Pentadbiran", session: "Pagi", major: "BM", maxRelief: 2 },
  { id: 3, name: "PUAN KOMALA BINTI JOSEPH", shortName: "KOMALA JOSEPH", role: "GPK HEM", session: "Pagi", major: "BI", maxRelief: 2 },
  { id: 4, name: "PUAN WARNAH BINTI SIRA", shortName: "WARNAH SIRA", role: "GPK Kokurikulum", session: "Pagi", major: "BM", maxRelief: 2 },
  { id: 5, name: "TUAN HJ EMRAN BIN HJ SELAMAT", shortName: "EMRAN HJ SELAMAT", role: "GPK Petang", session: "Petang", major: "PI", maxRelief: 2 },
  { id: 6, name: "AG KU KEMAINDDRA BIN PG MOHD TAIB", shortName: "AG KU KEMAINDRAA PG MOHD TAIB", role: "Guru Kelas 6 Iltizam", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 7, name: "AHAD BIN JAAFAR", shortName: "AHAD JAAFAR", role: "Guru Akademik • BM & Muzik", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 8, name: "AINATUN NADHIRAH BINTI DHARMAWI", shortName: "AINATUN NADHIRAH DHARMAWI", role: "Guru Kelas 3 Jayyid", session: "Petang", major: "MT", maxRelief: 3 },
  { id: 9, name: "ANI BINTI PATOLA", shortName: "ANI PATOLA", role: "Setiausaha Kurikulum", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 10, name: "ASMADI BIN LAJJAKASI", shortName: "ASMADI LAJAKASI", role: "Pegawai Aset & Maklumat", session: "Pagi", major: "SN", maxRelief: 3 },
  { id: 11, name: "BAJAM BINTI LADUNG", shortName: "BAJAM LADUNG", role: "Guru Kelas 6 Mumtaz", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 12, name: "DARMAWATI BTE LOKKONG", shortName: "DARMAWATI LOKKONG", role: "Penolong Setiausaha HEM", session: "Petang", major: "BM", maxRelief: 3 },
  { id: 13, name: "EVALORENNA BINTI LAMINSIN", shortName: "EVALORENNA LAMINSIN", role: "Setiausaha Kokurikulum", session: "Pagi", major: "BI", maxRelief: 3 },
  { id: 14, name: "FARIDAH BINTI SUNU", shortName: "FARIDAH SUNU", role: "Ketua Panitia Pend Moral", session: "Petang", major: "PI/PM", maxRelief: 3 },
  { id: 15, name: "HALIM BIN BIDI", shortName: "HALIM BIDI", role: "Penyelaras Kebajikan", session: "Pagi", major: "PI", maxRelief: 3 },
  { id: 16, name: "HAMSIAH BINTI HAMID", shortName: "HAMSIAH HAMID", role: "Ketua Panitia Bahasa Inggeris", session: "Pagi", major: "BI", maxRelief: 3 },
  { id: 17, name: "HASNAN BIN MAT ZIN", shortName: "HASNAN MAT ZIN", role: "Ketua Panitia Pendidikan Islam", session: "Pagi", major: "PI", maxRelief: 3 },
  { id: 19, name: "JAINAH BINTI SULAIMAN", shortName: "JAINAH SULAIMAN", role: "Penyelaras HIP", session: "Petang", major: "BI", maxRelief: 3 },
  { id: 20, name: "JUNAID BIN NURDIN", shortName: "JUNAID NURDIN", role: "Ketua Panitia Sains", session: "Pagi", major: "SN", maxRelief: 3 },
  { id: 21, name: "MARIANA BINTI KASSIM", shortName: "MARIANA KASSIM", role: "Penyelaras Prasekolah", session: "Pagi", major: "PRA", maxRelief: 2 },
  { id: 22, name: "MARINI BINTI LADI", shortName: "MARINI LADI", role: "Penyelaras PLC", session: "Petang", major: "MT", maxRelief: 3 },
  { id: 23, name: "MASTURAH BINTI TUDA", shortName: "MASTURAH TUDA", role: "Ketua Panitia Matematik", session: "Pagi", major: "MT", maxRelief: 3 },
  { id: 24, name: "MOHAMMAD FIKREY BIN ABDUL GAPAR", shortName: "MOHAMMAD FIKREY ABDUL GAPAR", role: "Penyelaras ICT & DELIMa", session: "Pagi", major: "RBT", maxRelief: 3 },
  { id: 25, name: "MOHAMMAD IKHWAN BIN ABDURAIS", shortName: "MOHAMMAD IKHWAN ABDURAIS", role: "Guru Kelas 2 Iltizam", session: "Petang", major: "PJ", maxRelief: 3 },
  { id: 26, name: "MOHD ALFAIZAL BIN DAUD", shortName: "MOHD ALFAZIAL DAUD", role: "Penyelaras Data & IDME", session: "Pagi", major: "PJ", maxRelief: 3 },
  { id: 27, name: "MOHD MUEMIN BIN MOHD AMIN JAPAR", shortName: "MOHD MUEMIN MOHD AMIN JAPAR", role: "Guru Akademik", session: "Pagi", major: "PI", maxRelief: 3 },
  { id: 28, name: "MUHAMADIAN BIN SUAIBU", shortName: "MUHAMADIAN SUAIBU", role: "Penyelaras Pemulihan Khas", session: "Pagi", major: "PEM", maxRelief: 2 },
  { id: 29, name: "NECHI BINTI SERUNAI", shortName: "NECHI SERUNAI", role: "AJK RMT", session: "Petang", major: "BM", maxRelief: 3 },
  { id: 30, name: "NOOR SYAFIQAH NADHIRAH BINTI JAMALUDDIN", shortName: "NOOR SYAFIQAH JAMALUDDIN", role: "Guru Kelas 1 Iltizam", session: "Petang", major: "BI", maxRelief: 3 },
  { id: 31, name: "NORIMAH BINTI JOYO REJO", shortName: "NORIMAH JOYO REJO", role: "Penyelaras 3K", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 32, name: "NORLINA BINTI BAGWAS", shortName: "NORLINA BAGWAS", role: "Setiausaha HEM Petang", session: "Petang", major: "BM", maxRelief: 3 },
  { id: 33, name: "NOZE BINTI TUKIJAN", shortName: "NOZE TUKIJAN", role: "Penyelaras Disiplin Pagi", session: "Pagi", major: "BI", maxRelief: 3 },
  { id: 34, name: "NUR FAEZAH BINTI BANTALANI", shortName: "NUR FAEZAH BANTALANI", role: "Guru Kelas 3 Mumtaz", session: "Petang", major: "SN", maxRelief: 3 },
  { id: 35, name: "NURUL ANISA BINTI SAPARUDIN", shortName: "NURUL ANISA SAPARUDIN", role: "Penyelaras Jadual Pagi", session: "Pagi", major: "BI", maxRelief: 3 },
  { id: 36, name: "RASMAWATI BINTI TAUSE", shortName: "RASMAWATI TAUSE", role: "Penyelaras Kurikulum Tahap 1", session: "Petang", major: "BM", maxRelief: 3 },
  { id: 37, name: "RINI BINTI DAUD", shortName: "RINI DAUD", role: "Ketua Panitia Sejarah", session: "Pagi", major: "SEJ", maxRelief: 3 },
  { id: 38, name: "ROBIATUL AIDAWYAH", shortName: "ROBIATUL AIDAWYAH", role: "Guru Akademik", session: "Pagi", major: "BA", maxRelief: 3 },
  { id: 39, name: "RONI BIN BACHO", shortName: "RONI BACHO", role: "Ketua Panitia RBT", session: "Pagi", major: "RBT", maxRelief: 3 },
  { id: 40, name: "ROSIDIAN BIN IDRIS", shortName: "ROSIDIAN IDRIS", role: "Setiausaha Sukan", session: "Pagi", major: "PJ", maxRelief: 3 },
  { id: 41, name: "ROSMINAH BINTI SAPAR", shortName: "ROSMINAH SAPAR", role: "Guru Perpustakaan & Media (GPM)", session: "Pagi", major: "BM", maxRelief: 2 },
  { id: 42, name: "RUHAYA BINTI AHMAD", shortName: "RUHAYA AHMAD", role: "Guru Kelas 3 Khoir", session: "Petang", major: "MT", maxRelief: 3 },
  { id: 43, name: "S.LILI BINTI LADI", shortName: "S.LILI LADI", role: "Penyelaras Intervensi", session: "Petang", major: "BM", maxRelief: 3 },
  { id: 44, name: "SABRIAH @ HABIBAH BINTI ABDUL SABAR", shortName: "SABRIAH ABDUL SABAR", role: "Ketua Panitia Bahasa Melayu", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 45, name: "SALSABILA BINTI SHAHRUDDIN", shortName: "SALSABILA SHAHRUDDIN", role: "Guru Akademik", session: "Pagi", major: "MT", maxRelief: 3 },
  { id: 46, name: "SITI JAWARA BINTI LUKMAN", shortName: "SITI JAWARA LUKMAN", role: "Ketua Panitia PSV", session: "Petang", major: "PSV", maxRelief: 3 },
  { id: 47, name: "SITI NAURIN FADZILAH BINTI JALAL", shortName: "SITI NAURIN FADZILAH JALAL", role: "Guru Bimbingan & Kaunseling (UBK)", session: "Pagi", major: "UBK", maxRelief: 1 },
  { id: 48, name: "SITI RABIA BIN IBRAHIM", shortName: "SITI RABIA IBRAHIM", role: "Guru Akademik", session: "Pagi", major: "BM", maxRelief: 3 },
  { id: 49, name: "SUNARTI BINTI TAPPA", shortName: "SUNARTI TAPPA", role: "Ketua Panitia Bahasa Arab", session: "Pagi", major: "BA", maxRelief: 3 },
  { id: 50, name: "TANJANG BIN TURE", shortName: "TANJANG TURE", role: "Ketua Panitia Muzik", session: "Pagi", major: "PMZ", maxRelief: 3 },
  { id: 51, name: "WAFA FARHANA BINTI ABD KADIR", shortName: "WAFA FARHANA ABD KADIR", role: "Ketua Panitia PJPK", session: "Pagi", major: "PJ", maxRelief: 3 },
  { id: 52, name: "WAN MUHAMAD YUSUF BIN WAN ABDUL AZIZ", shortName: "WAN MUHAMMAD YUSUF", role: "Penyelaras Pembangunan", session: "Pagi", major: "MT", maxRelief: 3 },
  { id: 53, name: "YUSNI BINTI WAHJUDIN", shortName: "YUSNI WAHJUDIN", role: "Guru Prasekolah Mutiara Hati", session: "Pagi", major: "PRA", maxRelief: 2 },
  { id: 54, name: "ZAMRIE BIN OMAR ALI", shortName: "ZAMRIE OMAR ALI", role: "Penyelaras Keselamatan", session: "Petang", major: "PJ", maxRelief: 3 }
];
