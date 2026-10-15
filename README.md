# Sistem Pengurusan Guru Ganti (Jadual Relief)
## Sekolah Kebangsaan Ranggu, Tawau, Sabah (Kod: XBA3037)
**Alamat Surat-Menyurat:** Peti Surat 842, 91008 Tawau, Sabah  
**Pejabat Pendidikan Daerah:** PPD Tawau (Zon Balung)  
**Antaramuka:** RedPen 2.0 (Pengurusan Jadual Relief Berwarna Interaktif)

---

## 🌟 Pengenalan & Matlamat Sistem

Sistem ini dibina semula khas untuk **Sekolah Kebangsaan Ranggu, Tawau (XBA3037)** berasaskan video rujukan demonstrasi modul **Pengurusan Guru Ganti (Relief) RedPen 2.0**.

Sistem ini membantu pihak pentadbir (Guru Besar & Penolong Kanan Pentadbiran) menyusun, menjana, menyemak secara visual, dan mengedarkan jadual guru ganti harian dengan pantas, adil, telus, serta mematuhi piawaian Kementerian Pendidikan Malaysia (KPM).

---

## 🚀 Ciri-Ciri Utama Sistem

### 1. 📋 Langkah 1: Pemilihan Guru Tidak Hadir
- **Tarikh & Hari Automatik:** Memilih tarikh persekolahan dan mengesan hari secara automatik (Isnin hingga Jumaat).
- **Penapis Sesi:** Sesi Pagi, Sesi Petang, atau Semua Sesi.
- **Pangkalan Data 54 Guru SK Ranggu:** Nama penuh, gelaran jawatan, dan opsyen subjek (BM, BI, MT, SN, PI, PJ, PSV, RBT, SEJ, BA, Muzik, Prasekolah, Pemulihan).
- **Kategori Sebab Tidak Hadir:**
  - CRK (Cuti Rehat Khas)
  - MC (Cuti Sakit)
  - Kursus / Bengkel / LDP
  - Tugas Luar / Urusan Rasmi PPD / JPN
  - Cuti Bersalin
  - Cuti Haji / Umrah
  - Cuti Kuarantin
  - Mesyuarat Rasmi
- **Tagging Dinamik:** Menyenaraikan guru tidak hadir dalam bentuk *chip badge* dengan pilihan untuk memadam.
- **Tetapan Kuota & Algoritma:**
  - Had Maksima Relief (lalai: 2 - 3 waktu seorang guru).
  - Suis *Auto Pilih Guru* (ON/OFF).
  - Pecahan Masa (30 minit / 60 minit).
  - **Kawalan Bebanan Pintar:** Mengelakkan guru yang baru mengajar 2 jam berturut-turut menerima relief tanpa rehat (*seperti yang ditekankan dalam video demonstrasi*).
  - **Keutamaan Opsyen Panitia:** Mengutamakan guru daripada panitia subjek yang sama jika lapang.

---

### 2. ⚡ Langkah 2: Jana Jadual Relief Pintar
- Menekan butang **"2. JANA JADUAL RELIEF"** akan mengaktifkan enjin algoritmik kekangan:
  1. Mengenal pasti semua kelas yang ditinggalkan oleh guru tidak hadir pada hari berkenaan berdasarkan **Jadual Waktu Induk SK Ranggu (654 Slot Mengajar)**.
  2. Menapis guru-guru yang mempunyai kelas sendiri atau telah mencapai had kuota.
  3. Mengira skor keadilan dan masa rehat bagi setiap calon.
  4. Menetapkan guru ganti yang paling sesuai dan adil secara automatik.

---

### 3. 🎨 Langkah 3: Pratonton Jadual (Draf)

#### A. 🟦🟧🟩 Paparan Grid Berwarna (Hero Feature Interaktif)
- **Matriks Lengkap:** Menampilkan semua guru pada paksi menegak dan waktu (W1 hingga W11 + Rehat) pada paksi mendatar.
- **Kod Warna Visual Rasmi:**
  - 🟦 **Biru (Jadual Asal):** Guru sedang mengajar kelas sendiri (cth: `6 K • BM`).
  - 🟧 **Oren (Jadual Relief):** Tugasan guru ganti (cth: `RELIEF: 4 M BM (Ganti: Cikgu Sabriah)`).
  - 🟩 **Hijau Berdenyut (Slot Sesuai & Bebas):** Slot alternatif yang layak mengambil relief.
  - ⬜ **Kelabu / Putih:** Waktu lapang / tiada kelas.
  - 🟪 **Ungu:** Guru yang ditandakan tidak hadir.

#### 🔄 Fungsi Interaktif Pindah Relief (*Click-to-Move / Swap*):
1. Klik mana-mana kotak **Oren** (Relief).
2. Sistem akan mengaktifkan **Mod Pindah Relief** dan menyalakan semua guru yang **BEBAS & LAPANG** pada waktu tersebut dengan warna **HIJAU BERDENYUT**.
3. Klik mana-mana kotak **HIJAU** pilihan anda.
4. Tugasan relief akan **berpindah secara serta-merta** kepada guru baharu berserta notifikasi pengesahan.
5. Paparan Senarai dan Pangkalan Data akan disegerakkan serentak!

#### B. 📄 Paparan Senarai (List View)
- Jadual senarai tersusun: Bil, Waktu & Masa, Kelas & Subjek, Guru Asal, dan Menu Pilihan Guru Ganti secara *inline*.

---

### 4. 🖨️ Cetakan Rasmi KPM & Edaran (PDF Ready)
Sistem dilengkapi dengan templat cetakan rasmi berformat A4 yang sedia dicetak (`window.print()`):
1. **Slip Pemberitahuan Guru Ganti Individu:**
   - 4 keping slip per lembaran A4 dengan garisan putus-putus (*Gunting Di Sini*).
   - Mempunyai kepala surat rasmi SK Ranggu, Kod XBA3037, nama guru ganti, guru asal, kelas, subjek, masa, serta ruangan tandatangan guru dan pengesahan pentadbir.
2. **Penyata Jadual Guru Ganti Harian (Papan Notis & Fail Pentadbiran):**
   - Lembaran lengkap jadual induk penggantian harian dengan ruangan pengesahan Penolong Kanan Pentadbiran (Puan Hajah Rahmatiah) dan Guru Besar (Encik Yunus bin Patarai).

---

### 5. 💾 Pangkalan Data Tempatan (LocalStorage)
- Boleh menyimpan rekod draf ke dalam pelayar web secara kekal.
- Tab **Senarai Rekod Relief Terdahulu** membolehkan pentadbir memuat semula arkib tarikh-tarikh sebelum ini bila-bila masa.

---

## 📁 Struktur Fail Projek

```text
sk-ranggu-relief/
├── index.html              # Antaramuka utama (RedPen 2.0 theme, Tailwind, responsive)
├── css/
│   └── style.css           # Penggayaan grid matriks, warna sel, animasi, & CSS cetakan KPM (@media print)
├── js/
│   ├── data.js             # Data 54 staf SK Ranggu, maklumat sekolah, dan sebab ketidakhadiran
│   ├── timetable-data.js   # 654 slot jadual waktu mengajar rasmi SK Ranggu 2026
│   ├── relief-engine.js    # Enjin algoritma agihan relief, semakan rehat, dan pertukaran sel
│   └── app.js              # Pengendali UI, interaktiviti grid, klik-pindah, carian, dan cetakan
├── assets/
│   ├── logo-sk-ranggu.svg  # Logo vektor rasmi SK Ranggu
│   ├── logo-skrg.png       # Logo rasmi SK Ranggu Tawau
│   ├── logo-kpm.svg        # Logo vektor Kementerian Pendidikan Malaysia
│   └── logo-kpm.png        # Logo rasmi KPM
└── README.md               # Dokumentasi lengkap sistem
```

---

## 💻 Panduan Penggunaan Pantas

1. Buka fail `index.html` terus dalam mana-mana pelayar web moden (Google Chrome, Microsoft Edge, Safari, atau Firefox).
2. Atau jalankan pelayan tempatan jika diperlukan:
   ```bash
   cd /Users/momon/.gemini/antigravity/scratch/sk-ranggu-relief
   python3 -m http.server 8080
   ```
   Kemudian buka `http://localhost:8080` pada pelayar web.

3. **Ujian Pantas (Demo Video):**
   - Klik butang **"Contoh Demo Video (2 Guru)"** di sebelah kanan Langkah 1.
   - Sistem akan memuatkan contoh 2 orang guru tidak hadir dan menjana jadual relief secara automatik.
   - Klik mana-mana kotak **Oren** dalam Grid Berwarna, kemudian klik mana-mana kotak **Hijau** untuk melihat demonstrasi pertukaran guru ganti secara langsung!
   - Tekan **"Cetak Slip (PDF)"** untuk melihat susun atur cetakan slip edaran rasmi KPM.

---
*Disediakan untuk kegunaan rasmi Sekolah Kebangsaan Ranggu, Peti Surat 842, 91008 Tawau, Sabah.*
