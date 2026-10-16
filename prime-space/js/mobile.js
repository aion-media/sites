/**
 * PRIME Space — Mobile Application Engine
 * Dedicated ultra-compact accordion schedule and touch UX
 */

document.addEventListener("DOMContentLoaded", () => {
  const MobileApp = {
    currentDay: 5, // Пятница по умолчанию
    currentCategory: "all",
    selectedLesson: null,

    daysMeta: [
      { num: 1, short: "Пн", name: "Понедельник", date: "12 окт" },
      { num: 2, short: "Вт", name: "Вторник", date: "13 окт" },
      { num: 3, short: "Ср", name: "Среда", date: "14 окт" },
      { num: 4, short: "Чт", name: "Четверг", date: "15 окт" },
      { num: 5, short: "Пт", name: "Пятница", date: "16 окт" },
      { num: 6, short: "Сб", name: "Суббота", date: "17 окт" },
      { num: 7, short: "Вс", name: "Воскресенье", date: "18 окт" }
    ],

    init() {
      this.renderDays();
      this.renderCategoryChips();
      this.renderSchedule();
      this.renderSpaces();
      this.bindBookingSheet();
      this.bindDesktopSwitch();
    },

    // 1. ДНИ НЕДЕЛИ В ГОРИЗОНТАЛЬНОЙ ЛЕНТЕ
    renderDays() {
      const container = document.getElementById("mDaysScroll");
      if (!container) return;

      container.innerHTML = this.daysMeta.map(d => `
        <div class="m-day-item ${d.num === this.currentDay ? 'active' : ''}" data-day="${d.num}">
          <div class="m-day-short">${d.short}</div>
          <div class="m-day-num">${d.date.split(" ")[0]}</div>
          <div class="m-day-sub">${d.date.split(" ")[1]}</div>
        </div>
      `).join("");

      container.querySelectorAll(".m-day-item").forEach(item => {
        item.addEventListener("click", () => {
          container.querySelectorAll(".m-day-item").forEach(i => i.classList.remove("active"));
          item.classList.add("active");
          this.currentDay = parseInt(item.dataset.day, 10);
          this.renderSchedule();

          // Центрируем выбранный день в ленте
          item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
      });
    },

    // 2. ФИЛЬТРЫ КАТЕГОРИЙ
    renderCategoryChips() {
      const chips = document.querySelectorAll(".m-chip-btn");
      chips.forEach(chip => {
        chip.addEventListener("click", () => {
          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          this.currentCategory = chip.dataset.cat;
          this.renderSchedule();
        });
      });
    },

    // 3. РЕНДЕРИНГ СПИСКА ЗАНЯТИЙ В ВИДЕ АККОРДЕОНОВ
    renderSchedule() {
      const container = document.getElementById("mScheduleList");
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
          <div style="text-align: center; padding: 36px 16px; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; color: #64748B;">
            <div style="font-size: 36px; margin-bottom: 8px;">🌿</div>
            <div style="font-size: 15px; font-weight: 700; color: #1E293B;">На этот день расписание формируется</div>
            <div style="font-size: 12px; margin-top: 4px;">Можно забронировать свободные часы коворкинга или кабинеты аренды.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = items.map((item, index) => {
        const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId, color: "#435667", icon: "✨" };
        const booked = item.participants ? item.participants.length : 0;
        const left = item.maxSpots - booked;
        const isFull = left <= 0;

        let spotsText = `${left} мест`;
        let spotsColor = "#10B981";
        if (isFull) {
          spotsText = "Мест нет";
          spotsColor = "#EF4444";
        } else if (left <= 3) {
          spotsText = `Осталось ${left}`;
          spotsColor = "#F59E0B";
        }

        const shortSpaceName = space.name.replace("PRIME ", "");

        return `
          <div class="m-acc-item ${index === 0 ? 'open' : ''}" data-lesson-id="${item.id}">
            
            <!-- Шапка аккордеона (компактная строка) -->
            <div class="m-acc-header">
              <div class="m-acc-left">
                <div class="m-acc-time-badge">
                  <div>${item.timeStart}</div>
                  <div style="font-size: 9px; opacity: 0.8;">${item.timeEnd}</div>
                </div>
                <div class="m-acc-main">
                  <div class="m-acc-title">${item.title}</div>
                  <div class="m-acc-tags">
                    <span class="m-acc-space-tag" style="background: ${space.badgeBg || 'rgba(0,0,0,0.06)'}; color: ${space.color}">
                      ${space.icon} ${shortSpaceName}
                    </span>
                    <span class="m-acc-age-tag">${item.ageLabel}</span>
                    <span style="font-size: 10px; font-weight: 700; color: ${spotsColor};">• ${spotsText}</span>
                  </div>
                </div>
              </div>

              <div class="m-acc-right">
                <div class="m-acc-price">${window.primeData.formatPrice(item.price)}</div>
                <div class="m-acc-chevron">▾</div>
              </div>
            </div>

            <!-- Тело аккордеона (раскрывается при клике) -->
            <div class="m-acc-body">
              <div class="m-acc-body-content">
                <p class="m-acc-desc">${item.desc || "Групповое занятие по программе пространства PRIME Space."}</p>
                
                <div class="m-acc-details-grid">
                  <div class="m-detail-item">
                    <span>Ведущий мастер:</span>
                    <span>${item.masterName}</span>
                  </div>
                  <div class="m-detail-item">
                    <span>Пространство:</span>
                    <span>${space.name} (${space.floor})</span>
                  </div>
                  <div class="m-detail-item">
                    <span>Возраст:</span>
                    <span>${item.ageLabel}</span>
                  </div>
                  <div class="m-detail-item">
                    <span>Свободно мест:</span>
                    <span style="color: ${spotsColor};">${isFull ? 'Лист ожидания' : `${left} из ${item.maxSpots}`}</span>
                  </div>
                </div>

                <button class="m-btn-book-action btn-m-book" data-id="${item.id}" ${isFull ? 'style="opacity: 0.8;"' : ''}>
                  ${isFull ? 'Записаться в лист ожидания ›' : 'Записаться на занятие ›'}
                </button>
              </div>
            </div>

          </div>
        `;
      }).join("");

      // Обработка клика по шапке аккордеона (свернуть/развернуть)
      container.querySelectorAll(".m-acc-header").forEach(header => {
        header.addEventListener("click", () => {
          const item = header.closest(".m-acc-item");
          const wasOpen = item.classList.contains("open");

          // Закрываем все остальные аккордеоны для идеальной компактности
          container.querySelectorAll(".m-acc-item").forEach(i => i.classList.remove("open"));

          if (!wasOpen) {
            item.classList.add("open");
          }
        });
      });

      // Обработка клика по кнопке "Записаться на занятие"
      container.querySelectorAll(".btn-m-book").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const lessonId = btn.dataset.id;
          this.openBookingSheet(lessonId);
        });
      });
    },

    // 4. РЕНДЕРИНГ 9 ПРОСТРАНСТВ (ГОРИЗОНТАЛЬНАЯ КАРУСЕЛЬ)
    renderSpaces() {
      const container = document.getElementById("mSpacesScroll");
      if (!container) return;

      const spaces = window.primeData.getSpaces();
      container.innerHTML = spaces.map(sp => `
        <div class="m-space-card">
          <div>
            <div class="m-space-top">
              <span class="m-space-badge" style="background: ${sp.badgeBg}; color: ${sp.color};">
                ${sp.icon} ${sp.name}
              </span>
              <span class="m-space-floor">${sp.floor}</span>
            </div>
            <div class="m-space-title">${sp.name}</div>
            <div class="m-space-sub">${sp.subtitle}</div>
            <p class="m-space-desc">${sp.desc}</p>
          </div>
          <div style="font-size: 10px; color: #64748B; font-weight: 600;">
            ${sp.features.slice(0, 2).join(" • ")}
          </div>
        </div>
      `).join("");
    },

    // 5. МОБИЛЬНАЯ ШТОРКА ЗАПИСИ (BOTTOM SHEET)
    bindBookingSheet() {
      const overlay = document.getElementById("mBookingSheet");
      const closeBtn = document.getElementById("mSheetClose");
      const form = document.getElementById("mBookingForm");

      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          overlay.classList.remove("open");
        });
      }

      if (overlay) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            overlay.classList.remove("open");
          }
        });
      }

      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!this.selectedLesson) return;

          const name = document.getElementById("mGuestName").value.trim();
          const phone = document.getElementById("mGuestPhone").value.trim();

          const result = window.primeData.bookSpot(this.selectedLesson.id, {
            name: name,
            phone: phone,
            spotsCount: 1
          });

          if (result.success) {
            alert(`Спасибо, ${name}! Вы успешно записаны на «${this.selectedLesson.title}». Ждем вас в PRIME Space!`);
            overlay.classList.remove("open");
            form.reset();
            this.renderSchedule();
          } else {
            alert(result.error || "Не удалось завершить запись.");
          }
        });
      }
    },

    openBookingSheet(lessonId) {
      const item = window.primeData.getScheduleItemById(lessonId);
      if (!item) return;

      this.selectedLesson = item;
      const space = window.primeData.getSpaceById(item.spaceId) || { name: item.spaceId, floor: "PRIME" };
      const dayMeta = this.daysMeta.find(d => d.num === item.dayOfWeek) || { name: "День" };

      document.getElementById("mSheetLessonTitle").textContent = item.title;
      document.getElementById("mSheetLessonTime").textContent = `${dayMeta.name}, ${item.timeStart} – ${item.timeEnd}`;
      document.getElementById("mSheetLessonSpace").textContent = `${space.name} (${space.floor})`;
      document.getElementById("mSheetLessonMaster").textContent = item.masterName;
      document.getElementById("mSheetLessonPrice").textContent = window.primeData.formatPrice(item.price);

      const overlay = document.getElementById("mBookingSheet");
      if (overlay) overlay.classList.add("open");
    },

    // 6. ПЕРЕКЛЮЧАТЕЛЬ НА ДЕСКТОПНУЮ ВЕРСИЮ
    bindDesktopSwitch() {
      const btn = document.getElementById("btnSwitchToDesktop");
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          sessionStorage.setItem("prime_force_desktop", "1");
          sessionStorage.removeItem("prime_force_mobile");
          window.location.href = "index.html?desktop=1";
        });
      }
    }
  };

  window.primeMobile = MobileApp;
  MobileApp.init();
});
