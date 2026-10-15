/**
 * ENJIN PINTAR PENGURUSAN GURU GANTI (RELIEF ALGORITHM)
 * SEKOLAH KEBANGSAAN RANGGU, TAWAU (XBA3037)
 * Memastikan pengagihan adil, mengelakkan guru mengajar berterusan tanpa rehat,
 * dan memadankan opsyen subjek secara automatik.
 */

class SKRangguReliefEngine {
  constructor(timetableData, teachersList) {
    this.timetableData = timetableData || [];
    this.teachersList = teachersList || [];
    this.activeAssignments = []; // Draf terkini
    this.absentTeachers = []; // [{ teacherId, name, reason }]
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedDayCode = this.getDayCodeFromDate(this.selectedDate);
    this.settings = {
      maxReliefPerTeacher: 2,
      autoAssign: true,
      slotSplit: 30, // 30 minit
      avoidContinuous: true, // Elak relief selepas 2 jam kelas berturut-turut
      prioritizeSameSubject: true, // Utamakan guru panitia sama
      filterSession: "Semua" // "Semua", "Pagi", "Petang"
    };
  }

  // Tukar tarikh kepada kod hari SK Ranggu (1: Isnin, 2: Selasa, 3: Rabu, 4: Khamis, 5: Jumaat)
  getDayCodeFromDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0: Sun, 1: Mon, ... 5: Fri, 6: Sat
    if (day >= 1 && day <= 5) return day;
    return 1; // Lalai ke Isnin jika hujung minggu
  }

  // Nama hari dalam Bahasa Melayu
  getDayName(dayCode) {
    const names = { 1: "Isnin", 2: "Selasa", 3: "Rabu", 4: "Khamis", 5: "Jumaat" };
    return names[dayCode] || "Isnin";
  }

  // Normalisasi nama untuk perbandingan tepat
  normalizeName(str) {
    if (!str) return "";
    return str.toLowerCase()
      .replace(/\b(bin|binti|bte|hajah|haji|hj|cikgu|encik|puan|ustaz|ustazah)\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  // Semak adakah dua nama merujuk guru yang sama
  isSameTeacher(name1, name2) {
    const n1 = this.normalizeName(name1);
    const n2 = this.normalizeName(name2);
    if (!n1 || !n2) return false;
    return n1.includes(n2) || n2.includes(n1);
  }

  // Dapatkan maklumat guru mengikut ID atau nama
  getTeacher(identifier) {
    if (typeof identifier === 'number') {
      return this.teachersList.find(t => t.id === identifier);
    }
    return this.teachersList.find(t => 
      this.isSameTeacher(t.name, identifier) || 
      this.isSameTeacher(t.shortName, identifier)
    );
  }

  // Tambah guru tidak hadir
  addAbsentTeacher(teacherId, reasonCode, reasonLabel) {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) return false;
    if (this.absentTeachers.some(a => a.teacherId === teacher.id)) return false;

    this.absentTeachers.push({
      teacherId: teacher.id,
      name: teacher.name,
      shortName: teacher.shortName,
      role: teacher.role,
      session: teacher.session,
      reasonCode: reasonCode || "CRK",
      reasonLabel: reasonLabel || "Cuti Rehat Khas (CRK)"
    });
    return true;
  }

  // Buang guru dari senarai tidak hadir
  removeAbsentTeacher(teacherId) {
    this.absentTeachers = this.absentTeachers.filter(a => a.teacherId !== teacherId);
  }

  // Cari semua jadual guru pada hari & waktu tertentu
  getTeacherClassAtSlot(teacherName, dayCode, waktu) {
    return this.timetableData.find(item => 
      item.kodHari === dayCode && 
      item.waktu === waktu && 
      this.isSameTeacher(item.guru, teacherName)
    );
  }

  // Kira jumlah waktu mengajar guru pada hari tersebut
  getTeacherDailyPeriodsCount(teacherName, dayCode) {
    return this.timetableData.filter(item => 
      item.kodHari === dayCode && 
      this.isSameTeacher(item.guru, teacherName)
    ).length;
  }

  // Semak bebanan berat: adakah guru mengajar berturut-turut pada waktu berhampiran?
  // Mengikut video: "Cikgu ini baru saja lepas 2 jam kelas berturut-turut... tak sempat rehat!"
  checkTeacherWorkloadStrain(teacherName, dayCode, targetWaktu) {
    let continuousCount = 0;
    
    // Semak 2 waktu sebelum
    const before1 = this.getTeacherClassAtSlot(teacherName, dayCode, targetWaktu - 1);
    const before2 = this.getTeacherClassAtSlot(teacherName, dayCode, targetWaktu - 2);
    
    // Semak 2 waktu selepas
    const after1 = this.getTeacherClassAtSlot(teacherName, dayCode, targetWaktu + 1);
    const after2 = this.getTeacherClassAtSlot(teacherName, dayCode, targetWaktu + 2);

    if (before1) continuousCount += 1;
    if (before1 && before2) continuousCount += 2;
    if (after1) continuousCount += 1;
    if (after1 && after2) continuousCount += 2;

    const hasNoRest = (before1 && before2) || (after1 && after2);
    return {
      continuousCount,
      hasNoRest,
      isHeavy: continuousCount >= 3 || hasNoRest,
      reason: hasNoRest ? "Mengajar berturut-turut (tiada rehat mencukupi)" : "Beban seimbang"
    };
  }

  // Cari semua slot kosong bagi guru-guru yang tidak hadir
  findVacantSlots(dayCode) {
    const vacantSlots = [];
    const absentTeacherIds = new Set(this.absentTeachers.map(a => a.teacherId));

    this.timetableData.forEach(item => {
      if (item.kodHari !== dayCode) return;

      const matchingAbsent = this.absentTeachers.find(a => this.isSameTeacher(a.name, item.guru) || this.isSameTeacher(a.shortName, item.guru));
      if (matchingAbsent) {
        vacantSlots.push({
          id: `vacant_${item.id}_${matchingAbsent.teacherId}`,
          timetableId: item.id,
          kodHari: item.kodHari,
          hari: item.hari,
          waktu: item.waktu,
          masa: item.masa,
          kelas: item.kelas,
          subjek: item.subjek,
          paparan: item.paparan,
          originalGuru: matchingAbsent.name,
          originalGuruShort: matchingAbsent.shortName,
          originalGuruId: matchingAbsent.teacherId,
          reasonCode: matchingAbsent.reasonCode,
          reasonLabel: matchingAbsent.reasonLabel
        });
      }
    });

    // Susun mengikut urutan waktu
    return vacantSlots.sort((a, b) => a.waktu - b.waktu);
  }

  // Jana jadual relief lengkap
  generateRelief(dayCode = this.selectedDayCode) {
    this.selectedDayCode = dayCode;
    const vacantSlots = this.findVacantSlots(dayCode);
    const assignments = [];
    const teacherReliefCounts = {}; // { teacherId: count }

    // Mulakan pembilang relief bagi setiap guru
    this.teachersList.forEach(t => {
      teacherReliefCounts[t.id] = 0;
    });

    // Set guru tidak hadir tidak boleh menerima relief
    const absentTeacherIds = new Set(this.absentTeachers.map(a => a.teacherId));

    vacantSlots.forEach(slot => {
      let assignedTeacher = null;
      let candidates = [];

      // Cari semua calon guru aktif
      this.teachersList.forEach(t => {
        // Abaikan guru tidak hadir
        if (absentTeacherIds.has(t.id)) return;

        // Abaikan jika melebihi had kuota relief
        const currentCount = teacherReliefCounts[t.id] || 0;
        const maxAllowed = Math.min(t.maxRelief || 3, this.settings.maxReliefPerTeacher);
        if (currentCount >= maxAllowed) return;

        // Abaikan jika ada kelas sendiri pada waktu ini
        const hasOwnClass = this.getTeacherClassAtSlot(t.name, dayCode, slot.waktu);
        if (hasOwnClass) return;

        // Abaikan jika sudah ditugaskan relief lain pada waktu ini
        const hasReliefAtSameTime = assignments.some(a => a.substituteTeacherId === t.id && a.waktu === slot.waktu);
        if (hasReliefAtSameTime) return;

        // Penilaian Calon (Scoring System)
        let score = 100;

        // 1. Semakan Bebanan & Masa Rehat (Kritikal mengikut video)
        const strain = this.checkTeacherWorkloadStrain(t.name, dayCode, slot.waktu);
        if (strain.hasNoRest && this.settings.avoidContinuous) {
          score -= 50; // Penalti berat jika tiada rehat
        } else if (strain.continuousCount > 0) {
          score -= (strain.continuousCount * 10);
        }

        // 2. Keutamaan Opsyen Panitia Sama
        if (this.settings.prioritizeSameSubject && t.major === slot.subjek) {
          score += 25;
        }

        // 3. Keadilan Pengagihan (Guru dengan relief 0 lebih diutamakan)
        score -= (currentCount * 20);

        // 4. Jumlah Kelas Harian (Beri kepada guru yang kelasnya lebih sedikit hari ini)
        const dailyClasses = this.getTeacherDailyPeriodsCount(t.name, dayCode);
        score -= (dailyClasses * 5);

        // 5. Guru Pentadbir (Guru Besar / GPK) kurangkan prioriti melainkan tiada pilihan
        if (t.role.includes("Guru Besar")) score -= 60;
        if (t.role.includes("GPK")) score -= 30;

        candidates.push({
          teacher: t,
          score,
          strain,
          currentReliefCount: currentCount
        });
      });

      // Susun calon dari skor tertinggi
      candidates.sort((a, b) => b.score - a.score);

      if (candidates.length > 0) {
        assignedTeacher = candidates[0].teacher;
        teacherReliefCounts[assignedTeacher.id] = (teacherReliefCounts[assignedTeacher.id] || 0) + 1;
      }

      assignments.push({
        id: `relief_${slot.id}`,
        vacantSlotId: slot.id,
        timetableId: slot.timetableId,
        kodHari: slot.kodHari,
        hari: slot.hari,
        waktu: slot.waktu,
        masa: slot.masa,
        kelas: slot.kelas,
        subjek: slot.subjek,
        originalGuru: slot.originalGuru,
        originalGuruShort: slot.originalGuruShort,
        originalGuruId: slot.originalGuruId,
        reasonCode: slot.reasonCode,
        reasonLabel: slot.reasonLabel,
        substituteTeacherId: assignedTeacher ? assignedTeacher.id : null,
        substituteTeacherName: assignedTeacher ? assignedTeacher.name : "TIADA GURU GANTI (KOSONG)",
        substituteTeacherShort: assignedTeacher ? assignedTeacher.shortName : "KOSONG",
        status: assignedTeacher ? "Auto-Assigned" : "Unassigned"
      });
    });

    this.activeAssignments = assignments;
    return assignments;
  }

  // Dapatkan senarai guru yang LAPANG (FREE) untuk slot tertentu
  // Digunakan untuk fungsi interaktif "Pindah Relief" dalam Grid Berwarna!
  getAvailableTeachersForSlot(waktu, dayCode = this.selectedDayCode, currentReliefId = null) {
    const absentTeacherIds = new Set(this.absentTeachers.map(a => a.teacherId));
    const results = [];

    this.teachersList.forEach(t => {
      // Guru tidak hadir tidak layak
      if (absentTeacherIds.has(t.id)) return;

      // Semak jika ada kelas sendiri
      const ownClass = this.getTeacherClassAtSlot(t.name, dayCode, waktu);
      if (ownClass) return; // Sedang mengajar kelas sendiri (Biru)

      // Semak jika sudah ada relief lain pada waktu ini (selain relief yang sedang dipinda)
      const existingRelief = this.activeAssignments.find(a => 
        a.id !== currentReliefId && 
        a.substituteTeacherId === t.id && 
        a.waktu === waktu
      );
      if (existingRelief) return; // Sudah pegang relief lain pada slot ini

      // Kira bilangan relief sedia ada
      const reliefCount = this.activeAssignments.filter(a => a.substituteTeacherId === t.id).length;
      const strain = this.checkTeacherWorkloadStrain(t.name, dayCode, waktu);

      results.push({
        teacherId: t.id,
        name: t.name,
        shortName: t.shortName,
        role: t.role,
        major: t.major,
        session: t.session,
        reliefCount,
        maxRelief: t.maxRelief || 3,
        strain,
        isSuitable: !strain.hasNoRest && reliefCount < (t.maxRelief || 3),
        statusLabel: strain.hasNoRest ? "Kurang Sesuai (Kelas Berturut-turut)" : "Sesuai & Lapang"
      });
    });

    // Susun: Guru yang sesuai didahulukan, kemudian jumlah relief paling sikit
    return results.sort((a, b) => {
      if (a.isSuitable === b.isSuitable) {
        return a.reliefCount - b.reliefCount;
      }
      return a.isSuitable ? -1 : 1;
    });
  }

  // Pindahkan tugas relief kepada guru lain (Interactive click-to-swap dari Grid Berwarna / Senarai)
  reassignRelief(reliefId, newTeacherId) {
    const target = this.activeAssignments.find(a => a.id === reliefId);
    if (!target) return { success: false, message: "Relief tidak dijumpai!" };

    const newTeacher = this.getTeacher(newTeacherId);
    if (!newTeacher) return { success: false, message: "Guru ganti baharu tidak sah!" };

    // Semak jika guru baru ada kelas sendiri
    const ownClass = this.getTeacherClassAtSlot(newTeacher.name, target.kodHari, target.waktu);
    if (ownClass) {
      return { 
        success: false, 
        message: `${newTeacher.shortName} mempunyai kelas (${ownClass.paparan}) pada waktu tersebut!` 
      };
    }

    // Semak jika guru baru sudah ada relief lain pada waktu yang sama
    const conflictRelief = this.activeAssignments.find(a => 
      a.id !== reliefId && 
      a.substituteTeacherId === newTeacher.id && 
      a.waktu === target.waktu
    );
    if (conflictRelief) {
      return { 
        success: false, 
        message: `${newTeacher.shortName} sudah mempunyai tugasan relief lain pada waktu tersebut!` 
      };
    }

    const previousTeacherName = target.substituteTeacherShort;
    target.substituteTeacherId = newTeacher.id;
    target.substituteTeacherName = newTeacher.name;
    target.substituteTeacherShort = newTeacher.shortName;
    target.status = "Manual-Modified";

    return {
      success: true,
      message: `Relief ${target.kelas} (${target.masa}) berjaya dipindahkan daripada ${previousTeacherName} kepada ${newTeacher.shortName}!`,
      updatedRelief: target
    };
  }

  // Dapatkan statistik pembahagian relief untuk audit keadilan
  getDistributionStatistics() {
    const stats = {};
    this.teachersList.forEach(t => {
      stats[t.id] = {
        teacher: t,
        reliefCount: 0,
        classesCount: this.getTeacherDailyPeriodsCount(t.name, this.selectedDayCode)
      };
    });

    this.activeAssignments.forEach(a => {
      if (a.substituteTeacherId && stats[a.substituteTeacherId]) {
        stats[a.substituteTeacherId].reliefCount += 1;
      }
    });

    return Object.values(stats);
  }

  // Simpan draf ke LocalStorage
  saveToDatabase() {
    const record = {
      id: `RELIEF_SKR_${this.selectedDate}_${Date.now()}`,
      date: this.selectedDate,
      dayCode: this.selectedDayCode,
      dayName: this.getDayName(this.selectedDayCode),
      absentTeachers: this.absentTeachers,
      assignments: this.activeAssignments,
      timestamp: new Date().toISOString()
    };

    const existingKey = "SKR_SAVED_RELIEF_RECORDS";
    let records = [];
    try {
      const raw = localStorage.getItem(existingKey);
      if (raw) records = JSON.parse(raw);
    } catch (e) {
      records = [];
    }

    // Ganti jika sudah ada rekod pada tarikh yang sama atau simpan baharu
    records = records.filter(r => r.date !== this.selectedDate);
    records.unshift(record);
    localStorage.setItem(existingKey, JSON.stringify(records));
    return record;
  }

  // Muat rekod yang disimpan
  loadSavedRecords() {
    try {
      const raw = localStorage.getItem("SKR_SAVED_RELIEF_RECORDS");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
}

// Eksport instance global
window.SKRangguReliefEngine = SKRangguReliefEngine;
