/**
 * APLIKASI UTAMA PENGURUSAN GURU GANTI (RELPEN 2.0 SK RANGGU)
 * Mengendalikan UI interaktif, paparan Grid Berwarna, pertukaran relief (click-to-swap),
 * paparan Senarai, cetakan PDF rasmi KPM, dan simpanan rekod.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Enjin
  const engine = new SKRangguReliefEngine(
    typeof INITIAL_TIMETABLE_DATA !== 'undefined' ? INITIAL_TIMETABLE_DATA : [],
    typeof SK_RANGGU_TEACHERS !== 'undefined' ? SK_RANGGU_TEACHERS : []
  );

  // Status Aplikasi
  let currentViewMode = "grid"; // "grid" atau "list"
  let selectedReliefForReassign = null; // Menyimpan relief yang sedang dipilih untuk ditukar
  let activeSessionFilter = "Semua"; // "Semua", "Pagi", "Petang"
  let teacherSearchQuery = "";

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

  // Butang Jana & Aksi
  const elBtnGenerate = document.getElementById('btn-generate-relief');
  const elBtnReset = document.getElementById('btn-reset');
  const elBtnSave = document.getElementById('btn-save-db');
  const elBtnPrint = document.getElementById('btn-print-pdf');

  // Bekas Paparan Jadual
  const elDraftSection = document.getElementById('draft-section');
  const elViewSwitcherGrid = document.getElementById('btn-view-grid');
  const elViewSwitcherList = document.getElementById('btn-view-list');
  const elGridContainer = document.getElementById('grid-view-container');
  const elListContainer = document.getElementById('list-view-container');
  const elReassignBanner = document.getElementById('reassign-active-banner');
  const elReassignDetails = document.getElementById('reassign-banner-details');
  const elBtnCancelReassign = document.getElementById('btn-cancel-reassign');
  const elFilterGridSession = document.getElementById('filter-grid-session');
  const elSearchTeacherGrid = document.getElementById('search-teacher-grid');

  // Statistik Ringkasan
  const elStatAbsentTotal = document.getElementById('stat-absent-total');
  const elStatVacantTotal = document.getElementById('stat-vacant-total');
  const elStatAssignedTotal = document.getElementById('stat-assigned-total');

  // Jam Digital
  const elLiveTime = document.getElementById('live-time-display');

  // 3. Muatkan Tarikh Semasa & Hari
  function initDateAndTime() {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    elDateInput.value = formatted;
    updateDayFromDate(formatted);

    // Kemas kini jam langsung
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
  }

  elDateInput.addEventListener('change', (e) => {
    updateDayFromDate(e.target.value);
    // Jika draf sedia ada, jana semula mengikut hari baharu
    if (engine.absentTeachers.length > 0) {
      handleGenerate();
    }
  });

  // 4. Isi Pilihan Guru & Sebab
  function populateDropdowns() {
    // Guru SK Ranggu
    elTeacherSelect.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
    SK_RANGGU_TEACHERS.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} (${t.role} • ${t.session})`;
      elTeacherSelect.appendChild(opt);
    });

    // Sebab
    elReasonSelect.innerHTML = '';
    SK_RANGGU_CONFIG.reliefReasons.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.code;
      opt.textContent = r.label;
      elReasonSelect.appendChild(opt);
    });
  }

  // 5. Tambah & Buang Guru Tidak Hadir
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
    showToast("Guru berjaya ditambah ke senarai tidak hadir.", "success");
  });

  // Contoh Demo Pantas (Persis Senario Video)
  if (elBtnQuickDemo) {
    elBtnQuickDemo.addEventListener('click', () => {
      // Setkan ke hari Isnin jika hari ini bukan hari persekolahan biasa
      const demoDate = "2026-10-12"; // Hari Isnin
      elDateInput.value = demoDate;
      updateDayFromDate(demoDate);

      // Kosongkan dan tambah 2 guru (Cikgu Rini Daud & Cikgu Sabriah Abdul Sabar)
      engine.absentTeachers = [];
      engine.addAbsentTeacher(37, "CRK", "Cuti Rehat Khas (CRK)");
      engine.addAbsentTeacher(44, "MC", "Cuti Sakit (MC)");

      renderAbsentChips();
      handleGenerate();
      showToast("Contoh Demo Video dimuatkan: Cikgu Rini Daud & Cikgu Sabriah tidak hadir. Jadual relief sedia dipratonton!", "info");
    });
  }

  function renderAbsentChips() {
    elAbsentChipsContainer.innerHTML = '';
    const absent = engine.absentTeachers;
    elAbsentCount.textContent = absent.length;

    if (absent.length === 0) {
      elAbsentChipsContainer.innerHTML = '<span class="text-xs text-slate-400 italic">Tiada guru tidak hadir ditambah lagi. Sila pilih guru di atas.</span>';
      return;
    }

    absent.forEach(t => {
      const chip = document.createElement('div');
      chip.className = 'inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition hover:shadow';
      chip.innerHTML = `
        <span class="font-bold">${t.shortName}</span>
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
          elDraftSection.classList.add('hidden');
        }
      });

      elAbsentChipsContainer.appendChild(chip);
    });
  }

  // 6. Jana Jadual Relief (Langkah 2)
  elBtnGenerate.addEventListener('click', handleGenerate);

  function handleGenerate() {
    if (engine.absentTeachers.length === 0) {
      showToast("Sila pilih sekurang-kurangnya seorang guru tidak hadir!", "warning");
      return;
    }

    // Kemas kini tetapan dari UI
    engine.settings.maxReliefPerTeacher = parseInt(elMaxRelief.value) || 2;
    engine.settings.autoAssign = elAutoAssign.checked;
    engine.settings.slotSplit = parseInt(elSlotSplit.value) || 30;
    engine.settings.avoidContinuous = elAvoidContinuous ? elAvoidContinuous.checked : true;
    engine.settings.prioritizeSameSubject = elPrioritizeOption ? elPrioritizeOption.checked : true;

    // Jana
    const assignments = engine.generateRelief();

    // Batal mana-mana mod reassign sedia ada
    cancelReassignMode();

    // Kemas kini statistik
    elStatAbsentTotal.textContent = engine.absentTeachers.length;
    elStatVacantTotal.textContent = assignments.length;
    const assignedCount = assignments.filter(a => a.substituteTeacherId !== null).length;
    elStatAssignedTotal.textContent = assignedCount;

    // Paparkan seksyen draf
    elDraftSection.classList.remove('hidden');

    // Paparkan paparan semasa
    renderCurrentView();

    // Skrol ke bahagian draf
    elDraftSection.scrollIntoView({ behavior: 'smooth' });
    showToast(`Jadual relief berjaya dijana! (${assignments.length} waktu perlu diganti)`, "success");
  }

  // 7. Pengendali Penukaran Paparan (Grid vs Senarai)
  elViewSwitcherGrid.addEventListener('click', () => {
    currentViewMode = "grid";
    elViewSwitcherGrid.classList.add('bg-indigo-600', 'text-white');
    elViewSwitcherGrid.classList.remove('bg-white', 'text-slate-700');
    elViewSwitcherList.classList.add('bg-white', 'text-slate-700');
    elViewSwitcherList.classList.remove('bg-indigo-600', 'text-white');
    renderCurrentView();
  });

  elViewSwitcherList.addEventListener('click', () => {
    currentViewMode = "list";
    elViewSwitcherList.classList.add('bg-indigo-600', 'text-white');
    elViewSwitcherList.classList.remove('bg-white', 'text-slate-700');
    elViewSwitcherGrid.classList.add('bg-white', 'text-slate-700');
    elViewSwitcherGrid.classList.remove('bg-indigo-600', 'text-white');
    renderCurrentView();
  });

  function renderCurrentView() {
    if (currentViewMode === "grid") {
      elGridContainer.classList.remove('hidden');
      elListContainer.classList.add('hidden');
      renderGridView();
    } else {
      elGridContainer.classList.add('hidden');
      elListContainer.classList.remove('hidden');
      renderListView();
    }
  }

  // Penapis Sesi & Carian Guru dalam Grid
  if (elFilterGridSession) {
    elFilterGridSession.addEventListener('change', (e) => {
      activeSessionFilter = e.target.value;
      renderGridView();
    });
  }

  if (elSearchTeacherGrid) {
    elSearchTeacherGrid.addEventListener('input', (e) => {
      teacherSearchQuery = e.target.value.toLowerCase().trim();
      renderGridView();
    });
  }

  // =========================================================================
  // 8. HERO FEATURE: PAPARAN GRID BERWARNA (SEPERTI DI DALAM VIDEO)
  // =========================================================================
  function renderGridView() {
    const dayCode = engine.selectedDayCode;
    const periods = TIMETABLE_PERIODS; // W1 hingga W11 + Rehat
    const absentTeacherIds = new Set(engine.absentTeachers.map(a => a.teacherId));

    // Tapis guru mengikut sesi & carian
    let teachers = SK_RANGGU_TEACHERS.filter(t => {
      if (activeSessionFilter === "Pagi" && t.session !== "Pagi") return false;
      if (activeSessionFilter === "Petang" && t.session !== "Petang") return false;
      if (teacherSearchQuery) {
        return t.name.toLowerCase().includes(teacherSearchQuery) || 
               t.shortName.toLowerCase().includes(teacherSearchQuery) ||
               t.role.toLowerCase().includes(teacherSearchQuery);
      }
      return true;
    });

    let html = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-indigo-950 text-white font-bold border-b border-indigo-900">
              <th class="p-3 text-left w-64 sticky left-0 bg-indigo-950 z-20 shadow-md">GURU (${teachers.length})</th>
    `;

    // Header Waktu (W1 hingga W11)
    periods.forEach(p => {
      if (p.isRehat) {
        html += `<th class="p-2 text-center bg-indigo-900/80 text-[10px] w-14">REHAT<br><span class="text-[9px] opacity-75">${p.masa}</span></th>`;
      } else {
        html += `<th class="p-2 text-center min-w-[78px] text-[10px]">${p.label}<br><span class="text-[9px] opacity-75 font-normal">${p.masa}</span></th>`;
      }
    });

    html += `
              <th class="p-3 text-center w-20 sticky right-0 bg-indigo-950 z-20">JUM RELIEF</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
    `;

    // Dapatkan calon target jika mod reassign aktif
    let availableTargetTeacherIds = new Set();
    if (selectedReliefForReassign) {
      const availables = engine.getAvailableTeachersForSlot(
        selectedReliefForReassign.waktu,
        selectedReliefForReassign.kodHari,
        selectedReliefForReassign.id
      );
      availables.forEach(c => availableTargetTeacherIds.add(c.teacherId));
    }

    // Baris Setiap Guru
    teachers.forEach(t => {
      const isAbsent = absentTeacherIds.has(t.id);
      const absentInfo = isAbsent ? engine.absentTeachers.find(a => a.teacherId === t.id) : null;
      
      // Hitung jumlah relief yang dipegang guru ini hari ini
      const teacherReliefs = engine.activeAssignments.filter(a => a.substituteTeacherId === t.id);
      const reliefCount = teacherReliefs.length;

      html += `
        <tr class="hover:bg-slate-50/80 transition-colors ${isAbsent ? 'bg-purple-50/40' : ''}">
          <!-- Kolum Guru (Sticky Left) -->
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

      // Kolum Setiap Slot Waktu
      periods.forEach(p => {
        if (p.isRehat) {
          html += `<td class="p-1 text-center bg-slate-100/60 border-r border-slate-100 text-[10px] text-slate-400 font-semibold select-none">REHAT</td>`;
          return;
        }

        const waktu = p.waktu;

        // 1. Semak adakah guru ini memegang RELIEF pada slot ini?
        const reliefAssigned = engine.activeAssignments.find(a => a.substituteTeacherId === t.id && a.waktu === waktu);

        // 2. Semak adakah guru ini mengajar KELAS SENDIRI pada slot ini?
        const ownClass = engine.getTeacherClassAtSlot(t.name, dayCode, waktu);

        // JIKA GURU MEMEGANG RELIEF (WARNA OREN - Seperti di video!)
        if (reliefAssigned) {
          const isSelected = selectedReliefForReassign && selectedReliefForReassign.id === reliefAssigned.id;
          html += `
            <td class="p-1 text-center border-r border-slate-100">
              <div 
                class="matrix-cell cell-relief rounded-lg p-1.5 text-[10px] leading-tight flex flex-col justify-center items-center ${isSelected ? 'active-selected' : ''}"
                data-relief-id="${reliefAssigned.id}"
                title="RELIEF: ${reliefAssigned.kelas} ${reliefAssigned.subjek} (Guru Asal: ${reliefAssigned.originalGuruShort}) - Klik untuk ubah / pindahkan guru ganti"
              >
                <span class="font-extrabold uppercase tracking-wide text-[9px] bg-black/20 px-1 py-0.2 rounded mb-0.5">RELIEF</span>
                <span class="font-bold">${reliefAssigned.kelas}</span>
                <span class="text-[9px] opacity-90">${reliefAssigned.subjek}</span>
                <span class="text-[8px] opacity-75 truncate max-w-full">Ganti: ${reliefAssigned.originalGuruShort}</span>
              </div>
            </td>
          `;
        }
        // JIKA MOD REASSIGN AKTIF & GURU INI ADALAH TARGET HIJAU (BEBAS & SESUAI)
        else if (selectedReliefForReassign && selectedReliefForReassign.waktu === waktu && availableTargetTeacherIds.has(t.id)) {
          const strain = engine.checkTeacherWorkloadStrain(t.name, dayCode, waktu);
          html += `
            <td class="p-1 text-center border-r border-slate-100">
              <div 
                class="matrix-cell cell-available-target rounded-lg p-1 text-[10px] leading-tight flex flex-col justify-center items-center group cursor-pointer"
                data-target-teacher-id="${t.id}"
                data-target-teacher-name="${t.shortName}"
                title="Slot Bebas! Klik untuk pindahkan relief ${selectedReliefForReassign.kelas} kepada ${t.shortName}"
              >
                <i class="fa-solid fa-arrow-down-to-bracket text-emerald-600 group-hover:text-white mb-0.5"></i>
                <span class="font-bold text-[9px]">PILIH</span>
                ${strain.hasNoRest ? '<span class="text-[7px] text-amber-600 bg-amber-50 px-1 rounded">2 jam kelas</span>' : '<span class="text-[7px] text-emerald-700 font-semibold">Lapang</span>'}
              </div>
            </td>
          `;
        }
        // JIKA GURU SEDANG MENGAJAR KELAS SENDIRI (WARNA BIRU)
        else if (ownClass) {
          // Jika guru tidak hadir, tunjukkan slot kosong yang perlu relief
          if (isAbsent) {
            html += `
              <td class="p-1 text-center border-r border-slate-100">
                <div class="matrix-cell bg-purple-100 text-purple-900 border border-purple-300 rounded-lg p-1.5 text-[10px] leading-tight flex flex-col justify-center items-center opacity-70">
                  <span class="text-[8px] font-bold text-purple-700">ASAL</span>
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
        // JIKA SLOT KOSONG / REHAT GURU (NEUTRAL)
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

      // Kolum Jumlah Relief (Sticky Right)
      html += `
          <td class="p-2 text-center sticky right-0 bg-white z-10 border-l border-slate-200">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${reliefCount > 0 ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}">
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

    elGridContainer.innerHTML = html;

    // Pasang Event Listeners untuk Interaktiviti Grid!
    attachGridEventListeners();
  }

  // Pasang Event Listeners Grid (Click-to-Move Relief)
  function attachGridEventListeners() {
    // 1. Klik pada slot relief (Oren) untuk aktifkan Mod Pindah Relief
    const reliefCells = elGridContainer.querySelectorAll('.cell-relief');
    reliefCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        const reliefId = cell.getAttribute('data-relief-id');
        const relief = engine.activeAssignments.find(a => a.id === reliefId);
        if (!relief) return;

        // Aktifkan mod penukaran
        selectedReliefForReassign = relief;

        // Paparkan banner maklumat
        elReassignBanner.classList.remove('hidden');
        elReassignDetails.innerHTML = `
          Anda sedang menukar relief untuk <strong>${relief.kelas} (${relief.subjek})</strong> pada waktu <strong>${relief.waktu} (${relief.masa})</strong>.<br>
          Guru semasa: <span class="bg-orange-600 px-1.5 py-0.5 rounded text-white font-bold">${relief.substituteTeacherShort}</span>. 
          <span class="text-amber-200 underline font-semibold">Sila klik mana-mana kotak HIJAU berdenyut di bawah untuk memindahkan tugas ini kepada guru berkenaan.</span>
        `;

        // Render semula grid untuk paparkan kotak hijau berdenyut
        renderGridView();
        showToast(`Mod Pindah Aktif: Pilih mana-mana slot hijau untuk gantikan ${relief.substituteTeacherShort}.`, "info");
      });
    });

    // 2. Klik pada slot target (Hijau) untuk laksanakan pemindahan!
    const targetCells = elGridContainer.querySelectorAll('.cell-available-target');
    targetCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (!selectedReliefForReassign) return;

        const newTeacherId = parseInt(cell.getAttribute('data-target-teacher-id'));
        const newTeacherName = cell.getAttribute('data-target-teacher-name');

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

  // Batal Mod Pindah Relief
  elBtnCancelReassign.addEventListener('click', cancelReassignMode);

  function cancelReassignMode() {
    selectedReliefForReassign = null;
    if (elReassignBanner) {
      elReassignBanner.classList.add('hidden');
    }
    renderCurrentView();
  }

  // =========================================================================
  // 9. PAPARAN SENARAI (LIST VIEW)
  // =========================================================================
  function renderListView() {
    const assignments = engine.activeAssignments;
    if (assignments.length === 0) {
      elListContainer.innerHTML = '<div class="p-8 text-center text-slate-400">Tiada jadual relief dijana.</div>';
      return;
    }

    let html = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm divide-y divide-slate-200">
          <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
            <tr>
              <th class="p-3 text-center w-12">BIL</th>
              <th class="p-3">WAKTU & MASA</th>
              <th class="p-3">KELAS & SUBJEK</th>
              <th class="p-3">GURU ASAL (TIDAK HADIR)</th>
              <th class="p-3">GURU GANTI (DICADANGKAN / TERKINI)</th>
              <th class="p-3 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-800">
    `;

    assignments.forEach((item, index) => {
      // Dapatkan senarai guru yang lapang untuk waktu ini
      const availableTeachers = engine.getAvailableTeachersForSlot(item.waktu, item.kodHari, item.id);

      html += `
        <tr class="hover:bg-indigo-50/40 transition">
          <td class="p-3 text-center font-bold text-slate-400">${index + 1}</td>
          <td class="p-3 font-medium">
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
            <div class="flex items-center gap-2">
              <select class="select-substitute-inline border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64" data-relief-id="${item.id}">
                <option value="">-- Pilih Guru Ganti --</option>
      `;

      // Guru yang sedang ditugaskan
      if (item.substituteTeacherId) {
        html += `<option value="${item.substituteTeacherId}" selected>${item.substituteTeacherName} [Semasa]</option>`;
      }

      // Senarai calon lapang
      availableTeachers.forEach(c => {
        if (c.teacherId !== item.substituteTeacherId) {
          html += `<option value="${c.teacherId}">${c.name} (${c.reliefCount} Relief) - ${c.statusLabel}</option>`;
        }
      });

      html += `
              </select>
            </div>
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

    html += `
          </tbody>
        </table>
      </div>
    `;

    elListContainer.innerHTML = html;

    // Event listener untuk dropdown inline
    const inlineSelects = elListContainer.querySelectorAll('.select-substitute-inline');
    inlineSelects.forEach(select => {
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
  // 10. SIMPAN KE DATABASE (LOCALSTORAGE)
  // =========================================================================
  elBtnSave.addEventListener('click', () => {
    if (engine.activeAssignments.length === 0) {
      showToast("Tiada jadual relief untuk disimpan!", "warning");
      return;
    }

    const saved = engine.saveToDatabase();
    showToast(`Jadual relief bagi tarikh ${saved.date} berjaya disimpan ke pangkalan data!`, "success");
    renderSavedRecordsTable();
  });

  // Render Jadual Rekod Simpanan Terdahulu
  function renderSavedRecordsTable() {
    const container = document.getElementById('saved-records-container');
    if (!container) return;

    const records = engine.loadSavedRecords();
    if (records.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs">Tiada rekod relief disimpan sebelum ini.</div>';
      return;
    }

    let html = `
      <table class="w-full text-xs text-left divide-y divide-slate-200">
        <thead class="bg-slate-50 text-slate-600 font-bold uppercase">
          <tr>
            <th class="p-2.5">TARIKH</th>
            <th class="p-2.5">HARI</th>
            <th class="p-2.5">GURU TIDAK HADIR</th>
            <th class="p-2.5">JUMLAH SLOT</th>
            <th class="p-2.5 text-center">AKSI</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
    `;

    records.forEach(r => {
      const absentList = r.absentTeachers.map(a => a.shortName).join(', ');
      html += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5 font-bold text-slate-800">${r.date}</td>
          <td class="p-2.5">${r.dayName}</td>
          <td class="p-2.5 text-slate-600 truncate max-w-xs" title="${absentList}">${absentList}</td>
          <td class="p-2.5 font-bold text-indigo-600">${r.assignments.length} Waktu</td>
          <td class="p-2.5 text-center">
            <button class="btn-load-record bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded font-bold transition mr-1" data-date="${r.date}">
              Muat
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    // Pasang handler butang muat rekod
    container.querySelectorAll('.btn-load-record').forEach(btn => {
      btn.addEventListener('click', () => {
        const date = btn.getAttribute('data-date');
        const target = records.find(r => r.date === date);
        if (target) {
          engine.selectedDate = target.date;
          engine.selectedDayCode = target.dayCode;
          engine.absentTeachers = target.absentTeachers;
          engine.activeAssignments = target.assignments;
          elDateInput.value = target.date;
          updateDayFromDate(target.date);
          renderAbsentChips();
          elDraftSection.classList.remove('hidden');
          renderCurrentView();
          showToast(`Rekod relief ${target.date} berjaya dimuatkan!`, "info");
        }
      });
    });
  }

  // =========================================================================
  // 11. CETAKAN RASMI (PDF & PRINT READY KPM FORMAT)
  // =========================================================================
  elBtnPrint.addEventListener('click', prepareAndPrint);

  function prepareAndPrint() {
    const assignments = engine.activeAssignments;
    if (assignments.length === 0) {
      showToast("Sila jana jadual relief sebelum mencetak!", "warning");
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
      <!-- ================= BAHAGIAN 1: SLIP GURU GANTI INDIVIDU (POTONGAN 4 SEHELAI) ================= -->
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
            <div><strong>Tarikh & Hari:</strong> ${dateFormatted} (${dayName})</div>
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

      <!-- ================= BAHAGIAN 2: PENYATA JADUAL GURU GANTI HARIAN (PAPAN NOTIS & ARKIB) ================= -->
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

        <!-- Senarai Guru Tidak Hadir -->
        <div class="mb-3 p-2 bg-slate-50 border border-slate-300 rounded text-xs">
          <strong>SENARAI GURU TIDAK HADIR:</strong> 
          ${engine.absentTeachers.map(a => `${a.name} (${a.reasonLabel})`).join('; ')}
        </div>

        <!-- Jadual Ringkasan Penggantian -->
        <table class="kpm-table mb-6">
          <thead>
            <tr>
              <th style="width: 5%;">BIL</th>
              <th style="width: 15%;">WAKTU & MASA</th>
              <th style="width: 15%;">KELAS</th>
              <th style="width: 15%;">MATA PELAJARAN</th>
              <th style="width: 25%;">GURU ASAL</th>
              <th style="width: 25%;">GURU GANTI</th>
            </tr>
          </thead>
          <tbody>
    `;

    assignments.forEach((item, idx) => {
      html += `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
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

        <!-- Ruang Pengesahan & Tandatangan -->
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

    // Picu cetakan pelayar
    window.print();
  }

  // 12. Reset
  elBtnReset.addEventListener('click', () => {
    if (confirm("Adakah anda pasti untuk membatalkan dan menetapkan semula jadual relief?")) {
      engine.absentTeachers = [];
      engine.activeAssignments = [];
      renderAbsentChips();
      elDraftSection.classList.add('hidden');
      cancelReassignMode();
      showToast("Jadual telah ditetapkan semula.", "info");
    }
  });

  // 13. Toast Notification Helper
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

  // Permulaan
  initDateAndTime();
  populateDropdowns();
  renderAbsentChips();
  renderSavedRecordsTable();
});
