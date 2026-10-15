/**
 * APLIKASI UTAMA PENGURUSAN GURU GANTI (REDPEN 2.0 SK RANGGU)
 * - Paparan Lengkap Jadual Waktu Harian DARI PAGI HINGGA PETANG (962 Slot Mengajar)
 * - Sesi Pagi: Tahap 2 (06:40 Pagi - 12:30 Tengah Hari) • 38 Guru
 * - Sesi Petang: Tahap 1 (12:30 Tengah Hari - 05:50 Petang) • 16 Guru
 * - Pilihan Sesi Pantas: [Sesi Pagi] [Sesi Petang] [Keseluruhan Pagi + Petang]
 * - Pilihan Hari Pantas: [Isnin] [Selasa] [Rabu] [Khamis] [Jumaat]
 * - Navigasi Penuh Berfungsi: Jadual Relief, Jadual Induk, Rekod, Analisis, Senarai 54 Guru
 * - Interaktiviti Pindah Relief (Click-to-Move Oren ➔ Hijau)
 * - Cetakan Rasmi KPM & Slip Edaran
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Enjin Pintar
  const engine = new SKRangguReliefEngine(
    typeof INITIAL_TIMETABLE_DATA !== 'undefined' ? INITIAL_TIMETABLE_DATA : [],
    typeof SK_RANGGU_TEACHERS !== 'undefined' ? SK_RANGGU_TEACHERS : []
  );

  // Status Aplikasi
  let currentActiveTab = "relief"; // "relief", "master", "records", "analytics", "staff"
  let currentViewMode = "grid"; // "grid" atau "list"
  let selectedReliefForReassign = null;
  let activeSessionFilter = "Semua"; // Lalai ke "Semua" supaya kedua-dua Sesi Pagi & Petang terus kelihatan!
  let teacherSearchQuery = "";
  let masterSessionFilter = "Semua";

  // 2. Elemen DOM
  const elDateInput = document.getElementById('input-date');
  const elDayBadge = document.getElementById('badge-day-name');
  const elSessionSelect = document.getElementById('select-session');
  const elTeacherSelect = document.getElementById('select-absent-teacher');
  const elReasonSelect = document.getElementById('select-absent-reason');
  const elBtnAddAbsent = document.getElementById('btn-add-absent');
  const elBtnQuickDemo = document.getElementById('btn-quick-demo');
  const elAbsentChipsContainer = document.getElementById('absent-chips-container');
  const elAbsentCount = document.getElementById('absent-count');
  
  // Tetapan
  const elMaxRelief = document.getElementById('setting-max-relief');
  const elAutoAssign = document.getElementById('setting-auto-assign');
  const elSlotSplit = document.getElementById('setting-slot-split');
  const elAvoidContinuous = document.getElementById('setting-avoid-continuous');
  const elPrioritizeOption = document.getElementById('setting-prioritize-option');

  // Butang Aksi Utama
  const elBtnGenerate = document.getElementById('btn-generate-relief');
  const elBtnReset = document.getElementById('btn-reset');
  const elBtnSave = document.getElementById('btn-save-db');
  const elBtnPrint = document.getElementById('btn-print-pdf');
  const elBtnTopPrint = document.getElementById('btn-top-print');

  // Bekas Paparan Jadual
  const elDraftSection = document.getElementById('draft-section');
  const elViewSwitcherGrid = document.getElementById('btn-view-grid');
  const elViewSwitcherList = document.getElementById('btn-view-list');
  const elGridContainer = document.getElementById('grid-view-container');
  const elListContainer = document.getElementById('list-view-container');
  const elReassignBanner = document.getElementById('reassign-active-banner');
  const elReassignDetails = document.getElementById('reassign-banner-details');
  const elBtnCancelReassign = document.getElementById('btn-cancel-reassign');
  const elSearchTeacherGrid = document.getElementById('search-teacher-grid');
  const elGridStatusBadge = document.getElementById('grid-status-badge');

  // Statistik Ringkasan
  const elStatAbsentTotal = document.getElementById('stat-absent-total');
  const elStatVacantTotal = document.getElementById('stat-vacant-total');
  const elStatAssignedTotal = document.getElementById('stat-assigned-total');
  const elLiveTime = document.getElementById('live-time-display');

  // Bekas Pandangan Alternatif
  const elViewRelief = document.getElementById('view-relief-content');
  const elViewMaster = document.getElementById('view-master-content');
  const elViewRecords = document.getElementById('view-records-content');
  const elViewAnalytics = document.getElementById('view-analytics-content');
  const elViewStaff = document.getElementById('view-staff-content');
  const elMainViewTitle = document.getElementById('main-view-title');
  const elMainViewDesc = document.getElementById('main-view-desc');

  // 3. Muatkan Tarikh & Waktu Langsung
  function initDateAndTime() {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    if (elDateInput) elDateInput.value = formatted;
    updateDayFromDate(formatted);

    setInterval(() => {
      const now = new Date();
      if (elLiveTime) {
        elLiveTime.textContent = now.toLocaleTimeString('ms-MY', { hour12: true });
      }
    }, 1000);
  }

  function updateDayFromDate(dateStr) {
    const dayCode = engine.getDayCodeFromDate(dateStr);
    engine.selectedDate = dateStr;
    engine.selectedDayCode = dayCode;
    const dayName = engine.getDayName(dayCode);
    if (elDayBadge) {
      elDayBadge.textContent = `Hari ${dayName}`;
    }
    updateQuickDayTabs(dayCode);
  }

  function updateQuickDayTabs(dayCode) {
    document.querySelectorAll('.day-tab-btn').forEach(btn => {
      const bDay = parseInt(btn.getAttribute('data-day'));
      if (bDay === dayCode) {
        btn.className = 'day-tab-btn px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm font-bold transition';
      } else {
        btn.className = 'day-tab-btn px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 font-semibold transition';
      }
    });
  }

  if (elDateInput) {
    elDateInput.addEventListener('change', (e) => {
      updateDayFromDate(e.target.value);
      if (engine.absentTeachers.length > 0) {
        handleGenerate();
      } else {
        renderGridView();
      }
    });
  }

  // Listener tab hari (Isnin - Jumaat)
  document.querySelectorAll('.day-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dayCode = parseInt(btn.getAttribute('data-day'));
      engine.selectedDayCode = dayCode;
      
      const today = new Date();
      const currentDay = today.getDay() || 7;
      const diff = dayCode - currentDay;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + diff);
      const formatted = targetDate.toISOString().split('T')[0];
      
      if (elDateInput) elDateInput.value = formatted;
      engine.selectedDate = formatted;
      if (elDayBadge) elDayBadge.textContent = `Hari ${engine.getDayName(dayCode)}`;
      updateQuickDayTabs(dayCode);

      if (engine.absentTeachers.length > 0) {
        handleGenerate();
      } else {
        renderGridView();
      }
      showToast(`Jadual ditukar kepada Hari ${engine.getDayName(dayCode)}`, "info");
    });
  });

  // 4. Pengendali Pilihan Sesi Pantas (Pagi vs Petang vs Keseluruhan)
  document.querySelectorAll('.session-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const session = btn.getAttribute('data-session');
      activeSessionFilter = session;
      
      document.querySelectorAll('.session-tab-btn').forEach(b => {
        if (b.getAttribute('data-session') === session) {
          b.className = 'session-tab-btn px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5 font-bold';
        } else {
          b.className = 'session-tab-btn px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/80 text-slate-700 transition flex items-center gap-1.5 font-bold';
        }
      });

      renderGridView();
      const label = session === 'Semua' ? 'Keseluruhan Jadual (Pagi & Petang)' : `Jadual Sesi ${session}`;
      showToast(`Memaparkan ${label}`, "info");
    });
  });

  // 5. Isi Pilihan Guru & Sebab
  function populateDropdowns() {
    if (elTeacherSelect) {
      elTeacherSelect.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
      SK_RANGGU_TEACHERS.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = `${t.name} (${t.role} • Sesi ${t.session})`;
        elTeacherSelect.appendChild(opt);
      });
    }

    if (elReasonSelect) {
      elReasonSelect.innerHTML = '';
      SK_RANGGU_CONFIG.reliefReasons.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.code;
        opt.textContent = r.label;
        elReasonSelect.appendChild(opt);
      });
    }
  }

  // 6. Tambah & Buang Guru Tidak Hadir
  if (elBtnAddAbsent) {
    elBtnAddAbsent.addEventListener('click', () => {
      const teacherId = parseInt(elTeacherSelect.value);
      const reasonCode = elReasonSelect.value;
      const reasonObj = SK_RANGGU_CONFIG.reliefReasons.find(r => r.code === reasonCode);
      const reasonLabel = reasonObj ? reasonObj.label : "Cuti Rehat Khas (CRK)";

      if (!teacherId) {
        showToast("Sila pilih guru yang tidak hadir terlebih dahulu!", "warning");
        return;
      }

      const success = engine.addAbsentTeacher(teacherId, reasonCode, reasonLabel);
      if (!success) {
        showToast("Guru ini sudah ada dalam senarai tidak hadir!", "warning");
        return;
      }

      renderAbsentChips();
      elTeacherSelect.value = '';
      handleGenerate();
      showToast("Guru berjaya ditambah ke senarai tidak hadir.", "success");
    });
  }

  // Butang Demo Pantas
  if (elBtnQuickDemo) {
    elBtnQuickDemo.addEventListener('click', () => {
      const demoDate = "2026-10-12"; // Isnin
      if (elDateInput) elDateInput.value = demoDate;
      engine.selectedDate = demoDate;
      engine.selectedDayCode = 1;
      if (elDayBadge) elDayBadge.textContent = "Hari Isnin";
      updateQuickDayTabs(1);

      // Tambah 1 guru pagi & 1 guru petang untuk demonstrasi menyeluruh!
      engine.absentTeachers = [];
      engine.addAbsentTeacher(37, "CRK", "Cuti Rehat Khas (CRK)"); // Cikgu Rini Daud (Pagi)
      engine.addAbsentTeacher(8, "MC", "Cuti Sakit (MC)");        // Cikgu Ainatun Nadhirah (Petang)

      renderAbsentChips();
      handleGenerate();
      showToast("Demo Dimuatkan: Cikgu Rini (Pagi) & Cikgu Ainatun (Petang) tidak hadir. Jadual relief sedia dipratonton!", "success");
    });
  }

  function renderAbsentChips() {
    if (!elAbsentChipsContainer) return;
    elAbsentChipsContainer.innerHTML = '';
    const absent = engine.absentTeachers;
    if (elAbsentCount) elAbsentCount.textContent = absent.length;

    if (absent.length === 0) {
      elAbsentChipsContainer.innerHTML = '<span class="text-xs text-slate-400 italic">Tiada guru tidak hadir. Jadual waktu mengajar harian dipaparkan secara normal dari Pagi hingga Petang di bawah.</span>';
      return;
    }

    absent.forEach(t => {
      const chip = document.createElement('div');
      chip.className = 'inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition hover:shadow';
      chip.innerHTML = `
        <span class="font-bold">${t.shortName}</span>
        <span class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">${t.session}</span>
        <span class="bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-semibold">${t.reasonCode}</span>
        <button type="button" class="text-slate-400 hover:text-red-500 font-bold ml-1 transition" data-id="${t.teacherId}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      chip.querySelector('button').addEventListener('click', () => {
        engine.removeAbsentTeacher(t.teacherId);
        renderAbsentChips();
        if (engine.absentTeachers.length > 0) {
          handleGenerate();
        } else {
          engine.activeAssignments = [];
          cancelReassignMode();
          renderGridView();
        }
      });

      elAbsentChipsContainer.appendChild(chip);
    });
  }

  // 7. Jana Jadual Relief (Langkah 2)
  if (elBtnGenerate) {
    elBtnGenerate.addEventListener('click', handleGenerate);
  }

  function handleGenerate() {
    if (engine.absentTeachers.length === 0) {
      showToast("Sila pilih sekurang-kurangnya seorang guru tidak hadir untuk menjana relief!", "warning");
      return;
    }

    if (elMaxRelief) engine.settings.maxReliefPerTeacher = parseInt(elMaxRelief.value) || 2;
    if (elAutoAssign) engine.settings.autoAssign = elAutoAssign.checked;
    if (elSlotSplit) engine.settings.slotSplit = parseInt(elSlotSplit.value) || 30;
    if (elAvoidContinuous) engine.settings.avoidContinuous = elAvoidContinuous.checked;
    if (elPrioritizeOption) engine.settings.prioritizeSameSubject = elPrioritizeOption.checked;

    const assignments = engine.generateRelief();
    cancelReassignMode();

    if (elStatAbsentTotal) elStatAbsentTotal.textContent = engine.absentTeachers.length;
    if (elStatVacantTotal) elStatVacantTotal.textContent = assignments.length;
    const assignedCount = assignments.filter(a => a.substituteTeacherId !== null).length;
    if (elStatAssignedTotal) elStatAssignedTotal.textContent = assignedCount;

    if (elGridStatusBadge) {
      elGridStatusBadge.textContent = "RELIEF DIJANA (DRAF)";
      elGridStatusBadge.className = "bg-orange-100 text-orange-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-orange-200 animate-pulse";
    }

    renderCurrentView();
    showToast(`Jadual relief dijana untuk Sesi Pagi & Petang (${assignments.length} waktu perlu diganti)`, "success");
  }

  // 8. Penukar Paparan Grid vs Senarai
  if (elViewSwitcherGrid) {
    elViewSwitcherGrid.addEventListener('click', () => {
      currentViewMode = "grid";
      elViewSwitcherGrid.className = 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5 font-bold';
      if (elViewSwitcherList) elViewSwitcherList.className = 'px-3 py-1.5 rounded-lg bg-white text-slate-700 shadow-sm transition flex items-center gap-1.5 font-semibold';
      renderCurrentView();
    });
  }

  if (elViewSwitcherList) {
    elViewSwitcherList.addEventListener('click', () => {
      currentViewMode = "list";
      elViewSwitcherList.className = 'px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm transition flex items-center gap-1.5 font-bold';
      if (elViewSwitcherGrid) elViewSwitcherGrid.className = 'px-3 py-1.5 rounded-lg bg-white text-slate-700 shadow-sm transition flex items-center gap-1.5 font-semibold';
      renderCurrentView();
    });
  }

  function renderCurrentView() {
    if (currentViewMode === "grid") {
      if (elGridContainer) elGridContainer.classList.remove('hidden');
      if (elListContainer) elListContainer.classList.add('hidden');
      renderGridView();
    } else {
      if (elGridContainer) elGridContainer.classList.add('hidden');
      if (elListContainer) elListContainer.classList.remove('hidden');
      renderListView();
    }
  }

  if (elSearchTeacherGrid) {
    elSearchTeacherGrid.addEventListener('input', (e) => {
      teacherSearchQuery = e.target.value.toLowerCase().trim();
      renderGridView();
    });
  }

  // =========================================================================
  // 9. PAPARAN GRID BERWARNA HARIAN LENGKAP (DARI PAGI HINGGA PETANG)
  // =========================================================================
  function renderGridView() {
    if (!elGridContainer) return;

    const dayCode = engine.selectedDayCode;
    const absentTeacherIds = new Set(engine.absentTeachers.map(a => a.teacherId));

    let availableTargetTeacherIds = new Set();
    if (selectedReliefForReassign) {
      const availables = engine.getAvailableTeachersForSlot(
        selectedReliefForReassign.waktu,
        selectedReliefForReassign.kodHari,
        selectedReliefForReassign.id,
        selectedReliefForReassign.sesi
      );
      availables.forEach(c => availableTargetTeacherIds.add(c.teacherId));
    }

    // Tapis guru Sesi Pagi & Sesi Petang
    const pagiTeachers = SK_RANGGU_TEACHERS.filter(t => t.session === "Pagi" && matchSearch(t));
    const petangTeachers = SK_RANGGU_TEACHERS.filter(t => t.session === "Petang" && matchSearch(t));

    function matchSearch(t) {
      if (!teacherSearchQuery) return true;
      return t.name.toLowerCase().includes(teacherSearchQuery) || 
             t.shortName.toLowerCase().includes(teacherSearchQuery) ||
             t.role.toLowerCase().includes(teacherSearchQuery);
    }

    let finalHtml = "";

    // JIKA SESI PAGI ATAU KESELURUHAN DIPILIH
    if (activeSessionFilter === "Pagi" || activeSessionFilter === "Semua") {
      finalHtml += buildSessionTableHtml({
        title: "🌅 SIDANG PAGI (TAHAP 2: TAHUN 4, 5, 6 • 06:40 PAGI - 12:30 TGH)",
        badgeColor: "bg-sky-100 text-sky-900 border-sky-300",
        periods: TIMETABLE_PERIODS_PAGI,
        teachers: pagiTeachers,
        sessionName: "Pagi",
        dayCode,
        absentTeacherIds,
        availableTargetTeacherIds
      });
    }

    // JIKA KEDUA-DUA SESI DIPAPARKAN (PEMISAH ESTETIK)
    if (activeSessionFilter === "Semua") {
      finalHtml += `<div class="my-6 border-t-2 border-dashed border-indigo-200"></div>`;
    }

    // JIKA SESI PETANG ATAU KESELURUHAN DIPILIH
    if (activeSessionFilter === "Petang" || activeSessionFilter === "Semua") {
      finalHtml += buildSessionTableHtml({
        title: "🌇 SIDANG PETANG (TAHAP 1: TAHUN 1, 2, 3 • 12:30 TGH - 05:50 PTG)",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
        periods: TIMETABLE_PERIODS_PETANG,
        teachers: petangTeachers,
        sessionName: "Petang",
        dayCode,
        absentTeacherIds,
        availableTargetTeacherIds
      });
    }

    elGridContainer.innerHTML = finalHtml;
    attachGridEventListeners();
  }

  // Fungsi Pembina HTML Jadual Matriks Mengikut Sesi
  function buildSessionTableHtml(config) {
    const { title, badgeColor, periods, teachers, sessionName, dayCode, absentTeacherIds, availableTargetTeacherIds } = config;

    let html = `
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase border ${badgeColor}">
            ${title}
          </span>
          <span class="text-xs text-slate-500 font-semibold">(${teachers.length} Guru)</span>
        </div>
        <div class="text-[11px] text-slate-500 font-semibold hidden sm:block">
          Hari: <strong class="text-indigo-900">${engine.getDayName(dayCode).toUpperCase()}</strong>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm mb-4">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-indigo-950 text-white font-bold border-b border-indigo-900">
              <th class="p-2.5 text-left w-64 sticky left-0 bg-indigo-950 z-20 shadow-md">
                GURU (${teachers.length})
              </th>
    `;

    // Header Waktu bagi sesi ini
    periods.forEach(p => {
      if (p.isRehat) {
        html += `<th class="p-2 text-center bg-indigo-900/80 text-[10px] w-14">REHAT<br><span class="text-[9px] opacity-75">${p.masa}</span></th>`;
      } else {
        html += `<th class="p-2 text-center min-w-[78px] text-[10px]">${p.label}<br><span class="text-[9px] opacity-75 font-normal">${p.masa}</span></th>`;
      }
    });

    html += `
              <th class="p-2.5 text-center w-20 sticky right-0 bg-indigo-950 z-20">RELIEF</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
    `;

    // Baris Setiap Guru Dalam Sesi Ini
    teachers.forEach(t => {
      const isAbsent = absentTeacherIds.has(t.id);
      const absentInfo = isAbsent ? engine.absentTeachers.find(a => a.teacherId === t.id) : null;
      const teacherReliefs = engine.activeAssignments.filter(a => a.substituteTeacherId === t.id);
      const reliefCount = teacherReliefs.length;

      html += `
        <tr class="hover:bg-slate-50/80 transition-colors ${isAbsent ? 'bg-purple-50/40' : ''}">
          <!-- Kolum Guru -->
          <td class="p-2.5 font-medium text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isAbsent ? 'bg-purple-200 text-purple-800' : 'bg-slate-100 text-slate-700'}">
                ${t.id}
              </div>
              <div class="truncate max-w-[190px]">
                <div class="font-bold text-slate-900 truncate" title="${t.name}">${t.shortName}</div>
                <div class="text-[10px] text-slate-500 truncate">${t.role}</div>
              </div>
            </div>
            ${isAbsent ? `<span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">TIDAK HADIR: ${absentInfo.reasonCode}</span>` : ''}
          </td>
      `;

      // Setiap Waktu Mengajar bagi Sesi ini
      periods.forEach(p => {
        if (p.isRehat) {
          html += `<td class="p-1 text-center bg-slate-100/60 border-r border-slate-100 text-[10px] text-slate-400 font-semibold select-none">REHAT</td>`;
          return;
        }

        const waktu = p.waktu;
        const reliefAssigned = engine.activeAssignments.find(a => a.substituteTeacherId === t.id && a.waktu === waktu && (a.sesi ? a.sesi === sessionName : true));
        const ownClass = engine.getTeacherClassAtSlot(t.name, dayCode, waktu, sessionName);

        // 1. JADUAL RELIEF (OREN)
        if (reliefAssigned) {
          const isSelected = selectedReliefForReassign && selectedReliefForReassign.id === reliefAssigned.id;
          html += `
            <td class="p-1 text-center border-r border-slate-100">
              <div 
                class="matrix-cell cell-relief rounded-lg p-1.5 text-[10px] leading-tight flex flex-col justify-center items-center ${isSelected ? 'active-selected' : ''}"
                data-relief-id="${reliefAssigned.id}"
                title="RELIEF: ${reliefAssigned.kelas} ${reliefAssigned.subjek} (Guru Asal: ${reliefAssigned.originalGuruShort}) - Klik untuk ubah guru ganti"
              >
                <span class="font-extrabold uppercase tracking-wide text-[8px] bg-black/25 px-1 rounded mb-0.5">RELIEF</span>
                <span class="font-bold">${reliefAssigned.kelas}</span>
                <span class="text-[9px] opacity-90">${reliefAssigned.subjek}</span>
                <span class="text-[8px] opacity-75 truncate max-w-full">Ganti: ${reliefAssigned.originalGuruShort}</span>
              </div>
            </td>
          `;
        }
        // 2. MOD PINDAH RELIEF (HIJAU BERDENYUT)
        else if (selectedReliefForReassign && selectedReliefForReassign.waktu === waktu && availableTargetTeacherIds.has(t.id) && selectedReliefForReassign.sesi === sessionName) {
          const strain = engine.checkTeacherWorkloadStrain(t.name, dayCode, waktu);
          html += `
            <td class="p-1 text-center border-r border-slate-100">
              <div 
                class="matrix-cell cell-available-target rounded-lg p-1 text-[10px] leading-tight flex flex-col justify-center items-center group cursor-pointer"
                data-target-teacher-id="${t.id}"
                data-target-teacher-name="${t.shortName}"
                title="Slot Bebas! Klik untuk pindahkan relief kepada ${t.shortName}"
              >
                <i class="fa-solid fa-arrow-down-to-bracket text-emerald-600 group-hover:text-white mb-0.5"></i>
                <span class="font-bold text-[9px]">PILIH</span>
                ${strain.hasNoRest ? '<span class="text-[7px] text-amber-600 bg-amber-50 px-1 rounded">2 jam kelas</span>' : '<span class="text-[7px] text-emerald-700 font-semibold">Lapang</span>'}
              </div>
            </td>
          `;
        }
        // 3. JADUAL ASAL (BIRU)
        else if (ownClass) {
          if (isAbsent) {
            html += `
              <td class="p-1 text-center border-r border-slate-100">
                <div class="matrix-cell bg-purple-100 text-purple-900 border border-purple-300 rounded-lg p-1.5 text-[10px] leading-tight flex flex-col justify-center items-center opacity-70">
                  <span class="text-[8px] font-bold text-purple-700">KOSONG</span>
                  <span class="font-bold">${ownClass.kelas}</span>
                  <span class="text-[9px]">${ownClass.subjek}</span>
                </div>
              </td>
            `;
          } else {
            html += `
              <td class="p-1 text-center border-r border-slate-100">
                <div class="matrix-cell cell-own-class rounded-lg p-1.5 text-[10px] leading-tight flex flex-col justify-center items-center" title="${ownClass.paparan} • ${ownClass.masa}">
                  <span class="font-bold">${ownClass.kelas}</span>
                  <span class="text-[9px] font-normal opacity-90">${ownClass.subjek}</span>
                </div>
              </td>
            `;
          }
        }
        // 4. SLOT KOSONG
        else {
          html += `
            <td class="p-1 text-center border-r border-slate-100">
              <div class="matrix-cell cell-free-neutral rounded-lg flex items-center justify-center text-[10px] font-mono text-slate-300">
                -
              </div>
            </td>
          `;
        }
      });

      // Kolum Jumlah Relief
      html += `
          <td class="p-2 text-center sticky right-0 bg-white z-10 border-l border-slate-200">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${reliefCount > 0 ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400'}">
              ${reliefCount}
            </span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    return html;
  }

  // Pasang Listener Klik Pindah Relief
  function attachGridEventListeners() {
    if (!elGridContainer) return;

    elGridContainer.querySelectorAll('.cell-relief').forEach(cell => {
      cell.addEventListener('click', () => {
        const reliefId = cell.getAttribute('data-relief-id');
        const relief = engine.activeAssignments.find(a => a.id === reliefId);
        if (!relief) return;

        selectedReliefForReassign = relief;

        if (elReassignBanner) elReassignBanner.classList.remove('hidden');
        if (elReassignDetails) {
          elReassignDetails.innerHTML = `
            Anda sedang menukar relief untuk <strong>${relief.kelas} (${relief.subjek})</strong> pada waktu <strong>W${relief.waktu} (${relief.masa})</strong> [Sesi ${relief.sesi || 'Pagi'}].<br>
            Guru semasa: <span class="bg-orange-600 px-1.5 py-0.5 rounded text-white font-bold">${relief.substituteTeacherShort}</span>. 
            <span class="text-amber-200 underline font-semibold">Klik mana-mana kotak HIJAU berdenyut untuk memindahkan tugas ini kepada guru berkenaan.</span>
          `;
        }

        renderGridView();
        showToast(`Mod Pindah Aktif: Pilih mana-mana slot hijau untuk gantikan ${relief.substituteTeacherShort}.`, "info");
      });
    });

    elGridContainer.querySelectorAll('.cell-available-target').forEach(cell => {
      cell.addEventListener('click', () => {
        if (!selectedReliefForReassign) return;

        const newTeacherId = parseInt(cell.getAttribute('data-target-teacher-id'));
        const result = engine.reassignRelief(selectedReliefForReassign.id, newTeacherId);
        
        if (result.success) {
          showToast(result.message, "success");
          cancelReassignMode();
          renderCurrentView();
        } else {
          showToast(result.message, "error");
        }
      });
    });
  }

  if (elBtnCancelReassign) {
    elBtnCancelReassign.addEventListener('click', cancelReassignMode);
  }

  function cancelReassignMode() {
    selectedReliefForReassign = null;
    if (elReassignBanner) elReassignBanner.classList.add('hidden');
    renderGridView();
  }

  // =========================================================================
  // 10. PAPARAN SENARAI (LIST VIEW)
  // =========================================================================
  function renderListView() {
    if (!elListContainer) return;

    const assignments = engine.activeAssignments;
    if (assignments.length === 0) {
      elListContainer.innerHTML = `
        <div class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <i class="fa-solid fa-clipboard-list text-3xl text-slate-300 mb-2"></i>
          <div class="font-bold">Tiada Jadual Relief Dijana</div>
          <p class="text-xs text-slate-400 mt-1">Sila pilih guru tidak hadir di atas dan klik "2. JANA JADUAL RELIEF".</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm divide-y divide-slate-200">
          <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
            <tr>
              <th class="p-3 text-center w-12">BIL</th>
              <th class="p-3">SESI & MASA</th>
              <th class="p-3">KELAS & SUBJEK</th>
              <th class="p-3">GURU ASAL (TIDAK HADIR)</th>
              <th class="p-3">GURU GANTI (DICADANGKAN / TERKINI)</th>
              <th class="p-3 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
    `;

    assignments.forEach((item, index) => {
      const availableTeachers = engine.getAvailableTeachersForSlot(item.waktu, item.kodHari, item.id, item.sesi);

      html += `
        <tr class="hover:bg-indigo-50/40 transition">
          <td class="p-3 text-center font-bold text-slate-400">${index + 1}</td>
          <td class="p-3 font-medium">
            <span class="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold mr-1">
              ${item.sesi || 'Pagi'}
            </span>
            <span class="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-bold mr-1.5">W${item.waktu}</span>
            <span class="font-mono text-xs text-slate-600">${item.masa}</span>
          </td>
          <td class="p-3">
            <div class="font-bold text-slate-900">${item.kelas}</div>
            <div class="text-xs text-indigo-600 font-semibold">${item.subjek}</div>
          </td>
          <td class="p-3">
            <div class="font-medium text-slate-900">${item.originalGuru}</div>
            <span class="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              ${item.reasonLabel}
            </span>
          </td>
          <td class="p-3">
            <select class="select-substitute-inline border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64" data-relief-id="${item.id}">
              <option value="">-- Pilih Guru Ganti --</option>
      `;

      if (item.substituteTeacherId) {
        html += `<option value="${item.substituteTeacherId}" selected>${item.substituteTeacherName} [Semasa]</option>`;
      }

      availableTeachers.forEach(c => {
        if (c.teacherId !== item.substituteTeacherId) {
          html += `<option value="${c.teacherId}">${c.name} (${c.reliefCount} Relief) - ${c.statusLabel}</option>`;
        }
      });

      html += `
            </select>
          </td>
          <td class="p-3 text-center">
            ${item.substituteTeacherId ? 
              `<span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">
                <i class="fa-solid fa-check"></i> Lengkap
              </span>` : 
              `<span class="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">
                <i class="fa-solid fa-triangle-exclamation"></i> Kosong
              </span>`
            }
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    elListContainer.innerHTML = html;

    elListContainer.querySelectorAll('.select-substitute-inline').forEach(select => {
      select.addEventListener('change', (e) => {
        const reliefId = select.getAttribute('data-relief-id');
        const newTeacherId = parseInt(e.target.value);
        if (!newTeacherId) return;

        const result = engine.reassignRelief(reliefId, newTeacherId);
        if (result.success) {
          showToast(result.message, "success");
          renderCurrentView();
        } else {
          showToast(result.message, "error");
        }
      });
    });
  }

  // =========================================================================
  // 11. NAVIGASI TAB UTAMA
  // =========================================================================
  function switchMainTab(tabKey) {
    currentActiveTab = tabKey;

    if (elViewRelief) elViewRelief.classList.add('hidden');
    if (elViewMaster) elViewMaster.classList.add('hidden');
    if (elViewRecords) elViewRecords.classList.add('hidden');
    if (elViewAnalytics) elViewAnalytics.classList.add('hidden');
    if (elViewStaff) elViewStaff.classList.add('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      const v = btn.getAttribute('data-view');
      if (v === tabKey) {
        btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 transition text-left';
      } else {
        btn.className = 'nav-btn w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white text-indigo-200 transition text-left';
      }
    });

    document.querySelectorAll('.top-tab-btn').forEach(btn => {
      const v = btn.getAttribute('data-view');
      if (v === tabKey) {
        btn.className = 'top-tab-btn px-3 py-1.5 rounded-lg bg-white text-indigo-700 shadow-sm font-bold transition flex items-center gap-1.5';
      } else {
        btn.className = 'top-tab-btn px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5 font-semibold';
      }
    });

    if (tabKey === "relief") {
      if (elViewRelief) elViewRelief.classList.remove('hidden');
      if (elMainViewTitle) elMainViewTitle.textContent = "Pengurusan Guru Ganti (Relief)";
      if (elMainViewDesc) elMainViewDesc.textContent = "Penjanaan jadual relief pintar, semakan jadual waktu mengajar harian & slip edaran rasmi";
      renderGridView();
    } else if (tabKey === "master") {
      if (elViewMaster) elViewMaster.classList.remove('hidden');
      if (elMainViewTitle) elMainViewTitle.textContent = "Jadual Waktu Induk Sekolah (Pagi & Petang)";
      if (elMainViewDesc) elMainViewDesc.textContent = "962 slot waktu mengajar rasmi bagi 54 orang guru (Sesi Pagi & Sesi Petang 2026)";
      renderMasterTimetable();
    } else if (tabKey === "records") {
      if (elViewRecords) elViewRecords.classList.remove('hidden');
      if (elMainViewTitle) elMainViewTitle.textContent = "Arkib Rekod Jadual Relief";
      if (elMainViewDesc) elMainViewDesc.textContent = "Senarai jadual relief yang telah disimpan ke pangkalan data tempatan";
      renderSavedRecordsTable();
    } else if (tabKey === "analytics") {
      if (elViewAnalytics) elViewAnalytics.classList.remove('hidden');
      if (elMainViewTitle) elMainViewTitle.textContent = "Analisis Bebanan & Agihan Relief";
      if (elMainViewDesc) elMainViewDesc.textContent = "Pemantauan keadilan agihan waktu mengajar dan kekerapan relief bagi semua guru";
      renderAnalyticsTable();
    } else if (tabKey === "staff") {
      if (elViewStaff) elViewStaff.classList.remove('hidden');
      if (elMainViewTitle) elMainViewTitle.textContent = "Direktori 54 Guru & Staf SK Ranggu";
      if (elMainViewDesc) elMainViewDesc.textContent = "Senarai penuh warga pendidik SK Ranggu berserta jawatan, sesi dan panitia";
      renderStaffDirectory();
    }
  }

  document.querySelectorAll('.nav-btn, .top-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-view');
      if (v) switchMainTab(v);
    });
  });

  // =========================================================================
  // 12. PAPARAN JADUAL WAKTU INDUK LENGKAP (962 SLOT PAGI & PETANG)
  // =========================================================================
  function renderMasterTimetable() {
    const container = document.getElementById('master-timetable-container');
    if (!container) return;

    const data = engine.timetableData;
    const dayCode = engine.selectedDayCode;
    const dayName = engine.getDayName(dayCode);

    // Tapis slot mengikut hari dan sesi master
    let daySlots = data.filter(d => d.kodHari === dayCode);
    if (masterSessionFilter !== "Semua") {
      daySlots = daySlots.filter(d => d.sesi === masterSessionFilter);
    }

    let html = `
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <!-- Pilihan Hari Induk -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700">Pilih Hari:</span>
          <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
            <button class="btn-master-day px-2.5 py-1 rounded ${dayCode === 1 ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-day="1">Isnin</button>
            <button class="btn-master-day px-2.5 py-1 rounded ${dayCode === 2 ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-day="2">Selasa</button>
            <button class="btn-master-day px-2.5 py-1 rounded ${dayCode === 3 ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-day="3">Rabu</button>
            <button class="btn-master-day px-2.5 py-1 rounded ${dayCode === 4 ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-day="4">Khamis</button>
            <button class="btn-master-day px-2.5 py-1 rounded ${dayCode === 5 ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-day="5">Jumaat</button>
          </div>
        </div>

        <!-- Pilihan Sesi Induk -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700">Tapis Sesi:</span>
          <div class="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
            <button class="btn-master-session px-2.5 py-1 rounded ${masterSessionFilter === 'Semua' ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-session="Semua">Semua Sesi</button>
            <button class="btn-master-session px-2.5 py-1 rounded ${masterSessionFilter === 'Pagi' ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-session="Pagi">Sesi Pagi</button>
            <button class="btn-master-session px-2.5 py-1 rounded ${masterSessionFilter === 'Petang' ? 'bg-indigo-600 text-white' : 'text-slate-600'}" data-session="Petang">Sesi Petang</button>
          </div>
        </div>

        <div class="text-xs text-slate-500">
          Memaparkan <strong>${daySlots.length}</strong> slot mengajar pada <strong>Hari ${dayName}</strong>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table class="w-full text-xs text-left divide-y divide-slate-200">
          <thead class="bg-indigo-950 text-white font-bold uppercase text-[11px]">
            <tr>
              <th class="p-3 text-center w-12">BIL</th>
              <th class="p-3">GURU</th>
              <th class="p-3 text-center">SESI</th>
              <th class="p-3">WAKTU & MASA</th>
              <th class="p-3">KELAS</th>
              <th class="p-3">SUBJEK</th>
              <th class="p-3">PAPARAN JADUAL</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
    `;

    daySlots.forEach((slot, idx) => {
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5 text-center font-bold text-slate-400">${idx + 1}</td>
          <td class="p-2.5 font-bold text-slate-900">${slot.guru}</td>
          <td class="p-2.5 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${slot.sesi === 'Pagi' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
              ${slot.sesi || 'Pagi'}
            </span>
          </td>
          <td class="p-2.5 font-mono text-slate-600">
            <span class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-800 mr-1">W${slot.waktu}</span>
            ${slot.masa}
          </td>
          <td class="p-2.5 font-bold text-indigo-700">${slot.kelas}</td>
          <td class="p-2.5 font-semibold text-slate-700">${slot.subjek}</td>
          <td class="p-2.5">
            <span class="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
              ${slot.paparan}
            </span>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;

    container.querySelectorAll('.btn-master-day').forEach(b => {
      b.addEventListener('click', () => {
        engine.selectedDayCode = parseInt(b.getAttribute('data-day'));
        renderMasterTimetable();
      });
    });

    container.querySelectorAll('.btn-master-session').forEach(b => {
      b.addEventListener('click', () => {
        masterSessionFilter = b.getAttribute('data-session');
        renderMasterTimetable();
      });
    });
  }

  // =========================================================================
  // 13. ANALISIS BEBANAN GURU
  // =========================================================================
  function renderAnalyticsTable() {
    const container = document.getElementById('analytics-table-container');
    if (!container) return;

    const stats = engine.getDistributionStatistics();

    let html = `
      <table class="w-full text-xs text-left divide-y divide-slate-200">
        <thead class="bg-indigo-950 text-white font-bold uppercase text-[11px]">
          <tr>
            <th class="p-3 text-center w-12">ID</th>
            <th class="p-3">NAMA GURU</th>
            <th class="p-3">JAWATAN / PERANAN</th>
            <th class="p-3 text-center">SESI</th>
            <th class="p-3 text-center">KELAS HARI INI</th>
            <th class="p-3 text-center">JUMLAH RELIEF</th>
            <th class="p-3 text-center">STATUS BEBANAN</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
    `;

    stats.forEach(st => {
      const t = st.teacher;
      const isOverload = st.reliefCount > 2;
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5 text-center font-bold text-slate-400">${t.id}</td>
          <td class="p-2.5 font-bold text-slate-900">${t.name}</td>
          <td class="p-2.5 text-slate-600">${t.role}</td>
          <td class="p-2.5 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.session === 'Pagi' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}">
              ${t.session}
            </span>
          </td>
          <td class="p-2.5 text-center font-bold font-mono">${st.classesCount} Waktu</td>
          <td class="p-2.5 text-center">
            <span class="inline-block px-2 py-0.5 rounded font-bold font-mono ${st.reliefCount > 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}">
              ${st.reliefCount}
            </span>
          </td>
          <td class="p-2.5 text-center">
            ${isOverload ? 
              `<span class="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">Maksima</span>` : 
              `<span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Seimbang</span>`
            }
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // =========================================================================
  // 14. DIREKTORI 54 GURU & STAF
  // =========================================================================
  function renderStaffDirectory() {
    const container = document.getElementById('staff-directory-container');
    if (!container) return;

    let html = `
      <table class="w-full text-xs text-left divide-y divide-slate-200">
        <thead class="bg-indigo-950 text-white font-bold uppercase text-[11px]">
          <tr>
            <th class="p-3 text-center w-12">BIL</th>
            <th class="p-3">NAMA PENUH</th>
            <th class="p-3">NAMA SINGKATAN</th>
            <th class="p-3">JAWATAN / PERANAN</th>
            <th class="p-3">OPSYEN PANITIA</th>
            <th class="p-3 text-center">SESI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
    `;

    SK_RANGGU_TEACHERS.forEach((t, i) => {
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5 text-center font-bold text-slate-400">${i + 1}</td>
          <td class="p-2.5 font-bold text-slate-900">${t.name}</td>
          <td class="p-2.5 text-indigo-700 font-semibold">${t.shortName}</td>
          <td class="p-2.5 text-slate-600">${t.role}</td>
          <td class="p-2.5">
            <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">
              ${t.major}
            </span>
          </td>
          <td class="p-2.5 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.session === 'Pagi' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}">
              ${t.session}
            </span>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // =========================================================================
  // 15. SIMPAN & MUAT REKOD LOCALSTORAGE
  // =========================================================================
  if (elBtnSave) {
    elBtnSave.addEventListener('click', () => {
      if (engine.activeAssignments.length === 0) {
        showToast("Tiada jadual relief untuk disimpan!", "warning");
        return;
      }

      const saved = engine.saveToDatabase();
      showToast(`Jadual relief bagi tarikh ${saved.date} berjaya disimpan ke pangkalan data!`, "success");
      renderSavedRecordsTable();
    });
  }

  function renderSavedRecordsTable() {
    const container = document.getElementById('saved-records-container');
    if (!container) return;

    const records = engine.loadSavedRecords();
    if (records.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs">Tiada rekod relief disimpan dalam arkib.</div>';
      return;
    }

    let html = `
      <table class="w-full text-xs text-left divide-y divide-slate-200">
        <thead class="bg-slate-50 text-slate-600 font-bold uppercase text-[11px]">
          <tr>
            <th class="p-3">TARIKH</th>
            <th class="p-3">HARI</th>
            <th class="p-3">GURU TIDAK HADIR</th>
            <th class="p-3 text-center">JUMLAH WAKTU</th>
            <th class="p-3 text-center">AKSI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
    `;

    records.forEach(r => {
      const absentList = r.absentTeachers.map(a => a.shortName).join(', ');
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-bold text-slate-900">${r.date}</td>
          <td class="p-3 font-semibold text-indigo-700">${r.dayName}</td>
          <td class="p-3 text-slate-600 truncate max-w-xs" title="${absentList}">${absentList}</td>
          <td class="p-3 text-center font-bold text-indigo-600 font-mono">${r.assignments.length} Waktu</td>
          <td class="p-3 text-center">
            <button class="btn-load-record bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-sm transition mr-1" data-date="${r.date}">
              Muat Semula
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    container.querySelectorAll('.btn-load-record').forEach(btn => {
      btn.addEventListener('click', () => {
        const date = btn.getAttribute('data-date');
        const target = records.find(r => r.date === date);
        if (target) {
          engine.selectedDate = target.date;
          engine.selectedDayCode = target.dayCode;
          engine.absentTeachers = target.absentTeachers;
          engine.activeAssignments = target.assignments;
          if (elDateInput) elDateInput.value = target.date;
          updateDayFromDate(target.date);
          renderAbsentChips();
          switchMainTab("relief");
          renderCurrentView();
          showToast(`Rekod relief bagi tarikh ${target.date} berjaya dimuatkan semula!`, "info");
        }
      });
    });
  }

  // =========================================================================
  // 16. CETAKAN RASMI KPM & SLIP EDARAN
  // =========================================================================
  if (elBtnPrint) elBtnPrint.addEventListener('click', prepareAndPrint);
  if (elBtnTopPrint) elBtnTopPrint.addEventListener('click', prepareAndPrint);

  function prepareAndPrint() {
    const assignments = engine.activeAssignments;
    if (assignments.length === 0) {
      showToast("Sila jana jadual relief terlebih dahulu sebelum mencetak!", "warning");
      return;
    }

    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const dayName = engine.getDayName(engine.selectedDayCode);
    const dateFormatted = new Date(engine.selectedDate).toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let html = `
      <div class="print-page-break">
        <div class="text-center font-bold text-sm uppercase mb-4 text-slate-800 border-b pb-2">
          SLIP PEMBERITAHUAN GURU GANTI (RELIEF) • SEKOLAH KEBANGSAAN RANGGU, TAWAU
        </div>
        <div class="grid grid-cols-2 gap-4">
    `;

    assignments.forEach(item => {
      if (!item.substituteTeacherId) return;

      html += `
        <div class="kpm-slip-box text-xs">
          <div class="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <div class="flex items-center gap-2">
              <img src="assets/logo-skrg.png" class="w-8 h-8 object-contain" alt="SK Ranggu Logo">
              <div>
                <div class="font-extrabold text-[11px] leading-tight">SK RANGGU, TAWAU (XBA3037)</div>
                <div class="text-[9px] text-slate-500">Peti Surat 842, 91008 Tawau, Sabah</div>
              </div>
            </div>
            <div class="text-right">
              <span class="bg-slate-100 border border-slate-300 font-bold px-1.5 py-0.5 rounded text-[9px]">SLIP RELIEF</span>
            </div>
          </div>

          <div class="space-y-1 mb-2 text-[10.5px]">
            <div><strong>Kepada:</strong> <span class="uppercase font-bold underline">${item.substituteTeacherName}</span></div>
            <div><strong>Tarikh & Hari:</strong> ${dateFormatted} (${dayName}) • <span class="font-bold text-indigo-700">Sesi ${item.sesi || 'Pagi'}</span></div>
            <div><strong>Waktu / Masa:</strong> <span class="bg-slate-100 font-mono font-bold px-1 rounded">Waktu ${item.waktu} (${item.masa})</span></div>
            <div><strong>Kelas & Subjek:</strong> <span class="font-bold">${item.kelas}</span> • ${item.subjek}</div>
            <div><strong>Guru Diganti:</strong> ${item.originalGuru} (${item.reasonCode})</div>
          </div>

          <div class="pt-2 border-t border-dashed border-slate-300 flex justify-between items-end text-[9px] text-slate-500">
            <div>
              Tandatangan Guru Ganti:<br>
              <div class="h-6 border-b border-slate-400 w-28 mt-1"></div>
            </div>
            <div class="text-right">
              Pengesahan Pentadbir:<br>
              <div class="h-6 border-b border-slate-400 w-28 mt-1"></div>
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>

      <div class="print-page-break pt-6">
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4">
          <div class="flex items-center gap-3">
            <img src="assets/logo-kpm.svg" class="w-14 h-14 object-contain" alt="KPM">
            <div>
              <h2 class="text-base font-extrabold tracking-wide uppercase text-slate-900 leading-tight">SEKOLAH KEBANGSAAN RANGGU</h2>
              <p class="text-xs text-slate-600">Peti Surat 842, 91008 Tawau, Sabah | Kod Sekolah: XBA3037 | Zon Balung, PPD Tawau</p>
              <p class="text-xs font-bold text-indigo-900 uppercase mt-0.5">JADUAL INDUK GURU GANTI HARIAN (RELIEF)</p>
            </div>
          </div>
          <div class="text-right text-xs">
            <div><strong>Tarikh:</strong> ${dateFormatted}</div>
            <div><strong>Hari:</strong> ${dayName}</div>
            <div><strong>Jumlah Guru Tidak Hadir:</strong> ${engine.absentTeachers.length} Orang</div>
          </div>
        </div>

        <div class="mb-3 p-2 bg-slate-50 border border-slate-300 rounded text-xs">
          <strong>SENARAI GURU TIDAK HADIR:</strong> 
          ${engine.absentTeachers.map(a => `${a.name} [Sesi ${a.session}] (${a.reasonLabel})`).join('; ')}
        </div>

        <table class="kpm-table mb-6">
          <thead>
            <tr>
              <th style="width: 5%;">BIL</th>
              <th style="width: 10%;">SESI</th>
              <th style="width: 15%;">WAKTU & MASA</th>
              <th style="width: 10%;">KELAS</th>
              <th style="width: 15%;">MATA PELAJARAN</th>
              <th style="width: 25%;">GURU ASAL</th>
              <th style="width: 20%;">GURU GANTI</th>
            </tr>
          </thead>
          <tbody>
    `;

    assignments.forEach((item, idx) => {
      html += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center; font-weight: bold;">${item.sesi || 'Pagi'}</td>
          <td style="text-align: center;">W${item.waktu} (${item.masa})</td>
          <td style="text-align: center; font-weight: bold;">${item.kelas}</td>
          <td>${item.subjek}</td>
          <td>${item.originalGuru}</td>
          <td style="font-weight: bold;">${item.substituteTeacherName}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>

        <div class="flex justify-between pt-8 text-xs text-slate-800">
          <div class="w-64 text-center">
            Disediakan Oleh:<br><br><br>
            <div class="border-b border-slate-800 font-bold pb-1">
              PUAN HAJAH RAHMATIAH BINTI MOHD JUDA
            </div>
            <div class="text-[10px] text-slate-600">Penolong Kanan Pentadbiran (PK 1)</div>
          </div>
          <div class="w-64 text-center">
            Disahkan Oleh:<br><br><br>
            <div class="border-b border-slate-800 font-bold pb-1">
              YUNUS BIN PATARAI
            </div>
            <div class="text-[10px] text-slate-600">Guru Besar, SK Ranggu Tawau</div>
          </div>
        </div>
      </div>
    `;

    printArea.innerHTML = html;
    window.print();
  }

  // 17. Reset
  if (elBtnReset) {
    elBtnReset.addEventListener('click', () => {
      if (confirm("Tetapkan semula jadual relief dan kosongkan senarai guru tidak hadir?")) {
        engine.absentTeachers = [];
        engine.activeAssignments = [];
        renderAbsentChips();
        cancelReassignMode();
        if (elGridStatusBadge) {
          elGridStatusBadge.textContent = "JADUAL INDUK";
          elGridStatusBadge.className = "bg-indigo-100 text-indigo-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-indigo-200";
        }
        renderGridView();
        showToast("Jadual telah ditetapkan semula ke paparan normal.", "info");
      }
    });
  }

  // 18. Toast Helper
  function showToast(message, type = "info") {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: "bg-emerald-600 text-white",
      error: "bg-rose-600 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-indigo-600 text-white"
    };

    const icons = {
      success: "fa-solid fa-circle-check",
      error: "fa-solid fa-circle-exclamation",
      warning: "fa-solid fa-triangle-exclamation",
      info: "fa-solid fa-circle-info"
    };

    toast.className = `toast px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 text-xs font-semibold ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info} text-sm"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // 19. PERMULAAN SISTEM (INITIAL RUN)
  // =========================================================================
  initDateAndTime();
  populateDropdowns();
  renderAbsentChips();
  renderSavedRecordsTable();

  // Paparkan Grid Waktu Mengajar Guru secara langsung sebaik dibuka!
  renderGridView();
});
