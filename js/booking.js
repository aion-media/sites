/**
 * EVO Beauty Space - Interactive Booking Engine
 */

class BookingEngine {
  constructor() {
    this.currentStep = 1;
    this.selectedService = null;
    this.selectedSpecialist = null;
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedTime = "11:00";
    this.selectedBranch = "EVO Sever (40 Đ. Bắc Sơn)";
    this.step1SelectedCategory = null;
    this.step1SearchQuery = "";
    this.clientData = {
      name: "",
      phone: "",
      comment: ""
    };

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

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  }

  open(serviceId = null) {
    if (!this.modal) return;
    this.currentStep = 1;
    this.step1SelectedCategory = null;
    this.step1SearchQuery = "";
    const services = window.evoData.getServices();
    
    if (serviceId) {
      this.selectedService = services.find(s => s.id === serviceId) || null;
      if (this.selectedService) {
        this.currentStep = 2; // Jump to specialist selection if service is pre-picked
      }
    } else {
      this.selectedService = null;
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

  pluralizeServices(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return "процедур";
    if (mod10 === 1) return "процедура";
    if (mod10 >= 2 && mod10 <= 4) return "процедуры";
    return "процедур";
  }

  renderStep1Services() {
    const services = window.evoData.getServices();
    const categories = window.evoData.getCategories();

    let html = `
      <div class="booking-step-view">
        <h3 class="font-serif" style="font-size: 24px; margin-bottom: 4px;">Выберите услугу</h3>
        <p class="text-muted" style="font-size: 13px; margin-bottom: 16px;">
          Найдите процедуру через поиск или выберите направление
        </p>

        <!-- Search Box -->
        <div class="modal-search-box">
          <span class="modal-search-icon">🔍</span>
          <input type="text" id="modalServiceSearchInput" class="modal-search-input" placeholder="Быстрый поиск процедуры или бренда (Profhilo, Стрижка)..." value="${this.step1SearchQuery}">
          <button id="modalClearSearchBtn" class="modal-search-clear" style="display: ${this.step1SearchQuery ? 'flex' : 'none'};">✕</button>
        </div>

        <!-- Dynamic Content Container -->
        <div id="modalStep1Content">
          ${this.getStep1ContentHtml(services, categories)}
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;
    this.bindStep1Events(services, categories);
  }

  getStep1ContentHtml(services, categories) {
    const hasSearch = this.step1SearchQuery && this.step1SearchQuery.trim().length > 0;
    const query = hasSearch ? this.step1SearchQuery.trim().toLowerCase() : '';

    if (hasSearch) {
      // 1. Search Results Mode
      const filtered = services.filter(s => 
        s.name.toLowerCase().includes(query) ||
        (s.subCategory && s.subCategory.toLowerCase().includes(query)) ||
        (s.desc && s.desc.toLowerCase().includes(query))
      );

      if (filtered.length === 0) {
        return `
          <div style="text-align: center; padding: 40px 20px; color: var(--color-text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
            <p style="font-size: 14px; margin-bottom: 12px;">Ничего не найдено по запросу «<strong>${this.step1SearchQuery}</strong>»</p>
            <button id="modalResetSearchBtn" class="btn btn-outline" style="font-size: 12px; padding: 8px 18px;">
              Показать все категории
            </button>
          </div>
        `;
      }

      return `
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: var(--color-text-muted);">
            Найдено процедур: <strong style="color: var(--color-text-main);">${filtered.length}</strong>
          </span>
          <button id="modalResetSearchBtn" style="font-size: 11px; color: var(--color-primary); background: none; border: none; cursor: pointer; text-decoration: underline;">
            Сбросить поиск
          </button>
        </div>

        <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
          ${filtered.map(s => `
            <div class="service-select-item" data-id="${s.id}">
              <div class="service-select-main">
                <div class="service-select-name">${s.name}</div>
                <div class="service-select-meta">
                  <span style="color: var(--color-primary); font-weight: 500;">${s.subCategory || ''}</span>
                  · ⏱ ${s.duration || 'По протоколу'}
                </div>
              </div>
              <div class="service-select-price">
                ${window.evoData.formatMoney(s.price)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (this.step1SelectedCategory) {
      // 2. Subcategories Drill-down inside selected Category
      const cat = categories.find(c => c.id === this.step1SelectedCategory) || categories[0];
      const catServices = services.filter(s => s.categoryId === cat.id);

      // Group by subcategory
      const groups = {};
      catServices.forEach(s => {
        const sub = s.subCategory || 'Общие процедуры';
        if (!groups[sub]) groups[sub] = [];
        groups[sub].push(s);
      });
      const subNames = Object.keys(groups);

      return `
        <div class="modal-category-header">
          <button id="modalBackToCatsBtn" class="btn-modal-back">
            ‹ Все категории
          </button>
          <div class="modal-category-badge">
            <span>${cat.icon}</span> <strong>${cat.name}</strong>
          </div>
        </div>

        <div style="max-height: 390px; overflow-y: auto; padding-right: 4px;">
          ${subNames.map((subName, idx) => {
            const items = groups[subName];
            const isOpen = subNames.length <= 2 || idx === 0;
            return `
              <div class="modal-subcat-group ${isOpen ? 'open' : ''}">
                <div class="modal-subcat-header">
                  <div class="modal-subcat-title-wrap">
                    <span class="modal-subcat-chevron">▾</span>
                    <span class="modal-subcat-name">${subName}</span>
                    <span class="modal-subcat-count">${items.length}</span>
                  </div>
                  <span class="modal-subcat-action">${isOpen ? 'Свернуть ▴' : 'Раскрыть ▾'}</span>
                </div>
                <div class="modal-subcat-body">
                  ${items.map(s => `
                    <div class="service-select-item" data-id="${s.id}">
                      <div class="service-select-main">
                        <div class="service-select-name">${s.name}</div>
                        <div class="service-select-meta">⏱ ${s.duration || 'По протоколу'}${s.desc ? ' · ' + s.desc.slice(0, 55) + '...' : ''}</div>
                      </div>
                      <div class="service-select-price">
                        ${window.evoData.formatMoney(s.price)}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 3. Category Grid Selection
    return `
      <div style="margin-bottom: 12px; font-size: 13px; color: var(--color-text-muted);">
        Выберите направление, чтобы посмотреть процедуры:
      </div>
      <div class="modal-cat-grid">
        ${categories.map(cat => {
          const count = services.filter(s => s.categoryId === cat.id).length;
          if (count === 0) return '';
          return `
            <div class="modal-cat-card" data-cat-id="${cat.id}">
              <div class="modal-cat-icon">${cat.icon}</div>
              <div class="modal-cat-info">
                <div class="modal-cat-title">${cat.name}</div>
                <div class="modal-cat-count">${count} ${this.pluralizeServices(count)}</div>
              </div>
              <div class="modal-cat-arrow">➔</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  bindStep1Events(services, categories) {
    const searchInput = document.getElementById('modalServiceSearchInput');
    const clearBtn = document.getElementById('modalClearSearchBtn');
    const contentArea = document.getElementById('modalStep1Content');

    const refreshContent = () => {
      if (contentArea) {
        contentArea.innerHTML = this.getStep1ContentHtml(services, categories);
        this.bindContentItemEvents(services, categories);
      }
      if (clearBtn) {
        clearBtn.style.display = this.step1SearchQuery ? 'flex' : 'none';
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.step1SearchQuery = e.target.value;
        refreshContent();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.step1SearchQuery = '';
        if (searchInput) searchInput.value = '';
        refreshContent();
        if (searchInput) searchInput.focus();
      });
    }

    this.bindContentItemEvents(services, categories);
  }

  bindContentItemEvents(services, categories) {
    const contentArea = document.getElementById('modalStep1Content');
    if (!contentArea) return;

    // Reset search buttons
    const resetBtns = contentArea.querySelectorAll('#modalResetSearchBtn, #modalResetSearchEmptyBtn');
    resetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.step1SearchQuery = '';
        const input = document.getElementById('modalServiceSearchInput');
        if (input) input.value = '';
        const clearBtn = document.getElementById('modalClearSearchBtn');
        if (clearBtn) clearBtn.style.display = 'none';
        contentArea.innerHTML = this.getStep1ContentHtml(services, categories);
        this.bindContentItemEvents(services, categories);
      });
    });

    // Back to categories button
    const backBtn = contentArea.querySelector('#modalBackToCatsBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.step1SelectedCategory = null;
        contentArea.innerHTML = this.getStep1ContentHtml(services, categories);
        this.bindContentItemEvents(services, categories);
      });
    }

    // Category cards click
    contentArea.querySelectorAll('.modal-cat-card').forEach(card => {
      card.addEventListener('click', () => {
        this.step1SelectedCategory = card.getAttribute('data-cat-id');
        contentArea.innerHTML = this.getStep1ContentHtml(services, categories);
        this.bindContentItemEvents(services, categories);
      });
    });

    // Subcategory accordion headers click
    contentArea.querySelectorAll('.modal-subcat-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.closest('.modal-subcat-group');
        if (group) {
          const isOpen = group.classList.toggle('open');
          const actionText = group.querySelector('.modal-subcat-action');
          if (actionText) {
            actionText.textContent = isOpen ? 'Свернуть ▴' : 'Раскрыть ▾';
          }
        }
      });
    });

    // Service item click -> select and transition to step 2
    contentArea.querySelectorAll('.service-select-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        this.selectedService = services.find(s => s.id === id);
        this.currentStep = 2;
        this.renderStep();
      });
    });
  }

  renderStep2Specialists() {
    const specialists = window.evoData.getSpecialists();
    
    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 class="font-serif" style="font-size: 24px;">Выберите специалиста</h3>
          <button id="stepBackBtn" style="font-size: 12px; color: var(--color-text-muted); text-decoration: underline;">‹ Назад к услугам</button>
        </div>
        <p class="text-muted" style="font-size: 13px; margin-bottom: 20px;">
          Выбранная процедура: <strong style="color: var(--color-primary);">${this.selectedService.name}</strong> (${window.evoData.formatMoney(this.selectedService.price)})
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
          <div class="spec-select-card" data-spec-id="any" style="padding: 16px; border: 2px dashed var(--color-accent-gold); border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 16px; background: var(--color-bg-subtle);">
            <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--color-accent-gold); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px;">✨</div>
            <div>
              <div style="font-weight: 700; font-size: 15px;">Любой свободный специалист</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">Система подберет ближайшее удобное для вас окно</div>
            </div>
          </div>

          ${specialists.map(sp => `
            <div class="spec-select-card" data-spec-id="${sp.id}" style="padding: 16px; border: 1px solid var(--color-border); border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 16px; transition: 0.2s;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='var(--color-border)'">
              <img src="${sp.photo}" alt="${sp.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
              <div>
                <div style="font-weight: 600; font-size: 14px;">${sp.name}</div>
                <div style="font-size: 12px; color: var(--color-accent-gold); font-weight: 500;">${sp.role}</div>
                <div style="font-size: 11px; color: var(--color-text-muted);">${sp.experience}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackBtn').addEventListener('click', () => {
      this.currentStep = 1;
      this.renderStep();
    });

    this.stepsContainer.querySelectorAll('.spec-select-card').forEach(el => {
      el.addEventListener('click', () => {
        const specId = el.getAttribute('data-spec-id');
        if (specId === 'any') {
          this.selectedSpecialist = { name: "Любой свободный специалист", role: "Дежурный эксперт EVO" };
        } else {
          this.selectedSpecialist = specialists.find(s => s.id === specId);
        }
        this.currentStep = 3;
        this.renderStep();
      });
    });
  }

  renderStep3DateTime() {
    const today = new Date().toISOString().split('T')[0];
    const availableSlots = [
      "09:30", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "19:45"
    ];

    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 class="font-serif" style="font-size: 24px;">Дата и время визита</h3>
          <button id="stepBackBtn" style="font-size: 12px; color: var(--color-text-muted); text-decoration: underline;">‹ Назад</button>
        </div>
        <p class="text-muted" style="font-size: 13px; margin-bottom: 24px;">
          Мастер: <strong style="color: var(--color-text-main);">${this.selectedSpecialist.name}</strong>
        </p>

        <div class="booking-form-group">
          <label class="form-label">Выберите дату</label>
          <input type="date" id="bookingDateInput" class="form-input" value="${this.selectedDate}" min="${today}">
        </div>

        <div class="booking-form-group">
          <label class="form-label">Доступные слоты на сегодня / выбранный день</label>
          <div class="time-slots-grid">
            ${availableSlots.map(time => `
              <button type="button" class="slot-btn ${time === this.selectedTime ? 'active' : ''}" data-time="${time}">
                ${time}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
          <button id="continueToContacts" class="btn btn-primary" style="width: 100%;">
            Продолжить к контактам ➔
          </button>
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackBtn').addEventListener('click', () => {
      this.currentStep = 2;
      this.renderStep();
    });

    const dateInput = document.getElementById('bookingDateInput');
    dateInput.addEventListener('change', (e) => {
      this.selectedDate = e.target.value;
    });

    this.stepsContainer.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.stepsContainer.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTime = btn.getAttribute('data-time');
      });
    });

    document.getElementById('continueToContacts').addEventListener('click', () => {
      this.currentStep = 4;
      this.renderStep();
    });
  }

  renderStep4Contacts() {
    let html = `
      <div class="booking-step-view">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 class="font-serif" style="font-size: 24px;">Ваши контакты</h3>
          <button id="stepBackBtn" style="font-size: 12px; color: var(--color-text-muted); text-decoration: underline;">‹ Назад</button>
        </div>
        <p class="text-muted" style="font-size: 13px; margin-bottom: 20px;">
          Мы забронируем за вами слот и пришлем подтверждение
        </p>

        <!-- Summary Pill -->
        <div style="background: var(--color-bg-subtle); padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--color-border-light); font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="text-muted">Услуга:</span>
            <strong>${this.selectedService.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="text-muted">Мастер:</span>
            <span>${this.selectedSpecialist.name}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span class="text-muted">Дата и время:</span>
            <span style="color: var(--color-primary); font-weight: 600;">${this.selectedDate} в ${this.selectedTime}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--color-border); margin-top: 6px;">
            <span class="text-muted">Итого:</span>
            <strong style="color: var(--color-primary); font-size: 16px; font-family: var(--font-serif);">${window.evoData.formatMoney(this.selectedService.price)}</strong>
          </div>
        </div>

        <form id="bookingFinalForm">
          <div class="booking-form-group">
            <label class="form-label">Выберите филиал EVO *</label>
            <select id="bookingBranchInput" class="form-select" style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border); font-family: inherit; font-size: 13px; background: #FFFFFF;">
              <option value="EVO Sever (40 Đ. Bắc Sơn)" ${this.selectedBranch.includes('Sever') ? 'selected' : ''}>📍 EVO Sever — 40 Đ. Bắc Sơn</option>
              <option value="EVO Beauty Space (94 Hùng Vương)" ${this.selectedBranch.includes('Hùng Vương') ? 'selected' : ''}>📍 EVO Beauty Space — 94 Hùng Vương</option>
            </select>
          </div>

          <div class="booking-form-group">
            <label class="form-label">Ваше Имя *</label>
            <input type="text" id="clientNameInput" class="form-input" placeholder="Например, Анна" required value="${this.clientData.name}">
          </div>

          <div class="booking-form-group">
            <label class="form-label">Телефон / Telegram / WhatsApp *</label>
            <input type="text" id="clientPhoneInput" class="form-input" placeholder="+84 ... или +7 ..." required value="${this.clientData.phone}">
          </div>

          <div class="booking-form-group">
            <label class="form-label">Пожелания или комментарий (опционально)</label>
            <textarea id="clientCommentInput" class="form-textarea" rows="2" placeholder="Например: аллергия на анестетик, хочу чашку капучино на овсяном...">${this.clientData.comment}</textarea>
          </div>

          <button type="submit" class="btn btn-gold" style="width: 100%; padding: 16px; font-size: 14px; margin-top: 10px;">
            Подтвердить запись ✨
          </button>
        </form>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('stepBackBtn').addEventListener('click', () => {
      this.currentStep = 3;
      this.renderStep();
    });

    document.getElementById('bookingFinalForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.clientData.name = document.getElementById('clientNameInput').value.trim();
      this.clientData.phone = document.getElementById('clientPhoneInput').value.trim();
      this.clientData.comment = document.getElementById('clientCommentInput').value.trim();
      const branchEl = document.getElementById('bookingBranchInput');
      if (branchEl) this.selectedBranch = branchEl.value;

      // Save to EVO CRM Data Store
      const newRecord = window.evoData.addAppointment({
        clientName: this.clientData.name,
        phone: this.clientData.phone,
        serviceName: this.selectedService.name,
        specialistName: this.selectedSpecialist.name,
        branch: this.selectedBranch,
        date: this.selectedDate,
        time: this.selectedTime,
        price: this.selectedService.price,
        comment: this.clientData.comment
      });

      this.currentStep = 5;
      this.lastCreatedId = newRecord.id;
      this.renderStep();
    });
  }

  renderStep5Success() {
    const salon = window.evoData.getSalonInfo();
    let html = `
      <div class="booking-step-view" style="text-align: center; padding: 20px 0;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: #D1FAE5; color: #065F46; font-size: 32px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          ✓
        </div>
        <h3 class="font-serif" style="font-size: 28px; margin-bottom: 10px; color: var(--color-primary);">Вы успешно записаны!</h3>
        <p class="text-muted" style="font-size: 14px; margin-bottom: 24px;">
          Номер вашей брони: <strong style="color: var(--color-text-main); font-size: 16px;">#${this.lastCreatedId}</strong>
        </p>

        <div style="background: var(--color-bg); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; font-size: 13px; border: 1px solid var(--color-border);">
          <p style="margin-bottom: 6px;">📍 <strong>Филиал:</strong> ${this.selectedBranch || salon.address}</p>
          <p style="margin-bottom: 6px;">📅 <strong>Время:</strong> ${this.selectedDate} в ${this.selectedTime}</p>
          <p style="margin-bottom: 6px;">✨ <strong>Услуга:</strong> ${this.selectedService.name}</p>
          <p>👩‍⚕️ <strong>Специалист:</strong> ${this.selectedSpecialist.name}</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="${salon.telegram}" target="_blank" class="btn btn-primary" style="width: 100%;">
            Написать администратору в Telegram
          </a>
          <button id="bookingFinishBtn" class="btn btn-outline" style="width: 100%;">
            Вернуться на сайт
          </button>
        </div>
      </div>
    `;

    this.stepsContainer.innerHTML = html;

    document.getElementById('bookingFinishBtn').addEventListener('click', () => {
      this.close();
    });
  }
}

// Global booking engine instance
window.bookingEngine = new BookingEngine();
