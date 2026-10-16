/**
 * NOIR Hair Atelier - Admin CRM Controller
 * Управление расписанием мастеров, живой редактор записей, смены и прейскурант
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

const ADMIN_PIN = "1234";
let currentDate = new Date().toISOString().split('T')[0];
let currentTab = 'timeline';
let currentWeekOffset = 0; // 0 = текущая неделя, 1 = следующая и т.д.
let adminServiceSearchQuery = '';

function initAdmin() {
  setupAuth();
  setupNav();
  setupModals();
  setupLiveSync();
}

function setupLiveSync() {
  // Мгновенная синхронизация между вкладками через событие storage
  window.addEventListener('storage', (e) => {
    if (e.key === window.noirData.STORAGE_KEYS.APPOINTMENTS || 
        e.key === window.noirData.STORAGE_KEYS.SPECIALISTS || 
        e.key === window.noirData.STORAGE_KEYS.SERVICES ||
        e.key === window.noirData.STORAGE_KEYS.CLIENTS) {
      updateKPIs();
      if (currentTab === 'timeline') renderTimeline();
      if (currentTab === 'specialists') renderSpecialistsSchedule();
      if (currentTab === 'appointments') renderJournal();
      if (currentTab === 'services') renderServicesAdmin();
      if (currentTab === 'clients') renderClientsAdmin();
    }
  });

  // Автоматическое обновление данных при переключении на вкладку браузера
  window.addEventListener('focus', () => {
    updateKPIs();
    if (currentTab === 'timeline') renderTimeline();
    if (currentTab === 'specialists') renderSpecialistsSchedule();
    if (currentTab === 'appointments') renderJournal();
    if (currentTab === 'services') renderServicesAdmin();
    if (currentTab === 'clients') renderClientsAdmin();
  });
}

function setupAuth() {
  const pinForm = document.getElementById('pinAuthForm');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinErrorMsg');
  const pinScreen = document.getElementById('pinLockScreen');
  const mainLayout = document.getElementById('adminMainLayout');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('autologin') === '1') {
    sessionStorage.setItem('noir_admin_auth', 'true');
  }

  // Проверка сессии
  if (sessionStorage.getItem('noir_admin_auth') === 'true' || (pinScreen && pinScreen.style.display === 'none')) {
    if (pinScreen) pinScreen.style.display = 'none';
    if (mainLayout) mainLayout.style.display = 'flex';
    loadDashboard();
    return;
  }

  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (pinInput.value === ADMIN_PIN) {
        sessionStorage.setItem('noir_admin_auth', 'true');
        pinScreen.style.display = 'none';
        mainLayout.style.display = 'flex';
        loadDashboard();
      } else {
        if (pinError) pinError.style.display = 'block';
        pinInput.value = '';
      }
    });
  }
}

function setupNav() {
  const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  const dateInput = document.getElementById('timelineDateInput');
  const dateDisplay = document.getElementById('timelineCurrentDateDisplay');
  const prevDayBtn = document.getElementById('timelinePrevDayBtn');
  const nextDayBtn = document.getElementById('timelineNextDayBtn');
  const todayBtn = document.getElementById('timelineTodayBtn');
  const refreshBtn = document.getElementById('timelineRefreshBtn');

  function updateTimelineDateDisplay() {
    if (dateInput) dateInput.value = currentDate;
    if (dateDisplay) {
      const d = new Date(currentDate);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      dateDisplay.textContent = d.toLocaleDateString('ru-RU', options);
    }
  }

  updateTimelineDateDisplay();

  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      currentDate = e.target.value;
      updateTimelineDateDisplay();
      renderTimeline();
    });
  }

  if (prevDayBtn) {
    prevDayBtn.addEventListener('click', () => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      currentDate = d.toISOString().split('T')[0];
      updateTimelineDateDisplay();
      renderTimeline();
    });
  }

  if (nextDayBtn) {
    nextDayBtn.addEventListener('click', () => {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      currentDate = d.toISOString().split('T')[0];
      updateTimelineDateDisplay();
      renderTimeline();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentDate = new Date().toISOString().split('T')[0];
      updateTimelineDateDisplay();
      renderTimeline();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      updateKPIs();
      renderTimeline();
    });
  }

  // Недельный навигатор в расписании мастеров
  const prevWeekBtn = document.getElementById('schedulePrevWeekBtn');
  const nextWeekBtn = document.getElementById('scheduleNextWeekBtn');
  const currentWeekBtn = document.getElementById('scheduleCurrentWeekBtn');

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      currentWeekOffset--;
      renderSpecialistsSchedule();
    });
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      currentWeekOffset++;
      renderSpecialistsSchedule();
    });
  }

  if (currentWeekBtn) {
    currentWeekBtn.addEventListener('click', () => {
      currentWeekOffset = 0;
      renderSpecialistsSchedule();
    });
  }
}

function switchTab(tabId) {
  currentTab = tabId;

  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    }
  });

  document.querySelectorAll('.admin-tab-pane').forEach(pane => {
    pane.style.display = 'none';
  });

  const activePane = document.getElementById(`tabPane_${tabId}`);
  if (activePane) {
    activePane.style.display = 'block';
  }

  if (tabId === 'timeline') renderTimeline();
  if (tabId === 'specialists') renderSpecialistsSchedule();
  if (tabId === 'appointments') renderJournal();
  if (tabId === 'services') renderServicesAdmin();
  if (tabId === 'clients') renderClientsAdmin();
}

function loadDashboard() {
  updateKPIs();
  switchTab(currentTab);

  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get('tab');
  const openSpec = urlParams.get('openSpec');
  const addSpec = urlParams.get('addSpec');

  if (targetTab) {
    switchTab(targetTab);
  }

  if (openSpec) {
    switchTab('specialists');
    setTimeout(() => {
      openEditSpecialistModal(openSpec);
    }, 150);
  } else if (addSpec === '1') {
    switchTab('specialists');
    setTimeout(() => {
      openCreateSpecialistModal();
    }, 150);
  }

  const openService = urlParams.get('openService');
  const addService = urlParams.get('addService');
  if (openService) {
    switchTab('services');
    setTimeout(() => {
      openEditServiceModal(openService);
    }, 150);
  } else if (addService === '1') {
    switchTab('services');
    setTimeout(() => {
      openCreateServiceModal();
    }, 150);
  }

  const openClient = urlParams.get('openClient');
  const addClient = urlParams.get('addClient');
  if (openClient) {
    switchTab('clients');
    setTimeout(() => {
      openClientModal(openClient);
    }, 150);
  } else if (addClient === '1') {
    switchTab('clients');
    setTimeout(() => {
      openCreateClientModal();
    }, 150);
  }
}

function updateKPIs() {
  const appointments = window.noirData.getAppointments();
  const today = new Date().toISOString().split('T')[0];

  // 1. Новые заявки (требуют подтверждения)
  const newRequests = appointments.filter(a => a.status === 'new').length;

  // 2. Записей на сегодня (подтверждённые и выполненные визиты на сегодня)
  const todayConfirmedApps = appointments.filter(a => a.date === today && (a.status === 'confirmed' || a.status === 'completed'));
  const todayCount = todayConfirmedApps.length;

  // 3. Выручка сегодня (сумма подтверждённых броней на сегодня)
  const todayConfirmedRevenue = todayConfirmedApps.reduce((acc, a) => acc + (a.price || 0), 0);

  // 4. В кассе / Оплачено (сумма по выполненным записям за сегодня)
  const todayCompletedApps = appointments.filter(a => a.date === today && a.status === 'completed');
  const todayCashRevenue = todayCompletedApps.reduce((acc, a) => acc + (a.price || 0), 0);

  const kpiNewCount = document.getElementById('kpiNewRequestsCount');
  const kpiTodayCount = document.getElementById('kpiTodayCount');
  const kpiTodayRev = document.getElementById('kpiTodayRevenue');
  const kpiCashRev = document.getElementById('kpiCashRevenue');

  if (kpiNewCount) kpiNewCount.textContent = newRequests;
  if (kpiTodayCount) kpiTodayCount.textContent = todayCount;
  if (kpiTodayRev) kpiTodayRev.textContent = window.noirData.formatMoney(todayConfirmedRevenue);
  if (kpiCashRev) kpiCashRev.textContent = window.noirData.formatMoney(todayCashRevenue);
}

// ==========================================
// 1. ТАЙМЛАЙН / СЕТКА РАСПИСАНИЯ НА ДЕНЬ
// ==========================================
function renderTimeline() {
  const tbody = document.getElementById('timelineTableBody');
  if (!tbody) return;

  const specialists = window.noirData.getSpecialists();
  const appointments = window.noirData.getAppointments().filter(a => a.date === currentDate);
  const hours = [
    "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00"
  ];

  const d = new Date(currentDate);
  const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();

  let html = '';

  specialists.forEach(sp => {
    let isWorking = true;
    if (sp.customSchedule && sp.customSchedule[currentDate]) {
      isWorking = sp.customSchedule[currentDate].isWorking;
    } else if (sp.workDays) {
      isWorking = sp.workDays.includes(dayOfWeek);
    }

    html += `
      <tr style="${!isWorking ? 'opacity: 0.6; background: rgba(0,0,0,0.2);' : ''}">
        <td style="border-right: 1px solid var(--border-subtle); padding: 10px 14px; width: 220px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${sp.avatar}" alt="${sp.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium); flex-shrink: 0;">
            <div style="overflow: hidden;">
              <div style="font-size: 14px; font-weight: 800; color: #FFFFFF; white-space: nowrap;">${sp.name}</div>
              <div style="font-size: 11px; color: ${isWorking ? 'var(--color-success)' : 'var(--text-dim)'}; font-weight: 600; white-space: nowrap;">
                ${isWorking ? '● На смене' : '○ Выходной'}
              </div>
            </div>
          </div>
        </td>
    `;

    for (let i = 0; i < hours.length; i++) {
      const h = hours[i];
      const hNum = parseInt(h.split(':')[0], 10);

      const app = appointments.find(a => {
        if (a.specialistId !== sp.id && (!a.specialistName || !a.specialistName.includes(sp.name))) {
          return false;
        }
        const appHour = parseInt(a.time.split(':')[0], 10);
        return appHour === hNum && a.status !== 'cancelled';
      });

      if (app) {
        const dur = app.duration || 60;
        const startMin = parseInt((app.time.split(':')[1] || '0'), 10);
        const totalEndMin = hNum * 60 + startMin + dur;
        const endHour = Math.floor(totalEndMin / 60);
        const endMin = totalEndMin % 60;
        const endTimeStr = String(endHour).padStart(2, '0') + ':' + String(endMin).padStart(2, '0');
        const spanHours = Math.max(1, Math.ceil(dur / 60));
        const actualColspan = Math.min(spanHours, hours.length - i);

        let statusClass = 'badge-status-confirmed';
        if (app.status === 'new') statusClass = 'badge-status-new';
        if (app.status === 'completed') statusClass = 'badge-status-completed';

        html += `
          <td colspan="${actualColspan}" class="timeline-app-cell" style="background: var(--bg-card); border: 1px solid var(--border-accent); border-left: 4px solid var(--accent-gold); border-radius: var(--radius-sm); padding: 8px 12px; box-shadow: var(--shadow-sm); vertical-align: middle;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 800; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${app.clientName}
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="badge-status ${statusClass}" style="font-size: 10px; padding: 2px 6px;">
                  ${app.status === 'new' ? 'Новая' : app.status === 'completed' ? 'Выполнена' : 'Подтверждена'}
                </span>
                <button type="button" class="btn btn-secondary" onclick="openEditAppointmentModal('${app.id}')" style="padding: 2px 7px; font-size: 11px; line-height: 1.2; box-shadow: none;" title="Изменить запись, время или услуги">
                  ✏️ Изменить
                </button>
              </div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
              ${app.serviceName}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 10px; color: var(--text-dim);">
              <span style="font-family: var(--font-mono);">${app.time} – ${endTimeStr} (${dur} мин)</span>
              <span style="font-weight: 700; color: var(--accent-gold);">${window.noirData.formatMoney(app.price)}</span>
            </div>
          </td>
        `;
        i += (actualColspan - 1);
      } else if (!isWorking) {
        html += `
          <td style="color: var(--text-dim); text-align: center; background: rgba(0,0,0,0.15);">
            <span style="opacity: 0.3; font-size: 11px;">вых</span>
          </td>
        `;
      } else {
        html += `
          <td style="color: var(--text-dim); text-align: center; cursor: pointer;" onclick="openQuickBookingFor('${sp.id}', '${h}')" title="Нажмите, чтобы записать клиента на ${h}">
            <span style="opacity: 0.25; font-size: 14px;">+</span>
          </td>
        `;
      }
    }

    html += `</tr>`;
  });

  // Строка нераспределённых записей (Любой свободный мастер)
  const unassignedApps = appointments.filter(a => {
    return !specialists.some(sp => (a.specialistId === sp.id || (a.specialistName && a.specialistName.includes(sp.name))));
  });

  if (unassignedApps.length > 0) {
    html += `
      <tr style="background: rgba(229, 169, 60, 0.06); border-top: 2px dashed var(--accent-gold);">
        <td style="border-right: 1px solid var(--border-subtle); padding: 10px 14px; width: 220px; min-width: 220px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent-gold-bg); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; font-size: 15px; color: var(--accent-gold); font-weight: 800; flex-shrink: 0;">
              !
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--accent-gold); font-size: 14px; font-weight: 800;">Не назначен</span>
                <span class="badge-status badge-status-new" style="font-size: 9px; padding: 2px 6px;">Требует мастера</span>
              </div>
              <div style="font-size: 11px; color: var(--text-dim);">Любой свободный мастер</div>
            </div>
          </div>
        </td>
    `;

    for (let i = 0; i < hours.length; i++) {
      const h = hours[i];
      const hNum = parseInt(h.split(':')[0], 10);
      const app = unassignedApps.find(a => parseInt(a.time.split(':')[0], 10) === hNum);

      if (app) {
        const dur = app.duration || 60;
        const startMin = parseInt((app.time.split(':')[1] || '0'), 10);
        const totalEndMin = hNum * 60 + startMin + dur;
        const endHour = Math.floor(totalEndMin / 60);
        const endMin = totalEndMin % 60;
        const endTimeStr = String(endHour).padStart(2, '0') + ':' + String(endMin).padStart(2, '0');
        const spanHours = Math.max(1, Math.ceil(dur / 60));
        const actualColspan = Math.min(spanHours, hours.length - i);

        html += `
          <td colspan="${actualColspan}" class="timeline-app-cell" style="background: var(--bg-card); border: 1px solid var(--color-warning); border-left: 4px solid var(--color-warning); border-radius: var(--radius-sm); padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 800; color: #FFFFFF;">${app.clientName}</span>
              <button type="button" class="btn btn-primary" onclick="openEditAppointmentModal('${app.id}')" style="padding: 2px 7px; font-size: 10px; line-height: 1.2;">
                ✏️ Назначить
              </button>
            </div>
            <div style="font-size: 11px; color: var(--text-muted);">${app.serviceName}</div>
            <div style="font-size: 10px; color: var(--color-warning); margin-top: 2px;">
              ⚠️ Выберите мастера
            </div>
          </td>
        `;
        i += (actualColspan - 1);
      } else {
        html += `<td style="color: var(--text-dim); text-align: center; opacity: 0.2;">—</td>`;
      }
    }
    html += `</tr>`;
  }

  tbody.innerHTML = html;
}

// ==========================================
// 2. РАСПИСАНИЕ И СМЕНЫ МАСТЕРОВ
// ==========================================
function getWeekDays(offset = 0) {
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDay + 1 + (offset * 7));

  const days = [];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${dayNames[i]} ${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNum: i + 1,
      label: dayLabel
    });
  }
  return days;
}

function renderSpecialistsSchedule() {
  const headerRow = document.getElementById('scheduleDaysHeader');
  const tbody = document.getElementById('specialistsScheduleTableBody');
  const weekLabel = document.getElementById('scheduleCurrentWeekLabel');
  if (!headerRow || !tbody) return;

  const week = getWeekDays(currentWeekOffset);
  const specialists = window.noirData.getSpecialists();

  const firstDay = week[0].label.split(' ')[1];
  const lastDay = week[6].label.split(' ')[1];
  if (weekLabel) {
    weekLabel.textContent = `${firstDay} — ${lastDay} (${currentWeekOffset === 0 ? 'Текущая' : currentWeekOffset > 0 ? '+' + currentWeekOffset + ' нед.' : currentWeekOffset + ' нед.'})`;
  }

  let headerHtml = `
    <th style="width: 220px;">Специалист</th>
    ${week.map(w => `<th style="text-align: center; font-size: 12px;">${w.label}</th>`).join('')}
    <th style="width: 110px; text-align: right;">Действия</th>
  `;
  headerRow.innerHTML = headerHtml;

  let bodyHtml = '';
  specialists.forEach(sp => {
    bodyHtml += `
      <tr>
        <td style="border-right: 1px solid var(--border-subtle); padding: 12px 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${sp.avatar}" alt="${sp.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium);">
            <div>
              <div style="font-weight: 800; color: #FFFFFF; font-size: 14px;">${sp.name}</div>
              <div style="font-size: 11px; color: var(--accent-gold);">${sp.role.split(',')[0]}</div>
            </div>
          </div>
        </td>
    `;

    week.forEach(w => {
      let isWorking = true;
      let hours = "10:00 - 20:00";

      if (sp.customSchedule && sp.customSchedule[w.dateStr]) {
        isWorking = sp.customSchedule[w.dateStr].isWorking;
        hours = sp.customSchedule[w.dateStr].hours || hours;
      } else if (sp.workDays) {
        isWorking = sp.workDays.includes(w.dayNum);
      }

      bodyHtml += `
        <td style="text-align: center; padding: 10px 6px;">
          <button type="button" onclick="toggleSpecialistDay('${sp.id}', '${w.dateStr}')" style="width: 100%; padding: 8px 6px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; ${isWorking ? 'background: var(--color-success-bg); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.35);' : 'background: rgba(255,255,255,0.03); color: var(--text-dim); border: 1px solid var(--border-subtle);'}" title="Нажмите, чтобы переключить рабочий/выходной">
            ${isWorking ? '10:00–20:00' : 'Выходной'}
          </button>
        </td>
      `;
    });

    bodyHtml += `
        <td style="text-align: right; padding: 12px 14px;">
          <button type="button" class="btn btn-secondary" onclick="openEditSpecialistModal('${sp.id}')" style="padding: 4px 10px; font-size: 12px;">
            Профиль
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = bodyHtml;
}

window.toggleSpecialistDay = function(specId, dateStr) {
  const specialists = window.noirData.getSpecialists();
  const sp = specialists.find(s => s.id === specId);
  if (!sp) return;

  if (!sp.customSchedule) sp.customSchedule = {};

  const d = new Date(dateStr);
  const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
  const defaultWorking = (sp.workDays || [1,2,3,4,5,6,7]).includes(dayOfWeek);

  const currentStatus = sp.customSchedule[dateStr] 
    ? sp.customSchedule[dateStr].isWorking 
    : defaultWorking;

  sp.customSchedule[dateStr] = {
    isWorking: !currentStatus,
    hours: !currentStatus ? "10:00 - 20:00" : ""
  };

  window.noirData.saveSpecialists(specialists);
  renderSpecialistsSchedule();
  renderTimeline();
};

// ==========================================
// 3. ЖУРНАЛ ЗАПИСЕЙ (ТАБЛИЦА + ПОИСК/ФИЛЬТР)
// ==========================================
function renderJournal() {
  const tbody = document.getElementById('journalTableBody');
  if (!tbody) return;

  const appointments = window.noirData.getAppointments();
  const searchInput = document.getElementById('journalSearchInput');
  const statusFilter = document.getElementById('journalStatusFilter');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filter = statusFilter ? statusFilter.value : 'all';

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (query) {
      const matchName = a.clientName.toLowerCase().includes(query);
      const matchPhone = (a.phone || '').toLowerCase().includes(query);
      const matchService = (a.serviceName || '').toLowerCase().includes(query);
      const matchId = (a.id || '').toLowerCase().includes(query);
      return matchName || matchPhone || matchService || matchId;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-dim);">
          Записи не найдены
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(a => {
    let statusClass = 'badge-status-confirmed';
    if (a.status === 'new') statusClass = 'badge-status-new';
    if (a.status === 'completed') statusClass = 'badge-status-completed';
    if (a.status === 'cancelled') statusClass = 'badge-status-cancelled';

    html += `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold);">${a.id}</td>
        <td>
          <div style="font-weight: 700; color: #FFFFFF;">${a.clientName}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${a.phone || '—'}</div>
        </td>
        <td>
          <div style="font-weight: 600; color: #FFFFFF;">${a.serviceName}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${a.duration || 60} мин • ${window.noirData.formatMoney(a.price)}</div>
        </td>
        <td style="color: var(--text-sub);">${a.specialistName}</td>
        <td>
          <div style="font-weight: 600; color: #FFFFFF;">${a.date}</div>
          <div style="font-size: 11px; color: var(--accent-gold); font-family: var(--font-mono);">${a.time}</div>
        </td>
        <td>
          <select class="status-select ${statusClass}" onchange="handleQuickStatusChange('${a.id}', this.value)" title="Быстрая смена статуса записи">
            <option value="new" ${a.status === 'new' ? 'selected' : ''}>Новая</option>
            <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>Подтверждена</option>
            <option value="completed" ${a.status === 'completed' ? 'selected' : ''}>Выполнена</option>
            <option value="cancelled" ${a.status === 'cancelled' ? 'selected' : ''}>Отменена</option>
          </select>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn-secondary" onclick="openEditAppointmentModal('${a.id}')" style="padding: 4px 10px; font-size: 12px;">
            Изменить
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

window.handleQuickStatusChange = function(appId, newStatus) {
  window.noirData.updateAppointmentStatus(appId, newStatus);
  updateKPIs();
  renderJournal();
  if (currentTab === 'timeline') renderTimeline();
};

// ==========================================
// 4. ПРЕЙСКУРАНТ / УСЛУГИ АДМИН
// ==========================================
function renderServicesAdmin() {
  const container = document.getElementById('adminServicesContainer');
  if (!container) return;

  const categories = window.noirData.getCategories();
  const services = window.noirData.getServices();

  let html = '';
  categories.forEach(cat => {
    const catServices = services.filter(s => s.categoryId === cat.id);
    html += `
      <div style="background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="font-size: 16px; font-weight: 800; color: #FFFFFF;">
            ${cat.name}
          </h4>
          <button type="button" class="btn btn-secondary" onclick="openCreateServiceModal('${cat.id}')" style="padding: 4px 12px; font-size: 12px;">
            + Добавить услугу
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
    `;

    if (catServices.length === 0) {
      html += `
        <div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 13px; background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle);">
          В этой категории пока нет услуг. Нажмите «+ Добавить услугу» выше.
        </div>
      `;
    } else {
      catServices.forEach(s => {
        const popularBadge = s.popular 
          ? `<span style="background: rgba(201, 162, 77, 0.15); color: var(--accent-gold); border: 1px solid rgba(201, 162, 77, 0.3); border-radius: 12px; padding: 2px 8px; font-size: 10px; margin-left: 6px; font-weight: 800; text-transform: uppercase;">Хит</span>` 
          : '';
        const includesCount = (s.includes && Array.isArray(s.includes)) ? s.includes.length : 0;

        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <div style="max-width: 70%;">
              <div style="font-weight: 700; color: #FFFFFF; font-size: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                ${s.name} ${popularBadge}
              </div>
              <div style="font-size: 12px; color: var(--text-dim); margin-top: 3px;">
                ${s.duration} мин • ${s.shortDesc || 'Без краткого описания'}
              </div>
              ${includesCount > 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  📋 Протокол: ${includesCount} ${includesCount === 1 ? 'пункт' : (includesCount < 5 ? 'пункта' : 'пунктов')}
                </div>
              ` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="font-weight: 800; color: var(--accent-gold); font-size: 14px; white-space: nowrap;">
                ${window.noirData.formatMoney(s.price)}
              </span>
              <button type="button" class="btn btn-secondary" onclick="openEditServiceModal('${s.id}')" style="padding: 5px 12px; font-size: 12px; white-space: nowrap;">
                Редактировать
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

// ==========================================
// 5. РЕДАКТИРОВАНИЕ ЗАПИСИ (СМЕНА МАСТЕРА, ВРЕМЕНИ, УСЛУГ)
// ==========================================
let currentEditingAppItems = [];

window.openEditAppointmentModal = function(appId) {
  const modal = document.getElementById('adminEditAppointmentModal');
  if (!modal) return;

  const appointments = window.noirData.getAppointments();
  const app = appointments.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('editAppModalTitle').textContent = `Изменить запись #${app.id}`;
  document.getElementById('editAppSubtitle').textContent = `Клиент: ${app.clientName} • ${app.date} в ${app.time}`;
  document.getElementById('editAppId').value = app.id;
  document.getElementById('editAppClientName').value = app.clientName || '';
  document.getElementById('editAppClientPhone').value = app.phone || '';
  document.getElementById('editAppDate').value = app.date;
  document.getElementById('editAppTime').value = app.time;
  document.getElementById('editAppStatus').value = app.status || 'confirmed';
  document.getElementById('editAppComment').value = app.comment || '';

  // Селектор мастеров
  const specSel = document.getElementById('editAppSpecialist');
  if (specSel) {
    const specialists = window.noirData.getSpecialists();
    specSel.innerHTML = `
      <option value="any">Любой свободный мастер</option>
      ${specialists.map(sp => `<option value="${sp.id}" ${sp.id === app.specialistId ? 'selected' : ''}>${sp.name} (${sp.role.split(',')[0]})</option>`).join('')}
    `;
  }

  // Селектор добавления доп. услуги
  const addServiceSel = document.getElementById('editAppAddServiceSelect');
  if (addServiceSel) {
    const allServices = window.noirData.getServices();
    addServiceSel.innerHTML = `
      <option value="">-- Выберите услугу для добавления в чек --</option>
      ${allServices.map(s => `<option value="${s.id}">${s.name} (${window.noirData.formatMoney(s.price)} • ${s.duration} мин)</option>`).join('')}
    `;
  }

  // Инициализация списка услуг
  if (app.items && Array.isArray(app.items) && app.items.length > 0) {
    currentEditingAppItems = JSON.parse(JSON.stringify(app.items));
  } else {
    currentEditingAppItems = [
      {
        serviceId: app.serviceId || '',
        name: app.serviceName || 'Услуга студии',
        price: app.price || 0,
        duration: app.duration || 60
      }
    ];
  }

  renderEditingAppItems();
  modal.classList.add('active');
};

function renderEditingAppItems() {
  const container = document.getElementById('editAppServicesList');
  const totalPriceEl = document.getElementById('editAppTotalPriceDisplay');
  const totalDurEl = document.getElementById('editAppTotalDurationDisplay');
  if (!container) return;

  let totalP = 0;
  let totalD = 0;

  let html = '';
  currentEditingAppItems.forEach((item, idx) => {
    totalP += (item.price || 0);
    totalD += (item.duration || 60);

    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 6px;">
        <div>
          <span style="font-weight: 700; color: #FFFFFF; font-size: 13px;">${item.name}</span>
          <span style="font-size: 11px; color: var(--text-dim); margin-left: 6px;">⏱️ ${item.duration} мин</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 800; color: var(--accent-gold); font-size: 13px;">${window.noirData.formatMoney(item.price)}</span>
          ${currentEditingAppItems.length > 1 ? `
            <button type="button" onclick="removeEditingAppItem(${idx})" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: var(--color-danger); border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer;">
              ✕
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalPriceEl) totalPriceEl.textContent = window.noirData.formatMoney(totalP);
  if (totalDurEl) totalDurEl.textContent = `${totalD} мин`;
}

window.addServiceToEditingApp = function() {
  const addServiceSel = document.getElementById('editAppAddServiceSelect');
  if (!addServiceSel || !addServiceSel.value) return;

  const srvId = addServiceSel.value;
  const srv = window.noirData.getServices().find(s => s.id === srvId);
  if (!srv) return;

  currentEditingAppItems.push({
    serviceId: srv.id,
    name: srv.name,
    price: srv.price,
    duration: srv.duration || 60
  });

  addServiceSel.value = "";
  renderEditingAppItems();
};

window.removeEditingAppItem = function(idx) {
  if (currentEditingAppItems.length > 1) {
    currentEditingAppItems.splice(idx, 1);
    renderEditingAppItems();
  }
};

function setupModals() {
  // Закрытие модальных окон
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  // Сохранение изменений в модалке записи
  const saveAppForm = document.getElementById('adminEditAppForm');
  if (saveAppForm) {
    saveAppForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editAppId').value;
      const clientName = document.getElementById('editAppClientName').value.trim();
      const phone = document.getElementById('editAppClientPhone').value.trim();
      const date = document.getElementById('editAppDate').value;
      const time = document.getElementById('editAppTime').value;
      const specialistId = document.getElementById('editAppSpecialist').value;
      const status = document.getElementById('editAppStatus').value;
      const comment = document.getElementById('editAppComment').value.trim();

      let specialistName = "Любой свободный мастер";
      if (specialistId !== 'any') {
        const sp = window.noirData.getSpecialists().find(s => s.id === specialistId);
        if (sp) specialistName = sp.name;
      }

      let totalP = 0;
      let totalD = 0;
      const serviceNames = [];

      currentEditingAppItems.forEach(item => {
        totalP += (item.price || 0);
        totalD += (item.duration || 60);
        serviceNames.push(item.name);
      });

      window.noirData.updateAppointment(id, {
        clientName,
        phone,
        date,
        time,
        specialistId,
        specialistName,
        status,
        comment,
        serviceId: currentEditingAppItems[0] ? currentEditingAppItems[0].serviceId : '',
        serviceName: serviceNames.join(' + '),
        price: totalP,
        duration: totalD,
        items: currentEditingAppItems
      });

      document.getElementById('adminEditAppointmentModal').classList.remove('active');
      updateKPIs();
      if (currentTab === 'timeline') renderTimeline();
      if (currentTab === 'appointments') renderJournal();
    });
  }

  // Быстрая запись из свободной ячейки
  const quickForm = document.getElementById('adminQuickBookingForm');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const srvId = document.getElementById('adminServiceSelect').value;
      const specId = document.getElementById('adminSpecialistSelect').value;
      const date = document.getElementById('adminBookingDate').value;
      const time = document.getElementById('adminBookingTime').value;
      const clientName = document.getElementById('adminClientName').value.trim();
      const phone = document.getElementById('adminClientPhone').value.trim();

      const srv = window.noirData.getServices().find(s => s.id === srvId);
      const sp = window.noirData.getSpecialists().find(s => s.id === specId);

      const client = window.noirData.findClientByContact(phone) || window.noirData.getClientByPhone(phone);
      const discount = (client && client.discountPercent) ? client.discountPercent : 0;
      const basePrice = srv ? srv.price : 0;
      const finalPrice = discount > 0 ? Math.round(basePrice * (100 - discount) / 100) : basePrice;

      window.noirData.addAppointment({
        clientName,
        phone,
        serviceId: srvId,
        serviceName: srv ? srv.name : "Услуга",
        specialistId: specId,
        specialistName: sp ? sp.name : "Любой свободный мастер",
        date,
        time,
        duration: srv ? srv.duration : 60,
        price: finalPrice,
        discountPercent: discount,
        comment: discount > 0 ? `Применена скидка гостя ${discount}% (базовая цена ${window.noirData.formatMoney(basePrice)})` : ""
      });

      document.getElementById('adminQuickBookingModal').classList.remove('active');
      updateKPIs();
      renderTimeline();
    });
  }

  // Динамическое отображение скидки в быстрой записи
  function updateQuickBookingDiscountDisplay() {
    const quickDiscountBox = document.getElementById('quickBookingDiscountInfo');
    if (!quickDiscountBox) return;
    const phoneInp = document.getElementById('adminClientPhone');
    const phone = phoneInp ? phoneInp.value.trim() : '';
    const client = window.noirData.findClientByContact(phone) || window.noirData.getClientByPhone(phone);
    const serviceSel = document.getElementById('adminServiceSelect');
    const srvId = serviceSel ? serviceSel.value : '';
    const srv = window.noirData.getServices().find(s => s.id === srvId);
    const basePrice = srv ? srv.price : 0;

    if (client && client.discountPercent > 0) {
      const discount = client.discountPercent;
      const saved = Math.round(basePrice * discount / 100);
      const finalP = basePrice - saved;
      quickDiscountBox.style.display = 'block';
      quickDiscountBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <div>
            <span>⭐ Персональная скидка гостя (${client.name}): <strong>${discount}%</strong></span>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Экономия: -${window.noirData.formatMoney(saved)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800; font-size: 14px; color: var(--accent-gold);">${window.noirData.formatMoney(finalP)}</div>
            <div style="text-decoration: line-through; opacity: 0.6; font-size: 11px;">${window.noirData.formatMoney(basePrice)}</div>
          </div>
        </div>
      `;
    } else {
      quickDiscountBox.style.display = 'none';
      quickDiscountBox.innerHTML = '';
    }
  }
  window.updateQuickBookingDiscountDisplay = updateQuickBookingDiscountDisplay;

  const adminClientPhoneInp = document.getElementById('adminClientPhone');
  const adminServiceSel = document.getElementById('adminServiceSelect');

  if (adminClientPhoneInp) {
    adminClientPhoneInp.addEventListener('input', () => {
      const phone = adminClientPhoneInp.value.trim();
      const client = window.noirData.findClientByContact(phone);
      if (client) {
        const nameInp = document.getElementById('adminClientName');
        if (nameInp && (!nameInp.value || nameInp.value === 'Гость')) {
          nameInp.value = client.name;
        }
      }
      updateQuickBookingDiscountDisplay();
    });
  }

  if (adminServiceSel) {
    adminServiceSel.addEventListener('change', updateQuickBookingDiscountDisplay);
  }

  // Поиск в журнале
  const journalSearch = document.getElementById('journalSearchInput');
  if (journalSearch) {
    journalSearch.addEventListener('input', () => {
      renderJournal();
    });
  }

  const journalStatus = document.getElementById('journalStatusFilter');
  if (journalStatus) {
    journalStatus.addEventListener('change', () => {
      renderJournal();
    });
  }

  // Редактирование и добавление мастера
  const specForm = document.getElementById('adminSpecialistForm');
  if (specForm) {
    specForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('specEditId').value;
      const name = document.getElementById('specEditName').value.trim();
      const role = document.getElementById('specEditRole').value.trim();
      const exp = document.getElementById('specEditExperience').value.trim();
      const avatar = document.getElementById('specEditAvatar').value.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

      // Собираем категории
      const selectedCats = [];
      document.querySelectorAll('#specCategoryCheckboxes input:checked').forEach(ch => {
        selectedCats.push(ch.value);
      });

      // Собираем дни недели
      const selectedWorkDays = [];
      document.querySelectorAll('#specWorkDaysCheckboxes input:checked').forEach(ch => {
        selectedWorkDays.push(parseInt(ch.value, 10));
      });

      const finalCategories = selectedCats.length > 0 ? selectedCats : ["men-style", "women-style"];
      const finalWorkDays = selectedWorkDays.length > 0 ? selectedWorkDays : [1, 2, 3, 4, 5, 6, 7];

      if (id) {
        // Редактирование существующего мастера
        window.noirData.updateSpecialist(id, {
          name,
          role,
          experience: exp,
          avatar,
          categories: finalCategories,
          workDays: finalWorkDays
        });
      } else {
        // Создание нового мастера
        window.noirData.addSpecialist({
          name,
          role,
          experience: exp,
          avatar,
          categories: finalCategories,
          workDays: finalWorkDays
        });
      }

      const specModal = document.getElementById('adminSpecialistModal');
      if (specModal) specModal.classList.remove('active');
      updateKPIs();
      renderSpecialistsSchedule();
      renderTimeline();
    });
  }

  // Редактирование и создание услуги
  const serviceForm = document.getElementById('adminServiceForm');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('serviceEditId').value;
      const categoryId = document.getElementById('serviceEditCategory').value;
      const popular = document.getElementById('serviceEditPopular').checked;
      const name = document.getElementById('serviceEditName').value.trim();
      const price = parseInt(document.getElementById('serviceEditPrice').value, 10) || 0;
      const duration = parseInt(document.getElementById('serviceEditDuration').value, 10) || 60;
      const shortDesc = document.getElementById('serviceEditShortDesc').value.trim();
      const fullDesc = document.getElementById('serviceEditFullDesc').value.trim();

      const includes = [];
      document.querySelectorAll('#serviceEditIncludesList .service-include-input').forEach(inp => {
        const val = inp.value.trim();
        if (val) includes.push(val);
      });

      const servicePayload = {
        categoryId,
        name,
        price,
        duration,
        popular,
        shortDesc,
        fullDesc: fullDesc || shortDesc,
        includes: includes.length > 0 ? includes : [
          "Консультация стилиста NOIR",
          "Основная процедура с авторской адаптацией",
          "Финишный стайлинг и рекомендации"
        ]
      };

      if (id) {
        window.noirData.updateService(id, servicePayload);
      } else {
        window.noirData.addService(servicePayload);
      }

      const modal = document.getElementById('adminServiceModal');
      if (modal) modal.classList.remove('active');
      renderServicesAdmin();
    });
  }

  // Поиск и фильтрация в базе клиентов
  const clientSearch = document.getElementById('clientSearchInput');
  if (clientSearch) {
    clientSearch.addEventListener('input', () => {
      renderClientsAdmin();
    });
  }

  const clientCatFilter = document.getElementById('clientCategoryFilter');
  if (clientCatFilter) {
    clientCatFilter.addEventListener('change', () => {
      renderClientsAdmin();
    });
  }

  const clientSort = document.getElementById('clientSortSelect');
  if (clientSort) {
    clientSort.addEventListener('change', () => {
      renderClientsAdmin();
    });
  }

  // Создание нового гостя вручную
  const clientCreateForm = document.getElementById('adminClientCreateForm');
  if (clientCreateForm) {
    clientCreateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newClientName').value.trim();
      const phone = document.getElementById('newClientPhone').value.trim();
      const telegram = document.getElementById('newClientTelegram').value.trim();
      const category = document.getElementById('newClientCategory').value;
      const discountPercent = parseInt(document.getElementById('newClientDiscount').value, 10) || 0;
      const notes = document.getElementById('newClientNotes').value.trim();

      const newClient = window.noirData.addClient({
        name,
        phone,
        telegram,
        category,
        discountPercent,
        notes,
        tags: [category === 'vip' ? 'VIP' : (category === 'regular' ? 'Постоянный' : 'Новый гость')]
      });

      const modal = document.getElementById('adminClientCreateModal');
      if (modal) modal.classList.remove('active');
      renderClientsAdmin();
      if (newClient) {
        openClientModal(newClient.id);
      }
    });
  }
}

window.openQuickBookingFor = function(specialistId, time) {
  const quickModal = document.getElementById('adminQuickBookingModal');
  if (!quickModal) return;

  const serviceSel = document.getElementById('adminServiceSelect');
  const specSel = document.getElementById('adminSpecialistSelect');
  const dateInput = document.getElementById('adminBookingDate');
  const timeInput = document.getElementById('adminBookingTime');

  if (dateInput) dateInput.value = currentDate;
  if (timeInput) timeInput.value = time;

  if (serviceSel) {
    const services = window.noirData.getServices();
    serviceSel.innerHTML = services.map(s => `
      <option value="${s.id}">${s.name} (${window.noirData.formatMoney(s.price)})</option>
    `).join('');
  }

  if (specSel) {
    const specialists = window.noirData.getSpecialists();
    specSel.innerHTML = specialists.map(sp => `
      <option value="${sp.id}" ${sp.id === specialistId ? 'selected' : ''}>${sp.name}</option>
    `).join('');
  }

  updateQuickBookingDiscountDisplay();
  quickModal.classList.add('active');
};

window.openCreateSpecialistModal = function() {
  const modal = document.getElementById('adminSpecialistModal');
  if (!modal) return;

  const titleEl = document.getElementById('specialistModalTitle');
  if (titleEl) titleEl.textContent = "Новый мастер ателье";

  document.getElementById('specEditId').value = "";
  document.getElementById('specEditName').value = "";
  document.getElementById('specEditRole').value = "";
  document.getElementById('specEditExperience').value = "";
  document.getElementById('specEditAvatar').value = "";

  populateCategoryCheckboxes([]);
  document.querySelectorAll('#specWorkDaysCheckboxes input').forEach(ch => ch.checked = true);

  modal.classList.add('active');
};

window.openEditSpecialistModal = function(specId) {
  const modal = document.getElementById('adminSpecialistModal');
  const specialists = window.noirData.getSpecialists();
  const spec = specialists.find(s => s.id === specId);
  if (!modal || !spec) return;

  const titleEl = document.getElementById('specialistModalTitle');
  if (titleEl) titleEl.textContent = "Редактирование профиля: " + spec.name;

  document.getElementById('specEditId').value = spec.id;
  document.getElementById('specEditName').value = spec.name;
  document.getElementById('specEditRole').value = spec.role;
  document.getElementById('specEditExperience').value = spec.experience || "";
  document.getElementById('specEditAvatar').value = spec.avatar || "";

  populateCategoryCheckboxes(spec.categories || []);

  const days = spec.workDays || [1, 2, 3, 4, 5, 6, 7];
  document.querySelectorAll('#specWorkDaysCheckboxes input').forEach(ch => {
    ch.checked = days.includes(parseInt(ch.value, 10));
  });

  modal.classList.add('active');
};

function populateCategoryCheckboxes(selectedCategories = []) {
  const container = document.getElementById('specCategoryCheckboxes');
  if (!container) return;

  const categories = window.noirData.getCategories();
  let html = '';

  categories.forEach(cat => {
    const isChecked = selectedCategories.length === 0 || selectedCategories.includes(cat.id);
    html += `
      <label style="display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: var(--radius-sm); cursor: pointer; transition: border-color 0.2s ease;">
        <input type="checkbox" value="${cat.id}" ${isChecked ? 'checked' : ''} style="accent-color: var(--accent-gold); width: 16px; height: 16px; cursor: pointer;">
        <span style="font-weight: 600; color: #FFFFFF; font-size: 13px;">${cat.name}</span>
      </label>
    `;
  });

  container.innerHTML = html;
}

// ==========================================
// 6. УПРАВЛЕНИЕ УСЛУГАМИ (СОЗДАНИЕ / РЕДАКТИРОВАНИЕ / УДАЛЕНИЕ)
// ==========================================
function populateServiceCategorySelect(selectedCategoryId = null) {
  const select = document.getElementById('serviceEditCategory');
  if (!select) return;

  const categories = window.noirData.getCategories();
  select.innerHTML = categories.map(cat => `
    <option value="${cat.id}" ${cat.id === selectedCategoryId ? 'selected' : ''}>
      ${cat.name}
    </option>
  `).join('');
}

window.addServiceIncludeItem = function(text = '') {
  const container = document.getElementById('serviceEditIncludesList');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'service-include-row';
  row.style.cssText = 'display: flex; gap: 8px; align-items: center;';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input service-include-input';
  input.value = text;
  input.placeholder = 'Пункт протокола (например: Мытьё головы премиальным шампунем)';
  input.style.cssText = 'flex-grow: 1; padding: 7px 12px; font-size: 13px;';

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.innerHTML = '✕';
  delBtn.title = 'Удалить пункт';
  delBtn.style.cssText = 'background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--color-danger); border-radius: var(--radius-sm); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; font-size: 13px; font-weight: 700;';
  delBtn.onclick = function() {
    row.remove();
  };

  row.appendChild(input);
  row.appendChild(delBtn);
  container.appendChild(row);
};

window.openCreateServiceModal = function(preselectedCategoryId = null) {
  const modal = document.getElementById('adminServiceModal');
  if (!modal) return;

  const titleEl = document.getElementById('serviceModalTitle');
  if (titleEl) titleEl.textContent = 'Новая услуга ателье NOIR';

  document.getElementById('serviceEditId').value = '';
  populateServiceCategorySelect(preselectedCategoryId);

  const popEl = document.getElementById('serviceEditPopular');
  if (popEl) popEl.checked = false;

  document.getElementById('serviceEditName').value = '';
  document.getElementById('serviceEditPrice').value = '450000';
  document.getElementById('serviceEditDuration').value = '60';
  document.getElementById('serviceEditShortDesc').value = '';
  document.getElementById('serviceEditFullDesc').value = '';

  const deleteBtn = document.getElementById('serviceDeleteBtn');
  if (deleteBtn) deleteBtn.style.display = 'none';

  const includesContainer = document.getElementById('serviceEditIncludesList');
  if (includesContainer) {
    includesContainer.innerHTML = '';
    // Предустанавливаем 4 базовых пункта для удобства заполнения
    window.addServiceIncludeItem('Консультация стилиста NOIR и диагностика');
    window.addServiceIncludeItem('Мытье головы премиальным шампунем до и после процедуры');
    window.addServiceIncludeItem('Основная авторская процедура с индивидуальной адаптацией');
    window.addServiceIncludeItem('Финишный стайлинг и рекомендации по домашнему уходу');
  }

  modal.classList.add('active');
};

window.openEditServiceModal = function(serviceId) {
  const modal = document.getElementById('adminServiceModal');
  if (!modal) return;

  const services = window.noirData.getServices();
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  const titleEl = document.getElementById('serviceModalTitle');
  if (titleEl) titleEl.textContent = `Редактирование: ${service.name}`;

  document.getElementById('serviceEditId').value = service.id;
  populateServiceCategorySelect(service.categoryId);

  const popEl = document.getElementById('serviceEditPopular');
  if (popEl) popEl.checked = !!service.popular;

  document.getElementById('serviceEditName').value = service.name || '';
  document.getElementById('serviceEditPrice').value = service.price || 0;
  document.getElementById('serviceEditDuration').value = service.duration || 60;
  document.getElementById('serviceEditShortDesc').value = service.shortDesc || '';
  document.getElementById('serviceEditFullDesc').value = service.fullDesc || service.shortDesc || '';

  const deleteBtn = document.getElementById('serviceDeleteBtn');
  if (deleteBtn) deleteBtn.style.display = 'inline-block';

  const includesContainer = document.getElementById('serviceEditIncludesList');
  if (includesContainer) {
    includesContainer.innerHTML = '';
    if (service.includes && Array.isArray(service.includes) && service.includes.length > 0) {
      service.includes.forEach(item => {
        window.addServiceIncludeItem(item);
      });
    } else {
      window.addServiceIncludeItem('Консультация мастера NOIR');
      window.addServiceIncludeItem('Основная процедура с авторской адаптацией');
      window.addServiceIncludeItem('Финишный стайлинг и рекомендации');
    }
  }

  modal.classList.add('active');
};

window.deleteCurrentService = function() {
  const id = document.getElementById('serviceEditId').value;
  if (!id) return;

  const service = window.noirData.getServices().find(s => s.id === id);
  const name = service ? service.name : 'эту услугу';

  if (confirm(`Вы уверены, что хотите удалить услугу «${name}» из прейскуранта?`)) {
    window.noirData.deleteService(id);
    const modal = document.getElementById('adminServiceModal');
    if (modal) modal.classList.remove('active');
    renderServicesAdmin();
  }
};

// ==========================================
// 7. БАЗА КЛИЕНТОВ И КАРТОЧКА ГОСТЯ (CRM)
// ==========================================

function getClientMonogram(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

function renderClientsAdmin() {
  const container = document.getElementById('adminClientsContainer');
  const statsSub = document.getElementById('clientsStatsSub');
  if (!container) return;

  const clients = window.noirData.getClients();
  const searchInput = document.getElementById('clientSearchInput');
  const categoryFilter = document.getElementById('clientCategoryFilter');
  const sortSelect = document.getElementById('clientSortSelect');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const cat = categoryFilter ? categoryFilter.value : 'all';
  const sortBy = sortSelect ? sortSelect.value : 'spent_desc';

  // Статистика
  const totalCount = clients.length;
  const vipCount = clients.filter(c => c.category === 'vip').length;
  const regularCount = clients.filter(c => c.category === 'regular').length;
  const newCount = clients.filter(c => c.category === 'new').length;

  if (statsSub) {
    statsSub.innerHTML = `Всего гостей в базе: <strong style="color: #FFFFFF;">${totalCount}</strong> • VIP: <strong style="color: var(--accent-gold);">${vipCount}</strong> • Постоянных: <strong style="color: var(--color-success);">${regularCount}</strong> • Новых: <strong style="color: var(--color-warning);">${newCount}</strong>`;
  }

  // Фильтрация
  let filtered = clients.filter(c => {
    if (cat !== 'all' && c.category !== cat) return false;
    if (query) {
      const matchName = (c.name || '').toLowerCase().includes(query);
      const matchPhone = (c.phone || '').toLowerCase().includes(query);
      const matchTele = (c.telegram || '').toLowerCase().includes(query);
      return matchName || matchPhone || matchTele;
    }
    return true;
  });

  // Сортировка
  filtered.sort((a, b) => {
    if (sortBy === 'spent_desc') return (b.totalSpent || 0) - (a.totalSpent || 0);
    if (sortBy === 'visits_desc') return (b.totalVisits || 0) - (a.totalVisits || 0);
    if (sortBy === 'recent') return (b.lastVisit || '').localeCompare(a.lastVisit || '');
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--text-dim); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
        Гости по заданным критериям не найдены
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(client => {
    const mono = getClientMonogram(client.name);
    let badgeHtml = '<span style="background: rgba(255,255,255,0.06); color: var(--text-dim); border: 1px solid var(--border-subtle); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">Новый</span>';
    let avatarBorder = 'var(--border-subtle)';
    let avatarGrad = 'linear-gradient(135deg, #1C2333, #0E1118)';
    let avatarColor = '#FFFFFF';

    if (client.category === 'vip') {
      badgeHtml = '<span style="background: rgba(201, 162, 77, 0.15); color: var(--accent-gold); border: 1px solid rgba(201, 162, 77, 0.35); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase;">⭐ VIP</span>';
      avatarBorder = 'var(--accent-gold)';
      avatarGrad = 'linear-gradient(135deg, var(--accent-gold), #8B6B23)';
      avatarColor = '#0E1118';
    } else if (client.category === 'regular') {
      badgeHtml = '<span style="background: rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">💎 Постоянный</span>';
      avatarBorder = 'rgba(16, 185, 129, 0.4)';
    }

    const discountBadge = (client.discountPercent && client.discountPercent > 0)
      ? `<span style="background: rgba(201, 162, 77, 0.15); color: var(--accent-gold); border: 1px solid rgba(201, 162, 77, 0.35); padding: 2px 7px; border-radius: 8px; font-size: 11px; font-weight: 800;">-${client.discountPercent}%</span>`
      : '';

    const apps = window.noirData.getClientAppointments(client.id);
    const lastApp = apps.length > 0 ? apps[0] : null;

    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px 20px; transition: border-color 0.2s ease; gap: 16px; flex-wrap: wrap;">
        <!-- Левый блок: Аватар и имя -->
        <div style="display: flex; align-items: center; gap: 16px; min-width: 260px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: ${avatarGrad}; color: ${avatarColor}; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid ${avatarBorder}; flex-shrink: 0;">
            ${mono}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 15px; font-weight: 800; color: #FFFFFF;">${client.name}</span>
              ${badgeHtml}
              ${discountBadge}
            </div>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 3px; display: flex; align-items: center; gap: 8px;">
              <span>📞 ${client.phone || '—'}</span>
              ${client.telegram ? `<span style="color: var(--accent-gold); font-family: var(--font-mono);">${client.telegram}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Центральный блок: Статистика визитов и LTV -->
        <div style="display: flex; gap: 24px; align-items: center;">
          <div style="text-align: center;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Визитов</div>
            <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">${client.totalVisits || 1}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Сумма (LTV)</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--accent-gold); margin-top: 2px;">${window.noirData.formatMoney(client.totalSpent)}</div>
          </div>
          <div style="min-width: 160px;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Последний визит</div>
            <div style="font-size: 12px; color: #FFFFFF; font-weight: 600; margin-top: 2px;">
              ${client.lastVisit || '—'}
            </div>
            <div style="font-size: 11px; color: var(--text-muted); max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${lastApp ? lastApp.serviceName : (client.favoriteSpecialistName ? 'Мастер: ' + client.favoriteSpecialistName : 'Визит в ателье')}
            </div>
          </div>
        </div>

        <!-- Правый блок: Действия -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" class="btn btn-secondary" onclick="openClientModal('${client.id}')" style="padding: 7px 14px; font-size: 12px; font-weight: 700; white-space: nowrap;">
            Карточка гостя
          </button>
          <button type="button" class="btn btn-primary" onclick="quickBookForClient('${client.id}')" style="padding: 7px 14px; font-size: 12px; font-weight: 700; white-space: nowrap;">
            + Записать
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.setClientModalDiscount = function(val) {
  const input = document.getElementById('clientModalDiscountInput');
  const badge = document.getElementById('clientModalDiscountBadge');
  const cleanVal = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
  if (input) input.value = cleanVal;
  if (badge) badge.textContent = cleanVal + '%';
};

window.openClientModal = function(clientId) {
  const modal = document.getElementById('adminClientModal');
  if (!modal) return;

  const client = window.noirData.getClientById(clientId);
  if (!client) return;

  document.getElementById('clientModalId').value = client.id;
  document.getElementById('clientModalName').textContent = client.name;
  if (document.getElementById('clientModalNameInput')) {
    document.getElementById('clientModalNameInput').value = client.name;
  }

  const discount = (client.discountPercent !== undefined && client.discountPercent !== null) ? client.discountPercent : 0;
  if (document.getElementById('clientModalDiscountInput')) {
    document.getElementById('clientModalDiscountInput').value = discount;
  }
  if (document.getElementById('clientModalDiscountBadge')) {
    document.getElementById('clientModalDiscountBadge').textContent = discount + '%';
  }

  const mono = getClientMonogram(client.name);
  const avatarEl = document.getElementById('clientModalAvatar');
  const badgeEl = document.getElementById('clientModalBadge');

  if (avatarEl) {
    avatarEl.textContent = mono;
    if (client.category === 'vip') {
      avatarEl.style.background = 'linear-gradient(135deg, var(--accent-gold), #8B6B23)';
      avatarEl.style.color = '#0E1118';
      avatarEl.style.borderColor = 'var(--accent-gold)';
    } else {
      avatarEl.style.background = 'linear-gradient(135deg, #1C2333, #0E1118)';
      avatarEl.style.color = '#FFFFFF';
      avatarEl.style.borderColor = 'var(--border-subtle)';
    }
  }

  if (badgeEl) {
    let badgeText = '';
    if (client.category === 'vip') {
      badgeText = '⭐ VIP ГОСТЬ';
      badgeEl.style.background = 'rgba(201, 162, 77, 0.15)';
      badgeEl.style.color = 'var(--accent-gold)';
      badgeEl.style.border = '1px solid rgba(201, 162, 77, 0.35)';
    } else if (client.category === 'regular') {
      badgeText = '💎 ПОСТОЯННЫЙ ГОСТЬ';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
      badgeEl.style.color = 'var(--color-success)';
      badgeEl.style.border = '1px solid rgba(16, 185, 129, 0.35)';
    } else {
      badgeText = '✨ НОВЫЙ ГОСТЬ';
      badgeEl.style.background = 'rgba(255, 255, 255, 0.06)';
      badgeEl.style.color = 'var(--text-dim)';
      badgeEl.style.border = '1px solid var(--border-subtle)';
    }

    if (discount > 0) {
      badgeText += ` • СКИДКА ${discount}%`;
    }
    badgeEl.textContent = badgeText;
  }

  const subEl = document.getElementById('clientModalSubtitle');
  if (subEl) {
    subEl.textContent = `${client.phone || 'Телефон не указан'} • Клиент с ${client.firstVisit || '2026'}`;
  }

  // KPI
  const visits = client.totalVisits || 1;
  const spent = client.totalSpent || 0;
  const avg = visits > 0 ? Math.round(spent / visits) : 0;

  document.getElementById('clientModalTotalVisits').textContent = visits;
  document.getElementById('clientModalTotalSpent').textContent = window.noirData.formatMoney(spent);
  document.getElementById('clientModalAvgCheck').textContent = window.noirData.formatMoney(avg);
  document.getElementById('clientModalFavSpecialist').textContent = client.favoriteSpecialistName || 'Любой свободный мастер';

  // Поля ввода
  document.getElementById('clientModalHairNotes').value = client.hairNotes || '';
  document.getElementById('clientModalNotes').value = client.notes || '';
  document.getElementById('clientModalPhoneInput').value = client.phone || '';
  document.getElementById('clientModalTelegramInput').value = client.telegram || '';
  document.getElementById('clientModalCategorySelect').value = client.category || 'new';

  // История визитов
  const historyList = document.getElementById('clientModalVisitsHistoryList');
  const countEl = document.getElementById('clientModalHistoryCount');
  const appointments = window.noirData.getClientAppointments(client.id);

  appointments.sort((a, b) => {
    return (b.date + ' ' + b.time).localeCompare(a.date + ' ' + a.time);
  });

  if (countEl) {
    countEl.textContent = `${appointments.length} ${appointments.length === 1 ? 'визит' : (appointments.length < 5 ? 'визита' : 'визитов')}`;
  }

  if (historyList) {
    if (appointments.length === 0) {
      historyList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim); background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-subtle); font-size: 13px;">
          Записей визитов пока нет. Нажмите «+ Записать гостя» ниже.
        </div>
      `;
    } else {
      let historyHtml = '';
      appointments.forEach(app => {
        let statusBadge = '<span style="font-size: 10px; padding: 2px 6px; border-radius: 8px; background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3);">Новая</span>';
        if (app.status === 'confirmed') {
          statusBadge = '<span style="font-size: 10px; padding: 2px 6px; border-radius: 8px; background: rgba(201, 162, 77, 0.15); color: var(--accent-gold); border: 1px solid rgba(201, 162, 77, 0.3);">Подтверждена</span>';
        } else if (app.status === 'completed') {
          statusBadge = '<span style="font-size: 10px; padding: 2px 6px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: var(--color-success); border: 1px solid rgba(16, 185, 129, 0.3);">Выполнена</span>';
        } else if (app.status === 'cancelled') {
          statusBadge = '<span style="font-size: 10px; padding: 2px 6px; border-radius: 8px; background: rgba(239, 68, 68, 0.15); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.3);">Отменена</span>';
        }

        historyHtml += `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 13px; font-weight: 700; color: #FFFFFF;">
                📅 ${app.date} в ${app.time}
              </span>
              <div style="display: flex; align-items: center; gap: 8px;">
                ${statusBadge}
                <span style="font-size: 13px; font-weight: 800; color: var(--accent-gold);">${window.noirData.formatMoney(app.price)}</span>
              </div>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #FFFFFF;">
              ✂️ ${app.serviceName}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 3px; display: flex; justify-content: space-between;">
              <span>Мастер: <strong style="color: var(--text-sub);">${app.specialistName}</strong></span>
              <span>Длительность: ${app.duration || 60} мин</span>
            </div>
            ${app.comment ? `
              <div style="margin-top: 6px; font-size: 11px; color: var(--text-muted); background: rgba(0,0,0,0.25); padding: 6px 10px; border-radius: 4px; border-left: 2px solid var(--accent-gold);">
                💬 ${app.comment}
              </div>
            ` : ''}
          </div>
        `;
      });
      historyList.innerHTML = historyHtml;
    }
  }

  modal.classList.add('active');
};

window.saveCurrentClientProfile = function() {
  const clientId = document.getElementById('clientModalId').value;
  if (!clientId) return;

  const nameInput = document.getElementById('clientModalNameInput');
  const name = nameInput ? nameInput.value.trim() : '';

  const discountInput = document.getElementById('clientModalDiscountInput');
  const discountPercent = discountInput ? Math.max(0, Math.min(100, parseInt(discountInput.value, 10) || 0)) : 0;

  const hairNotes = document.getElementById('clientModalHairNotes').value.trim();
  const notes = document.getElementById('clientModalNotes').value.trim();
  const phone = document.getElementById('clientModalPhoneInput').value.trim();
  const telegram = document.getElementById('clientModalTelegramInput').value.trim();
  const category = document.getElementById('clientModalCategorySelect').value;

  const updatePayload = {
    hairNotes,
    notes,
    phone,
    telegram,
    category,
    discountPercent
  };

  if (name) {
    updatePayload.name = name;
  }

  window.noirData.updateClient(clientId, updatePayload);

  // Обновляем заголовок модалки и монограмму
  if (name) {
    document.getElementById('clientModalName').textContent = name;
    const avatarEl = document.getElementById('clientModalAvatar');
    if (avatarEl) avatarEl.textContent = getClientMonogram(name);
  }

  // Обновляем визуальный бейдж
  const badgeEl = document.getElementById('clientModalBadge');
  if (badgeEl) {
    let badgeText = '';
    if (category === 'vip') {
      badgeText = '⭐ VIP ГОСТЬ';
      badgeEl.style.background = 'rgba(201, 162, 77, 0.15)';
      badgeEl.style.color = 'var(--accent-gold)';
    } else if (category === 'regular') {
      badgeText = '💎 ПОСТОЯННЫЙ ГОСТЬ';
      badgeEl.style.background = 'rgba(16, 185, 129, 0.15)';
      badgeEl.style.color = 'var(--color-success)';
    } else {
      badgeText = '✨ НОВЫЙ ГОСТЬ';
      badgeEl.style.background = 'rgba(255, 255, 255, 0.06)';
      badgeEl.style.color = 'var(--text-dim)';
    }

    if (discountPercent > 0) {
      badgeText += ` • СКИДКА ${discountPercent}%`;
    }
    badgeEl.textContent = badgeText;
  }

  renderClientsAdmin();

  // Обратная связь на кнопке
  const saveBtn = window.event ? window.event.target : null;
  if (saveBtn) {
    const origText = saveBtn.innerHTML;
    saveBtn.innerHTML = '✓ Сохранено!';
    saveBtn.style.background = 'rgba(16, 185, 129, 0.2)';
    saveBtn.style.color = 'var(--color-success)';
    setTimeout(() => {
      saveBtn.innerHTML = origText;
      saveBtn.style.background = '';
      saveBtn.style.color = '';
    }, 1200);
  }
};

window.quickBookForClient = function(clientId) {
  const client = window.noirData.getClientById(clientId);
  if (!client) return;

  const modal = document.getElementById('adminClientModal');
  if (modal) modal.classList.remove('active');

  openQuickBookingFor(client.favoriteSpecialistId || 'any', '14:00');

  // Предзаполняем поля клиента
  const nameInput = document.getElementById('adminClientName');
  const phoneInput = document.getElementById('adminClientPhone');
  if (nameInput) nameInput.value = client.name;
  if (phoneInput) {
    phoneInput.value = client.phone;
  }

  updateQuickBookingDiscountDisplay();
};

window.bookAppointmentForCurrentClient = function() {
  const clientId = document.getElementById('clientModalId').value;
  if (clientId) {
    quickBookForClient(clientId);
  }
};

window.openCreateClientModal = function() {
  const modal = document.getElementById('adminClientCreateModal');
  if (!modal) return;

  document.getElementById('newClientName').value = '';
  document.getElementById('newClientPhone').value = '';
  document.getElementById('newClientTelegram').value = '';
  document.getElementById('newClientCategory').value = 'new';
  const discInp = document.getElementById('newClientDiscount');
  if (discInp) discInp.value = '0';
  document.getElementById('newClientNotes').value = '';

  modal.classList.add('active');
};


