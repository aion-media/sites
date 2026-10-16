/**
 * PRIME Space — CRM Panel Management Engine
 * "Space to Grow Together"
 */

document.addEventListener("DOMContentLoaded", () => {
  const Admin = {
    currentDay: 5, // Пятница по умолчанию
    activeTab: "matrix",
    currentEditingItem: null,
    clientFilter: "all",
    clientSearchQuery: "",
    currentViewingClient: null,

    timeSlots: [
      "09:30", "10:00", "10:30", "11:00", "11:30", 
      "12:00", "12:30", "13:00", "13:30", "14:00", 
      "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00", 
      "19:30", "20:00", "20:30", "21:00"
    ],

    spacesForMatrix: [
      "prime-body",
      "prime-art",
      "prime-lab",
      "prime-mind",
      "prime-coworking",
      "prime-private",
      "prime-balance"
    ],

    daysMeta: [
      { num: 1, name: "Понедельник", short: "Пн" },
      { num: 2, name: "Вторник", short: "Вт" },
      { num: 3, name: "Среда", short: "Ср" },
      { num: 4, name: "Четверг", short: "Чт" },
      { num: 5, name: "Пятница", short: "Пт" },
      { num: 6, name: "Суббота", short: "Сб" },
      { num: 7, name: "Воскресенье", short: "Вс" }
    ],

    init() {
      this.bindAuth();
      this.bindNavigation();
      this.renderDaySelector();
      this.renderKPIs();
      this.renderMatrix();
      this.renderMastersList();
      this.renderAppointmentsJournal();
      this.renderClientsList();
      this.bindClientsEvents();
      this.bindActionModals();

      const urlParams = new URLSearchParams(window.location.search);
      const requestedTab = urlParams.get("tab");
      if (requestedTab) {
        const item = document.querySelector(`.admin-nav-item[data-tab="${requestedTab}"]`);
        if (item) item.click();
      }
    },

    // 1. АВТОРИЗАЦИЯ ПО PIN-КОДУ
    bindAuth() {
      const form = document.getElementById("pinAuthForm");
      const pinInput = document.getElementById("pinInput");
      const pinError = document.getElementById("pinErrorMsg");
      const lockScreen = document.getElementById("pinLockScreen");
      const mainLayout = document.getElementById("adminMainLayout");

      if (sessionStorage.getItem("prime_admin_authed") === "true" || window.location.search.includes("authed=1")) {
        lockScreen.style.display = "none";
        mainLayout.style.display = "grid";
      }

      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (pinInput.value === "1234" || pinInput.value === "606") {
            sessionStorage.setItem("prime_admin_authed", "true");
            lockScreen.style.display = "none";
            mainLayout.style.display = "grid";
          } else {
            pinError.style.display = "block";
            pinInput.value = "";
          }
        });
      }
    },

    // 2. НАВИГАЦИЯ ПО ВКЛАДКАМ CRM
    bindNavigation() {
      const navItems = document.querySelectorAll(".admin-nav-item[data-tab]");
      navItems.forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const tab = item.dataset.tab;
          this.activeTab = tab;

          navItems.forEach(n => n.classList.remove("active"));
          item.classList.add("active");

          document.querySelectorAll(".admin-tab-pane").forEach(pane => {
            pane.style.display = "none";
          });

          const activePane = document.getElementById("tabPane-" + tab);
          if (activePane) activePane.style.display = "block";

          if (tab === "matrix") this.renderMatrix();
          if (tab === "clients") this.renderClientsList();
          if (tab === "journal") this.renderAppointmentsJournal();
          if (tab === "masters") this.renderMastersList();
          if (tab === "rentals") this.renderRentalsMatrix();
        });
      });
    },

    // 3. СЕЛЕКТОР ДНЕЙ НЕДЕЛИ
    renderDaySelector() {
      const container = document.getElementById("adminDaySelector");
      if (!container) return;

      container.innerHTML = this.daysMeta.map(d => `
        <button class="btn btn-sm ${d.num === this.currentDay ? "btn-dark" : "btn-outline"} btn-day-select" data-day="${d.num}">
          ${d.short} • ${d.name}
        </button>
      `).join("");

      container.querySelectorAll(".btn-day-select").forEach(btn => {
        btn.addEventListener("click", () => {
          this.currentDay = parseInt(btn.dataset.day, 10);
          this.renderDaySelector();
          this.renderKPIs();
          this.renderMatrix();
        });
      });
    },

    // 4. KPI КАРТОЧКИ ДНЯ
    renderKPIs() {
      const items = window.primeData.getScheduleByDay(this.currentDay);
      const totalLessons = items.length;
      let totalGuests = 0;
      let totalRevenue = 0;
      let maxPossibleSpots = 0;

      items.forEach(it => {
        const booked = it.participants ? it.participants.length : 0;
        totalGuests += booked;
        totalRevenue += booked * (it.price || 0);
        maxPossibleSpots += (it.maxSpots || 10);
      });

      const occupancyRate = maxPossibleSpots > 0 ? Math.round((totalGuests / maxPossibleSpots) * 100) : 0;

      document.getElementById("kpiDayLessons").textContent = totalLessons;
      document.getElementById("kpiDayGuests").textContent = totalGuests;
      document.getElementById("kpiDayOccupancy").textContent = occupancyRate + "%";
      document.getElementById("kpiDayRevenue").textContent = window.primeData.formatPrice(totalRevenue);
    },

    // 5. ИНТЕРАКТИВНАЯ ШАХМАТКА ЗАЛОВ И ВРЕМЕНИ (MATRIX)
    renderMatrix() {
      const thead = document.getElementById("matrixHead");
      const tbody = document.getElementById("matrixBody");
      if (!thead || !tbody) return;

      const spaces = this.spacesForMatrix.map(id => window.primeData.getSpaceById(id)).filter(Boolean);
      const items = window.primeData.getScheduleByDay(this.currentDay);
      const rentals = (window.primeData.getRentals() || []).filter(r => r.dayOfWeek === this.currentDay);

      // Шапка таблицы: Время + Колонки пространств
      thead.innerHTML = `
        <tr>
          <th style="width: 85px;">Время</th>
          ${spaces.map(s => `
            <th style="border-top: 3px solid ${s.color};">
              <span style="font-size: 14px; margin-right: 4px;">${s.icon}</span>
              ${s.name}
            </th>
          `).join("")}
        </tr>
      `;

      // Строки: по каждому 30-минутному слоту
      tbody.innerHTML = this.timeSlots.map(timeStr => {
        const timeHour = parseInt(timeStr.split(":")[0], 10);
        const timeMin = parseInt(timeStr.split(":")[1], 10);
        const timeInMinutes = timeHour * 60 + timeMin;

        const cellsHtml = spaces.map(space => {
          // Ищем занятие, попадающее в этот слот
          const matchLesson = items.find(it => {
            if (it.spaceId !== space.id) return false;
            const sH = parseInt(it.timeStart.split(":")[0], 10);
            const sM = parseInt(it.timeStart.split(":")[1], 10);
            const eH = parseInt(it.timeEnd.split(":")[0], 10);
            const eM = parseInt(it.timeEnd.split(":")[1], 10);
            const startM = sH * 60 + sM;
            const endM = eH * 60 + eM;
            return timeInMinutes >= startM && timeInMinutes < endM;
          });

          // Ищем аренду кабинета (для PRIVATE и BALANCE)
          const matchRental = rentals.find(r => {
            if (r.spaceId !== space.id) return false;
            const sH = parseInt(r.timeStart.split(":")[0], 10);
            const sM = parseInt(r.timeStart.split(":")[1], 10);
            const eH = parseInt(r.timeEnd.split(":")[0], 10);
            const eM = parseInt(r.timeEnd.split(":")[1], 10);
            const startM = sH * 60 + sM;
            const endM = eH * 60 + eM;
            return timeInMinutes >= startM && timeInMinutes < endM;
          });

          if (matchLesson) {
            // Отрисовываем плашку только на первом слоте занятия
            const isStartSlot = matchLesson.timeStart === timeStr;
            const booked = matchLesson.participants ? matchLesson.participants.length : 0;
            const isFull = booked >= matchLesson.maxSpots;

            if (isStartSlot) {
              return `
                <td style="background: rgba(255,255,255,0.7);">
                  <div class="matrix-slot-card" data-lesson-id="${matchLesson.id}" style="--slot-color: ${space.color}">
                    <div class="matrix-slot-title">${matchLesson.title}</div>
                    <div class="matrix-slot-meta">
                      <span>👤 ${matchLesson.masterName}</span>
                      <span class="guest-count-pill ${isFull ? 'full' : ''}">${booked} / ${matchLesson.maxSpots}</span>
                    </div>
                  </div>
                </td>
              `;
            } else {
              return `<td style="background: rgba(248, 250, 252, 0.4); border-left: 2px dashed ${space.color}; opacity: 0.5;">
                <span style="font-size: 10px; color: #94A3B8;">продолжение</span>
              </td>`;
            }
          }

          if (matchRental) {
            const isStartSlot = matchRental.timeStart === timeStr;
            if (isStartSlot) {
              return `
                <td style="background: rgba(255,255,255,0.7);">
                  <div class="matrix-slot-card" style="--slot-color: #64748B; background: #F1F5F9;">
                    <div class="matrix-slot-title">🔑 Аренда: ${matchRental.specialistName}</div>
                    <div class="matrix-slot-meta">
                      <span>${matchRental.specialistRole}</span>
                      <span style="color: var(--accent-emerald); font-weight: 700;">Сдано</span>
                    </div>
                  </div>
                </td>
              `;
            } else {
              return `<td style="background: rgba(241, 245, 249, 0.5); opacity: 0.6;">
                <span style="font-size: 10px; color: #94A3B8;">аренда</span>
              </td>`;
            }
          }

          return `<td><span style="font-size: 11px; color: #CBD5E1;">—</span></td>`;
        }).join("");

        return `
          <tr>
            <td class="matrix-time-col">${timeStr}</td>
            ${cellsHtml}
          </tr>
        `;
      }).join("");

      // Клик по блоку занятия в шахматке -> открытие модалки управления
      tbody.querySelectorAll(".matrix-slot-card[data-lesson-id]").forEach(card => {
        card.addEventListener("click", () => {
          const lessonId = card.dataset.lessonId;
          this.openLessonDetailModal(lessonId);
        });
      });
    },

    // 6. МОДАЛКА УПРАВЛЕНИЯ ЗАНЯТИЕМ И СПИСКОМ ГОСТЕЙ
    openLessonDetailModal(lessonId) {
      const item = window.primeData.getScheduleItemById(lessonId);
      if (!item) return;

      this.currentEditingItem = item;
      const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId, color: "#D9654C" };
      const masters = window.primeData.getMasters();

      const modal = document.getElementById("lessonDetailModal");
      document.getElementById("modalLessonTitle").textContent = item.title;
      document.getElementById("modalLessonSub").textContent = `${item.timeStart} – ${item.timeEnd} • ${space.name}`;

      // 6.1. Заполняем форму редактирования параметров занятия
      document.getElementById("editLessonTitle").value = item.title;
      document.getElementById("editLessonSpace").value = item.spaceId;
      document.getElementById("editLessonTimeStart").value = item.timeStart;
      document.getElementById("editLessonTimeEnd").value = item.timeEnd;
      document.getElementById("editLessonMaxSpots").value = item.maxSpots;
      document.getElementById("editLessonPrice").value = item.price;
      document.getElementById("editLessonAge").value = item.ageLabel || "";

      // Селект мастеров
      const masterSelect = document.getElementById("editLessonMaster");
      masterSelect.innerHTML = masters.map(m => `
        <option value="${m.name}" ${m.name === item.masterName ? "selected" : ""}>${m.name} (${m.role})</option>
      `).join("") + `<option value="Другой специалист">Другой специалист</option>`;

      // 6.2. Рендерим таблицу участников
      this.renderParticipantsList(item);

      modal.classList.add("open");
    },

    renderParticipantsList(item) {
      const tbody = document.getElementById("modalParticipantsBody");
      const participants = item.participants || [];

      document.getElementById("modalParticipantsCount").textContent = `${participants.length} из ${item.maxSpots} мест занято`;

      if (participants.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: #94A3B8; padding: 24px;">
              Записавшихся пока нет. Нажмите «+ Добавить гостя со стойки», чтобы записать клиента вручную.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = participants.map((p, idx) => `
        <tr>
          <td><strong style="color: var(--prime-navy-dark); font-size: 13px;">${idx + 1}. ${p.name}</strong></td>
          <td><a href="tel:${p.phone}" style="color: var(--prime-cta-blue); font-weight: 600; font-size: 12px; white-space: nowrap;">${p.phone}</a></td>
          <td>
            <select class="form-input participant-status-select" data-p-id="${p.id}" style="padding: 4px 6px; font-size: 11px; width: 100%; max-width: 125px; border-radius: 8px;">
              <option value="confirmed" ${p.status === "confirmed" ? "selected" : ""}>Подтвержден</option>
              <option value="visited" ${p.status === "visited" ? "selected" : ""}>✅ Пришел</option>
              <option value="cancelled" ${p.status === "cancelled" ? "selected" : ""}>❌ Отмена</option>
            </select>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-sm btn-outline btn-del-guest" data-p-id="${p.id}" style="color: #EF4444; border-color: #FCA5A5; padding: 4px 7px; font-size: 11px; border-radius: 8px;" title="Удалить запись">✕</button>
          </td>
        </tr>
      `).join("");

      // Смена статуса
      tbody.querySelectorAll(".participant-status-select").forEach(sel => {
        sel.addEventListener("change", (e) => {
          const pId = sel.dataset.pId;
          window.primeData.updateParticipantStatus(item.id, pId, e.target.value);
          this.renderKPIs();
        });
      });

      // Удаление гостя
      tbody.querySelectorAll(".btn-del-guest").forEach(btn => {
        btn.addEventListener("click", () => {
          if (confirm("Удалить запись этого гостя?")) {
            const pId = btn.dataset.pId;
            window.primeData.removeParticipant(item.id, pId);
            const updated = window.primeData.getScheduleItemById(item.id);
            this.renderParticipantsList(updated);
            this.renderKPIs();
            this.renderMatrix();
          }
        });
      });
    },

    // 7. ЖУРНАЛ ВСЕХ ЗАПИСЕЙ КЛИЕНТОВ (TAB JOURNAL)
    renderAppointmentsJournal() {
      const tbody = document.getElementById("journalTableBody");
      if (!tbody) return;

      const schedule = window.primeData.getSchedule();
      let allBookings = [];

      schedule.forEach(item => {
        const dayMeta = this.daysMeta.find(d => d.num === item.dayOfWeek) || { name: "День" };
        const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId };

        if (item.participants) {
          item.participants.forEach(p => {
            allBookings.push({
              guestName: p.name,
              phone: p.phone,
              lessonTitle: item.title,
              dayName: dayMeta.name,
              time: `${item.timeStart} – ${item.timeEnd}`,
              spaceName: space.name,
              masterName: item.masterName,
              status: p.status || "confirmed",
              price: item.price
            });
          });
        }
      });

      if (allBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px;">Журнал пуст</td></tr>`;
        return;
      }

      tbody.innerHTML = allBookings.map((b, i) => `
        <tr>
          <td><strong>${b.guestName}</strong></td>
          <td>${b.phone}</td>
          <td>${b.lessonTitle}</td>
          <td>${b.dayName}, ${b.time}</td>
          <td>${b.spaceName} (${b.masterName})</td>
          <td><span style="font-weight: 700; color: var(--accent-emerald);">${b.status === 'visited' ? 'Пришел' : 'Подтвержден'}</span></td>
        </tr>
      `).join("");
    },

    // 7.1 БАЗА КЛИЕНТОВ И КАРТОЧКИ ГОСТЕЙ (TAB CLIENTS)
    renderClientsList() {
      const tbody = document.getElementById("clientsTableBody");
      const badge = document.getElementById("clientsTotalCountBadge");
      if (!tbody) return;

      let clients = window.primeData.getClients();
      const totalCount = clients.length;

      // Поиск по имени, телефону, никнейму или заметкам
      if (this.clientSearchQuery) {
        const q = this.clientSearchQuery.toLowerCase();
        clients = clients.filter(c => {
          const matchName = (c.name || "").toLowerCase().includes(q);
          const matchPhone = (c.phone || "").toLowerCase().includes(q);
          const matchNotes = (c.notes || "").toLowerCase().includes(q);
          return matchName || matchPhone || matchNotes;
        });
      }

      // Фильтр по категории гостя
      if (this.clientFilter === "regular") {
        clients = clients.filter(c => (c.visitsCount || 0) >= 2);
      } else if (this.clientFilter === "new") {
        clients = clients.filter(c => (c.visitsCount || 0) <= 1);
      }

      if (badge) {
        badge.textContent = `Всего в базе: ${totalCount} • Найдено: ${clients.length}`;
      }

      if (clients.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 36px 20px; color: #64748B;">
              <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
              <div style="font-size: 15px; font-weight: 700; color: #334155;">Клиенты не найдены</div>
              <div style="font-size: 13px; margin-top: 4px;">Попробуйте изменить поисковый запрос или фильтр</div>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = clients.map(c => {
        const initial = (c.name || "Г").trim().charAt(0).toUpperCase();
        const visits = c.visitsCount || 1;
        const isRegular = visits >= 2;
        const lastActivity = (c.history && c.history.length > 0) ? c.history[0] : null;
        const hasNotes = !!(c.notes && c.notes.trim());

        let lastActivityHtml = `<span style="color: #94A3B8;">Нет записей</span>`;
        if (lastActivity) {
          const sp = window.primeData.getSpaceById(lastActivity.spaceId);
          const spName = sp ? sp.name : "";
          lastActivityHtml = `
            <div>
              <div style="font-weight: 700; color: #1E293B;">${lastActivity.lessonTitle || "Занятие"}</div>
              <div style="font-size: 11px; color: #64748B;">${lastActivity.date || ""} • ${spName}</div>
            </div>
          `;
        }

        const visitsBadge = isRegular 
          ? `<span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: rgba(135, 139, 114, 0.18); color: #586047;">${visits} визита ⭐</span>`
          : `<span style="display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #F1F5F9; color: #64748B;">1 визит</span>`;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #435667; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(67, 86, 103, 0.2);">
                  ${initial}
                </div>
                <div>
                  <div style="font-weight: 700; color: #1E293B; display: flex; align-items: center; gap: 6px;">
                    ${c.name}
                    ${hasNotes ? `<span title="${c.notes.replace(/"/g, '&quot;')}" style="cursor: help; font-size: 13px;">📝</span>` : ''}
                  </div>
                  ${hasNotes ? `<div style="font-size: 11px; color: #878B72; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.notes}</div>` : ''}
                </div>
              </div>
            </td>
            <td>
              <div style="font-weight: 600; color: #334155;">${c.phone || "—"}</div>
            </td>
            <td style="text-align: center;">
              ${visitsBadge}
            </td>
            <td>
              <span style="font-size: 12px; color: #64748B;">${c.firstVisit || "—"}</span>
            </td>
            <td>
              ${lastActivityHtml}
            </td>
            <td style="text-align: right;">
              <button class="btn btn-outline btn-sm btn-view-client" data-client-id="${c.id}" style="padding: 7px 14px; font-size: 12px; font-weight: 700; border-radius: 20px;">
                Карточка гостя ›
              </button>
            </td>
          </tr>
        `;
      }).join("");

      // Слушатель кнопки карточки гостя
      tbody.querySelectorAll(".btn-view-client").forEach(btn => {
        btn.addEventListener("click", () => {
          const clientId = btn.dataset.clientId;
          this.openClientProfileModal(clientId);
        });
      });
    },

    // Модалка карточки клиента
    openClientProfileModal(clientId) {
      const clients = window.primeData.getClients();
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      this.currentViewingClient = client;
      const modal = document.getElementById("clientProfileModal");
      if (!modal) return;

      const initial = (client.name || "Г").trim().charAt(0).toUpperCase();
      const visits = client.visitsCount || 1;
      const isRegular = visits >= 2;

      document.getElementById("clientModalAvatar").textContent = initial;
      document.getElementById("clientModalName").textContent = client.name || "Гость";
      
      const badgeEl = document.getElementById("clientModalBadge");
      if (badgeEl) {
        badgeEl.textContent = isRegular ? `Постоянный гость (${visits} визита)` : "Новый гость (1 визит)";
        badgeEl.style.background = isRegular ? "rgba(135, 139, 114, 0.2)" : "#F1F5F9";
        badgeEl.style.color = isRegular ? "#586047" : "#64748B";
      }

      document.getElementById("clientModalPhone").textContent = `📞 ${client.phone || "—"}`;
      document.getElementById("clientModalFirstVisit").textContent = `🗓 Первый визит: ${client.firstVisit || "—"}`;
      document.getElementById("clientModalVisitsCount").textContent = `⭐️ Всего посещений: ${visits}`;

      const notesInput = document.getElementById("clientModalNotes");
      if (notesInput) {
        notesInput.value = client.notes || "";
      }

      const feedback = document.getElementById("notesSaveFeedback");
      if (feedback) feedback.style.display = "none";

      // История занятий
      const historyBody = document.getElementById("clientModalHistoryBody");
      if (historyBody) {
        const history = client.history || [];
        if (history.length === 0) {
          historyBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748B;">Нет истории посещений</td></tr>`;
        } else {
          historyBody.innerHTML = history.map(h => {
            const sp = window.primeData.getSpaceById(h.spaceId);
            const spName = sp ? sp.name : (h.spaceId || "Зал");
            return `
              <tr>
                <td>
                  <span style="font-weight: 600; color: #1E293B;">${h.date || "—"}</span>
                  <div style="font-size: 11px; color: #64748B;">${h.time || ""}</div>
                </td>
                <td>
                  <div style="font-weight: 700; color: #1E293B;">${h.lessonTitle || "Занятие"}</div>
                </td>
                <td>
                  <div>${spName}</div>
                  <div style="font-size: 11px; color: #64748B;">Ведущий: ${h.masterName || "Инструктор"}</div>
                </td>
                <td>
                  <span style="font-weight: 700; color: #435667;">${window.primeData.formatPrice(h.price)}</span>
                </td>
                <td>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(16, 185, 129, 0.12); color: #059669;">
                    Посетил
                  </span>
                </td>
              </tr>
            `;
          }).join("");
        }
      }

      modal.classList.add("open");
    },

    bindClientsEvents() {
      // Поиск по вводу
      const searchInput = document.getElementById("clientSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.clientSearchQuery = e.target.value.trim();
          this.renderClientsList();
        });
      }

      // Кнопки фильтра (Все, Постоянные, Новые)
      const filterBtns = document.querySelectorAll(".client-filter-btn");
      filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          filterBtns.forEach(b => {
            b.classList.remove("active");
            b.classList.add("btn-outline");
          });
          btn.classList.add("active");
          btn.classList.remove("btn-outline");

          this.clientFilter = btn.dataset.filter;
          this.renderClientsList();
        });
      });

      // Сохранение заметок администратора
      const btnSaveNotes = document.getElementById("btnSaveClientNotes");
      if (btnSaveNotes) {
        btnSaveNotes.addEventListener("click", () => {
          if (!this.currentViewingClient) return;
          const notesText = document.getElementById("clientModalNotes").value.trim();
          const ok = window.primeData.updateClientNotes(this.currentViewingClient.id, notesText);
          if (ok) {
            this.currentViewingClient.notes = notesText;
            const feedback = document.getElementById("notesSaveFeedback");
            if (feedback) {
              feedback.style.display = "inline";
              setTimeout(() => {
                feedback.style.display = "none";
              }, 2500);
            }
            this.renderClientsList();
          }
        });
      }
    },

    // 8. БАЗА МАСТЕРОВ (TAB MASTERS)
    renderMastersList() {
      const container = document.getElementById("mastersGrid");
      if (!container) return;

      const masters = window.primeData.getMasters();
      container.innerHTML = masters.map(m => `
        <div class="space-card" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div class="master-avatar-circle" style="width: 48px; height: 48px; font-size: 18px; background: #E2E8F0; color: #1E293B;">
                  <span>${m.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 style="font-size: 16px; font-weight: 700;">${m.name}</h4>
                  <p style="font-size: 12px; color: var(--text-muted);">${m.role}</p>
                </div>
              </div>
              <button class="btn btn-outline btn-sm btn-edit-master" data-master-id="${m.id}" style="padding: 5px 12px; font-size: 12px;">
                ✏️ Редактировать
              </button>
            </div>
            
            <div style="margin-top: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                Направления / Залы:
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${(m.spaces || []).map(s => {
                  const sp = window.primeData.getSpaceById(s);
                  const color = sp ? sp.color : '#475569';
                  const bg = sp ? (sp.badgeBg || 'rgba(0,0,0,0.06)') : '#F1F5F9';
                  const icon = sp ? sp.icon : '✨';
                  const name = sp ? sp.name : s;
                  return `<span style="font-size: 11px; padding: 3px 8px; border-radius: 999px; background: ${bg}; color: ${color}; font-weight: 600;">${icon} ${name}</span>`;
                }).join("")}
              </div>
            </div>
          </div>
        </div>
      `).join("");

      // Клик по кнопке "Редактировать мастера"
      container.querySelectorAll(".btn-edit-master").forEach(btn => {
        btn.addEventListener("click", () => {
          const mId = btn.dataset.masterId;
          this.openEditMasterModal(mId);
        });
      });
    },

    // Модалка редактирования мастера
    openEditMasterModal(masterId) {
      const masters = window.primeData.getMasters();
      const master = masters.find(m => m.id === masterId);
      if (!master) return;

      const modal = document.getElementById("editMasterModal");
      document.getElementById("editMasterId").value = master.id;
      document.getElementById("editMasterName").value = master.name;
      document.getElementById("editMasterRole").value = master.role;

      // Рендерим чекбоксы пространств
      const spacesContainer = document.getElementById("editMasterSpacesCheckboxes");
      const allSpaces = window.primeData.getSpaces();
      spacesContainer.innerHTML = allSpaces.map(sp => {
        const isChecked = (master.spaces || []).includes(sp.id);
        return `
          <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; cursor: pointer;">
            <input type="checkbox" name="editMasterSpace" value="${sp.id}" ${isChecked ? "checked" : ""}>
            <span>${sp.icon} ${sp.name}</span>
          </label>
        `;
      }).join("");

      modal.classList.add("open");
    },

    // Модалка добавления нового мастера
    openAddMasterModal() {
      const modal = document.getElementById("addMasterModal");
      document.getElementById("newMasterForm").reset();

      const spacesContainer = document.getElementById("newMasterSpacesCheckboxes");
      const allSpaces = window.primeData.getSpaces();
      spacesContainer.innerHTML = allSpaces.map(sp => `
        <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; cursor: pointer;">
          <input type="checkbox" name="newMasterSpace" value="${sp.id}">
          <span>${sp.icon} ${sp.name}</span>
        </label>
      `).join("");

      modal.classList.add("open");
    },

    // 9. ОБРАБОТЧИКИ СОБЫТИЙ И СОХРАНЕНИЯ
    bindActionModals() {
      const lessonModal = document.getElementById("lessonDetailModal");
      const addLessonModal = document.getElementById("addLessonModal");
      const editMasterModal = document.getElementById("editMasterModal");
      const addMasterModal = document.getElementById("addMasterModal");
      const clientModal = document.getElementById("clientProfileModal");

      // Закрытие всех модалок по крестику
      document.querySelectorAll(".admin-modal-close").forEach(btn => {
        btn.addEventListener("click", () => {
          if (lessonModal) lessonModal.classList.remove("open");
          if (addLessonModal) addLessonModal.classList.remove("open");
          if (editMasterModal) editMasterModal.classList.remove("open");
          if (addMasterModal) addMasterModal.classList.remove("open");
          if (clientModal) clientModal.classList.remove("open");
        });
      });

      // Закрытие по клику вне модального окна (на overlay)
      document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.classList.remove("open");
          }
        });
      });

      // Кнопка открытия добавления мастера
      const openAddMasterBtn = document.getElementById("openAddMasterBtn");
      if (openAddMasterBtn) {
        openAddMasterBtn.addEventListener("click", () => {
          this.openAddMasterModal();
        });
      }

      // Форма редактирования мастера
      const editMasterForm = document.getElementById("editMasterForm");
      if (editMasterForm) {
        editMasterForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = document.getElementById("editMasterId").value;
          const name = document.getElementById("editMasterName").value.trim();
          const role = document.getElementById("editMasterRole").value.trim();
          const checkedSpaces = Array.from(document.querySelectorAll("input[name='editMasterSpace']:checked")).map(cb => cb.value);

          window.primeData.updateMaster(id, { name, role, spaces: checkedSpaces });
          editMasterModal.classList.remove("open");
          this.renderMastersList();
        });
      }

      // Кнопка удаления мастера
      const btnDeleteMaster = document.getElementById("btnDeleteMaster");
      if (btnDeleteMaster) {
        btnDeleteMaster.addEventListener("click", () => {
          const id = document.getElementById("editMasterId").value;
          if (confirm("Вы уверены, что хотите удалить этого резидента из базы?")) {
            window.primeData.deleteMaster(id);
            editMasterModal.classList.remove("open");
            this.renderMastersList();
          }
        });
      }

      // Форма создания нового мастера
      const newMasterForm = document.getElementById("newMasterForm");
      if (newMasterForm) {
        newMasterForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("newMasterName").value.trim();
          const role = document.getElementById("newMasterRole").value.trim();
          const checkedSpaces = Array.from(document.querySelectorAll("input[name='newMasterSpace']:checked")).map(cb => cb.value);

          window.primeData.addMaster({ name, role, spaces: checkedSpaces });
          addMasterModal.classList.remove("open");
          this.renderMastersList();
        });
      }

      // Сохранение изменений занятия
      const saveLessonBtn = document.getElementById("btnSaveLessonEdit");
      if (saveLessonBtn) {
        saveLessonBtn.addEventListener("click", () => {
          if (!this.currentEditingItem) return;

          const updated = {
            title: document.getElementById("editLessonTitle").value.trim(),
            spaceId: document.getElementById("editLessonSpace").value,
            timeStart: document.getElementById("editLessonTimeStart").value,
            timeEnd: document.getElementById("editLessonTimeEnd").value,
            masterName: document.getElementById("editLessonMaster").value,
            maxSpots: parseInt(document.getElementById("editLessonMaxSpots").value, 10),
            price: parseInt(document.getElementById("editLessonPrice").value, 10),
            ageLabel: document.getElementById("editLessonAge").value
          };

          window.primeData.updateScheduleItem(this.currentEditingItem.id, updated);
          lessonModal.classList.remove("open");
          this.renderKPIs();
          this.renderMatrix();
          alert("Изменения занятия успешно сохранены!");
        });
      }

      // Удаление занятия
      const deleteLessonBtn = document.getElementById("btnDeleteLesson");
      if (deleteLessonBtn) {
        deleteLessonBtn.addEventListener("click", () => {
          if (!this.currentEditingItem) return;
          if (confirm("Вы уверены, что хотите отменить и удалить это занятие из расписания?")) {
            window.primeData.deleteScheduleItem(this.currentEditingItem.id);
            lessonModal.classList.remove("open");
            this.renderKPIs();
            this.renderMatrix();
          }
        });
      }

      // Ручное добавление гостя со стойки администратора
      const manualGuestForm = document.getElementById("manualGuestForm");
      if (manualGuestForm) {
        manualGuestForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!this.currentEditingItem) return;

          const name = document.getElementById("manualGuestName").value.trim();
          const phone = document.getElementById("manualGuestPhone").value.trim();

          const res = window.primeData.bookSpot(this.currentEditingItem.id, { name, phone, spotsCount: 1 });
          if (res.success) {
            manualGuestForm.reset();
            const updated = window.primeData.getScheduleItemById(this.currentEditingItem.id);
            this.renderParticipantsList(updated);
            this.renderKPIs();
            this.renderMatrix();
            this.renderClientsList();
          } else {
            alert(res.error);
          }
        });
      }

      // Открытие модалки создания нового занятия
      const openAddLessonBtn = document.getElementById("openAddLessonBtn");
      if (openAddLessonBtn) {
        openAddLessonBtn.addEventListener("click", () => {
          addLessonModal.classList.add("open");
        });
      }

      // Форма создания нового занятия
      const addLessonForm = document.getElementById("newLessonForm");
      if (addLessonForm) {
        addLessonForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const newItem = {
            dayOfWeek: parseInt(document.getElementById("newLessonDay").value, 10),
            spaceId: document.getElementById("newLessonSpace").value,
            timeStart: document.getElementById("newLessonTimeStart").value,
            timeEnd: document.getElementById("newLessonTimeEnd").value,
            title: document.getElementById("newLessonTitle").value.trim(),
            masterName: document.getElementById("newLessonMaster").value.trim(),
            maxSpots: parseInt(document.getElementById("newLessonMaxSpots").value, 10),
            price: parseInt(document.getElementById("newLessonPrice").value, 10),
            ageLabel: document.getElementById("newLessonAge").value.trim(),
            desc: document.getElementById("newLessonDesc").value.trim()
          };

          window.primeData.addScheduleItem(newItem);
          addLessonModal.classList.remove("open");
          addLessonForm.reset();
          this.renderKPIs();
          this.renderMatrix();
          alert("Новое занятие успешно добавлено в расписание!");
        });
      }
    }
  };

  window.primeAdmin = Admin;
  Admin.init();
});
