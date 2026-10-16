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
      if (currentTab === 'payroll') renderPayrollAdmin();
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
    if (currentTab === 'payroll') renderPayrollAdmin();
  });
}

function setupAuth() {
  const pinForm = document.getElementById('pinAuthForm');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinErrorMsg');
  const pinScreen = document.getElementById('pinLockScreen');
  const mainLayout = document.getElementById('adminMainLayout');

  const href = window.location.href;
  const isAutoLogin = href.includes('autologin=1');

  if (href.includes('openRecovery=1')) {
    openPinRecoveryModal();
  }

  try {
    if (isAutoLogin) {
      sessionStorage.setItem('noir_admin_auth', 'true');
    }
  } catch (e) {}

  let isAuth = isAutoLogin;
  try {
    if (sessionStorage.getItem('noir_admin_auth') === 'true') {
      isAuth = true;
    }
  } catch (e) {}

  // Проверка сессии или параметра autologin
  if (isAuth || (pinScreen && pinScreen.style.display === 'none')) {
    if (pinScreen) pinScreen.style.display = 'none';
    if (mainLayout) mainLayout.style.display = 'flex';
    loadDashboard();
    return;
  }


  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = pinInput ? pinInput.value.trim() : '';
      const isValid = window.noirData ? window.noirData.verifyAdminPin(entered) : (entered === "1234");
      
      if (isValid) {
        sessionStorage.setItem('noir_admin_auth', 'true');
        pinScreen.style.display = 'none';
        mainLayout.style.display = 'flex';
        loadDashboard();
      } else {
        if (pinError) pinError.style.display = 'block';
        if (pinInput) pinInput.value = '';
      }
    });
  }
}

// ==========================================
// УПРАВЛЕНИЕ PIN-КОДОМ И ВОССТАНОВЛЕНИЕ ДОСТУПА
// ==========================================

function openPinRecoveryModal() {
  const modal = document.getElementById('pinRecoveryModal');
  const notice = document.getElementById('recoverySuccessNotice');
  if (notice) notice.style.display = 'none';
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}
window.openPinRecoveryModal = openPinRecoveryModal;

function closePinRecoveryModal() {
  const modal = document.getElementById('pinRecoveryModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}
window.closePinRecoveryModal = closePinRecoveryModal;

function confirmResetPinToDefault() {
  if (window.noirData) {
    window.noirData.resetAdminPinToDefault();
  }
  const notice = document.getElementById('recoverySuccessNotice');
  if (notice) {
    notice.style.display = 'block';
  }
  const pinInput = document.getElementById('pinInput');
  if (pinInput) pinInput.value = '1234';
  const pinError = document.getElementById('pinErrorMsg');
  if (pinError) pinError.style.display = 'none';
  setTimeout(() => {
    closePinRecoveryModal();
  }, 1200);
}
window.confirmResetPinToDefault = confirmResetPinToDefault;

function openPinChangeModal() {
  const modal = document.getElementById('adminPinChangeModal');
  const err = document.getElementById('pinChangeErrorMsg');
  const succ = document.getElementById('pinChangeSuccessMsg');
  if (err) err.style.display = 'none';
  if (succ) succ.style.display = 'none';
  
  const curInp = document.getElementById('currentPinInput');
  const newInp = document.getElementById('newPinInput');
  const confInp = document.getElementById('confirmNewPinInput');
  if (curInp) curInp.value = '';
  if (newInp) newInp.value = '';
  if (confInp) confInp.value = '';

  const sec = window.noirData ? window.noirData.getSecurityInfo() : null;
  const emailInp = document.getElementById('changeOwnerEmailInput');
  if (emailInp && sec && sec.ownerEmail) {
    emailInp.value = sec.ownerEmail;
  }

  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}
window.openPinChangeModal = openPinChangeModal;

function closePinChangeModal() {
  const modal = document.getElementById('adminPinChangeModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}
window.closePinChangeModal = closePinChangeModal;


function handleAdminPinChangeSubmit(e) {
  e.preventDefault();
  const curVal = document.getElementById('currentPinInput').value.trim();
  const newVal = document.getElementById('newPinInput').value.trim();
  const confVal = document.getElementById('confirmNewPinInput').value.trim();
  const emailVal = document.getElementById('changeOwnerEmailInput') ? document.getElementById('changeOwnerEmailInput').value.trim() : '';
  const errEl = document.getElementById('pinChangeErrorMsg');
  const succEl = document.getElementById('pinChangeSuccessMsg');

  if (errEl) errEl.style.display = 'none';
  if (succEl) succEl.style.display = 'none';

  // 1. Проверяем текущий PIN
  const isCurValid = window.noirData ? window.noirData.verifyAdminPin(curVal) : (curVal === "1234");
  if (!isCurValid) {
    if (errEl) {
      errEl.textContent = "Неверный текущий PIN-код! Проверьте и попробуйте снова.";
      errEl.style.display = 'block';
    }
    return;
  }

  // 2. Проверяем формат нового PIN
  if (!/^\d{4,8}$/.test(newVal)) {
    if (errEl) {
      errEl.textContent = "Новый PIN-код должен содержать от 4 до 8 цифр.";
      errEl.style.display = 'block';
    }
    return;
  }

  // 3. Сверяем подтверждение
  if (newVal !== confVal) {
    if (errEl) {
      errEl.textContent = "Новый PIN-код и подтверждение не совпадают.";
      errEl.style.display = 'block';
    }
    return;
  }

  // 4. Сохраняем в базу
  if (window.noirData) {
    window.noirData.updateAdminPin(newVal, emailVal);
  }

  if (succEl) {
    succEl.style.display = 'block';
  }

  setTimeout(() => {
    closePinChangeModal();
  }, 1000);
}
window.handleAdminPinChangeSubmit = handleAdminPinChangeSubmit;


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
  if (tabId === 'payroll') renderPayrollAdmin();
}

function loadDashboard() {
  updateKPIs();
  switchTab(currentTab);

  const href = window.location.href;
  const search = window.location.search || (href.includes('?') ? href.substring(href.indexOf('?')) : '');
  const urlParams = new URLSearchParams(search);
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

  const expandPayroll = urlParams.get('expandPayroll');
  if (expandPayroll) {
    switchTab('payroll');
    setTimeout(() => {
      expandedPayrollMasters[expandPayroll === '1' ? 'spec-alex' : expandPayroll] = true;
      renderPayrollAdmin();
    }, 150);
  }

  const payrollPeriod = urlParams.get('payrollPeriod');
  if (payrollPeriod) {
    switchTab('payroll');
    setTimeout(() => {
      setPayrollPeriod(payrollPeriod);
    }, 150);
  }

  const payrollSubView = urlParams.get('payrollSubView');
  if (payrollSubView) {
    switchTab('payroll');
    setTimeout(() => {
      switchPayrollSubView(payrollSubView);
    }, 150);
  }

  const openPayout = urlParams.get('openPayout');
  if (openPayout) {
    switchTab('payroll');
    setTimeout(() => {
      const dateRange = getPayrollDateRange();
      openPayoutModal(openPayout === '1' ? 'spec-alex' : openPayout, dateRange.startDate, dateRange.endDate);
    }, 200);
  }

  const openPayrollHelp = urlParams.get('openPayrollHelp');
  if (openPayrollHelp || href.includes('openPayrollHelp') || href.includes('payroll-help') || window.location.hash.includes('help')) {
    switchTab('payroll');
    openPayrollHelpModal();
  }

  const openPinChange = urlParams.get('openPinChange');
  if (openPinChange || href.includes('openPinChange=1')) {
    openPinChangeModal();
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
      const commissionPercent = parseInt(document.getElementById('specEditCommission').value, 10) || 40;

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
          workDays: finalWorkDays,
          commissionPercent
        });
      } else {
        // Создание нового мастера
        window.noirData.addSpecialist({
          name,
          role,
          experience: exp,
          avatar,
          categories: finalCategories,
          workDays: finalWorkDays,
          commissionPercent
        });
      }

      const specModal = document.getElementById('adminSpecialistModal');
      if (specModal) specModal.classList.remove('active');
      updateKPIs();
      renderSpecialistsSchedule();
      renderTimeline();
      if (currentTab === 'payroll') renderPayrollAdmin();
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

  // Оформление кассовой выплаты мастеру
  const payoutForm = document.getElementById('adminPayoutConfirmForm');
  if (payoutForm) {
    payoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const specId = document.getElementById('payoutFormSpecId').value;
      const startDate = document.getElementById('payoutFormStartDate').value;
      const endDate = document.getElementById('payoutFormEndDate').value;
      const amount = parseInt(document.getElementById('payoutFormAmount').value, 10) || 0;
      const grossRevenue = parseInt(document.getElementById('payoutFormGross').value, 10) || 0;
      const salonMargin = parseInt(document.getElementById('payoutFormMargin').value, 10) || 0;
      const servicesCount = parseInt(document.getElementById('payoutFormCount').value, 10) || 0;
      const paymentMethod = document.getElementById('payoutMethodSelect').value;
      const issuedBy = document.getElementById('payoutIssuedByInput').value.trim() || 'Владелец NOIR Atelier';
      const notes = document.getElementById('payoutNotesInput').value.trim();
      const autoPrint = document.getElementById('payoutAutoPrintCheckbox').checked;

      // Детализация услуг мастера за этот период
      const payrollData = window.noirData.calculatePayroll({
        startDate,
        endDate,
        includeConfirmed: payrollIncludeConfirmed
      });
      const sp = payrollData.specialists.find(s => s.specialistId === specId);
      const items = sp ? sp.items : [];
      const periodLabel = getPayrollDateRange().label;

      const newOrder = window.noirData.createPayoutOrder({
        specialistId: specId,
        startDate,
        endDate,
        periodLabel,
        amount,
        grossRevenue,
        salonMargin,
        servicesCount,
        paymentMethod,
        notes,
        issuedBy,
        items
      });

      const modal = document.getElementById('adminPayoutConfirmModal');
      if (modal) modal.classList.remove('active');

      renderPayrollAdmin();
      if (typeof renderPayoutLedger === 'function') {
        renderPayoutLedger();
      }

      if (autoPrint && newOrder) {
        setTimeout(() => {
          printSpecialistPayslip(newOrder.id);
        }, 200);
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
  const commInput = document.getElementById('specEditCommission');
  if (commInput) commInput.value = "40";

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
  const commInput = document.getElementById('specEditCommission');
  if (commInput) commInput.value = spec.commissionPercent != null ? spec.commissionPercent : 40;

  populateCategoryCheckboxes(spec.categories || []);

  const days = spec.workDays || [1, 2, 3, 4, 5, 6, 7];
  document.querySelectorAll('#specWorkDaysCheckboxes input').forEach(ch => {
    ch.checked = days.includes(parseInt(ch.value, 10));
  });

  modal.classList.add('active');
};

window.setSpecCommission = function(val) {
  const commInput = document.getElementById('specEditCommission');
  if (commInput) commInput.value = val;
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
      <div class="client-list-row">
        <!-- 1. Имя и аватар гостя -->
        <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: ${avatarGrad}; color: ${avatarColor}; font-weight: 800; font-size: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid ${avatarBorder}; flex-shrink: 0;">
            ${mono}
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 15px; font-weight: 800; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${client.name}</span>
              ${badgeHtml}
              ${discountBadge}
            </div>
            <div style="font-size: 12px; color: var(--text-dim); margin-top: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>📞 ${client.phone || '—'}</span>
              ${client.telegram ? `<span style="color: var(--accent-gold); font-family: var(--font-mono);">${client.telegram}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- 2. Визитов -->
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Визитов</div>
          <div style="font-size: 15px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">${client.totalVisits || 1}</div>
        </div>

        <!-- 3. Сумма (LTV) -->
        <div style="text-align: center;">
          <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Сумма (LTV)</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--accent-gold); margin-top: 2px;">${window.noirData.formatMoney(client.totalSpent)}</div>
        </div>

        <!-- 4. Последний визит -->
        <div style="min-width: 0;">
          <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Последний визит</div>
          <div style="font-size: 12px; color: #FFFFFF; font-weight: 600; margin-top: 2px;">
            ${client.lastVisit || '—'}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${lastApp ? lastApp.serviceName : (client.favoriteSpecialistName ? 'Мастер: ' + client.favoriteSpecialistName : 'Визит в ателье')}
          </div>
        </div>

        <!-- 5. Действия -->
        <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-end;">
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

// ==========================================
// 8. ЗАРПЛАТНАЯ ВЕДОМОСТЬ МАСТЕРОВ (PAYROLL)
// ==========================================
let payrollPeriodMode = 'weekly'; // 'today', 'weekly', 'lastweek', 'month'
let payrollWeekOffset = 0;
let payrollIncludeConfirmed = false;
const expandedPayrollMasters = {};

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPayrollDateRange() {
  const baseToday = new Date();

  let startDateStr = '';
  let endDateStr = '';
  let label = '';

  if (payrollPeriodMode === 'today') {
    const target = new Date(baseToday);
    target.setDate(target.getDate() + payrollWeekOffset);
    startDateStr = formatLocalDate(target);
    endDateStr = startDateStr;
    const isBase = payrollWeekOffset === 0;
    label = target.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short' }) + (isBase ? ' (Сегодня)' : '');
  } else if (payrollPeriodMode === 'weekly' || payrollPeriodMode === 'lastweek') {
    const target = new Date(baseToday);
    const dayOfWeek = target.getDay() === 0 ? 7 : target.getDay();
    target.setDate(target.getDate() - (dayOfWeek - 1) + (payrollWeekOffset * 7));

    const mon = new Date(target);
    const sun = new Date(target);
    sun.setDate(mon.getDate() + 6);

    startDateStr = formatLocalDate(mon);
    endDateStr = formatLocalDate(sun);

    const monFmt = mon.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    const sunFmt = sun.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    const weekNote = payrollWeekOffset === 0 ? ' (Текущая неделя)' : (payrollWeekOffset === -1 ? ' (Прошлая неделя)' : '');
    label = `${monFmt} — ${sunFmt}${weekNote}`;
  } else if (payrollPeriodMode === 'month') {
    const target = new Date(baseToday);
    target.setMonth(target.getMonth() + payrollWeekOffset);
    const y = target.getFullYear();
    const m = target.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    startDateStr = formatLocalDate(firstDay);
    endDateStr = formatLocalDate(lastDay);

    const monthName = target.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    label = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }

  return { startDate: startDateStr, endDate: endDateStr, label };
}

window.setPayrollPeriod = function(mode) {
  payrollPeriodMode = mode;
  if (mode === 'today') {
    payrollWeekOffset = 0;
  } else if (mode === 'weekly') {
    payrollWeekOffset = 0;
  } else if (mode === 'lastweek') {
    payrollPeriodMode = 'weekly';
    payrollWeekOffset = -1;
  } else if (mode === 'month') {
    payrollWeekOffset = 0;
  }

  // Обновляем визуальное состояние кнопок
  document.querySelectorAll('.payroll-period-btn').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  });

  const activeBtnId = mode === 'lastweek' ? 'payrollPeriodBtn_lastweek' : `payrollPeriodBtn_${mode}`;
  const activeBtn = document.getElementById(activeBtnId);
  if (activeBtn) {
    activeBtn.classList.remove('btn-secondary');
    activeBtn.classList.add('btn-primary');
  }

  renderPayrollAdmin();
};

window.navigatePayrollPeriod = function(dir) {
  payrollWeekOffset += dir;
  renderPayrollAdmin();
};

window.togglePayrollIncludeConfirmed = function(checked) {
  payrollIncludeConfirmed = checked;
  renderPayrollAdmin();
};

window.changeSalonDefaultPayrollPeriod = function(val) {
  window.noirData.saveSalonInfo({ payrollPeriod: val });
  const select = document.getElementById('salonPayrollPeriodSelect');
  if (select) select.value = val;
  const sub = document.getElementById('payrollSubHeader');
  if (sub) {
    const periodName = val === 'weekly' ? 'раз в неделю' : 'каждый день';
    sub.innerHTML = `Регламент выплат: <strong style="color: var(--accent-gold);">${periodName}</strong>. Начисления по выполненным услугам и процентная ставка каждого мастера.`;
  }
};

window.toggleMasterPayrollDetails = function(specId) {
  expandedPayrollMasters[specId] = !expandedPayrollMasters[specId];
  renderPayrollAdmin();
};

let currentPayrollSubView = 'calc';

window.switchPayrollSubView = function(subView) {
  currentPayrollSubView = subView;
  const calcTabBtn = document.getElementById('payrollSubTab_calc');
  const ledgerTabBtn = document.getElementById('payrollSubTab_ledger');
  const calcView = document.getElementById('payrollSubView_calc');
  const ledgerView = document.getElementById('payrollSubView_ledger');

  if (subView === 'calc') {
    if (calcTabBtn) {
      calcTabBtn.classList.remove('btn-secondary');
      calcTabBtn.classList.add('btn-primary');
    }
    if (ledgerTabBtn) {
      ledgerTabBtn.classList.remove('btn-primary');
      ledgerTabBtn.classList.add('btn-secondary');
    }
    if (calcView) calcView.style.display = 'block';
    if (ledgerView) ledgerView.style.display = 'none';
    renderPayrollAdmin();
  } else {
    if (calcTabBtn) {
      calcTabBtn.classList.remove('btn-primary');
      calcTabBtn.classList.add('btn-secondary');
    }
    if (ledgerTabBtn) {
      ledgerTabBtn.classList.remove('btn-secondary');
      ledgerTabBtn.classList.add('btn-primary');
    }
    if (calcView) calcView.style.display = 'none';
    if (ledgerView) ledgerView.style.display = 'block';
    renderPayoutLedger();
  }

  // Обновляем бейдж общего количества ордеров
  const orders = window.noirData.getPayoutOrders();
  const badgeEl = document.getElementById('payoutOrdersBadgeCount');
  if (badgeEl) badgeEl.textContent = orders.length;
};

function openPayrollHelpModal() {
  const modal = document.getElementById('adminPayrollHelpModal');
  if (modal) modal.classList.add('active');
}
window.openPayrollHelpModal = openPayrollHelpModal;

window.openPayoutModal = function(specId, startDate, endDate) {
  const modal = document.getElementById('adminPayoutConfirmModal');
  if (!modal) return;

  const dateRange = getPayrollDateRange();
  const payrollData = window.noirData.calculatePayroll({
    startDate: startDate || dateRange.startDate,
    endDate: endDate || dateRange.endDate,
    includeConfirmed: payrollIncludeConfirmed
  });

  const sp = payrollData.specialists.find(s => s.specialistId === specId);
  if (!sp) return;

  document.getElementById('payoutFormSpecId').value = sp.specialistId;
  document.getElementById('payoutFormStartDate').value = startDate || dateRange.startDate;
  document.getElementById('payoutFormEndDate').value = endDate || dateRange.endDate;
  document.getElementById('payoutFormAmount').value = sp.masterPayroll;
  document.getElementById('payoutFormGross').value = sp.grossRevenue;
  document.getElementById('payoutFormMargin').value = sp.salonMargin;
  document.getElementById('payoutFormCount').value = sp.totalServicesCount;

  const avatarEl = document.getElementById('payoutModalAvatar');
  if (avatarEl) avatarEl.src = sp.specialistAvatar;

  const nameEl = document.getElementById('payoutModalMasterName');
  if (nameEl) nameEl.textContent = sp.specialistName;

  const roleEl = document.getElementById('payoutModalMasterRole');
  if (roleEl) roleEl.textContent = `${sp.specialistRole} • Ставка ${sp.commissionPercent}%`;

  const periodEl = document.getElementById('payoutModalPeriod');
  if (periodEl) periodEl.textContent = `Период: ${dateRange.label}`;

  const amountEl = document.getElementById('payoutModalAmountDisplay');
  if (amountEl) amountEl.textContent = window.noirData.formatMoney(sp.masterPayroll);

  const statsEl = document.getElementById('payoutModalStatsSummary');
  if (statsEl) {
    statsEl.textContent = `По ${sp.totalServicesCount} выполненным услугам (касса: ${window.noirData.formatMoney(sp.grossRevenue)}, маржа салона: ${window.noirData.formatMoney(sp.salonMargin)})`;
  }

  const notesEl = document.getElementById('payoutNotesInput');
  if (notesEl) {
    notesEl.value = `Выплата зарплаты мастеру ${sp.specialistName} за период ${dateRange.label}.`;
  }

  modal.classList.add('active');
};

function renderPayrollAdmin() {
  const container = document.getElementById('payrollTableContainer');
  if (!container) return;

  const dateRange = getPayrollDateRange();

  // Обновляем бейдж кассовых ордеров в под-вкладке
  const allOrders = window.noirData.getPayoutOrders();
  const badgeEl = document.getElementById('payoutOrdersBadgeCount');
  if (badgeEl) badgeEl.textContent = allOrders.length;

  // Обновляем плашку периода
  const labelEl = document.getElementById('payrollCurrentPeriodLabel');
  if (labelEl) labelEl.textContent = dateRange.label;

  // Селектор периодичности салона
  const salonInfo = window.noirData.getSalonInfo();
  const salonPeriodSelect = document.getElementById('salonPayrollPeriodSelect');
  if (salonPeriodSelect && salonInfo.payrollPeriod) {
    salonPeriodSelect.value = salonInfo.payrollPeriod;
  }

  // Расчёт ведомости
  const payrollData = window.noirData.calculatePayroll({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    includeConfirmed: payrollIncludeConfirmed
  });

  // Обновляем KPI
  const revEl = document.getElementById('payrollKpiTotalRevenue');
  const payEl = document.getElementById('payrollKpiTotalPayroll');
  const marginEl = document.getElementById('payrollKpiSalonMargin');
  const countEl = document.getElementById('payrollKpiServicesCount');

  if (revEl) revEl.textContent = window.noirData.formatMoney(payrollData.summary.totalRevenue);
  if (payEl) payEl.textContent = window.noirData.formatMoney(payrollData.summary.totalPayroll);
  if (marginEl) marginEl.textContent = window.noirData.formatMoney(payrollData.summary.salonMargin);
  if (countEl) countEl.textContent = payrollData.summary.totalServicesCount;

  // Отрисовка списка мастеров
  if (!payrollData.specialists || payrollData.specialists.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 36px; text-align: center; color: var(--text-dim);">
        В базе нет зарегистрированных мастеров.
      </div>
    `;
    return;
  }

  let html = '';

  payrollData.specialists.forEach(sp => {
    const isExpanded = !!expandedPayrollMasters[sp.specialistId];
    
    // Проверяем наличие защищённого кассового ордера на этот период
    const paidOrder = window.noirData.getPayoutOrderForPeriod(sp.specialistId, dateRange.startDate, dateRange.endDate);
    const isPaid = !!paidOrder;

    html += `
      <div style="background: var(--bg-card); border: 1px solid ${isPaid ? 'rgba(16, 185, 129, 0.45)' : 'var(--border-subtle)'}; ${isPaid ? 'box-shadow: 0 0 16px -4px rgba(16, 185, 129, 0.25);' : ''} border-radius: var(--radius-md); overflow: hidden; transition: all 0.2s ease;">
        <!-- Основная строка мастера с фиксированной сеткой колонок -->
        <div class="payroll-master-row" style="background: ${isPaid ? 'rgba(16, 185, 129, 0.05)' : 'transparent'};">
          <!-- 1. Фото и данные мастера -->
          <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
            <img src="${sp.specialistAvatar}" alt="${sp.specialistName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid ${isPaid ? '#10B981' : 'var(--accent-gold)'}; flex-shrink: 0;">
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h4 style="font-size: 15px; font-weight: 800; color: #FFFFFF; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${sp.specialistName}</h4>
                <span style="background: rgba(212, 175, 55, 0.15); color: var(--accent-gold); border: 1px solid rgba(212, 175, 55, 0.3); padding: 2px 7px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 800; white-space: nowrap;">
                  ${sp.commissionPercent}% ставка
                </span>
                ${isPaid ? `
                  <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 2px 9px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">
                    <span>✓ Выплачено</span>
                    <span style="color: #6EE7B7; font-size: 10px; font-family: var(--font-mono);">(#${paidOrder.id})</span>
                  </span>
                ` : ''}
              </div>
              <p style="font-size: 12px; color: var(--text-dim); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sp.specialistRole}</p>
            </div>
          </div>

          <!-- 2. Услуг -->
          <div style="text-align: center;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Услуг</div>
            <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${sp.totalServicesCount}</div>
          </div>

          <!-- 3. Касса мастера -->
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Касса мастера</div>
            <div style="font-size: 14px; font-weight: 700; color: #FFFFFF; margin-top: 2px;">${window.noirData.formatMoney(sp.grossRevenue)}</div>
          </div>

          <!-- 4. Доход салона -->
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase;">Доход салона</div>
            <div style="font-size: 14px; font-weight: 700; color: #10B981; margin-top: 2px;">${window.noirData.formatMoney(sp.salonMargin)}</div>
          </div>

          <!-- 5. К выплате мастеру -->
          <div style="text-align: right; background: ${isPaid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(212, 175, 55, 0.08)'}; padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.25)'};">
            <div style="font-size: 10px; color: ${isPaid ? '#10B981' : 'var(--accent-gold)'}; text-transform: uppercase; font-weight: 700; white-space: nowrap;">
              ${isPaid ? 'Выплачено на руки' : 'К выплате мастеру'}
            </div>
            <div style="font-size: 16px; font-weight: 900; color: ${isPaid ? '#10B981' : 'var(--accent-gold)'}; margin-top: 1px; white-space: nowrap;">
              ${window.noirData.formatMoney(isPaid ? paidOrder.amount : sp.masterPayroll)}
            </div>
          </div>

          <!-- 6. Действия -->
          <div style="display: flex; align-items: center; gap: 8px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="toggleMasterPayrollDetails('${sp.specialistId}')" style="padding: 7px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
              <span>Детализация (${sp.totalServicesCount})</span>
              <span style="font-size: 10px; transition: transform 0.2s ease; ${isExpanded ? 'transform: rotate(180deg);' : ''}">▼</span>
            </button>

            ${isPaid ? `
              <!-- Защищённая выплата: случайный клик не сбросит ордер, доступна печать расчётного листка -->
              <button type="button" class="btn btn-secondary" onclick="printSpecialistPayslip('${paidOrder.id}')" style="background: rgba(16, 185, 129, 0.15); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 7px 14px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; white-space: nowrap;" title="Распечатать расчётный листок (А4)">
                <span>🖨️ Листок (Payslip)</span>
              </button>
            ` : `
              <button type="button" class="btn btn-primary" onclick="openPayoutModal('${sp.specialistId}', '${dateRange.startDate}', '${dateRange.endDate}')" style="padding: 7px 16px; font-size: 12px; font-weight: 800; white-space: nowrap;" ${sp.masterPayroll === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                Выплатить
              </button>
            `}
          </div>
        </div>


        <!-- Разворачиваемая таблица услуг -->
        ${isExpanded ? `
          <div style="border-top: 1px solid var(--border-subtle); padding: 14px 20px; background: rgba(0, 0, 0, 0.25);">
            ${sp.items.length === 0 ? `
              <div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 16px;">
                В выбранный период у мастера нет записей с подходящим статусом.
              </div>
            ` : `
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-dim);">
                      <th style="padding: 8px 10px; font-weight: 600;">Дата и время</th>
                      <th style="padding: 8px 10px; font-weight: 600;">Клиент</th>
                      <th style="padding: 8px 10px; font-weight: 600;">Услуга</th>
                      <th style="padding: 8px 10px; font-weight: 600; text-align: right;">Оплачено гостем</th>
                      <th style="padding: 8px 10px; font-weight: 600; text-align: center;">Ставка</th>
                      <th style="padding: 8px 10px; font-weight: 600; text-align: right;">Мастеру (${sp.commissionPercent}%)</th>
                      <th style="padding: 8px 10px; font-weight: 600; text-align: right;">Салону</th>
                      <th style="padding: 8px 10px; font-weight: 600; text-align: center;">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sp.items.map(it => `
                      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #FFFFFF;">
                        <td style="padding: 10px 10px; font-weight: 600; white-space: nowrap;">
                          ${it.date} в ${it.time}
                        </td>
                        <td style="padding: 10px 10px;">
                          <div style="font-weight: 600;">${it.clientName}</div>
                          <div style="font-size: 11px; color: var(--text-dim);">${it.clientPhone}</div>
                        </td>
                        <td style="padding: 10px 10px; color: var(--accent-gold-light); font-weight: 600;">
                          ${it.serviceName}
                        </td>
                        <td style="padding: 10px 10px; text-align: right; font-weight: 700;">
                          ${window.noirData.formatMoney(it.price)}
                        </td>
                        <td style="padding: 10px 10px; text-align: center; color: var(--text-dim);">
                          ${it.commissionPercent}%
                        </td>
                        <td style="padding: 10px 10px; text-align: right; font-weight: 800; color: var(--accent-gold);">
                          ${window.noirData.formatMoney(it.masterShare)}
                        </td>
                        <td style="padding: 10px 10px; text-align: right; color: #10B981; font-weight: 700;">
                          ${window.noirData.formatMoney(it.salonShare)}
                        </td>
                        <td style="padding: 10px 10px; text-align: center;">
                          <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; background: ${it.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'}; color: ${it.status === 'completed' ? '#10B981' : '#60A5FA'}; border: 1px solid ${it.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};">
                            ${it.status === 'completed' ? 'Выполнена' : 'Подтверждена'}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================
// 6.2 ЖУРНАЛ КАССОВЫХ ВЫПЛАТ (АРХИВ И ИСТОРИЯ)
// ==========================================
window.renderPayoutLedger = function() {
  const container = document.getElementById('payoutLedgerTableContainer');
  if (!container) return;

  // Динамически заполняем селектор специалистов, если ещё не заполнен
  const specSelect = document.getElementById('ledgerSpecialistSelect');
  if (specSelect && (!specSelect.options || specSelect.options.length <= 1)) {
    const specialists = window.noirData.getSpecialists();
    specSelect.innerHTML = `<option value="all">Все мастера</option>` + specialists.map(s => `
      <option value="${s.id}">${s.name}</option>
    `).join('');
  }

  const searchVal = (document.getElementById('ledgerSearchInput')?.value || '').toLowerCase().trim();
  const yearVal = document.getElementById('ledgerYearSelect')?.value || 'all';
  const monthVal = document.getElementById('ledgerMonthSelect')?.value || 'all';
  const specVal = document.getElementById('ledgerSpecialistSelect')?.value || 'all';

  const orders = window.noirData.getPayoutOrders();

  // Фильтрация ордеров
  const filtered = orders.filter(o => {
    if (o.status === 'cancelled') return false;

    const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(o.startDate);

    if (yearVal !== 'all') {
      const orderYear = orderDate.getFullYear().toString();
      if (orderYear !== yearVal && !(o.startDate && o.startDate.startsWith(yearVal))) return false;
    }

    if (monthVal !== 'all') {
      if (orderDate.getMonth().toString() !== monthVal) return false;
    }

    if (specVal !== 'all' && o.specialistId !== specVal) {
      return false;
    }

    if (searchVal) {
      const searchTarget = `${o.id} ${o.specialistName} ${o.paymentMethod || ''} ${o.notes || ''} ${o.issuedBy || ''}`.toLowerCase();
      if (!searchTarget.includes(searchVal)) return false;
    }

    return true;
  });

  // Расчёт и обновление сводных KPI
  const count = filtered.length;
  const paidTotal = filtered.reduce((acc, o) => acc + (o.amount || 0), 0);
  const grossTotal = filtered.reduce((acc, o) => acc + (o.grossRevenue || 0), 0);
  const marginTotal = filtered.reduce((acc, o) => acc + (o.salonMargin || 0), 0);

  const kpiCount = document.getElementById('ledgerKpiCount');
  const kpiPaid = document.getElementById('ledgerKpiPaidTotal');
  const kpiGross = document.getElementById('ledgerKpiGrossTotal');
  const kpiMargin = document.getElementById('ledgerKpiMarginTotal');

  if (kpiCount) kpiCount.textContent = count;
  if (kpiPaid) kpiPaid.textContent = window.noirData.formatMoney(paidTotal);
  if (kpiGross) kpiGross.textContent = window.noirData.formatMoney(grossTotal);
  if (kpiMargin) kpiMargin.textContent = window.noirData.formatMoney(marginTotal);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 48px 20px; text-align: center; color: var(--text-dim);">
        <div style="font-size: 36px; margin-bottom: 10px;">📜</div>
        <div style="font-size: 15px; font-weight: 800; color: #FFFFFF;">Кассовых ордеров не найдено</div>
        <div style="font-size: 12px; margin-top: 4px; color: var(--text-muted);">
          По выбранным фильтрам периода или поисковому запросу нет проведённых выплат.
        </div>
      </div>
    `;
    return;
  }

  let html = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border-subtle); color: var(--text-dim); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 12px 16px; font-weight: 700;">№ Ордера</th>
              <th style="padding: 12px 14px; font-weight: 700;">Дата и время</th>
              <th style="padding: 12px 16px; font-weight: 700;">Мастер</th>
              <th style="padding: 12px 14px; font-weight: 700;">Период начисления</th>
              <th style="padding: 12px 12px; font-weight: 700; text-align: center;">Услуг</th>
              <th style="padding: 12px 14px; font-weight: 700; text-align: right;">Касса мастера</th>
              <th style="padding: 12px 14px; font-weight: 700; text-align: right;">Доход салона</th>
              <th style="padding: 12px 16px; font-weight: 700; text-align: right;">Выдано на руки</th>
              <th style="padding: 12px 14px; font-weight: 700;">Способ выдачи</th>
              <th style="padding: 12px 16px; font-weight: 700; text-align: center;">Документ</th>
            </tr>
          </thead>
          <tbody>
  `;

  filtered.forEach(o => {
    html += `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s ease;" onmouseenter="this.style.background='rgba(255,255,255,0.02)'" onmouseleave="this.style.background='transparent'">
        <td style="padding: 14px 16px; font-family: var(--font-mono); font-weight: 800; color: var(--accent-gold); white-space: nowrap;">
          #${o.id}
        </td>
        <td style="padding: 14px 14px; white-space: nowrap;">
          <div style="font-weight: 600; color: #FFFFFF;">${o.dateFormatted}</div>
          <div style="font-size: 11px; color: var(--text-dim);">${o.timeFormatted || '18:00'}</div>
        </td>
        <td style="padding: 14px 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${o.specialistAvatar}" alt="${o.specialistName}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent-gold);">
            <div>
              <div style="font-weight: 800; color: #FFFFFF; font-size: 13px;">${o.specialistName}</div>
              <div style="font-size: 11px; color: var(--text-dim);">${o.commissionPercent}% ставка</div>
            </div>
          </div>
        </td>
        <td style="padding: 14px 14px; font-size: 12px; color: var(--text-sub);">
          ${o.periodLabel || (o.startDate + ' — ' + o.endDate)}
        </td>
        <td style="padding: 14px 12px; text-align: center; font-weight: 700; color: #FFFFFF;">
          ${o.servicesCount || (o.items ? o.items.length : 0)}
        </td>
        <td style="padding: 14px 14px; text-align: right; font-weight: 600; color: var(--text-sub); white-space: nowrap;">
          ${window.noirData.formatMoney(o.grossRevenue)}
        </td>
        <td style="padding: 14px 14px; text-align: right; font-weight: 700; color: #10B981; white-space: nowrap;">
          ${window.noirData.formatMoney(o.salonMargin)}
        </td>
        <td style="padding: 14px 16px; text-align: right; white-space: nowrap;">
          <div style="font-size: 15px; font-weight: 900; color: var(--accent-gold);">
            ${window.noirData.formatMoney(o.amount)}
          </div>
        </td>
        <td style="padding: 14px 14px; font-size: 12px; color: var(--text-muted);">
          <span style="background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; font-size: 11px;">
            ${o.paymentMethod || 'Наличные из кассы'}
          </span>
        </td>
        <td style="padding: 14px 16px; text-align: center; white-space: nowrap;">
          <button type="button" class="btn btn-secondary" onclick="printSpecialistPayslip('${o.id}')" style="padding: 6px 12px; font-size: 11px; font-weight: 700; border-color: rgba(212, 175, 55, 0.4); color: #E5C378; display: inline-flex; align-items: center; gap: 5px;" title="Распечатать расчётный листок А4">
            <span>🖨️ Листок (А4)</span>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
};

// ==========================================
// 6.3 ПЕЧАТЬ РАСЧЁТНОГО ЛИСТКА МАСТЕРА (А4)
// ==========================================
window.printSpecialistPayslip = function(orderId) {
  const orders = window.noirData.getPayoutOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    alert("Ордер #" + orderId + " не найден в базе кассовых выплат.");
    return;
  }

  const printArea = document.getElementById('printableDocumentArea');
  if (!printArea) return;

  const salon = window.noirData.getSalonInfo();

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map((it, idx) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 7px 8px; color: #6B7280; text-align: center;">${idx + 1}</td>
        <td style="padding: 7px 8px; font-weight: 600; white-space: nowrap;">${it.date} в ${it.time}</td>
        <td style="padding: 7px 8px;">${it.clientName || 'Гость салона'}</td>
        <td style="padding: 7px 8px; font-weight: 600;">${it.serviceName}</td>
        <td style="padding: 7px 8px; text-align: right; font-weight: 600;">${window.noirData.formatMoney(it.price)}</td>
        <td style="padding: 7px 8px; text-align: center; color: #6B7280;">${it.commissionPercent || order.commissionPercent}%</td>
        <td style="padding: 7px 8px; text-align: right; font-weight: 800; color: #000000;">${window.noirData.formatMoney(it.masterShare)}</td>
        <td style="padding: 7px 8px; text-align: right; color: #059669; font-weight: 600;">${window.noirData.formatMoney(it.salonShare)}</td>
      </tr>
    `).join('');
  } else {
    itemsHtml = `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td colspan="8" style="padding: 14px 10px; text-align: center; color: #6B7280;">
          Выполненные услуги за расчётный период (${order.servicesCount} услуг, валовая касса ${window.noirData.formatMoney(order.grossRevenue)}).
        </td>
      </tr>
    `;
  }

  printArea.innerHTML = `
    <div style="padding: 24px 32px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #111827; background: #FFFFFF; line-height: 1.45;">
      <!-- Шапка салона -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 1.5px; margin: 0; color: #000000;">NOIR HAIR ATELIER</h1>
            <span style="font-size: 11px; background: #111827; color: #FFFFFF; padding: 2px 6px; border-radius: 3px; font-weight: 700;">ORIGINAL</span>
          </div>
          <p style="font-size: 12px; color: #4B5563; margin: 4px 0 0;">Премиальное ателье авторских стрижек, сложного окрашивания и SPA</p>
          <p style="font-size: 11px; color: #6B7280; margin: 2px 0 0;">📍 ${salon.address || '48 An Thuong 2, Da Nang'} • 📞 ${salon.phone || '+84 90 123 4567'} • 🌐 noir.viet</p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #F3F4F6; border: 1px solid #D1D5DB; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
            Расходный кассовый ордер
          </div>
          <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 2px; color: #111827; font-family: monospace;">Ордер #${order.id}</h2>
          <p style="font-size: 11px; color: #6B7280; margin: 0;">Выдан: ${order.dateFormatted} в ${order.timeFormatted || '18:00'}</p>
        </div>
      </div>

      <!-- Данные мастера и период начисления -->
      <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 16px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 10px; color: #6B7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Получатель денежных средств (Мастер):</div>
          <div style="font-size: 17px; font-weight: 900; color: #111827; margin-top: 2px;">${order.specialistName}</div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 2px;">
            ${order.specialistRole} • Индивидуальная ставка: <strong>${order.commissionPercent}%</strong>
          </div>
        </div>
        <div style="border-left: 1px solid #E5E7EB; padding-left: 16px;">
          <div style="font-size: 10px; color: #6B7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Расчётный период:</div>
          <div style="font-size: 13px; font-weight: 800; color: #111827; margin-top: 2px;">${order.periodLabel || (order.startDate + ' — ' + order.endDate)}</div>
          <div style="font-size: 11px; color: #059669; font-weight: 800; margin-top: 3px;">
            ✓ Закрыт и проведён по кассе
          </div>
        </div>
      </div>

      <!-- Детализация оказанных услуг -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; margin: 0;">
            Детализация услуг мастера за расчётный период
          </h3>
          <span style="font-size: 11px; color: #6B7280;">Всего процедур: <strong>${order.servicesCount || (order.items ? order.items.length : 0)}</strong></span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background: #F3F4F6; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB; color: #374151;">
              <th style="padding: 7px 8px; width: 28px; text-align: center;">№</th>
              <th style="padding: 7px 8px;">Дата / Время</th>
              <th style="padding: 7px 8px;">Гость</th>
              <th style="padding: 7px 8px;">Наименование процедуры</th>
              <th style="padding: 7px 8px; text-align: right;">Чек гостя</th>
              <th style="padding: 7px 8px; text-align: center;">Ставка</th>
              <th style="padding: 7px 8px; text-align: right;">Мастеру (${order.commissionPercent}%)</th>
              <th style="padding: 7px 8px; text-align: right;">Салону</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #F9FAFB; border-top: 2px solid #D1D5DB; font-weight: 800;">
              <td colspan="4" style="padding: 8px 8px; text-align: right;">ИТОГО ПО ВЕДОМОСТИ:</td>
              <td style="padding: 8px 8px; text-align: right;">${window.noirData.formatMoney(order.grossRevenue)}</td>
              <td style="padding: 8px 8px; text-align: center;">—</td>
              <td style="padding: 8px 8px; text-align: right; font-size: 12px; color: #000000;">${window.noirData.formatMoney(order.amount)}</td>
              <td style="padding: 8px 8px; text-align: right; color: #059669;">${window.noirData.formatMoney(order.salonMargin)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Итоговый кассовый блок -->
      <div style="background: #F3F4F6; border: 2px solid #111827; border-radius: 6px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #111827; letter-spacing: 0.5px;">СУММА К ВЫДАЧЕ НА РУКИ:</div>
          <div style="font-size: 11px; color: #4B5563; margin-top: 3px;">
            Способ выдачи: <strong>${order.paymentMethod || 'Наличные из кассы'}</strong> • Примечание: ${order.notes || 'Выплата произведена полностью'}
          </div>
        </div>
        <div style="font-size: 26px; font-weight: 900; color: #000000; letter-spacing: 0.5px;">
          ${window.noirData.formatMoney(order.amount)}
        </div>
      </div>

      <!-- Юридический блок подписей -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 26px; padding-top: 14px; border-top: 1px dashed #D1D5DB;">
        <div style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #111827; margin-bottom: 4px;">Выплату из кассы произвёл:</div>
          <div style="font-size: 12px; color: #4B5563;">Администратор / Управляющий: <strong>${order.issuedBy || 'Владелец NOIR Atelier'}</strong></div>
          <div style="margin-top: 34px; border-top: 1px solid #111827; padding-top: 4px; display: flex; justify-content: space-between; font-size: 10px; color: #6B7280;">
            <span>(подпись)</span>
            <span>(М.П. / дата)</span>
          </div>
        </div>

        <div style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px 16px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #111827; margin-bottom: 4px;">Сумму получил в полном объёме:</div>
          <div style="font-size: 11px; color: #4B5563; line-height: 1.35;">
            Мастер: <strong>${order.specialistName}</strong><br>
            <em>«С расчётом ознакомлен и согласен, денежные средства в сумме ${window.noirData.formatMoney(order.amount)} получил полностью, претензий к ателье не имею»</em>
          </div>
          <div style="margin-top: 18px; border-top: 1px solid #111827; padding-top: 4px; display: flex; justify-content: space-between; font-size: 10px; color: #6B7280;">
            <span>(личная подпись мастера)</span>
            <span>(дата: ${order.dateFormatted})</span>
          </div>
        </div>
      </div>
    </div>
  `;

  window.print();
};

// ==========================================
// 6.4 ПЕЧАТЬ СВОДНОЙ ВЕДОМОСТИ НА САЛОН (А4)
// ==========================================
window.printWeeklyPayrollSummary = function(startDate, endDate) {
  const dateRange = getPayrollDateRange();
  const start = startDate || dateRange.startDate;
  const end = endDate || dateRange.endDate;

  const payrollData = window.noirData.calculatePayroll({
    startDate: start,
    endDate: end,
    includeConfirmed: payrollIncludeConfirmed
  });

  const printArea = document.getElementById('printableDocumentArea');
  if (!printArea) return;

  const salon = window.noirData.getSalonInfo();
  const now = new Date();
  const printDateStr = now.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const printTimeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  let rowsHtml = '';
  payrollData.specialists.forEach((sp, idx) => {
    const paidOrder = window.noirData.getPayoutOrderForPeriod(sp.specialistId, start, end);
    const isPaid = !!paidOrder;

    rowsHtml += `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 8px; text-align: center; color: #6B7280;">${idx + 1}</td>
        <td style="padding: 8px; font-weight: 800; color: #000000;">${sp.specialistName}</td>
        <td style="padding: 8px; color: #4B5563; font-size: 11px;">${sp.specialistRole}</td>
        <td style="padding: 8px; text-align: center; font-weight: 700;">${sp.commissionPercent}%</td>
        <td style="padding: 8px; text-align: center; font-weight: 700;">${sp.totalServicesCount}</td>
        <td style="padding: 8px; text-align: right; font-weight: 600;">${window.noirData.formatMoney(sp.grossRevenue)}</td>
        <td style="padding: 8px; text-align: right; color: #059669; font-weight: 700;">${window.noirData.formatMoney(sp.salonMargin)}</td>
        <td style="padding: 8px; text-align: right; font-weight: 900; font-size: 13px; color: #000000;">${window.noirData.formatMoney(sp.masterPayroll)}</td>
        <td style="padding: 8px; text-align: center;">
          ${isPaid ? `
            <span style="display: inline-block; background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ✓ Выплачено (#${paidOrder.id})
            </span>
          ` : `
            <span style="color: #9CA3AF; font-size: 11px;">К начислению</span>
          `}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #D1D5DB; width: 140px; text-align: center;">
          ${isPaid ? `
            <span style="font-size: 10px; color: #059669; font-weight: 700;">Подписано в ордере</span>
          ` : `
            <div style="border-bottom: 1px solid #9CA3AF; margin-top: 14px;"></div>
          `}
        </td>
      </tr>
    `;
  });

  printArea.innerHTML = `
    <div style="padding: 24px 32px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #111827; background: #FFFFFF; line-height: 1.45;">
      <!-- Шапка ведомости -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 1.5px; margin: 0; color: #000000;">NOIR HAIR ATELIER</h1>
          <p style="font-size: 12px; color: #4B5563; margin: 4px 0 0;">Сводная зарплатная ведомость мастеров и специалистов ателье</p>
          <p style="font-size: 11px; color: #6B7280; margin: 2px 0 0;">📍 ${salon.address || '48 An Thuong 2, Da Nang'} • 📞 ${salon.phone || '+84 90 123 4567'}</p>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-block; background: #F3F4F6; border: 1px solid #D1D5DB; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            Сводный реестр выплат
          </div>
          <div style="font-size: 14px; font-weight: 800; margin-top: 6px; color: #111827;">Период: ${dateRange.label}</div>
          <p style="font-size: 11px; color: #6B7280; margin: 2px 0 0;">Сформировано: ${printDateStr} в ${printTimeStr}</p>
        </div>
      </div>

      <!-- Таблица мастеров -->
      <div style="margin-bottom: 22px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background: #F3F4F6; border-top: 1px solid #D1D5DB; border-bottom: 1px solid #D1D5DB; color: #374151;">
              <th style="padding: 8px; width: 28px; text-align: center;">№</th>
              <th style="padding: 8px;">Специалист</th>
              <th style="padding: 8px;">Должность</th>
              <th style="padding: 8px; text-align: center;">Ставка</th>
              <th style="padding: 8px; text-align: center;">Услуг</th>
              <th style="padding: 8px; text-align: right;">Касса мастера</th>
              <th style="padding: 8px; text-align: right;">Доход салона</th>
              <th style="padding: 8px; text-align: right;">К выплате</th>
              <th style="padding: 8px; text-align: center;">Статус ордера</th>
              <th style="padding: 8px; text-align: center;">Подпись в получении</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #F9FAFB; border-top: 2px solid #111827; font-weight: 800; font-size: 12px;">
              <td colspan="4" style="padding: 10px 8px; text-align: right;">ИТОГО ПО САЛОНУ:</td>
              <td style="padding: 10px 8px; text-align: center;">${payrollData.summary.totalServicesCount}</td>
              <td style="padding: 10px 8px; text-align: right;">${window.noirData.formatMoney(payrollData.summary.totalRevenue)}</td>
              <td style="padding: 10px 8px; text-align: right; color: #059669;">${window.noirData.formatMoney(payrollData.summary.salonMargin)}</td>
              <td style="padding: 10px 8px; text-align: right; font-size: 14px; color: #000000;">${window.noirData.formatMoney(payrollData.summary.totalPayroll)}</td>
              <td colspan="2" style="padding: 10px 8px;"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Сводка и финансовый итог -->
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 6px; padding: 14px 18px; margin-bottom: 26px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: #4B5563;">
          Общий фонд начисленной заработной платы за период составляет: <strong style="color: #000000;">${window.noirData.formatMoney(payrollData.summary.totalPayroll)}</strong><br>
          Чистый доход ателье после выплат мастерам: <strong style="color: #059669;">${window.noirData.formatMoney(payrollData.summary.salonMargin)}</strong>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; color: #6B7280; text-transform: uppercase; font-weight: 700;">Фонд оплаты труда:</div>
          <div style="font-size: 22px; font-weight: 900; color: #111827;">${window.noirData.formatMoney(payrollData.summary.totalPayroll)}</div>
        </div>
      </div>

      <!-- Подписи руководства -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 36px; padding-top: 16px; border-top: 1px dashed #D1D5DB;">
        <div>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #374151;">Сводную ведомость составил:</div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 2px;">Главный администратор NOIR Atelier</div>
          <div style="margin-top: 32px; border-top: 1px solid #111827; padding-top: 4px; display: flex; justify-content: space-between; font-size: 10px; color: #6B7280;">
            <span>(подпись)</span>
            <span>(Ф.И.О.)</span>
          </div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #374151;">Выплату зарплатного фонда утвердил:</div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 2px;">Управляющий / Владелец ателье</div>
          <div style="margin-top: 32px; border-top: 1px solid #111827; padding-top: 4px; display: flex; justify-content: space-between; font-size: 10px; color: #6B7280;">
            <span>(подпись)</span>
            <span>(М.П. / дата)</span>
          </div>
        </div>
      </div>
    </div>
  `;

  window.print();
};



