/**
 * CODE 606 Barbershop - Admin CRM Controller
 * Включает управление расписанием на день, мастерами и недельными сменами
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

const ADMIN_PIN = "1234";
let currentDate = new Date().toISOString().split('T')[0];
let currentTab = 'timeline';
let currentWeekOffset = 0; // 0 = текущая неделя, 1 = следующая неделя и т.д.
let openCategoriesState = {};
let adminServiceSearchQuery = '';

function initAdmin() {
  setupAuth();
  setupNav();
  setupModals();
  setupLiveSync();
}

function setupLiveSync() {
  // 1. Мгновенная синхронизация между вкладками через событие storage
  window.addEventListener('storage', (e) => {
    if (e.key === window.hdData.STORAGE_KEYS.APPOINTMENTS || 
        e.key === window.hdData.STORAGE_KEYS.SPECIALISTS || 
        e.key === window.hdData.STORAGE_KEYS.SERVICES) {
      updateKPIs();
      if (currentTab === 'timeline') renderTimeline();
      if (currentTab === 'specialists') renderSpecialistsSchedule();
      if (currentTab === 'appointments') renderJournal();
      if (currentTab === 'services') renderServicesAdmin();
    }
  });

  // 2. Автоматическое обновление данных при переключении обратно на вкладку браузера
  window.addEventListener('focus', () => {
    updateKPIs();
    if (currentTab === 'timeline') renderTimeline();
    if (currentTab === 'specialists') renderSpecialistsSchedule();
    if (currentTab === 'appointments') renderJournal();
  });
}

function setupAuth() {
  const pinForm = document.getElementById('pinAuthForm');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinErrorMsg');
  const pinScreen = document.getElementById('pinLockScreen');
  const mainLayout = document.getElementById('adminMainLayout');

  // Проверка сессии
  if (sessionStorage.getItem('hd_admin_auth') === 'true' || (pinScreen && pinScreen.style.display === 'none')) {
    if (pinScreen) pinScreen.style.display = 'none';
    if (mainLayout) mainLayout.style.display = 'flex';
    loadDashboard();
    return;
  }

  pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (pinInput.value === ADMIN_PIN) {
      sessionStorage.setItem('hd_admin_auth', 'true');
      pinScreen.style.display = 'none';
      mainLayout.style.display = 'flex';
      loadDashboard();
    } else {
      pinError.style.display = 'block';
      pinInput.value = '';
    }
  });
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
      renderJournal();
    });
  }

  const statusFilter = document.getElementById('journalStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderJournal();
    });
  }

  // Кнопки переключения недели в графике
  const prevWeekBtn = document.getElementById('schedulePrevWeekBtn');
  const nextWeekBtn = document.getElementById('scheduleNextWeekBtn');
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

  // Поиск по каталогу услуг
  const serviceSearchInput = document.getElementById('adminServiceSearchInput');
  if (serviceSearchInput) {
    serviceSearchInput.addEventListener('input', (e) => {
      adminServiceSearchQuery = e.target.value.toLowerCase().trim();
      renderServicesAdmin();
    });
  }

  // Кнопка "Развернуть все / Свернуть все"
  const toggleAllBtn = document.getElementById('toggleAllCategoriesBtn');
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      toggleAllCategories();
    });
  }
}

function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.admin-nav-item[data-tab]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.admin-tab-section').forEach(sec => {
    sec.style.display = 'none';
  });

  const targetSec = document.getElementById('tab-' + tabId);
  if (targetSec) targetSec.style.display = 'block';

  if (tabId === 'timeline') renderTimeline();
  if (tabId === 'specialists') renderSpecialistsSchedule();
  if (tabId === 'appointments') renderJournal();
  if (tabId === 'services') renderServicesAdmin();
}

function loadDashboard() {
  updateKPIs();
  renderTimeline();
  renderSpecialistsSchedule();
  renderJournal();
  renderServicesAdmin();
}

function updateKPIs() {
  const appointments = window.hdData.getAppointments();
  const services = window.hdData.getServices();
  const today = new Date().toISOString().split('T')[0];

  const todayApps = appointments.filter(a => a.date === today);
  const newApps = appointments.filter(a => a.status === 'new');
  
  const revenue = todayApps
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  document.getElementById('kpiTodayCount').textContent = todayApps.length;
  document.getElementById('kpiNewCount').textContent = newApps.length;
  document.getElementById('kpiRevenue').textContent = window.hdData.formatMoney(revenue);
  document.getElementById('kpiServicesCount').textContent = services.length;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДАТ ДЛЯ НЕДЕЛЬНОГО ГРАФИКА ---
function getWeekDays(offsetWeeks = 0) {
  const curr = new Date();
  // Вычисляем понедельник текущей недели
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday + offsetWeeks * 7));

  const week = [];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayFormatted = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    week.push({
      dateStr: dateStr,
      dayName: dayNames[i],
      label: `${dayNames[i]} ${dayFormatted}`,
      dayNum: i + 1 // 1..7
    });
  }
  return week;
}

// --- 1. РАСПИСАНИЕ НА ДЕНЬ (ТАЙМЛАЙН) ---
function renderTimeline() {
  const tbody = document.getElementById('timelineTableBody');
  if (!tbody) return;

  const specialists = window.hdData.getSpecialists();
  const appointments = window.hdData.getAppointments().filter(a => a.date === currentDate && a.status !== 'cancelled');
  const hours = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  const curD = new Date(currentDate);
  const dayOfWeek = curD.getDay() === 0 ? 7 : curD.getDay();

  let html = '';

  specialists.forEach(sp => {
    // Проверяем статус работы мастера на этот день
    let isWorking = true;
    if (sp.customSchedule && sp.customSchedule[currentDate]) {
      isWorking = sp.customSchedule[currentDate].isWorking;
    } else if (sp.workDays) {
      isWorking = sp.workDays.includes(dayOfWeek);
    }

    html += `
      <tr style="${!isWorking ? 'opacity: 0.65; background: rgba(0,0,0,0.02);' : ''}">
        <td style="font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 10px; border-right: 1px solid var(--border-subtle);">
          <img src="${sp.avatar}" alt="${sp.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>${sp.name}</span>
              ${!isWorking ? '<span class="badge-status badge-status-cancelled" style="font-size: 9px; padding: 2px 6px;">Выходной</span>' : ''}
            </div>
            <div style="font-size: 11px; color: var(--text-dim); font-weight: normal;">${sp.role.split(',')[0]}</div>
          </div>
        </td>
    `;

    for (let i = 0; i < hours.length; i++) {
      const h = hours[i];
      const hNum = parseInt(h.split(':')[0], 10);

      // Ищем запись, которая начинается в этот час
      const app = appointments.find(a => {
        const isMaster = (a.specialistId === sp.id || (a.specialistName && a.specialistName.includes(sp.name)));
        if (!isMaster) return false;
        const appHour = parseInt(a.time.split(':')[0], 10);
        return appHour === hNum;
      });

      if (app) {
        const dur = app.duration || 60;
        const startMin = parseInt((app.time.split(':')[1] || '0'), 10);
        const totalEndMin = hNum * 60 + startMin + dur;
        const endHour = Math.floor(totalEndMin / 60);
        const endMin = totalEndMin % 60;
        const endTimeStr = String(endHour).padStart(2, '0') + ':' + String(endMin).padStart(2, '0');

        // Расчет количества часовых колонок (например, 60 мин = 1, 120 мин = 2, 180 мин = 3, 300 мин = 5)
        const spanHours = Math.max(1, Math.ceil(dur / 60));
        const actualColspan = Math.min(spanHours, hours.length - i);

        html += `
          <td colspan="${actualColspan}" class="timeline-app-cell" style="background: #FFFFFF; border: 1px solid rgba(232, 122, 54, 0.35); border-left: 4px solid var(--accent-primary); border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); vertical-align: middle; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${app.clientName}
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; color: var(--text-sub); font-family: var(--font-mono); background: #F3F4F6; border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
                  ${app.time} – ${endTimeStr} (${dur} мин)
                </span>
                <button type="button" class="btn btn-primary" onclick="openEditAppointmentModal('${app.id}')" style="padding: 3px 8px; font-size: 10px; line-height: 1.2; box-shadow: none;" title="Изменить мастера, время или добавить услуги">
                  ✏️ Изменить
                </button>
              </div>
            </div>
            <div style="font-size: 11px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
              ${app.serviceName}
            </div>
            ${app.variantName && app.variantName !== 'Стандарт' ? `
              <div style="font-size: 10px; color: var(--accent-primary); margin-top: 2px;">
                + ${app.variantName}
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 10px; color: var(--text-dim);">
              <span>${app.phone || ''}</span>
              <strong style="color: var(--accent-primary); font-family: var(--font-mono); font-size: 11px;">${window.hdData.formatMoney(app.price)}</strong>
            </div>
          </td>
        `;

        // Пропускаем ячейки, которые растянуты с помощью colspan
        i += (actualColspan - 1);
      } else if (!isWorking) {
        html += `
          <td style="color: var(--text-dim); text-align: center; background: rgba(255,255,255,0.01);">
            <span style="opacity: 0.3; font-size: 11px;">вых</span>
          </td>
        `;
      } else {
        html += `
          <td style="color: var(--text-dim); text-align: center; cursor: pointer;" onclick="openQuickBookingFor('${sp.id}', '${h}')" title="Нажмите, чтобы записать клиента на ${h}">
            <span style="opacity: 0.25;">+</span>
          </td>
        `;
      }
    }

    html += `</tr>`;
  });

  // Дополнительно: если есть записи со статусом "Любой свободный мастер" (specialistId === 'any'),
  // выводим отдельную заметную строку «Дежурный мастер / Свободный барбер», чтобы запись никогда не терялась!
  const unassignedApps = appointments.filter(a => {
    return !specialists.some(sp => (a.specialistId === sp.id || (a.specialistName && a.specialistName.includes(sp.name))));
  });

  if (unassignedApps.length > 0) {
    html += `
      <tr style="background: rgba(232, 122, 54, 0.05); border-top: 2px dashed var(--accent-primary);">
        <td style="font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 10px; border-right: 1px solid var(--border-subtle);">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(232, 122, 54, 0.15); border: 1px solid var(--accent-primary); display: flex; align-items: center; justify-content: center; font-size: 16px;">
            ⚡
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--accent-primary);">Не назначен</span>
              <span class="badge-status badge-status-new" style="font-size: 9px; padding: 2px 6px;">Требует мастера</span>
            </div>
            <div style="font-size: 11px; color: var(--text-dim); font-weight: normal;">Любой свободный мастер</div>
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
          <td colspan="${actualColspan}" class="timeline-app-cell" style="background: #FFFFFF; border: 1px solid #F59E0B; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); vertical-align: middle;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${app.clientName}
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; color: var(--text-sub); font-family: var(--font-mono); background: #F3F4F6; border: 1px solid var(--border-subtle); padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
                  ${app.time} – ${endTimeStr} (${dur} мин)
                </span>
                <button type="button" class="btn btn-primary" onclick="openEditAppointmentModal('${app.id}')" style="padding: 3px 8px; font-size: 10px; line-height: 1.2; box-shadow: none;" title="Назначить мастера">
                  ✏️ Назначить
                </button>
              </div>
            </div>
            <div style="font-size: 11px; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500;">
              ${app.serviceName}
            </div>
            <div style="font-size: 10px; color: #D97706; margin-top: 2px;">
              ⚠️ Нажмите «Назначить» для выбора барбера
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

// --- 2. МАСТЕРА И ГРАФИК РАБОТЫ (НЕДЕЛЬНОЕ РАСПИСАНИЕ) ---
function renderSpecialistsSchedule() {
  const headerRow = document.getElementById('scheduleDaysHeader');
  const tbody = document.getElementById('specialistsScheduleTableBody');
  const weekLabel = document.getElementById('scheduleCurrentWeekLabel');
  if (!headerRow || !tbody) return;

  const week = getWeekDays(currentWeekOffset);
  const specialists = window.hdData.getSpecialists();

  // Обновляем плашку с датами недели
  const firstDay = week[0].label.split(' ')[1];
  const lastDay = week[6].label.split(' ')[1];
  if (weekLabel) {
    weekLabel.textContent = `${firstDay} — ${lastDay} (${currentWeekOffset === 0 ? 'Текущая' : currentWeekOffset > 0 ? '+' + currentWeekOffset + ' нед.' : currentWeekOffset + ' нед.'})`;
  }

  // Заголовок таблицы
  let headerHtml = `
    <th style="width: 220px;">Специалист</th>
    ${week.map(w => `<th style="text-align: center; font-size: 12px;">${w.label}</th>`).join('')}
    <th style="width: 130px; text-align: right;">Действия</th>
  `;
  headerRow.innerHTML = headerHtml;

  // Строки мастеров
  let bodyHtml = '';
  specialists.forEach(sp => {
    bodyHtml += `
      <tr>
        <td style="border-right: 1px solid var(--border-subtle); padding: 12px 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${sp.avatar}" alt="${sp.name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium);">
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${sp.name}</div>
              <div style="font-size: 11px; color: var(--text-dim);">${sp.role}</div>
            </div>
          </div>
        </td>
    `;

    // 7 дней недели
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
          <button type="button" class="schedule-day-toggle" onclick="toggleSpecialistDay('${sp.id}', '${w.dateStr}')" style="width: 100%; padding: 8px 6px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; ${isWorking ? 'background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.35);' : 'background: #F8F9FA; color: var(--text-dim); border: 1px solid var(--border-subtle);'}" title="Нажмите, чтобы переключить рабочий/выходной">
            ${isWorking ? '10:00–20:00' : 'Выходной'}
          </button>
        </td>
      `;
    });

    // Действия (редактирование, удаление)
    bodyHtml += `
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn btn-glass" onclick="openEditSpecialistModal('${sp.id}')" style="padding: 6px 10px; font-size: 12px; margin-right: 4px;" title="Редактировать мастера">
          ✏️
        </button>
        ${specialists.length > 1 ? `
          <button class="btn btn-glass" onclick="deleteSpecialistAction('${sp.id}', '${sp.name}')" style="padding: 6px 10px; font-size: 12px; color: #EF4444;" title="Удалить">
            🗑️
          </button>
        ` : ''}
      </td>
    </tr>`;
  });

  tbody.innerHTML = bodyHtml;
}

window.toggleSpecialistDay = function(specId, dateStr) {
  window.hdData.toggleDaySchedule(specId, dateStr);
  renderSpecialistsSchedule();
  renderTimeline();
};

window.deleteSpecialistAction = function(id, name) {
  if (confirm(`Вы уверены, что хотите удалить мастера ${name}?`)) {
    window.hdData.deleteSpecialist(id);
    renderSpecialistsSchedule();
    renderTimeline();
    updateKPIs();
  }
};

// --- 3. ЖУРНАЛ ЗАПИСЕЙ ---
function renderJournal() {
  const tbody = document.getElementById('journalTableBody');
  if (!tbody) return;

  const filter = document.getElementById('journalStatusFilter') ? document.getElementById('journalStatusFilter').value : 'all';
  let appointments = window.hdData.getAppointments();

  if (filter !== 'all') {
    appointments = appointments.filter(a => a.status === filter);
  }

  if (appointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Нет записей в журнале по выбранному фильтру
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  appointments.forEach(a => {
    let statusBadge = '';
    switch (a.status) {
      case 'new':
        statusBadge = '<span class="badge-status badge-status-new">Новая</span>';
        break;
      case 'confirmed':
        statusBadge = '<span class="badge-status badge-status-confirmed">Подтверждена</span>';
        break;
      case 'completed':
        statusBadge = '<span class="badge-status badge-status-completed">Выполнена</span>';
        break;
      case 'cancelled':
        statusBadge = '<span class="badge-status badge-status-cancelled">Отменена</span>';
        break;
    }

    html += `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--text-main);">#${a.id}</td>
        <td style="font-weight: 600; color: var(--text-main);">${a.clientName}</td>
        <td>
          <a href="tel:${a.phone}" style="color: var(--text-sub); text-decoration: underline;">${a.phone}</a>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${a.serviceName}</div>
          ${a.variantName ? `<div style="font-size: 11px; color: var(--text-dim);">${a.variantName}</div>` : ''}
        </td>
        <td>${a.specialistName}</td>
        <td>
          <strong>${a.date}</strong> в ${a.time}
        </td>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-primary);">
          ${window.hdData.formatMoney(a.price)}
        </td>
        <td>${statusBadge}</td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-primary" onclick="openEditAppointmentModal('${a.id}')" style="padding: 4px 8px; font-size: 11px;" title="Изменить мастера, время, услуги">
              ✏️ Изменить
            </button>
            ${a.status === 'new' ? `
              <button class="btn btn-outline" onclick="changeStatus('${a.id}', 'confirmed')" style="padding: 4px 8px; font-size: 11px;">
                Подтвердить
              </button>
            ` : ''}
            ${a.status !== 'completed' && a.status !== 'cancelled' ? `
              <button class="btn btn-glass" onclick="changeStatus('${a.id}', 'completed')" style="padding: 4px 8px; font-size: 11px;">
                ✓ Завершить
              </button>
              <button class="btn btn-glass" onclick="changeStatus('${a.id}', 'cancelled')" style="padding: 4px 8px; font-size: 11px; color: #EF4444;">
                ✕
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function changeStatus(appointmentId, newStatus) {
  window.hdData.updateAppointmentStatus(appointmentId, newStatus);
  updateKPIs();
  renderTimeline();
  renderJournal();
}

// --- 4. УПРАВЛЕНИЕ УСЛУГАМИ И ЦЕНАМИ (АККОРДЕОНЫ ПО КАТЕГОРИЯМ) ---
function getServicesCountLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${count} услуг`;
  if (mod10 === 1) return `${count} услуга`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} услуги`;
  return `${count} услуг`;
}

function updateToggleAllBtnText() {
  const btn = document.getElementById('toggleAllCategoriesBtn');
  if (!btn) return;
  const items = document.querySelectorAll('.crm-accordion-item');
  if (items.length === 0) return;
  const allOpen = Array.from(items).every(el => el.classList.contains('open'));
  btn.innerHTML = allOpen ? 'Свернуть все ▴' : 'Развернуть все ▾';
}

window.toggleCategoryAccordion = function(catId) {
  const item = document.getElementById('accordion-cat-' + catId);
  if (!item) return;
  const isOpen = item.classList.toggle('open');
  openCategoriesState[catId] = isOpen;
  updateToggleAllBtnText();
};

window.toggleAllCategories = function() {
  const items = document.querySelectorAll('.crm-accordion-item');
  const allOpen = Array.from(items).every(el => el.classList.contains('open'));
  const shouldOpen = !allOpen;

  items.forEach(el => {
    const catId = el.getAttribute('data-cat-id');
    el.classList.toggle('open', shouldOpen);
    if (catId) openCategoriesState[catId] = shouldOpen;
  });

  updateToggleAllBtnText();
};

function renderServicesAdmin() {
  const container = document.getElementById('adminServicesAccordionContainer');
  if (!container) return;

  const categories = window.hdData.getCategories();
  const allServices = window.hdData.getServices();

  const query = adminServiceSearchQuery.toLowerCase().trim();

  let html = '';

  categories.forEach((cat, index) => {
    // Услуги данной категории
    let catServices = allServices.filter(s => s.categoryId === cat.id);

    // Фильтрация поиском
    if (query) {
      catServices = catServices.filter(s => 
        s.name.toLowerCase().includes(query) ||
        (s.shortDesc && s.shortDesc.toLowerCase().includes(query)) ||
        cat.name.toLowerCase().includes(query)
      );
    }

    // Если идет поиск и в категории нет совпадений, не показываем пустой аккордеон
    if (query && catServices.length === 0) {
      return;
    }

    // Состояние открытости:
    // При поиске всегда раскрываем совпавшие категории
    // Без поиска — по умолчанию категории свернуты (или берутся из сохраненного состояния кликов)
    let isOpen = false;
    if (query) {
      isOpen = true;
    } else if (openCategoriesState[cat.id] !== undefined) {
      isOpen = openCategoriesState[cat.id];
    } else {
      isOpen = false;
      openCategoriesState[cat.id] = false;
    }

    const countLabel = getServicesCountLabel(catServices.length);

    html += `
      <div class="crm-accordion-item ${isOpen ? 'open' : ''}" id="accordion-cat-${cat.id}" data-cat-id="${cat.id}">
        <div class="crm-accordion-header" onclick="toggleCategoryAccordion('${cat.id}')">
          <div class="crm-accordion-title">
            <span style="font-size: 20px;">${cat.icon}</span>
            <div>
              <span style="color: var(--text-main); font-weight: 700;">${cat.name}</span>
              ${cat.desc ? `<div style="font-size: 11px; color: var(--text-dim); font-weight: normal; margin-top: 2px;">${cat.desc}</div>` : ''}
            </div>
            <span class="crm-accordion-badge">${countLabel}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-glass" onclick="event.stopPropagation(); openCreateServiceModal('${cat.id}')" style="padding: 5px 12px; font-size: 11px;" title="Добавить новую услугу в эту категорию">
              + В категорию
            </button>
            <span class="crm-accordion-chevron">▼</span>
          </div>
        </div>

        <div class="crm-accordion-body">
          ${catServices.length === 0 ? `
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
              В этой категории пока нет услуг.
              <button class="btn btn-outline" onclick="openCreateServiceModal('${cat.id}')" style="margin-left: 10px; padding: 4px 10px; font-size: 12px;">+ Добавить</button>
            </div>
          ` : `
            <div class="timeline-container" style="border: none; border-radius: 0; box-shadow: none;">
              <table class="timeline-table">
                <thead>
                  <tr>
                    <th style="width: 32%;">Название процедуры</th>
                    <th style="width: 14%;">Длительность</th>
                    <th style="width: 16%;">Базовая цена</th>
                    <th style="width: 24%;">Варианты / Длины</th>
                    <th style="width: 14%; text-align: right;">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  ${catServices.map(s => {
                    const hasVariants = s.priceVariants && s.priceVariants.length > 0;
                    const variantsText = hasVariants ? s.priceVariants.map(v => `${v.name}: ${window.hdData.formatMoney(v.price)}`).join('; ') : '—';
                    return `
                      <tr>
                        <td style="font-weight: 600; color: var(--text-main);">
                          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <span>${s.name}</span>
                            ${s.badge ? `<span class="badge-tag badge-tag-white" style="font-size: 9px;">${s.badge}</span>` : ''}
                          </div>
                          ${s.shortDesc ? `<div style="font-size: 11px; color: var(--text-dim); margin-top: 3px; font-weight: normal; line-height: 1.35;">${s.shortDesc}</div>` : ''}
                        </td>
                        <td>~${s.duration || 60} мин</td>
                        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-main);">
                          ${window.hdData.formatMoney(s.price)}
                        </td>
                        <td style="font-size: 12px; color: var(--text-muted); max-width: 260px;">
                          ${variantsText}
                        </td>
                        <td style="text-align: right;">
                          <div style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-outline" onclick="openEditServiceModal('${s.id}')" style="padding: 6px 12px; font-size: 12px;" title="Редактировать услугу, категорию, цену и время">
                              ✏️ Редактировать
                            </button>
                            <button class="btn btn-glass" onclick="deleteServiceAction('${s.id}', '${s.name.replace(/'/g, "\\'")}')" style="padding: 6px 10px; font-size: 12px; color: #EF4444;" title="Удалить услугу">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  });

  if (!html) {
    html = `
      <div style="padding: 48px; text-align: center; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
        <div style="font-size: 28px; margin-bottom: 8px;">🔍</div>
        <div style="font-size: 16px; font-weight: 600; color: #FFFFFF; margin-bottom: 4px;">Ничего не найдено</div>
        <div style="font-size: 13px; color: var(--text-muted);">По запросу «${adminServiceSearchQuery}» не найдено ни одной услуги</div>
      </div>
    `;
  }

  container.innerHTML = html;
  updateToggleAllBtnText();
}

window.deleteServiceAction = function(id, name) {
  if (confirm(`Вы уверены, что хотите удалить услугу "${name}"?`)) {
    window.hdData.deleteService(id);
    updateKPIs();
    renderServicesAdmin();
  }
};


// --- МОДАЛЬНЫЕ ОКНА ---
function setupModals() {
  // Кнопки добавления услуги ("+ Добавить услугу" в шапке и "+ Создать новую услугу" во вкладке)
  const addServiceTopBtn = document.getElementById('openAddServiceBtn');
  const addServiceTabBtn = document.getElementById('addServiceTabBtn');
  if (addServiceTopBtn) {
    addServiceTopBtn.addEventListener('click', () => openCreateServiceModal());
  }
  if (addServiceTabBtn) {
    addServiceTabBtn.addEventListener('click', () => openCreateServiceModal());
  }

  // Быстрая запись
  const quickBtn = document.getElementById('openQuickBookingBtn');
  const quickModal = document.getElementById('adminQuickBookingModal');
  const quickClose = document.getElementById('closeQuickBookingModal');
  const quickForm = document.getElementById('adminQuickBookingForm');

  if (quickBtn && quickModal) {
    quickBtn.addEventListener('click', () => {
      populateQuickBookingSelects();
      quickModal.classList.add('active');
    });
    quickClose.addEventListener('click', () => quickModal.classList.remove('active'));
    quickModal.addEventListener('click', (e) => {
      if (e.target === quickModal) quickModal.classList.remove('active');
    });

    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const services = window.hdData.getServices();
      const specialists = window.hdData.getSpecialists();

      const sId = document.getElementById('adminServiceSelect').value;
      const spId = document.getElementById('adminSpecialistSelect').value;
      const srv = services.find(s => s.id === sId);
      const spec = specialists.find(s => s.id === spId) || { name: 'Любой мастер' };

      window.hdData.addAppointment({
        clientName: document.getElementById('adminClientName').value.trim(),
        phone: document.getElementById('adminClientPhone').value.trim(),
        serviceId: sId,
        serviceName: srv ? srv.name : "Услуга",
        variantName: "Стандарт",
        specialistId: spId,
        specialistName: spec.name,
        date: document.getElementById('adminBookingDate').value,
        time: document.getElementById('adminBookingTime').value,
        duration: srv ? srv.duration : 60,
        price: srv ? srv.price : 0,
        comment: document.getElementById('adminBookingComment').value.trim()
      });

      quickModal.classList.remove('active');
      quickForm.reset();
      updateKPIs();
      renderTimeline();
      renderJournal();
    });
  }

  // Создание и Редактирование услуги
  const editModal = document.getElementById('adminEditServiceModal');
  const editClose = document.getElementById('closeEditServiceModal');
  const editForm = document.getElementById('adminEditServiceForm');

  if (editModal) {
    editClose.addEventListener('click', () => editModal.classList.remove('active'));
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) editModal.classList.remove('active');
    });

    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editServiceId').value;
      const name = document.getElementById('editServiceName').value.trim();
      const categoryId = document.getElementById('editServiceCategory').value;
      const price = parseInt(document.getElementById('editServicePrice').value, 10);
      const duration = parseInt(document.getElementById('editServiceDuration').value, 10) || 60;
      const desc = document.getElementById('editServiceDesc').value.trim();

      if (id) {
        // Редактирование существующей услуги
        window.hdData.updateService(id, {
          name,
          categoryId,
          price,
          duration,
          shortDesc: desc,
          fullDesc: desc
        });
      } else {
        // Создание новой услуги
        window.hdData.addService({
          name,
          categoryId,
          price,
          duration,
          shortDesc: desc,
          fullDesc: desc
        });
      }

      editModal.classList.remove('active');
      updateKPIs();
      renderServicesAdmin();
    });
  }

  // Добавление / Редактирование мастера
  const specModal = document.getElementById('adminSpecialistModal');
  const openAddSpecBtn = document.getElementById('openAddSpecialistBtn');
  const closeSpecBtn = document.getElementById('closeSpecialistModal');
  const specForm = document.getElementById('adminSpecialistForm');

  if (openAddSpecBtn && specModal) {
    openAddSpecBtn.addEventListener('click', () => {
      openCreateSpecialistModal();
    });
  }

  if (closeSpecBtn && specModal) {
    closeSpecBtn.addEventListener('click', () => specModal.classList.remove('active'));
    specModal.addEventListener('click', (e) => {
      if (e.target === specModal) specModal.classList.remove('active');
    });
  }

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

      if (id) {
        // Редактирование
        window.hdData.updateSpecialist(id, {
          name,
          role,
          experience: exp,
          avatar,
          categories: selectedCats.length > 0 ? selectedCats : ["complex-color", "single-color"],
          workDays: selectedWorkDays
        });
      } else {
        // Создание нового мастера
        window.hdData.addSpecialist({
          name,
          role,
          experience: exp,
          avatar,
          categories: selectedCats.length > 0 ? selectedCats : ["complex-color", "single-color"],
          workDays: selectedWorkDays
        });
      }

      specModal.classList.remove('active');
      renderSpecialistsSchedule();
      renderTimeline();
    });
  }
}

function openCreateSpecialistModal() {
  const modal = document.getElementById('adminSpecialistModal');
  if (!modal) return;

  document.getElementById('specialistModalTitle').textContent = "Новый мастер студии";
  document.getElementById('specEditId').value = "";
  document.getElementById('specEditName').value = "";
  document.getElementById('specEditRole').value = "";
  document.getElementById('specEditExperience').value = "";
  document.getElementById('specEditAvatar').value = "";

  populateCategoryCheckboxes([]);
  document.querySelectorAll('#specWorkDaysCheckboxes input').forEach(ch => ch.checked = true);

  modal.classList.add('active');
}

window.openEditSpecialistModal = function(specId) {
  const modal = document.getElementById('adminSpecialistModal');
  const specialists = window.hdData.getSpecialists();
  const spec = specialists.find(s => s.id === specId);
  if (!modal || !spec) return;

  document.getElementById('specialistModalTitle').textContent = "Редактирование профиля: " + spec.name;
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

  const categories = window.hdData.getCategories();
  container.innerHTML = categories.map(cat => {
    const isChecked = selectedCategories.includes(cat.id);
    return `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; background: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
        <input type="checkbox" value="${cat.id}" ${isChecked ? 'checked' : ''}>
        <span>${cat.icon} ${cat.name}</span>
      </label>
    `;
  }).join('');
}

function populateQuickBookingSelects() {
  const serviceSel = document.getElementById('adminServiceSelect');
  const specSel = document.getElementById('adminSpecialistSelect');
  const dateInput = document.getElementById('adminBookingDate');

  if (dateInput) dateInput.value = currentDate;

  if (serviceSel) {
    const services = window.hdData.getServices();
    serviceSel.innerHTML = services.map(s => `
      <option value="${s.id}">${s.name} (${window.hdData.formatMoney(s.price)})</option>
    `).join('');
  }

  if (specSel) {
    const specialists = window.hdData.getSpecialists();
    specSel.innerHTML = `
      <option value="any">Любой свободный мастер</option>
      ${specialists.map(sp => `<option value="${sp.id}">${sp.name} (${sp.role.split(',')[0]})</option>`).join('')}
    `;
  }
}

window.openQuickBookingFor = function(specialistId, time) {
  const quickModal = document.getElementById('adminQuickBookingModal');
  if (!quickModal) return;

  populateQuickBookingSelects();
  document.getElementById('adminSpecialistSelect').value = specialistId;
  document.getElementById('adminBookingTime').value = time;
  quickModal.classList.add('active');
};

function populateServiceCategorySelect(selectedCategoryId = null) {
  const select = document.getElementById('editServiceCategory');
  if (!select) return;

  const categories = window.hdData.getCategories();
  select.innerHTML = categories.map(c => `
    <option value="${c.id}" ${c.id === selectedCategoryId ? 'selected' : ''}>
      ${c.icon} ${c.name}
    </option>
  `).join('');
}

window.openCreateServiceModal = function(preselectedCategoryId = null) {
  const modal = document.getElementById('adminEditServiceModal');
  if (!modal) return;

  document.getElementById('editServiceModalTitle').textContent = "Новая услуга студии";
  document.getElementById('editServiceId').value = "";
  document.getElementById('editServiceName').value = "";
  document.getElementById('editServicePrice').value = "";
  document.getElementById('editServiceDuration').value = "60";
  document.getElementById('editServiceDesc').value = "";

  populateServiceCategorySelect(preselectedCategoryId);

  modal.classList.add('active');
};

window.openEditServiceModal = function(serviceId) {
  const services = window.hdData.getServices();
  const srv = services.find(s => s.id === serviceId);
  if (!srv) return;

  const modal = document.getElementById('adminEditServiceModal');
  if (!modal) return;

  document.getElementById('editServiceModalTitle').textContent = "Редактирование: " + srv.name;
  document.getElementById('editServiceId').value = srv.id;
  document.getElementById('editServiceName').value = srv.name;
  document.getElementById('editServicePrice').value = srv.price;
  document.getElementById('editServiceDuration').value = String(srv.duration || 60);
  document.getElementById('editServiceDesc').value = srv.shortDesc || srv.fullDesc || '';

  populateServiceCategorySelect(srv.categoryId);

  modal.classList.add('active');
};

// ==========================================
// ЛОГИКА РЕДАКТИРОВАНИЯ ЗАПИСИ (СМЕНА МАСТЕРА, ВРЕМЕНИ, ДОБАВЛЕНИЕ УСЛУГ)
// ==========================================
let currentEditingAppItems = []; // Массив услуг текущей редактируемой записи: [{ serviceId, name, price, duration }]

window.openEditAppointmentModal = function(appId) {
  const modal = document.getElementById('adminEditAppointmentModal');
  if (!modal) return;

  const appointments = window.hdData.getAppointments();
  const app = appointments.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('editAppModalTitle').textContent = `Изменить запись #${app.id}`;
  document.getElementById('editAppSubtitle').textContent = `Клиент: ${app.clientName} • ${app.date} в ${app.time}`;
  document.getElementById('editAppId').value = app.id;
  document.getElementById('editAppClientName').value = app.clientName || '';
  document.getElementById('editAppClientPhone').value = app.phone || '';
  document.getElementById('editAppDate').value = app.date;
  document.getElementById('editAppTime').value = app.time;
  document.getElementById('editAppStatus').value = app.status || 'new';
  document.getElementById('editAppComment').value = app.comment || '';

  // Заполняем селект мастеров
  const specSel = document.getElementById('editAppSpecialistSelect');
  const specialists = window.hdData.getSpecialists();
  specSel.innerHTML = `
    <option value="any">Любой свободный мастер</option>
    ${specialists.map(sp => `
      <option value="${sp.id}" ${sp.id === app.specialistId ? 'selected' : ''}>
        ${sp.name} (${sp.role.split(',')[0]})
      </option>
    `).join('')}
  `;
  if (app.specialistId) {
    specSel.value = app.specialistId;
  }

  // Заполняем список услуг для добавления
  const addServiceSel = document.getElementById('editAppAddServiceSelect');
  const allServices = window.hdData.getServices();
  addServiceSel.innerHTML = allServices.map(s => `
    <option value="${s.id}">
      ${s.name} (${window.hdData.formatMoney(s.price)}, ${s.duration || 45} мин)
    </option>
  `).join('');

  // Инициализируем массив услуг в записи
  currentEditingAppItems = [];
  // Если в записи уже была сохранена основная услуга:
  if (app.serviceName) {
    // Проверим, не мульти-услуга ли это уже (через разделитель +)
    const serviceNames = app.serviceName.split(' + ').map(s => s.trim());
    if (serviceNames.length > 1) {
      serviceNames.forEach((sName, idx) => {
        const found = allServices.find(srv => srv.name === sName);
        currentEditingAppItems.push({
          serviceId: found ? found.id : ('custom-' + idx),
          name: sName,
          price: found ? found.price : (idx === 0 ? app.price : 0),
          duration: found ? (found.duration || 45) : (idx === 0 ? (app.duration || 60) : 30)
        });
      });
    } else {
      currentEditingAppItems.push({
        serviceId: app.serviceId || 'srv-primary',
        name: app.serviceName,
        price: app.price || 0,
        duration: app.duration || 60
      });
    }
  }

  renderEditingAppServices();
  modal.classList.add('active');
};

function renderEditingAppServices() {
  const container = document.getElementById('editAppServicesList');
  const durationBadge = document.getElementById('editAppTotalDurationBadge');
  const priceInput = document.getElementById('editAppPrice');
  if (!container) return;

  if (currentEditingAppItems.length === 0) {
    container.innerHTML = `
      <div style="font-size: 13px; color: var(--text-dim); padding: 10px; text-align: center;">
        Нет выбранных услуг. Добавьте процедуру из списка ниже.
      </div>
    `;
    if (durationBadge) durationBadge.textContent = 'Общая длительность: 0 мин';
    if (priceInput) priceInput.value = 0;
    return;
  }

  let totalDuration = 0;
  let totalPrice = 0;

  let html = '';
  currentEditingAppItems.forEach((item, index) => {
    totalDuration += (parseInt(item.duration, 10) || 0);
    totalPrice += (parseInt(item.price, 10) || 0);

    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-primary); font-weight: 700; font-size: 13px;">${index + 1}.</span>
          <div>
            <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">${item.name}</div>
            <div style="font-size: 11px; color: var(--text-dim);">⏱ ${item.duration} мин</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--accent-primary);">
            ${window.hdData.formatMoney(item.price)}
          </div>
          <button type="button" onclick="removeEditingAppService(${index})" style="background: none; border: none; color: #EF4444; font-size: 16px; cursor: pointer; padding: 2px 6px;" title="Удалить эту услугу из записи">
            ✕
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (durationBadge) durationBadge.textContent = `Общая длительность: ${totalDuration} мин (~${Math.ceil(totalDuration/60)} ч)`;
  if (priceInput) priceInput.value = totalPrice;
}

window.removeEditingAppService = function(index) {
  if (currentEditingAppItems.length <= 1) {
    if (!confirm('В записи осталась одна услуга. Вы уверены, что хотите удалить её?')) return;
  }
  currentEditingAppItems.splice(index, 1);
  renderEditingAppServices();
};

function setupEditAppointmentModal() {
  const modal = document.getElementById('adminEditAppointmentModal');
  const closeBtn = document.getElementById('closeEditAppModal');
  const cancelBtn = document.getElementById('editAppCancelBtn');
  const deleteBtn = document.getElementById('editAppDeleteBtn');
  const addBtn = document.getElementById('editAppAddServiceBtn');
  const form = document.getElementById('adminEditAppForm');

  if (!modal) return;

  const closeModal = () => modal.classList.remove('active');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Кнопка добавления услуги
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const addSelect = document.getElementById('editAppAddServiceSelect');
      const sId = addSelect.value;
      const allServices = window.hdData.getServices();
      const srv = allServices.find(s => s.id === sId);
      if (!srv) return;

      currentEditingAppItems.push({
        serviceId: srv.id,
        name: srv.name,
        price: srv.price || 0,
        duration: srv.duration || 45
      });

      renderEditingAppServices();
    });
  }

  // Кнопка удаления записи
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const id = document.getElementById('editAppId').value;
      if (!id) return;
      if (confirm(`Вы действительно хотите безвозвратно удалить запись #${id}?`)) {
        window.hdData.deleteAppointment(id);
        modal.classList.remove('active');
        updateKPIs();
        renderTimeline();
        renderJournal();
      }
    });
  }

  // Сохранение отредактированной записи
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editAppId').value;
      if (!id) return;

      const clientName = document.getElementById('editAppClientName').value.trim();
      const phone = document.getElementById('editAppClientPhone').value.trim();
      const specialistId = document.getElementById('editAppSpecialistSelect').value;
      const specialists = window.hdData.getSpecialists();
      const spec = specialists.find(s => s.id === specialistId) || { name: 'Любой мастер' };
      const date = document.getElementById('editAppDate').value;
      const time = document.getElementById('editAppTime').value;
      const status = document.getElementById('editAppStatus').value;
      const price = parseInt(document.getElementById('editAppPrice').value, 10) || 0;
      const comment = document.getElementById('editAppComment').value.trim();

      // Рассчитываем объединенное название и длительность
      let serviceName = "Услуга";
      let totalDuration = 60;
      let primaryServiceId = "";

      if (currentEditingAppItems.length > 0) {
        serviceName = currentEditingAppItems.map(item => item.name).join(' + ');
        totalDuration = currentEditingAppItems.reduce((acc, item) => acc + (parseInt(item.duration, 10) || 0), 0);
        primaryServiceId = currentEditingAppItems[0].serviceId;
      }

      window.hdData.updateAppointment(id, {
        clientName,
        phone,
        specialistId,
        specialistName: spec.name,
        date,
        time,
        status,
        price,
        serviceId: primaryServiceId,
        serviceName,
        duration: totalDuration,
        comment
      });

      modal.classList.remove('active');
      updateKPIs();
      renderTimeline();
      renderJournal();
    });
  }
}

// Регистрируем вызов setupEditAppointmentModal в инициализации
const originalSetupModals = setupModals;
setupModals = function() {
  if (originalSetupModals) originalSetupModals();
  setupEditAppointmentModal();
};

