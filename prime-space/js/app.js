/**
 * PRIME Space — Client Application Logic
 * "Space to Grow Together"
 */

document.addEventListener("DOMContentLoaded", () => {
  const App = {
    currentDay: 5, // По умолчанию Пятница (день с насыщенным расписанием)
    currentCategory: "all",
    selectedScheduleItem: null,

    daysConfig: [
      { num: 1, name: "Понедельник", short: "Пн" },
      { num: 2, name: "Вторник", short: "Вт" },
      { num: 3, name: "Среда", short: "Ср" },
      { num: 4, name: "Четверг", short: "Чт" },
      { num: 5, name: "Пятница", short: "Пт" },
      { num: 6, name: "Суббота", short: "Сб" },
      { num: 7, name: "Воскресенье", short: "Вс" }
    ],

    init() {
      this.renderSpaces();
      this.renderDaysNav();
      this.bindCategoryFilters();
      this.renderSchedule();
      this.bindModalEvents();
      this.bindMobileSwitch();
    },

    // 1. РЕНДЕРИНГ 9 ПРОСТРАНСТВ
    renderSpaces() {
      const container = document.getElementById("spacesGrid");
      if (!container) return;

      const spaces = window.primeData.getSpaces();
      container.innerHTML = spaces.map(space => `
        <div class="space-card" style="--space-color: ${space.color}">
          <div>
            <div class="space-card-top">
              <span class="space-card-badge" style="background: ${space.badgeBg}; color: ${space.color}">
                <span>${space.icon}</span> ${space.name}
              </span>
              <span class="space-floor">${space.floor}</span>
            </div>
            <h3 class="space-card-title">${space.name}</h3>
            <div class="space-card-sub">${space.subtitle}</div>
            <p class="space-card-desc">${space.desc}</p>
          </div>
          <div>
            <div class="space-features-list">
              ${space.features.map(f => `<span class="space-feature-tag">${f}</span>`).join("")}
            </div>
          </div>
        </div>
      `).join("");
    },

    // 2. ДНИ НЕДЕЛИ В РАСПИСАНИИ
    renderDaysNav() {
      const container = document.getElementById("daysNav");
      if (!container) return;

      container.innerHTML = this.daysConfig.map(day => `
        <div class="day-tab ${day.num === this.currentDay ? "active" : ""}" data-day="${day.num}">
          <div class="day-name">${day.short}</div>
          <div class="day-sub">${day.name}</div>
        </div>
      `).join("");

      container.querySelectorAll(".day-tab").forEach(tab => {
        tab.addEventListener("click", () => {
          container.querySelectorAll(".day-tab").forEach(t => t.classList.remove("active"));
          tab.classList.add("active");
          this.currentDay = parseInt(tab.dataset.day, 10);
          this.renderSchedule();
        });
      });
    },

    // 3. ФИЛЬТРЫ КАТЕГОРИЙ
    bindCategoryFilters() {
      const chips = document.querySelectorAll(".cat-chip");
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          this.currentCategory = chip.dataset.cat;
          this.renderSchedule();
        });
      });
    },

    // 4. РЕНДЕРИНГ КАРТОЧЕК ЗАНЯТИЙ
    renderSchedule() {
      const container = document.getElementById("scheduleGrid");
      if (!container) return;

      let items = window.primeData.getScheduleByDay(this.currentDay);

      // Фильтрация по категории
      if (this.currentCategory !== "all") {
        if (this.currentCategory === "kids") {
          items = items.filter(it => it.category === "kids" || it.ageLabel.includes("дети") || it.ageLabel.includes("лет"));
        } else if (this.currentCategory === "adults") {
          items = items.filter(it => it.category === "adults" || it.ageLabel.includes("18+") || it.ageLabel.includes("16+"));
        } else if (this.currentCategory === "mind") {
          items = items.filter(it => it.category === "mind" || it.spaceId === "prime-mind" || it.spaceId === "prime-coworking");
        }
      }

      if (items.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 12px;">🌿</div>
            <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">На этот день расписание формируется</h4>
            <p style="font-size: 14px;">Пока можно забронировать свободные часы в коворкинге или аренду приватных кабинетов.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map(item => {
        const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId, color: "#D9654C", icon: "✨" };
        const booked = item.participants ? item.participants.length : 0;
        const left = item.maxSpots - booked;

        let spotsBadgeHtml = "";
        let isFull = false;

        if (left <= 0) {
          spotsBadgeHtml = `<span class="spots-badge full">Мест нет (Лист ожидания)</span>`;
          isFull = true;
        } else if (left <= 3) {
          spotsBadgeHtml = `<span class="spots-badge warning">Осталось ${left} из ${item.maxSpots} мест</span>`;
        } else {
          spotsBadgeHtml = `<span class="spots-badge available">${left} мест свободно</span>`;
        }

        return `
          <div class="schedule-card" style="--card-accent: ${space.color}">
            <div>
              <div class="card-header-row">
                <div class="time-slot">🕒 ${item.timeStart} – ${item.timeEnd}</div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  <span class="age-badge">${item.ageLabel}</span>
                  <span class="space-badge" style="background: ${space.badgeBg || 'rgba(0,0,0,0.06)'}; color: ${space.color}">
                    ${space.icon} ${space.name}
                  </span>
                </div>
              </div>

              <h4 class="card-title">${item.title}</h4>
              <p class="card-desc">${item.desc || ""}</p>
            </div>

            <div>
              <div class="card-meta-row">
                <div class="master-info">
                  <div class="master-avatar-circle">
                    <span>${item.masterName.charAt(0)}</span>
                  </div>
                  <span>${item.masterName}</span>
                </div>
                <div class="spots-status">
                  ${spotsBadgeHtml}
                </div>
              </div>

              <div class="card-footer-row">
                <div class="card-price">${window.primeData.formatPrice(item.price)}</div>
                <button class="btn btn-primary btn-sm btn-book" data-id="${item.id}" ${isFull ? 'style="opacity: 0.7;"' : ''}>
                  ${isFull ? 'Лист ожидания' : 'Записаться на занятие ›'}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Клик по кнопке "Записаться"
      container.querySelectorAll(".btn-book").forEach(btn => {
        btn.addEventListener("click", () => {
          const itemId = btn.dataset.id;
          this.openBookingModal(itemId);
        });
      });
    },

    // 5. МОДАЛЬНОЕ ОКНО ОНЛАЙН-ЗАПИСИ
    openBookingModal(itemId) {
      const item = window.primeData.getScheduleItemById(itemId);
      if (!item) return;

      this.selectedScheduleItem = item;
      const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId, color: "#D9654C" };
      const dayName = this.daysConfig.find(d => d.num === item.dayOfWeek)?.name || "День";

      const modal = document.getElementById("bookingModal");
      const summaryBox = document.getElementById("bookingSummary");

      summaryBox.innerHTML = `
        <div class="booking-summary-row">
          <span>Занятие:</span>
          <span>${item.title}</span>
        </div>
        <div class="booking-summary-row">
          <span>День и время:</span>
          <span>${dayName}, ${item.timeStart} – ${item.timeEnd}</span>
        </div>
        <div class="booking-summary-row">
          <span>Пространство:</span>
          <span style="color: ${space.color};">${space.name}</span>
        </div>
        <div class="booking-summary-row">
          <span>Преподаватель:</span>
          <span>${item.masterName}</span>
        </div>
        <div class="booking-summary-row">
          <span>Стоимость участия:</span>
          <span>${window.primeData.formatPrice(item.price)}</span>
        </div>
      `;

      // Сброс формы
      document.getElementById("bookingForm").reset();
      document.getElementById("bookingSuccessMsg").style.display = "none";
      document.getElementById("bookingFormFields").style.display = "block";

      modal.classList.add("open");
    },

    bindModalEvents() {
      const modal = document.getElementById("bookingModal");
      const closeBtn = document.getElementById("modalCloseBtn");
      const form = document.getElementById("bookingForm");

      if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.classList.remove("open");
        });
      }

      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!this.selectedScheduleItem) return;

          const name = document.getElementById("guestName").value.trim();
          const phone = document.getElementById("guestPhone").value.trim();
          const spotsCount = document.getElementById("guestSpots").value;
          const comment = document.getElementById("guestComment").value.trim();

          const result = window.primeData.bookSpot(this.selectedScheduleItem.id, {
            name,
            phone,
            spotsCount,
            comment
          });

          if (result.success) {
            document.getElementById("bookingFormFields").style.display = "none";
            document.getElementById("bookingSuccessMsg").style.display = "block";
            // Обновляем карточки расписания
            this.renderSchedule();
          } else {
            alert(result.error || "Не удалось оформить запись");
          }
        });
      }
    },

    bindMobileSwitch() {
      const btn = document.getElementById("switchToMobileBtn");
      if (btn) {
        btn.addEventListener("click", () => {
          sessionStorage.setItem("prime_force_mobile", "1");
          sessionStorage.removeItem("prime_force_desktop");
        });
      }
    }
  };

  window.primeApp = App;
  App.init();
});
