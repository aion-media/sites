/**
 * NOIR Hair Atelier - Online Booking Wizard Controller
 * 5-шаговый интерактивный мастер онлайн-записи
 */

document.addEventListener('DOMContentLoaded', () => {
  initBookingWizard();
});

let bookingState = {
  step: 1,
  serviceId: null,
  serviceName: "",
  price: 0,
  duration: 60,
  specialistId: "any",
  specialistName: "Любой свободный мастер",
  date: new Date().toISOString().split('T')[0],
  time: "12:00",
  clientName: "",
  phone: "",
  comment: ""
};

function initBookingWizard() {
  setupWizardTriggers();
  setupWizardNavigation();
}

function setupWizardTriggers() {
  // Кнопки открытия модального окна записи
  document.querySelectorAll('[data-open-booking]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceId = btn.getAttribute('data-service-id');
      const specId = btn.getAttribute('data-spec-id');
      openBookingModal(serviceId, specId);
    });
  });

  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('bookingModalClose');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

window.openBookingModal = function(preselectedServiceId = null, preselectedSpecId = null) {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  // Сброс состояния
  bookingState = {
    step: 1,
    serviceId: preselectedServiceId || null,
    serviceName: "",
    price: 0,
    duration: 60,
    specialistId: preselectedSpecId || "any",
    specialistName: "Любой свободный мастер",
    date: new Date().toISOString().split('T')[0],
    time: "",
    clientName: "",
    phone: "",
    comment: ""
  };

  if (preselectedServiceId) {
    const services = window.noirData.getServices();
    const srv = services.find(s => s.id === preselectedServiceId);
    if (srv) {
      bookingState.serviceName = srv.name;
      bookingState.price = srv.price;
      bookingState.duration = srv.duration || 60;
    }
  }

  if (preselectedSpecId) {
    const specialists = window.noirData.getSpecialists();
    const sp = specialists.find(s => s.id === preselectedSpecId);
    if (sp) {
      bookingState.specialistName = sp.name;
    }
  }

  renderStep1Services();
  renderStep2Specialists();
  renderStep3DateTime();
  goToStep(preselectedServiceId ? 2 : 1);

  modal.classList.add('active');
};

function goToStep(stepNumber) {
  bookingState.step = stepNumber;

  // Индикаторы шагов
  document.querySelectorAll('.wizard-step').forEach(st => {
    const stepIdx = parseInt(st.getAttribute('data-step-indicator'), 10);
    st.classList.remove('active', 'completed');
    if (stepIdx < stepNumber) {
      st.classList.add('completed');
    } else if (stepIdx === stepNumber) {
      st.classList.add('active');
    }
  });

  // Панели
  document.querySelectorAll('.wizard-panel').forEach(p => {
    p.classList.remove('active');
  });
  const currentPanel = document.getElementById(`wizardPanel${stepNumber}`);
  if (currentPanel) {
    currentPanel.classList.add('active');
  }

  // Обновление кнопок
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  if (prevBtn) {
    prevBtn.style.visibility = (stepNumber === 1 || stepNumber === 5) ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    if (stepNumber === 4) {
      nextBtn.textContent = 'Подтвердить запись';
    } else if (stepNumber === 5) {
      nextBtn.textContent = 'Готово';
    } else {
      nextBtn.textContent = 'Далее →';
    }
  }

  if (stepNumber === 3) {
    updateTimeSlots();
  } else if (stepNumber === 4) {
    renderStep4Summary();
  }
}

function setupWizardNavigation() {
  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (bookingState.step > 1 && bookingState.step < 5) {
        goToStep(bookingState.step - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      handleNextStep();
    });
  }
}

function handleNextStep() {
  if (bookingState.step === 1) {
    if (!bookingState.serviceId) {
      alert("Пожалуйста, выберите услугу");
      return;
    }
    goToStep(2);
  } else if (bookingState.step === 2) {
    goToStep(3);
  } else if (bookingState.step === 3) {
    if (!bookingState.time) {
      alert("Пожалуйста, выберите подходящее время записи");
      return;
    }
    goToStep(4);
  } else if (bookingState.step === 4) {
    const nameInput = document.getElementById('bookingClientName');
    const phoneInput = document.getElementById('bookingClientPhone');
    const commentInput = document.getElementById('bookingClientComment');

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const comment = commentInput ? commentInput.value.trim() : "";

    if (!name || name.length < 2) {
      alert("Пожалуйста, укажите ваше имя");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!phone || phone.length < 6) {
      alert("Пожалуйста, укажите контактный телефон или никнейм в Telegram");
      if (phoneInput) phoneInput.focus();
      return;
    }

    bookingState.clientName = name;
    bookingState.phone = phone;
    bookingState.comment = comment;

    // Сохраняем в базу LocalStorage
    const newRecord = window.noirData.addAppointment({
      clientName: bookingState.clientName,
      phone: bookingState.phone,
      serviceId: bookingState.serviceId,
      serviceName: bookingState.serviceName,
      specialistId: bookingState.specialistId,
      specialistName: bookingState.specialistName,
      date: bookingState.date,
      time: bookingState.time,
      duration: bookingState.duration,
      price: bookingState.price,
      comment: bookingState.comment
    });

    renderStep5Success(newRecord);
    goToStep(5);
  } else if (bookingState.step === 5) {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
  }
}

// Рендер Шага 1: Услуги
function renderStep1Services() {
  const container = document.getElementById('wizardServicesList');
  if (!container) return;

  let categories = window.noirData.getCategories();
  let services = window.noirData.getServices();
  const specialists = window.noirData.getSpecialists();

  let activeSpec = null;
  if (bookingState.specialistId && bookingState.specialistId !== 'any') {
    activeSpec = specialists.find(s => s.id === bookingState.specialistId);
  }

  let html = '';

  // Если выбран конкретный мастер, фильтруем категории и услуги по его профилю
  if (activeSpec && activeSpec.categories && activeSpec.categories.length > 0) {
    const allowedCatIds = activeSpec.categories;
    categories = categories.filter(cat => allowedCatIds.includes(cat.id));
    services = services.filter(s => allowedCatIds.includes(s.categoryId));

    // Проверяем, подходит ли текущая выбранная услуга
    if (bookingState.serviceId) {
      const curSrv = services.find(s => s.id === bookingState.serviceId);
      if (!curSrv) {
        bookingState.serviceId = null;
        bookingState.serviceName = "";
        bookingState.price = 0;
      }
    }

    html += `
      <div style="background: rgba(229, 169, 60, 0.08); border: 1px solid var(--border-accent); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${activeSpec.avatar}" alt="${activeSpec.name}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-accent);">
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #FFFFFF;">Мастер: ${activeSpec.name}</div>
            <div style="font-size: 11px; color: var(--accent-gold);">Показаны только услуги, выполняемые данным мастером</div>
          </div>
        </div>
        <button type="button" class="btn btn-secondary" onclick="clearSelectedSpecialistInBooking()" style="padding: 6px 12px; font-size: 11px; white-space: nowrap;">
          Показать всех мастеров
        </button>
      </div>
    `;
  }

  categories.forEach(cat => {
    const catServices = services.filter(s => s.categoryId === cat.id);
    if (catServices.length === 0) return;

    html += `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 800; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
          ${cat.name}
        </div>
        <div class="wizard-options-grid">
    `;

    catServices.forEach(s => {
      const isSelected = bookingState.serviceId === s.id;
      html += `
        <div class="wizard-option-card ${isSelected ? 'selected' : ''}" onclick="selectWizardService('${s.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="font-weight: 700; color: #FFFFFF; font-size: 14px;">${s.name}</div>
            <div style="font-weight: 800; color: var(--accent-gold); font-size: 13px; white-space: nowrap; margin-left: 8px;">
              ${window.noirData.formatMoney(s.price)}
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 8px;">
            ⏱️ ${s.duration} мин
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            ${s.shortDesc}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  if (categories.length === 0) {
    html += `
      <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
        <p>Для выбранного мастера пока нет доступных услуг в каталоге.</p>
        <button type="button" class="btn btn-secondary" onclick="clearSelectedSpecialistInBooking()" style="margin-top: 12px;">
          Показать все услуги ателье
        </button>
      </div>
    `;
  }

  container.innerHTML = html;
}

window.clearSelectedSpecialistInBooking = function() {
  bookingState.specialistId = 'any';
  bookingState.specialistName = 'Любой свободный мастер';
  renderStep1Services();
  renderStep2Specialists();
};

window.selectWizardService = function(serviceId) {
  const services = window.noirData.getServices();
  const srv = services.find(s => s.id === serviceId);
  if (!srv) return;

  bookingState.serviceId = srv.id;
  bookingState.serviceName = srv.name;
  bookingState.price = srv.price;
  bookingState.duration = srv.duration || 60;

  renderStep1Services();
  renderStep2Specialists();
};

// Рендер Шага 2: Специалисты
function renderStep2Specialists() {
  const container = document.getElementById('wizardSpecialistsList');
  if (!container) return;

  const specialists = window.noirData.getSpecialists();
  const services = window.noirData.getServices();
  const selectedSrv = services.find(s => s.id === bookingState.serviceId);

  // Фильтруем мастеров по выбранной услуге
  let eligibleSpecialists = specialists;
  if (selectedSrv && selectedSrv.categoryId) {
    eligibleSpecialists = specialists.filter(sp => {
      if (sp.categories && Array.isArray(sp.categories) && sp.categories.length > 0) {
        return sp.categories.includes(selectedSrv.categoryId);
      }
      return true;
    });
  }

  // Если выбранный мастер не оказывает эту услугу, сбрасываем на "Любой свободный мастер"
  if (bookingState.specialistId !== 'any' && !eligibleSpecialists.some(sp => sp.id === bookingState.specialistId)) {
    bookingState.specialistId = 'any';
    bookingState.specialistName = 'Любой свободный мастер';
  }

  let html = '';
  if (selectedSrv) {
    html += `
      <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <span>Выбрана услуга: <strong style="color: #FFFFFF;">${selectedSrv.name}</strong></span>
        <span style="color: var(--accent-gold); font-weight: 600; font-size: 12px;">Доступно мастеров: ${eligibleSpecialists.length}</span>
      </div>
    `;
  }

  html += `
    <div class="wizard-options-grid">
      <div class="wizard-option-card ${bookingState.specialistId === 'any' ? 'selected' : ''}" onclick="selectWizardSpecialist('any', 'Любой свободный мастер')">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--accent-gold-bg); border: 1px solid var(--border-accent); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; color: var(--accent-gold); font-weight: 800;">
          N
        </div>
        <div style="font-weight: 800; color: #FFFFFF; font-size: 15px; margin-bottom: 4px;">Любой свободный мастер</div>
        <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 6px;">Рекомендуем для максимального выбора удобного времени</div>
        <div style="font-size: 11px; color: var(--accent-gold); font-weight: 600;">Ближайший доступный слот</div>
      </div>
  `;

  eligibleSpecialists.forEach(sp => {
    const isSelected = bookingState.specialistId === sp.id;
    html += `
      <div class="wizard-option-card ${isSelected ? 'selected' : ''}" onclick="selectWizardSpecialist('${sp.id}', '${sp.name}')">
        <img src="${sp.avatar}" alt="${sp.name}" class="wizard-spec-avatar">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 15px; margin-bottom: 2px;">${sp.name}</div>
        <div style="font-size: 12px; color: var(--accent-gold); font-weight: 600; margin-bottom: 6px;">${sp.role}</div>
        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${sp.experience}</div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

window.selectWizardSpecialist = function(id, name) {
  bookingState.specialistId = id;
  bookingState.specialistName = name;
  renderStep2Specialists();
};

// Рендер Шага 3: Дата и Время
function renderStep3DateTime() {
  const dateInput = document.getElementById('wizardDateInput');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = bookingState.date || today;

    dateInput.addEventListener('change', (e) => {
      bookingState.date = e.target.value;
      updateTimeSlots();
    });
  }
}

function updateTimeSlots() {
  const container = document.getElementById('wizardTimeSlotsGrid');
  if (!container) return;

  const date = bookingState.date;
  const specId = bookingState.specialistId;
  const appointments = window.noirData.getAppointments();

  const slots = [
    "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00"
  ];

  let html = '';
  slots.forEach(slot => {
    const hour = parseInt(slot.split(':')[0], 10);
    // Проверка занятости
    const isBusy = appointments.some(a => {
      if (a.date !== date || a.status === 'cancelled') return false;
      const appHour = parseInt(a.time.split(':')[0], 10);
      if (specId !== 'any') {
        return a.specialistId === specId && appHour === hour;
      }
      return false; // Для "любого мастера" покажем слот доступным, если хотя бы 1 мастер свободен
    });

    const isSelected = bookingState.time === slot;
    html += `
      <button type="button" class="time-slot-btn ${isSelected ? 'selected' : ''}" 
              ${isBusy ? 'disabled' : ''} 
              onclick="selectWizardTime('${slot}')">
        ${slot}
      </button>
    `;
  });

  container.innerHTML = html;
}

window.selectWizardTime = function(slot) {
  bookingState.time = slot;
  updateTimeSlots();
};

// Рендер Шага 4: Итог перед подтверждением
function renderStep4Summary() {
  const container = document.getElementById('wizardBookingSummaryBox');
  if (!container) return;

  container.innerHTML = `
    <div style="background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-medium); padding: 18px; margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
        Ваша запись в NOIR Atelier
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">
        ${bookingState.serviceName}
      </div>
      <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 12px;">
        Мастер: <strong style="color: #FFFFFF;">${bookingState.specialistName}</strong> • ${bookingState.duration} мин
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
        <div style="font-size: 14px; color: var(--text-sub);">
          📅 <strong>${bookingState.date}</strong> в <strong>${bookingState.time}</strong>
        </div>
        <div style="font-size: 17px; font-weight: 800; color: var(--accent-gold);">
          ${window.noirData.formatMoney(bookingState.price)}
        </div>
      </div>
    </div>
  `;
}

// Рендер Шага 5: Успешная запись
function renderStep5Success(record) {
  const container = document.getElementById('wizardSuccessBox');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--color-success-bg); border: 2px solid var(--color-success); color: var(--color-success); display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px;">
        ✓
      </div>
      <h3 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-bottom: 8px;">
        Запись успешно подтверждена!
      </h3>
      <p style="font-size: 14px; color: var(--text-muted); max-width: 420px; margin: 0 auto 24px; line-height: 1.5;">
        Номер вашей брони: <strong style="color: var(--accent-gold); font-family: var(--font-mono);">${record.id}</strong>.<br>
        Мы ждём вас по адресу <strong>${DEFAULT_SALON_INFO.addressShort}</strong>.
      </p>

      <div style="background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); padding: 18px; text-align: left; max-width: 440px; margin: 0 auto 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: var(--text-dim); font-size: 13px;">Услуга:</span>
          <span style="color: #FFFFFF; font-weight: 700; font-size: 13px;">${record.serviceName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: var(--text-dim); font-size: 13px;">Мастер:</span>
          <span style="color: #FFFFFF; font-weight: 600; font-size: 13px;">${record.specialistName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: var(--text-dim); font-size: 13px;">Дата и время:</span>
          <span style="color: var(--accent-gold); font-weight: 700; font-size: 13px;">${record.date} в ${record.time}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-dim); font-size: 13px;">Стоимость:</span>
          <span style="color: #FFFFFF; font-weight: 800; font-size: 14px;">${window.noirData.formatMoney(record.price)}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
        <a href="${DEFAULT_SALON_INFO.telegram}" target="_blank" class="btn btn-secondary" style="font-size: 13px;">
          💬 Чат в Telegram
        </a>
      </div>
    </div>
  `;
}
