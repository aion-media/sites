/**
 * EVO Beauty Space - Admin Dashboard & CRM Engine
 * Реализует интерактивную шахматку мастеров, электронный журнал бронирований,
 * управление прейскурантом и автоматическую синхронизацию в реальном времени.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1. PIN PROTECTION LOGIC
  // ============================================================
  const pinLockScreen = document.getElementById('pinLockScreen');
  const adminMainLayout = document.getElementById('adminMainLayout');
  const pinAuthForm = document.getElementById('pinAuthForm');
  const pinInput = document.getElementById('pinInput');
  const pinErrorMsg = document.getElementById('pinErrorMsg');

  const CORRECT_PIN = "1234";

  // Check if session already unlocked
  if (sessionStorage.getItem('evo_admin_unlocked') === 'true') {
    if (pinLockScreen) pinLockScreen.style.display = 'none';
    if (adminMainLayout) adminMainLayout.style.display = 'flex';
  }

  if (pinAuthForm) {
    pinAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (pinInput.value.trim() === CORRECT_PIN) {
        sessionStorage.setItem('evo_admin_unlocked', 'true');
        pinLockScreen.style.display = 'none';
        adminMainLayout.style.display = 'flex';
        renderAll();
      } else {
        pinErrorMsg.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  // ============================================================
  // 2. STATE & CONFIGURATION
  // ============================================================
  function getTodayDateStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  let currentTab = 'timeline'; // Default active tab: 'timeline', 'appointments', 'services'
  let timelineDate = getTodayDateStr();
  let timelineBranch = 'all'; // 'all', 'sever', 'center'
  let selectedAppForDetail = null;

  let appointmentFilter = 'all';
  let serviceCategoryFilter = 'all';
  let serviceSearchQuery = '';

  // Elements
  const tabNavItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  const tabSections = document.querySelectorAll('.admin-tab-section');

  // KPI Elements
  const kpiTodayCount = document.getElementById('kpiTodayCount');
  const kpiRevenue = document.getElementById('kpiRevenue');
  const kpiNewCount = document.getElementById('kpiNewCount');
  const kpiServicesCount = document.getElementById('kpiServicesCount');

  // Containers
  const timelineBoard = document.getElementById('timelineBoard');
  const appointmentsTbody = document.getElementById('appointmentsTbody');
  const servicesTbody = document.getElementById('servicesTbody');

  // Modals
  const addServiceModal = document.getElementById('addServiceModal');
  const addServiceForm = document.getElementById('addServiceForm');
  const openAddServiceBtn = document.getElementById('openAddServiceBtn');
  const closeAddServiceBtn = document.getElementById('closeAddServiceBtn');

  const editServiceModal = document.getElementById('editServiceModal');
  const editServiceForm = document.getElementById('editServiceForm');
  const closeEditServiceBtn = document.getElementById('closeEditServiceBtn');

  const quickBookingModal = document.getElementById('quickBookingModal');
  const quickBookingForm = document.getElementById('quickBookingForm');
  const openQuickBookingBtn = document.getElementById('openQuickBookingBtn');
  const closeQuickBookingBtn = document.getElementById('closeQuickBookingBtn');
  const qbSpecialistSelect = document.getElementById('qbSpecialistSelect');
  const qbBranchSelect = document.getElementById('qbBranchSelect');
  const qbDateInput = document.getElementById('qbDateInput');
  const qbTimeSelect = document.getElementById('qbTimeSelect');
  const qbServiceSelect = document.getElementById('qbServiceSelect');
  const qbPriceInput = document.getElementById('qbPriceInput');
  const qbClientName = document.getElementById('qbClientName');
  const qbClientPhone = document.getElementById('qbClientPhone');
  const qbCommentInput = document.getElementById('qbCommentInput');
  const qbStatusSelect = document.getElementById('qbStatusSelect');

  const appDetailModal = document.getElementById('appointmentDetailModal');
  const closeAppDetailBtn = document.getElementById('closeAppDetailBtn');
  const closeAppDetailFooterBtn = document.getElementById('closeAppDetailFooterBtn');
  const deleteAppointmentBtn = document.getElementById('deleteAppointmentBtn');

  // ============================================================
  // 3. NAVIGATION SWITCHING
  // ============================================================
  tabNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      currentTab = targetTab;

      tabNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      tabSections.forEach(sec => {
        sec.style.display = (sec.id === `tab-${targetTab}`) ? 'block' : 'none';
      });

      renderAll();
    });
  });

  // ============================================================
  // 4. KPI SUMMARY CALCULATION
  // ============================================================
  function renderKPIs() {
    const appointments = window.evoData.getAppointments();
    const services = window.evoData.getServices();

    const todayStr = getTodayDateStr();
    const todayApps = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled');
    const newApps = appointments.filter(a => a.status === 'new');

    const totalEstRevenue = appointments
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    if (kpiTodayCount) kpiTodayCount.textContent = todayApps.length;
    if (kpiNewCount) kpiNewCount.textContent = newApps.length;
    if (kpiRevenue) kpiRevenue.textContent = (totalEstRevenue / 1000000).toFixed(1) + " млн ₫";
    if (kpiServicesCount) kpiServicesCount.textContent = services.length;
  }

  // ============================================================
  // 5. MASTER TIMELINE GRID (ШАХМАТКА МАСТЕРОВ)
  // ============================================================
  function formatTimelineDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts.map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
    const dayMonthYear = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capWeekday}, ${dayMonthYear}`;
  }

  function shiftTimelineDate(offsetDays) {
    const parts = timelineDate.split('-');
    const [y, m, d] = parts.map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offsetDays);
    const ny = dateObj.getFullYear();
    const nm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const nd = String(dateObj.getDate()).padStart(2, '0');
    timelineDate = `${ny}-${nm}-${nd}`;
    renderTimeline();
    renderKPIs();
  }

  // Date controls
  const timelinePrevBtn = document.getElementById('timelinePrevDayBtn');
  const timelineNextBtn = document.getElementById('timelineNextDayBtn');
  const timelineTodayBtn = document.getElementById('timelineTodayBtn');
  const timelineDatePicker = document.getElementById('timelineDatePicker');

  if (timelinePrevBtn) timelinePrevBtn.addEventListener('click', () => shiftTimelineDate(-1));
  if (timelineNextBtn) timelineNextBtn.addEventListener('click', () => shiftTimelineDate(1));
  if (timelineTodayBtn) timelineTodayBtn.addEventListener('click', () => {
    timelineDate = getTodayDateStr();
    renderTimeline();
    renderKPIs();
  });
  if (timelineDatePicker) {
    timelineDatePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        timelineDate = e.target.value;
        renderTimeline();
        renderKPIs();
      }
    });
  }

  // Branch filter pills
  const branchPills = document.querySelectorAll('.timeline-branch-pill');
  branchPills.forEach(pill => {
    pill.addEventListener('click', () => {
      branchPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      timelineBranch = pill.getAttribute('data-branch');
      renderTimeline();
    });
  });

  function renderTimeline() {
    if (!timelineBoard) return;

    // 1. Update Header Date
    const formattedDateEl = document.getElementById('timelineFormattedDate');
    const todayBadgeEl = document.getElementById('timelineTodayBadge');
    if (formattedDateEl) formattedDateEl.textContent = formatTimelineDate(timelineDate);
    if (todayBadgeEl) {
      todayBadgeEl.style.display = (timelineDate === getTodayDateStr()) ? 'inline-block' : 'none';
    }
    if (timelineDatePicker) timelineDatePicker.value = timelineDate;

    // 2. Filter Specialists by branch
    const allSpecialists = window.evoData.getSpecialists();
    let specialists = allSpecialists;
    if (timelineBranch !== 'all') {
      specialists = allSpecialists.filter(s => s.branch === timelineBranch);
    }

    if (specialists.length === 0) {
      timelineBoard.style.gridTemplateColumns = '1fr';
      timelineBoard.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--color-text-muted);">
          В данном филиале пока нет назначенных специалистов
        </div>
      `;
      return;
    }

    timelineBoard.style.gridTemplateColumns = `74px repeat(${specialists.length}, minmax(220px, 1fr))`;

    // 3. Appointments for selected date
    const allAppointments = window.evoData.getAppointments();
    const dayAppointments = allAppointments.filter(a => a.date === timelineDate);

    let html = '';

    // A. Header Row: Time + Specialists
    html += `<div class="timeline-corner-cell">Время</div>`;
    specialists.forEach(spec => {
      const specApps = dayAppointments.filter(a => {
        const match = (a.specialistId === spec.id || a.specialistName === spec.name);
        return match && a.status !== 'cancelled';
      });

      const branchLabel = spec.branch === 'sever' ? 'EVO Sever' : 'EVO Beauty Space';

      html += `
        <div class="timeline-spec-col-header">
          <img src="${spec.photo}" alt="${spec.name}" class="spec-header-avatar">
          <div class="spec-header-info">
            <div class="spec-header-name" title="${spec.name}">${spec.name}</div>
            <div class="spec-header-role">${spec.role.split(',')[0]}</div>
            <span class="spec-header-badge">📍 ${branchLabel}</span>
          </div>
          <div class="spec-header-count" title="Записей на выбранную дату">${specApps.length} зап.</div>
        </div>
      `;
    });

    // B. Time Rows (09:00 - 20:00)
    const TIME_SLOTS = [
      "09:00", "10:00", "11:00", "12:00", "13:00", 
      "14:00", "15:00", "16:00", "17:00", "18:00", 
      "19:00", "20:00"
    ];

    const statusConfig = {
      new: { label: "Новая", class: "status-new" },
      confirmed: { label: "Подтверждена", class: "status-confirmed" },
      in_progress: { label: "В процессе", class: "status-in_progress" },
      completed: { label: "Выполнена", class: "status-completed" },
      cancelled: { label: "Отменена", class: "status-cancelled" }
    };

    TIME_SLOTS.forEach(slotHour => {
      // Time label cell
      html += `<div class="timeline-time-cell">${slotHour}</div>`;

      const slotHourNum = parseInt(slotHour.split(':')[0], 10);

      // Columns for each specialist
      specialists.forEach(spec => {
        const appsInSlot = dayAppointments.filter(a => {
          const matchSpec = (a.specialistId === spec.id || a.specialistName === spec.name);
          if (!matchSpec) return false;
          if (!a.time) return false;
          const aHour = parseInt(a.time.split(':')[0], 10);
          return aHour === slotHourNum;
        });

        html += `<div class="timeline-slot-cell" data-spec-id="${spec.id}" data-time="${slotHour}">`;

        if (appsInSlot.length > 0) {
          appsInSlot.forEach(app => {
            const conf = statusConfig[app.status] || statusConfig.new;
            html += `
              <div class="timeline-card ${conf.class}" data-app-id="${app.id}" title="Кликните для деталей и смены статуса">
                <div class="timeline-card-header">
                  <span class="timeline-card-time">⏰ ${app.time}</span>
                  <span class="timeline-card-badge">${conf.label}</span>
                </div>
                <div class="timeline-card-client">👤 ${app.clientName}</div>
                <div class="timeline-card-service" title="${app.serviceName}">✨ ${app.serviceName}</div>
                <div class="timeline-card-footer">
                  <span class="timeline-card-price">${window.evoData.formatMoney(app.price)}</span>
                  <span style="font-size: 10px; opacity: 0.85;">${app.phone ? '📞 ' + app.phone.slice(-9) : ''}</span>
                </div>
              </div>
            `;
          });
        } else {
          // Empty slot -> hover "+ Записать"
          const defaultBranch = spec.branchName || (spec.branch === 'sever' ? 'EVO Sever (40 Đ. Bắc Sơn)' : 'EVO Beauty Space (94 Hùng Vương)');
          html += `
            <div class="timeline-slot-empty" 
                 data-spec-id="${spec.id}" 
                 data-spec-name="${spec.name}" 
                 data-branch="${defaultBranch}" 
                 data-time="${slotHour}">
              <span class="timeline-add-pill">+ Записать</span>
            </div>
          `;
        }

        html += `</div>`;
      });
    });

    timelineBoard.innerHTML = html;

    // Attach click listeners to cards -> Appointment Detail modal
    timelineBoard.querySelectorAll('.timeline-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = card.getAttribute('data-app-id');
        openAppointmentDetail(appId);
      });
    });

    // Attach click listeners to empty slots -> Quick Booking modal
    timelineBoard.querySelectorAll('.timeline-slot-empty').forEach(slot => {
      slot.addEventListener('click', () => {
        const specId = slot.getAttribute('data-spec-id');
        const time = slot.getAttribute('data-time');
        const branch = slot.getAttribute('data-branch');
        openQuickBookingModal({ specialistId: specId, time: time, branch: branch, date: timelineDate });
      });
    });
  }

  // ============================================================
  // 6. QUICK BOOKING MODAL (АДМИНИСТРАТОРСКАЯ ЗАПИСЬ)
  // ============================================================
  function populateQuickBookingSelects() {
    const specialists = window.evoData.getSpecialists();
    const services = window.evoData.getServices();

    if (qbSpecialistSelect) {
      qbSpecialistSelect.innerHTML = specialists.map(s => `
        <option value="${s.id}" data-name="${s.name}" data-branch="${s.branchName || ''}">${s.name} (${s.role.split(',')[0]})</option>
      `).join('');
    }

    if (qbServiceSelect) {
      qbServiceSelect.innerHTML = `
        <option value="">-- Выберите процедуру --</option>
        ${services.map(s => `
          <option value="${s.id}" data-price="${s.price}" data-name="${s.name}">
            ${s.name} — ${window.evoData.formatMoney(s.price)}
          </option>
        `).join('')}
      `;
    }
  }

  function openQuickBookingModal(params = {}) {
    populateQuickBookingSelects();

    if (params.specialistId && qbSpecialistSelect) {
      qbSpecialistSelect.value = params.specialistId;
    }
    if (params.branch && qbBranchSelect) {
      qbBranchSelect.value = params.branch;
    }
    if (params.date && qbDateInput) {
      qbDateInput.value = params.date;
    } else if (qbDateInput) {
      qbDateInput.value = timelineDate;
    }
    if (params.time && qbTimeSelect) {
      qbTimeSelect.value = params.time;
    }

    // Dynamic branch auto-fill on specialist change
    if (qbSpecialistSelect) {
      qbSpecialistSelect.onchange = () => {
        const opt = qbSpecialistSelect.options[qbSpecialistSelect.selectedIndex];
        const b = opt.getAttribute('data-branch');
        if (b && qbBranchSelect) qbBranchSelect.value = b;
      };
    }

    // Dynamic price auto-fill on service change
    if (qbServiceSelect) {
      qbServiceSelect.onchange = () => {
        const opt = qbServiceSelect.options[qbServiceSelect.selectedIndex];
        const pr = opt.getAttribute('data-price');
        if (pr && qbPriceInput) qbPriceInput.value = pr;
      };
    }

    if (quickBookingModal) {
      quickBookingModal.style.display = 'flex';
      quickBookingModal.classList.add('active');
    }
  }

  function closeQuickBookingModal() {
    if (quickBookingModal) {
      quickBookingModal.style.display = 'none';
      quickBookingModal.classList.remove('active');
      quickBookingForm.reset();
    }
  }

  if (openQuickBookingBtn) {
    openQuickBookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuickBookingModal({ date: timelineDate, time: "11:00" });
    });
  }

  if (closeQuickBookingBtn) {
    closeQuickBookingBtn.addEventListener('click', closeQuickBookingModal);
  }

  if (quickBookingModal) {
    quickBookingModal.addEventListener('click', (e) => {
      if (e.target === quickBookingModal) closeQuickBookingModal();
    });
  }

  if (quickBookingForm) {
    quickBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const specOpt = qbSpecialistSelect.options[qbSpecialistSelect.selectedIndex];
      const specialistName = specOpt ? specOpt.getAttribute('data-name') : 'Специалист';
      const specialistId = qbSpecialistSelect.value;

      const srvOpt = qbServiceSelect.options[qbServiceSelect.selectedIndex];
      const serviceName = srvOpt ? srvOpt.getAttribute('data-name') : 'Процедура';

      const newAppointment = {
        clientName: qbClientName.value.trim(),
        phone: qbClientPhone.value.trim(),
        serviceName: serviceName,
        specialistId: specialistId,
        specialistName: specialistName,
        branch: qbBranchSelect.value,
        date: qbDateInput.value,
        time: qbTimeSelect.value,
        price: Number(qbPriceInput.value) || 0,
        status: qbStatusSelect.value || "confirmed",
        comment: qbCommentInput.value.trim()
      };

      window.evoData.addAppointment(newAppointment);

      // Keep timeline on the date of this new booking so admin sees it immediately
      timelineDate = newAppointment.date;

      closeQuickBookingModal();
      renderAll();
    });
  }

  // ============================================================
  // 7. APPOINTMENT DETAIL & STATUS SWITCHER MODAL
  // ============================================================
  function openAppointmentDetail(appId) {
    const appointments = window.evoData.getAppointments();
    const app = appointments.find(a => a.id === appId);
    if (!app) return;

    selectedAppForDetail = app;

    document.getElementById('appDetailId').textContent = `#${app.id}`;
    document.getElementById('appDetailClientName').textContent = app.clientName || 'Гость';
    document.getElementById('appDetailPhone').textContent = app.phone || '—';
    document.getElementById('appDetailPhoneLink').href = app.phone ? `tel:${app.phone}` : '#';

    // WhatsApp link
    const cleanPhone = (app.phone || '').replace(/[^0-9]/g, '');
    document.getElementById('appDetailWaLink').href = cleanPhone ? `https://wa.me/${cleanPhone}` : '#';

    document.getElementById('appDetailService').textContent = app.serviceName;
    document.getElementById('appDetailSpecialist').textContent = app.specialistName || 'Любой специалист';
    document.getElementById('appDetailBranch').textContent = app.branch || 'EVO Beauty Space';
    document.getElementById('appDetailDateTime').textContent = `${app.date} в ${app.time}`;
    document.getElementById('appDetailPrice').textContent = window.evoData.formatMoney(app.price);

    const commentWrap = document.getElementById('appDetailCommentWrap');
    if (app.comment) {
      commentWrap.style.display = 'block';
      document.getElementById('appDetailComment').textContent = `«${app.comment}»`;
    } else {
      commentWrap.style.display = 'none';
    }

    // Badge styling matching user colors
    const badgeEl = document.getElementById('appDetailBadge');
    const badgeMap = {
      new: { text: '🟢 Новая', class: 'status-new' },
      confirmed: { text: '🟠 Подтверждена', class: 'status-confirmed' },
      in_progress: { text: '⏳ В процессе', class: 'status-in_progress' },
      completed: { text: '🔵 Выполнена', class: 'status-completed' },
      cancelled: { text: '✕ Отменена', class: 'status-cancelled' }
    };
    const bInfo = badgeMap[app.status] || badgeMap.new;
    badgeEl.className = `status-badge ${bInfo.class}`;
    badgeEl.textContent = bInfo.text;

    if (appDetailModal) {
      appDetailModal.style.display = 'flex';
      appDetailModal.classList.add('active');
    }
  }

  function closeAppointmentDetail() {
    if (appDetailModal) {
      appDetailModal.style.display = 'none';
      appDetailModal.classList.remove('active');
      selectedAppForDetail = null;
    }
  }

  if (closeAppDetailBtn) closeAppDetailBtn.addEventListener('click', closeAppointmentDetail);
  if (closeAppDetailFooterBtn) closeAppDetailFooterBtn.addEventListener('click', closeAppointmentDetail);
  if (appDetailModal) {
    appDetailModal.addEventListener('click', (e) => {
      if (e.target === appDetailModal) closeAppointmentDetail();
    });
  }

  // Quick Status Switch Buttons
  document.querySelectorAll('.app-status-change-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedAppForDetail) return;
      const newStatus = btn.getAttribute('data-status');
      window.evoData.updateAppointmentStatus(selectedAppForDetail.id, newStatus);
      
      // Update modal badge
      selectedAppForDetail.status = newStatus;
      const badgeEl = document.getElementById('appDetailBadge');
      const badgeMap = {
        new: { text: '🟢 Новая', class: 'status-new' },
        confirmed: { text: '🟠 Подтверждена', class: 'status-confirmed' },
        in_progress: { text: '⏳ В процессе', class: 'status-in_progress' },
        completed: { text: '🔵 Выполнена', class: 'status-completed' },
        cancelled: { text: '✕ Отменена', class: 'status-cancelled' }
      };
      const bInfo = badgeMap[newStatus] || badgeMap.new;
      badgeEl.className = `status-badge ${bInfo.class}`;
      badgeEl.textContent = bInfo.text;

      renderAll();
    });
  });

  // Delete Appointment
  if (deleteAppointmentBtn) {
    deleteAppointmentBtn.addEventListener('click', () => {
      if (!selectedAppForDetail) return;
      if (confirm(`Удалить бронь #${selectedAppForDetail.id} клиента ${selectedAppForDetail.clientName}?`)) {
        window.evoData.deleteAppointment(selectedAppForDetail.id);
        closeAppointmentDetail();
        renderAll();
      }
    });
  }

  // ============================================================
  // 8. RENDER APPOINTMENTS TABLE (СПИСОК ВСЕХ ЗАПИСЕЙ)
  // ============================================================
  function renderAppointments() {
    if (!appointmentsTbody) return;
    const appointments = window.evoData.getAppointments();

    let filtered = appointments.filter(a => {
      if (appointmentFilter === 'all') return true;
      return a.status === appointmentFilter;
    });

    if (filtered.length === 0) {
      appointmentsTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
            Записей с таким статусом не найдено
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    filtered.forEach(app => {
      const statusLabels = {
        new: '<span class="status-badge status-new">● Новая</span>',
        confirmed: '<span class="status-badge status-confirmed">✓ Подтверждена</span>',
        in_progress: '<span class="status-badge status-in_progress">⏳ В процессе</span>',
        completed: '<span class="status-badge status-completed">✔ Выполнена</span>',
        cancelled: '<span class="status-badge status-cancelled">✕ Отменена</span>'
      };

      html += `
        <tr>
          <td>
            <strong>#${app.id}</strong>
            <div style="font-size: 11px; color: var(--color-text-muted);">
              ${new Date(app.createdAt || Date.now()).toLocaleDateString('ru-RU')}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; cursor: pointer; color: var(--color-primary);" class="app-row-click" data-id="${app.id}">
              ${app.clientName}
            </div>
            <a href="tel:${app.phone}" style="color: var(--color-primary); font-size: 12px; text-decoration: none;">📞 ${app.phone}</a>
            ${app.comment ? `<div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px; font-style: italic;">«${app.comment}»</div>` : ''}
          </td>
          <td>
            <div style="font-weight: 500;">${app.serviceName}</div>
            <div style="font-size: 11px; color: var(--color-text-muted);">Специалист: ${app.specialistName || 'Любой'}</div>
            ${app.branch ? `<div style="font-size: 11px; color: #8A6E48; font-weight: 600; margin-top: 3px;">📍 ${app.branch}</div>` : ''}
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-primary);">${app.date}</div>
            <div style="font-size: 12px;">⏰ ${app.time}</div>
          </td>
          <td>
            <div style="font-family: var(--font-serif); font-weight: 700; color: var(--color-primary);">
              ${window.evoData.formatMoney(app.price)}
            </div>
          </td>
          <td>${statusLabels[app.status] || app.status}</td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center;">
              <select class="form-select status-select" data-id="${app.id}" style="padding: 6px 10px; font-size: 12px; border-radius: 6px;">
                <option value="new" ${app.status === 'new' ? 'selected' : ''}>🟢 Новая</option>
                <option value="confirmed" ${app.status === 'confirmed' ? 'selected' : ''}>🟠 Подтвердить</option>
                <option value="in_progress" ${app.status === 'in_progress' ? 'selected' : ''}>⏳ В процессе</option>
                <option value="completed" ${app.status === 'completed' ? 'selected' : ''}>🔵 Выполнена</option>
                <option value="cancelled" ${app.status === 'cancelled' ? 'selected' : ''}>✕ Отменить</option>
              </select>
              <button class="btn btn-outline app-view-btn" data-id="${app.id}" title="Подробнее" style="padding: 6px 10px; font-size: 11px;">
                🔍
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    appointmentsTbody.innerHTML = html;

    // Status change listener
    appointmentsTbody.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-id');
        const newStatus = e.target.value;
        window.evoData.updateAppointmentStatus(id, newStatus);
        renderAll();
      });
    });

    // Row detail click
    appointmentsTbody.querySelectorAll('.app-row-click, .app-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openAppointmentDetail(id);
      });
    });
  }

  // ============================================================
  // 9. RENDER SERVICES TABLE (УПРАВЛЕНИЕ УСЛУГАМИ И ЦЕНАМИ)
  // ============================================================
  function renderServices() {
    if (!servicesTbody) return;
    const services = window.evoData.getServices();
    const categories = window.evoData.getCategories();

    let filtered = services.filter(s => {
      const matchCat = (serviceCategoryFilter === 'all') || (s.categoryId === serviceCategoryFilter);
      const matchSearch = !serviceSearchQuery || 
        s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
        (s.subCategory && s.subCategory.toLowerCase().includes(serviceSearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    let html = '';
    filtered.forEach(s => {
      const catObj = categories.find(c => c.id === s.categoryId);
      const catName = catObj ? catObj.name : s.categoryId;

      html += `
        <tr style="${s.isHidden ? 'opacity: 0.55; background: #FFF9F9;' : ''}">
          <td>
            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span>${s.name}</span>
              ${s.isHidden ? '<span style="font-size: 10px; background: #FEE2E2; color: #991B1B; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Скрыта с сайта</span>' : '<span style="font-size: 10px; background: #ECFDF5; color: #065F46; padding: 2px 6px; border-radius: 4px;">Активна</span>'}
            </div>
            <div style="font-size: 11px; color: var(--color-text-muted); max-width: 300px; margin-top: 3px;">
              ${s.desc || '—'}
            </div>
          </td>
          <td>
            <span class="badge-cat" style="font-size: 10px;">${catName}</span>
            <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">${s.subCategory || ''}</div>
          </td>
          <td>
            <div style="font-size: 12px;">⏱ ${s.duration || '—'}</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" class="form-input service-price-input" data-id="${s.id}" value="${s.price}" style="width: 120px; padding: 6px 8px; font-size: 12px; font-weight: 600;">
              <span style="font-size: 11px; font-weight: 600; color: var(--color-primary);">₫</span>
              <button class="btn btn-outline save-price-btn" data-id="${s.id}" title="Сохранить цену" style="padding: 6px 10px; font-size: 11px;">
                💾
              </button>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn-outline edit-service-btn" data-id="${s.id}" title="Редактировать всё" style="padding: 6px 10px; font-size: 12px; background: #FFFFFF;">
                ✏️
              </button>
              <button class="btn btn-outline toggle-vis-btn" data-id="${s.id}" title="${s.isHidden ? 'Показать на сайте' : 'Временно скрыть'}" style="padding: 6px 10px; font-size: 12px; background: #FFFFFF;">
                ${s.isHidden ? '👁️' : '🚫'}
              </button>
              <button class="btn btn-outline delete-service-btn" data-id="${s.id}" title="Удалить услугу" style="padding: 6px 10px; font-size: 12px; color: #DC2626; border-color: #FCA5A5; background: #FFFFFF;">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    servicesTbody.innerHTML = html;

    // Attach Price Save Handlers
    servicesTbody.querySelectorAll('.save-price-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const input = servicesTbody.querySelector(`.service-price-input[data-id="${id}"]`);
        if (input) {
          const newPrice = Number(input.value);
          window.evoData.updateServicePrice(id, newPrice);
          btn.textContent = '✓';
          btn.style.borderColor = '#10B981';
          btn.style.color = '#10B981';
          setTimeout(() => {
            btn.textContent = '💾';
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 1500);
        }
      });
    });

    // Attach Edit Full Service Handlers
    servicesTbody.querySelectorAll('.edit-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Attach Toggle Visibility Handlers
    servicesTbody.querySelectorAll('.toggle-vis-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.evoData.toggleServiceVisibility(id);
        renderServices();
      });
    });

    // Attach Delete Service Handlers
    servicesTbody.querySelectorAll('.delete-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const s = window.evoData.getServices().find(item => item.id === id);
        const name = s ? s.name : "процедуру";
        if (confirm(`Вы уверены, что хотите навсегда удалить «${name}» из каталога?`)) {
          window.evoData.deleteService(id);
          renderServices();
          renderKPIs();
        }
      });
    });
  }

  // ============================================================
  // 10. EDIT SERVICE MODAL LOGIC
  // ============================================================
  function openEditModal(serviceId) {
    const s = window.evoData.getServices().find(item => item.id === serviceId);
    if (!s || !editServiceModal) return;

    document.getElementById('editServiceId').value = s.id;
    document.getElementById('editServiceName').value = s.name || '';
    document.getElementById('editServiceCategory').value = s.categoryId || 'cosmetology';
    document.getElementById('editServiceSubcategory').value = s.subCategory || '';
    document.getElementById('editServicePrice').value = s.price || 0;
    document.getElementById('editServiceDuration').value = s.duration || '';
    document.getElementById('editServiceDesc').value = s.desc || '';

    editServiceModal.style.display = 'flex';
    setTimeout(() => {
      editServiceModal.classList.add('active');
    }, 10);
  }

  function closeEditModal() {
    if (editServiceModal) {
      editServiceModal.classList.remove('active');
      setTimeout(() => {
        editServiceModal.style.display = 'none';
      }, 200);
    }
  }

  if (closeEditServiceBtn) closeEditServiceBtn.addEventListener('click', closeEditModal);
  if (editServiceModal) {
    editServiceModal.addEventListener('click', (e) => {
      if (e.target === editServiceModal) closeEditModal();
    });
  }

  if (editServiceForm) {
    editServiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editServiceId').value;
      const updatedData = {
        name: document.getElementById('editServiceName').value.trim(),
        categoryId: document.getElementById('editServiceCategory').value,
        subCategory: document.getElementById('editServiceSubcategory').value.trim(),
        price: Number(document.getElementById('editServicePrice').value),
        duration: document.getElementById('editServiceDuration').value.trim(),
        desc: document.getElementById('editServiceDesc').value.trim()
      };

      window.evoData.updateService(id, updatedData);
      closeEditModal();
      renderServices();
      alert(`Изменения в процедуре «${updatedData.name}» успешно сохранены и обновлены на сайте!`);
    });
  }

  // ============================================================
  // 11. ADD NEW SERVICE MODAL LOGIC
  // ============================================================
  const newServiceCategorySelect = document.getElementById('newServiceCategory');
  const newServiceSubcategorySelect = document.getElementById('newServiceSubcategorySelect');
  const customSubcategoryWrap = document.getElementById('customSubcategoryWrap');
  const newServiceCustomSubcategory = document.getElementById('newServiceCustomSubcategory');

  function populateSubcategoriesForCategory(catId) {
    if (!newServiceSubcategorySelect) return;
    const services = window.evoData.getServices();
    const existingSubs = [...new Set(
      services
        .filter(s => s.categoryId === catId && s.subCategory)
        .map(s => s.subCategory)
    )];

    let html = '';
    existingSubs.forEach(sub => {
      html += `<option value="${sub}">${sub}</option>`;
    });
    html += `<option value="__NEW__">+ Создать новую подкатегорию...</option>`;

    newServiceSubcategorySelect.innerHTML = html;
    
    if (customSubcategoryWrap) customSubcategoryWrap.style.display = 'none';
    if (newServiceCustomSubcategory) newServiceCustomSubcategory.value = '';
  }

  if (newServiceCategorySelect) {
    newServiceCategorySelect.addEventListener('change', () => {
      populateSubcategoriesForCategory(newServiceCategorySelect.value);
    });
  }

  if (newServiceSubcategorySelect) {
    newServiceSubcategorySelect.addEventListener('change', () => {
      if (newServiceSubcategorySelect.value === '__NEW__') {
        if (customSubcategoryWrap) {
          customSubcategoryWrap.style.display = 'block';
          if (newServiceCustomSubcategory) newServiceCustomSubcategory.focus();
        }
      } else {
        if (customSubcategoryWrap) customSubcategoryWrap.style.display = 'none';
      }
    });
  }

  if (openAddServiceBtn && addServiceModal) {
    openAddServiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (newServiceCategorySelect) {
        populateSubcategoriesForCategory(newServiceCategorySelect.value);
      }
      addServiceModal.style.display = 'flex';
      setTimeout(() => {
        addServiceModal.classList.add('active');
      }, 10);
    });
  }

  function closeServiceModal() {
    if (addServiceModal) {
      addServiceModal.classList.remove('active');
      setTimeout(() => {
        addServiceModal.style.display = 'none';
      }, 200);
    }
  }

  if (closeAddServiceBtn && addServiceModal) {
    closeAddServiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeServiceModal();
    });
  }

  if (addServiceModal) {
    addServiceModal.addEventListener('click', (e) => {
      if (e.target === addServiceModal) closeServiceModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addServiceModal && addServiceModal.classList.contains('active')) closeServiceModal();
      if (editServiceModal && editServiceModal.classList.contains('active')) closeEditModal();
      if (quickBookingModal && quickBookingModal.classList.contains('active')) closeQuickBookingModal();
      if (appDetailModal && appDetailModal.classList.contains('active')) closeAppointmentDetail();
    }
  });

  if (addServiceForm) {
    addServiceForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let resolvedSubcategory = newServiceSubcategorySelect.value;
      if (resolvedSubcategory === '__NEW__') {
        resolvedSubcategory = (newServiceCustomSubcategory.value.trim()) || 'Новые процедуры';
      }

      const newService = {
        name: document.getElementById('newServiceName').value.trim(),
        categoryId: newServiceCategorySelect.value,
        subCategory: resolvedSubcategory,
        price: Number(document.getElementById('newServicePrice').value),
        duration: document.getElementById('newServiceDuration').value.trim() || 'По протоколу',
        desc: document.getElementById('newServiceDesc').value.trim()
      };

      window.evoData.addService(newService);
      closeServiceModal();
      addServiceForm.reset();
      
      const srvTabNav = document.querySelector('.admin-nav-item[data-tab="services"]');
      if (srvTabNav) srvTabNav.click();

      renderServices();
      renderKPIs();
      
      alert(`Услуга «${newService.name}» успешно добавлена в раздел «${newService.subCategory}» и доступна на сайте!`);
    });
  }

  // ============================================================
  // 12. FILTER LISTENERS & SYNCHRONIZATION
  // ============================================================
  const appFilterBtns = document.querySelectorAll('.app-filter-btn');
  appFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      appFilterBtns.forEach(b => b.classList.remove('btn-primary'));
      btn.classList.add('btn-primary');
      appointmentFilter = btn.getAttribute('data-filter');
      renderAppointments();
    });
  });

  const srvCatSelect = document.getElementById('adminServiceCatFilter');
  if (srvCatSelect) {
    srvCatSelect.addEventListener('change', (e) => {
      serviceCategoryFilter = e.target.value;
      renderServices();
    });
  }

  const srvSearchInput = document.getElementById('adminServiceSearch');
  if (srvSearchInput) {
    srvSearchInput.addEventListener('input', (e) => {
      serviceSearchQuery = e.target.value.trim();
      renderServices();
    });
  }

  // ============================================================
  // 13. REAL-TIME AUTO-SYNCHRONIZATION (ОНЛАЙН-СИНХРОНИЗАЦИЯ)
  // ============================================================
  function renderAll() {
    renderKPIs();
    renderTimeline();
    renderAppointments();
    renderServices();
  }

  // Listen to cross-tab storage changes (e.g. client booked online in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.includes('evo_')) {
      renderAll();
    }
  });

  // Re-render when admin switches back to this tab
  window.addEventListener('focus', () => {
    renderAll();
  });

  // Background auto-refresh timer every 25 seconds
  setInterval(renderAll, 25000);

  // Initialize CRM
  renderAll();
});
