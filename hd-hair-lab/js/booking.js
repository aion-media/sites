/**
 * H&D Hair Lab - Interactive Booking Engine (5 Steps)
 */

class BookingEngine {
  constructor() {
    this.currentStep = 1;
    this.selectedService = null;
    this.selectedVariant = null;
    this.selectedSpecialist = null;
    this.selectedDate = (window.hdData && window.hdData.getLocalDateString) ? window.hdData.getLocalDateString() : new Date().toLocaleDateString('en-CA');
    this.selectedTime = "12:00";
    this.step1SelectedGroup = "all";
    this.step1SelectedSubCategory = "all";
    this.step1SearchQuery = "";
    this.clientData = {
      name: "",
      phone: "",
      comment: ""
    };
    this.lastCreatedId = null;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modal = document.getElementById('bookingModalOverlay');
    this.closeBtn = document.getElementById('bookingModalClose');
    this.stepsContainer = document.getElementById('bookingStepsContent');
    this.stepIndicators = document.querySelectorAll('.step-indicator');
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(serviceId = null) {
    if (!this.modal) this.initElements();
    if (!this.modal) return;

    this.currentStep = 1;
    this.selectedDate = (window.hdData && window.hdData.getLocalDateString) ? window.hdData.getLocalDateString() : new Date().toLocaleDateString('en-CA');
    this.step1SelectedGroup = "all";
    this.step1SelectedSubCategory = "all";
    this.step1SearchQuery = "";
    const services = window.hdData.getServices();

    if (serviceId) {
      this.selectedService = services.find(s => s.id === serviceId) || null;
      if (this.selectedService) {
        if (this.selectedService.priceVariants && this.selectedService.priceVariants.length > 0) {
          this.selectedVariant = this.selectedService.priceVariants[0];
        } else {
          this.selectedVariant = { name: "Стандарт", price: this.selectedService.price };
        }
        this.currentStep = 2; // Переходим сразу к выбору мастера, если услуга уже выбрана
      }
    } else {
      this.selectedService = null;
      this.selectedVariant = null;
    }

    this.renderStep();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  updateIndicators() {
    if (!this.stepIndicators || this.stepIndicators.length === 0) {
      this.stepIndicators = document.querySelectorAll('.step-indicator');
    }
    this.stepIndicators.forEach((ind, index) => {
      const stepNum = index + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === this.currentStep) {
        ind.classList.add('active');
      } else if (stepNum < this.currentStep) {
        ind.classList.add('completed');
      }
    });
  }

  renderStep() {
    this.updateIndicators();
    if (!this.stepsContainer) this.stepsContainer = document.getElementById('bookingStepsContent');
    if (!this.stepsContainer) return;

    switch (this.currentStep) {
      case 1:
        this.renderStep1Services();
        break;
      case 2:
        this.renderStep2Specialists();
        break;
      case 3:
        this.renderStep3DateTime();
        break;
      case 4:
        this.renderStep4Contacts();
        break;
      case 5:
        this.renderStep5Success();
        break;
    }
  }

  // --- ШАГ 1: ВЫБОР УСЛУГИ ---
  renderStep1Services() {
    const groups = window.hdData.getCategoryGroups();
    const allCategories = window.hdData.getCategories();
    let services = window.hdData.getServices();

    // Фильтрация по группе и подкатегории
    if (this.step1SelectedGroup && this.step1SelectedGroup !== 'all') {
      const curGroup = groups.find(g => g.id === this.step1SelectedGroup);
      if (this.step1SelectedSubCategory && this.step1SelectedSubCategory !== 'all') {
        services = services.filter(s => s.categoryId === this.step1SelectedSubCategory);
      } else if (curGroup) {
        services = services.filter(s => curGroup.categoryIds.includes(s.categoryId));
      }
    }

    if (this.step1SearchQuery) {
      const q = this.step1SearchQuery.toLowerCase();
      services = services.filter(s => s.name.toLowerCase().includes(q) || s.shortDesc.toLowerCase().includes(q));
    }

    const currentGroupObj = groups.find(g => g.id === this.step1SelectedGroup);
    const hasSubCategories = currentGroupObj && currentGroupObj.categoryIds.length > 1;
    const subCats = hasSubCategories ? allCategories.filter(c => currentGroupObj.categoryIds.includes(c.id)) : [];

    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h4 style="font-size: 20px;">1. Выберите интересующую процедуру</h4>
          <span style="font-size: 13px; color: var(--text-dim);">${services.length} услуг доступно</span>
        </div>

        <div style="margin-bottom: 14px;">
          <input type="text" id="bookingSearchInput" class="form-input" placeholder="Поиск по названию (AirTouch, Блонд, Стрижка, Брови)..." value="${this.step1SearchQuery}" style="padding: 12px 16px;">
        </div>

        <!-- Сгруппированные категории: помещаются на любом экране без горизонтального скролла -->
        <div style="display: flex; flex-wrap: wrap; gap: 6px 8px; margin-bottom: ${hasSubCategories ? '8px' : '16px'};">
          <button class="cat-tab-btn ${this.step1SelectedGroup === 'all' || !this.step1SelectedGroup ? 'active' : ''}" data-group="all" style="padding: 6px 12px; font-size: 12px;">
            Все разделы
          </button>
          ${groups.map(g => `
            <button class="cat-tab-btn ${this.step1SelectedGroup === g.id ? 'active' : ''}" data-group="${g.id}" style="padding: 6px 12px; font-size: 12px;">
              ${g.icon} ${g.shortName || g.name}
            </button>
          `).join('')}
        </div>

        ${hasSubCategories ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px 8px; margin-bottom: 16px; padding: 6px 10px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <button class="sub-cat-btn ${this.step1SelectedSubCategory === 'all' || !this.step1SelectedSubCategory ? 'active' : ''}" data-sub="all" style="padding: 4px 10px; font-size: 11px;">
              Все в разделе
            </button>
            ${subCats.map(c => `
              <button class="sub-cat-btn ${this.step1SelectedSubCategory === c.id ? 'active' : ''}" data-sub="${c.id}" style="padding: 4px 10px; font-size: 11px;">
                ${c.icon} ${c.name}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div style="max-height: 380px; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 12px;">
          ${services.map(s => {
            const hasVariants = s.priceVariants && s.priceVariants.length > 0;
            return `
              <div class="service-select-item" data-id="${s.id}" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; cursor: pointer; transition: all 0.2s ease;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                  <div>
                    <h5 style="font-size: 16px; margin-bottom: 4px;">${s.name}</h5>
                    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${s.shortDesc}</p>
                    <div style="font-size: 12px; color: var(--text-dim);">⏱ ~${s.duration} мин</div>
                  </div>
                  <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-family: var(--font-mono); font-weight: 700; font-size: 16px; color: #FFFFFF;">
                      ${hasVariants ? 'от ' + window.hdData.formatMoney(s.priceVariants[0].price) : window.hdData.formatMoney(s.price)}
                    </div>
                    <button class="btn btn-outline" style="padding: 6px 14px; font-size: 12px; margin-top: 8px;">Выбрать ›</button>
                  </div>
                </div>

                ${hasVariants ? `
                  <div class="variants-picker-group" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
                    ${s.priceVariants.map((v, i) => `
                      <button type="button" class="variant-select-btn" data-service-id="${s.id}" data-variant-index="${i}" style="padding: 6px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); font-size: 12px; color: var(--text-sub);">
                        ${v.name}: <strong style="color: #FFF;">${window.hdData.formatMoney(v.price)}</strong>
                      </button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    // Listeners
    const searchEl = document.getElementById('bookingSearchInput');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        this.step1SearchQuery = e.target.value;
        this.renderStep1Services();
      });
    }

    this.stepsContainer.querySelectorAll('.cat-tab-btn[data-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-group');
        this.step1SelectedGroup = group;
        this.step1SelectedSubCategory = 'all';
        this.renderStep1Services();
      });
    });

    this.stepsContainer.querySelectorAll('.sub-cat-btn[data-sub]').forEach(subBtn => {
      subBtn.addEventListener('click', () => {
        const sub = subBtn.getAttribute('data-sub');
        this.step1SelectedSubCategory = sub;
        this.renderStep1Services();
      });
    });

    this.stepsContainer.querySelectorAll('.service-select-item').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.variant-select-btn')) return;
        const sId = card.getAttribute('data-id');
        this.pickService(sId, 0);
      });
    });


    this.stepsContainer.querySelectorAll('.variant-select-btn').forEach(vBtn => {
      vBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sId = vBtn.getAttribute('data-service-id');
        const vIdx = parseInt(vBtn.getAttribute('data-variant-index'), 10);
        this.pickService(sId, vIdx);
      });
    });
  }

  pickService(serviceId, variantIdx = 0) {
    const services = window.hdData.getServices();
    this.selectedService = services.find(s => s.id === serviceId);
    if (this.selectedService) {
      if (this.selectedService.priceVariants && this.selectedService.priceVariants.length > variantIdx) {
        this.selectedVariant = this.selectedService.priceVariants[variantIdx];
      } else {
        this.selectedVariant = { name: "Стандарт", price: this.selectedService.price };
      }
      this.currentStep = 2;
      this.renderStep();
    }
  }

  // --- ШАГ 2: ВЫБОР МАСТЕРА ---
  renderStep2Specialists() {
    const specialists = window.hdData.getSpecialists();
    const serviceCategory = this.selectedService ? this.selectedService.categoryId : null;

    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 20px;">2. Выберите специалиста</h4>
          <button id="stepBackTo1" style="font-size: 13px; color: var(--text-muted); text-decoration: underline;">‹ Назад к услугам</button>
        </div>

        <div style="background: var(--bg-card); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 20px; border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: var(--text-dim); text-transform: uppercase;">Выбранная процедура:</div>
            <strong style="font-size: 15px; color: #FFFFFF;">${this.selectedService.name}</strong>
            ${this.selectedVariant ? `<div style="font-size: 12px; color: var(--text-muted);">${this.selectedVariant.name}</div>` : ''}
          </div>
          <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: #FFFFFF;">
            ${window.hdData.formatMoney(this.selectedVariant ? this.selectedVariant.price : this.selectedService.price)}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto;">
          <!-- Любой свободный мастер -->
          <div class="specialist-pick-card" data-spec-id="any" style="display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; cursor: pointer; transition: all 0.2s ease;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; font-size: 22px;">
              ⚡
            </div>
            <div style="flex-grow: 1;">
              <h5 style="font-size: 16px; margin-bottom: 2px;">Любой свободный мастер</h5>
              <p style="font-size: 13px; color: var(--text-muted);">Система подберет ближайшее удобное окно у ведущего специалиста</p>
            </div>
            <button class="btn btn-outline" style="padding: 6px 14px; font-size: 12px;">Выбрать ›</button>
          </div>

          <!-- Конкретные мастера -->
          ${specialists.map(sp => {
            const isMatch = !serviceCategory || sp.categories.includes(serviceCategory);
            return `
              <div class="specialist-pick-card" data-spec-id="${sp.id}" style="display: flex; align-items: center; gap: 16px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; cursor: pointer; transition: all 0.2s ease; ${!isMatch ? 'opacity: 0.6;' : ''}">
                <img src="${sp.avatar}" alt="${sp.name}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-medium);">
                <div style="flex-grow: 1;">
                  <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 600;">${sp.role}</div>
                  <h5 style="font-size: 16px; margin-bottom: 4px;">${sp.name}</h5>
                  <p style="font-size: 12px; color: var(--text-muted);">${sp.experience}</p>
                </div>
                <button class="btn btn-outline" style="padding: 6px 14px; font-size: 12px;">Выбрать ›</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackTo1').addEventListener('click', () => {
      this.currentStep = 1;
      this.renderStep();
    });

    this.stepsContainer.querySelectorAll('.specialist-pick-card').forEach(card => {
      card.addEventListener('click', () => {
        const specId = card.getAttribute('data-spec-id');
        if (specId === 'any') {
          this.selectedSpecialist = { id: 'any', name: 'Любой свободный мастер', role: 'Специалист студии' };
        } else {
          this.selectedSpecialist = specialists.find(s => s.id === specId);
        }
        this.currentStep = 3;
        this.renderStep();
      });
    });
  }

  // Проверка рабочего дня мастера
  isSpecialistWorking(spec, dateStr) {
    if (!spec || spec.id === 'any') return true;
    if (spec.customSchedule && spec.customSchedule[dateStr]) {
      return spec.customSchedule[dateStr].isWorking;
    }
    if (spec.workDays) {
      const d = new Date(dateStr);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      return spec.workDays.includes(dayOfWeek);
    }
    return true;
  }

  // --- ШАГ 3: ВЫБОР ДАТЫ И ВРЕМЕНИ ---
  renderStep3DateTime() {
    const getLocal = (d) => (window.hdData && window.hdData.getLocalDateString) ? window.hdData.getLocalDateString(d) : d.toLocaleDateString('en-CA');
    const today = getLocal(new Date());
    const tomorrowDate = getLocal(new Date(Date.now() + 86400000));
    const afterTomorrowDate = getLocal(new Date(Date.now() + 86400000 * 2));

    if (!this.selectedDate || this.selectedDate < today) {
      this.selectedDate = today;
    }

    const isMasterWorking = this.isSpecialistWorking(this.selectedSpecialist, this.selectedDate);

    const slots = [
      "10:00", "11:00", "12:00", "13:00",
      "14:00", "15:00", "16:00", "17:00",
      "18:00", "19:00"
    ];

    const isTodayWork = this.isSpecialistWorking(this.selectedSpecialist, today);
    const isTomorrowWork = this.isSpecialistWorking(this.selectedSpecialist, tomorrowDate);
    const isAfterTomorrowWork = this.isSpecialistWorking(this.selectedSpecialist, afterTomorrowDate);

    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 20px;">3. Выберите дату и время</h4>
          <button id="stepBackTo2" style="font-size: 13px; color: var(--text-muted); text-decoration: underline;">‹ Назад к мастеру</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 16px; font-size: 13px;">
          <div>Специалист: <strong style="color: #FFF;">${this.selectedSpecialist.name}</strong></div>
          <div>${isMasterWorking ? '<span class="badge-status badge-status-new" style="font-size: 10px;">Приём открыт</span>' : '<span class="badge-status badge-status-cancelled" style="font-size: 10px;">Выходной день</span>'}</div>
        </div>

        <!-- Быстрые даты -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button class="btn ${this.selectedDate === today ? 'btn-primary' : 'btn-outline'}" data-date="${today}" style="flex: 1; padding: 10px; font-size: 13px; ${!isTodayWork ? 'opacity: 0.6;' : ''}">
            Сегодня ${!isTodayWork ? '(вых)' : ''}
          </button>
          <button class="btn ${this.selectedDate === tomorrowDate ? 'btn-primary' : 'btn-outline'}" data-date="${tomorrowDate}" style="flex: 1; padding: 10px; font-size: 13px; ${!isTomorrowWork ? 'opacity: 0.6;' : ''}">
            Завтра ${!isTomorrowWork ? '(вых)' : ''}
          </button>
          <button class="btn ${this.selectedDate === afterTomorrowDate ? 'btn-primary' : 'btn-outline'}" data-date="${afterTomorrowDate}" style="flex: 1; padding: 10px; font-size: 13px; ${!isAfterTomorrowWork ? 'opacity: 0.6;' : ''}">
            Послезавтра ${!isAfterTomorrowWork ? '(вых)' : ''}
          </button>
        </div>

        <div class="booking-form-group">
          <label class="form-label">Или выберите дату в календаре:</label>
          <input type="date" id="bookingCustomDate" class="form-input" min="${today}" value="${this.selectedDate}">
        </div>

        ${!isMasterWorking ? `
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 26px; margin-bottom: 8px;">🛋️</div>
            <h5 style="color: #F87171; font-size: 16px; margin-bottom: 6px;">У мастера ${this.selectedSpecialist.name} в этот день выходной</h5>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
              По графику студии специалист не принимает ${this.selectedDate}. Пожалуйста, выберите рабочий день мастера или переключитесь на любого свободного специалиста:
            </p>
            <button type="button" class="btn btn-outline" id="switchToAnyMasterBtn" style="padding: 10px 18px; font-size: 13px;">
              ⚡ Записаться к любому свободному мастеру
            </button>
          </div>
        ` : `
          <div class="booking-form-group">
            <label class="form-label">Доступные часы приёма:</label>
            <div class="time-slots-grid">
              ${slots.map(t => `
                <button class="time-slot-btn ${this.selectedTime === t ? 'active' : ''}" data-time="${t}">
                  ${t}
                </button>
              `).join('')}
            </div>
          </div>
        `}

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: var(--text-dim);">Выбрано:</div>
            <strong style="color: #FFFFFF; font-size: 15px;">${this.selectedDate} ${isMasterWorking ? 'в ' + this.selectedTime : '(Выходной день)'}</strong>
          </div>
          <button id="step3NextBtn" class="btn btn-primary" style="padding: 12px 28px;" ${!isMasterWorking ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
            Далее к контактам ›
          </button>
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackTo2').addEventListener('click', () => {
      this.currentStep = 2;
      this.renderStep();
    });

    const anyMasterBtn = document.getElementById('switchToAnyMasterBtn');
    if (anyMasterBtn) {
      anyMasterBtn.addEventListener('click', () => {
        this.selectedSpecialist = { id: 'any', name: 'Любой свободный мастер', role: 'Специалист студии' };
        this.renderStep3DateTime();
      });
    }

    this.stepsContainer.querySelectorAll('[data-date]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDate = btn.getAttribute('data-date');
        this.renderStep3DateTime();
      });
    });

    const dateInput = document.getElementById('bookingCustomDate');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.renderStep3DateTime();
      });
    }

    this.stepsContainer.querySelectorAll('.time-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedTime = btn.getAttribute('data-time');
        this.renderStep3DateTime();
      });
    });

    const nextBtn = document.getElementById('step3NextBtn');
    if (nextBtn && isMasterWorking) {
      nextBtn.addEventListener('click', () => {
        this.currentStep = 4;
        this.renderStep();
      });
    }
  }

  // --- ШАГ 4: ВВОД КОНТАКТОВ ---
  renderStep4Contacts() {
    const salon = window.hdData.getSalonInfo();
    const finalPrice = this.selectedVariant ? this.selectedVariant.price : this.selectedService.price;

    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 20px;">4. Подтверждение и ваши контакты</h4>
          <button id="stepBackTo3" style="font-size: 13px; color: var(--text-muted); text-decoration: underline;">‹ Назад к дате</button>
        </div>

        <!-- Резюме записи -->
        <div style="background: var(--bg-card); padding: 18px; border-radius: var(--radius-md); margin-bottom: 24px; border: 1px solid var(--border-subtle); font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-dim);">Услуга:</span>
            <strong style="color: #FFFFFF;">${this.selectedService.name}</strong>
          </div>
          ${this.selectedVariant ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: var(--text-dim);">Вариант / длина:</span>
              <span style="color: var(--text-sub);">${this.selectedVariant.name}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-dim);">Мастер:</span>
            <span style="color: var(--text-sub);">${this.selectedSpecialist.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-dim);">Дата и время:</span>
            <span style="color: #FFFFFF; font-weight: 600;">${this.selectedDate} в ${this.selectedTime}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-dim);">Адрес:</span>
            <span style="color: var(--text-sub);">${salon.addressShort}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid var(--border-subtle); margin-top: 8px;">
            <span style="color: var(--text-dim); font-size: 14px;">Стоимость:</span>
            <strong style="color: #FFFFFF; font-size: 18px; font-family: var(--font-mono);">${window.hdData.formatMoney(finalPrice)}</strong>
          </div>
        </div>

        <form id="bookingFinalForm">
          <div class="booking-form-group">
            <label class="form-label">Ваше Имя *</label>
            <input type="text" id="clientNameInput" class="form-input" placeholder="Например: Анна или Александр" required value="${this.clientData.name}">
          </div>

          <div class="booking-form-group">
            <label class="form-label">Телефон / Telegram / WhatsApp *</label>
            <input type="text" id="clientPhoneInput" class="form-input" placeholder="+84 ... или +7 ..." required value="${this.clientData.phone}">
          </div>

          <div class="booking-form-group">
            <label class="form-label">Пожелания или комментарий (опционально)</label>
            <textarea id="clientCommentInput" class="form-textarea" rows="2" placeholder="Например: густые волосы, было осветление 3 месяца назад, нужен холодный оттенок...">${this.clientData.comment}</textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 16px; font-size: 15px; margin-top: 10px;">
            Подтвердить запись ✨
          </button>
        </form>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackTo3').addEventListener('click', () => {
      this.currentStep = 3;
      this.renderStep();
    });

    document.getElementById('bookingFinalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.clientData.name = document.getElementById('clientNameInput').value.trim();
      this.clientData.phone = document.getElementById('clientPhoneInput').value.trim();
      this.clientData.comment = document.getElementById('clientCommentInput').value.trim();

      // Сохраняем в локальную CRM систему H&D Hair Lab
      const newRecord = window.hdData.addAppointment({
        clientName: this.clientData.name,
        phone: this.clientData.phone,
        serviceId: this.selectedService.id,
        serviceName: this.selectedService.name,
        variantName: this.selectedVariant ? this.selectedVariant.name : "Стандарт",
        specialistId: this.selectedSpecialist.id,
        specialistName: this.selectedSpecialist.name,
        date: this.selectedDate,
        time: this.selectedTime,
        duration: this.selectedService.duration || 60,
        price: finalPrice,
        comment: this.clientData.comment
      });

      this.lastCreatedId = newRecord.id;
      this.currentStep = 5;
      this.renderStep();
    });
  }

  // --- ШАГ 5: ЭКРАН УСПЕХА ---
  renderStep5Success() {
    const salon = window.hdData.getSalonInfo();
    const finalPrice = this.selectedVariant ? this.selectedVariant.price : this.selectedService.price;

    let html = `
      <div class="booking-step-view" style="text-align: center; padding: 10px 0;">
        <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #10B981; font-size: 30px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          ✓
        </div>
        <h3 style="font-size: 26px; margin-bottom: 8px;">Вы успешно записаны!</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">
          Номер вашей брони в CRM: <strong style="color: #FFFFFF; font-family: var(--font-mono); font-size: 18px;">#${this.lastCreatedId}</strong>
        </p>

        <div style="background: var(--bg-card); border-radius: var(--radius-md); padding: 20px; text-align: left; margin-bottom: 24px; font-size: 13px; border: 1px solid var(--border-subtle);">
          <p style="margin-bottom: 8px;">📍 <strong>Адрес студии:</strong> ${salon.address}</p>
          <p style="margin-bottom: 8px;">📅 <strong>Дата и время:</strong> ${this.selectedDate} в ${this.selectedTime}</p>
          <p style="margin-bottom: 8px;">✨ <strong>Процедура:</strong> ${this.selectedService.name} (${this.selectedVariant ? this.selectedVariant.name : 'Стандарт'})</p>
          <p style="margin-bottom: 8px;">👩‍🔬 <strong>Мастер:</strong> ${this.selectedSpecialist.name}</p>
          <p>💰 <strong>Стоимость:</strong> <span style="font-family: var(--font-mono); font-weight: 700; color: #FFFFFF;">${window.hdData.formatMoney(finalPrice)}</span></p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="${salon.telegram}" target="_blank" class="btn btn-primary" style="width: 100%;">
            Подтвердить визит в Telegram студии
          </a>
          <a href="${salon.whatsapp}" target="_blank" class="btn btn-outline" style="width: 100%;">
            Написать в WhatsApp (+84 382 437 900)
          </a>
          <button id="bookingDoneFinishBtn" class="btn btn-glass" style="width: 100%;">
            Вернуться на сайт
          </button>
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('bookingDoneFinishBtn').addEventListener('click', () => {
      this.close();
    });
  }
}

// Глобальный экземпляр
window.bookingEngine = new BookingEngine();
