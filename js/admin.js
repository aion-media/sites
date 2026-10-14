/**
 * EVO Beauty Space - Admin Dashboard & CRM Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // PIN Protection Logic
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

  let currentTab = 'appointments'; // 'appointments', 'services', 'analytics'
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

  // Table Containers
  const appointmentsTbody = document.getElementById('appointmentsTbody');
  const servicesTbody = document.getElementById('servicesTbody');

  // Modal & Form elements
  const addServiceModal = document.getElementById('addServiceModal');
  const addServiceForm = document.getElementById('addServiceForm');
  const openAddServiceBtn = document.getElementById('openAddServiceBtn');
  const closeAddServiceBtn = document.getElementById('closeAddServiceBtn');

  // 1. Navigation switching
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

  // 2. Render KPIs
  function renderKPIs() {
    const appointments = window.evoData.getAppointments();
    const services = window.evoData.getServices();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayApps = appointments.filter(a => a.date === todayStr);
    const newApps = appointments.filter(a => a.status === 'new');

    const totalEstRevenue = appointments
      .filter(a => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    if (kpiTodayCount) kpiTodayCount.textContent = todayApps.length;
    if (kpiNewCount) kpiNewCount.textContent = newApps.length;
    if (kpiRevenue) kpiRevenue.textContent = (totalEstRevenue / 1000000).toFixed(1) + " млн ₫";
    if (kpiServicesCount) kpiServicesCount.textContent = services.length;
  }

  // 3. Render Appointments Table
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
        completed: '<span class="status-badge status-completed">✔ Завершена</span>',
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
            <div style="font-weight: 600;">${app.clientName}</div>
            <a href="tel:${app.phone}" style="color: var(--color-primary); font-size: 12px;">📞 ${app.phone}</a>
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
            <select class="form-select status-select" data-id="${app.id}" style="padding: 6px 10px; font-size: 12px; border-radius: 6px;">
              <option value="new" ${app.status === 'new' ? 'selected' : ''}>Новая</option>
              <option value="confirmed" ${app.status === 'confirmed' ? 'selected' : ''}>Подтвердить</option>
              <option value="in_progress" ${app.status === 'in_progress' ? 'selected' : ''}>В процессе</option>
              <option value="completed" ${app.status === 'completed' ? 'selected' : ''}>Завершена</option>
              <option value="cancelled" ${app.status === 'cancelled' ? 'selected' : ''}>Отменить</option>
            </select>
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
        renderKPIs();
        renderAppointments();
      });
    });
  }

  // 4. Render Services Table
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
            <!-- Inline Live Price Editor -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" class="form-input service-price-input" data-id="${s.id}" value="${s.price}" style="width: 120px; padding: 6px 8px; font-size: 12px; font-weight: 600;">
              <span style="font-size: 11px; font-weight: 600; color: var(--color-primary);">₫</span>
              <button class="btn btn-outline save-price-btn" data-id="${s.id}" title="Сохранить цену" style="padding: 6px 10px; font-size: 11px;">
                💾
              </button>
            </div>
          </td>
          <td>
            <!-- Action Toolbar: Edit, Toggle Visibility, Delete -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn-outline edit-service-btn" data-id="${s.id}" title="Редактировать всё (название, описание, длительность)" style="padding: 6px 10px; font-size: 12px; background: #FFFFFF;">
                ✏️
              </button>
              <button class="btn btn-outline toggle-vis-btn" data-id="${s.id}" title="${s.isHidden ? 'Показать на сайте' : 'Временно скрыть с сайта'}" style="padding: 6px 10px; font-size: 12px; background: #FFFFFF;">
                ${s.isHidden ? '👁️' : '🚫'}
              </button>
              <button class="btn btn-outline delete-service-btn" data-id="${s.id}" title="Удалить услугу из базы" style="padding: 6px 10px; font-size: 12px; color: #DC2626; border-color: #FCA5A5; background: #FFFFFF;">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    servicesTbody.innerHTML = html;

    // 1. Attach Price Save Handlers
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

    // 2. Attach Edit Full Service Handlers
    servicesTbody.querySelectorAll('.edit-service-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // 3. Attach Toggle Visibility Handlers
    servicesTbody.querySelectorAll('.toggle-vis-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.evoData.toggleServiceVisibility(id);
        renderServices();
      });
    });

    // 4. Attach Delete Service Handlers
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

  // Edit Service Modal Logic
  const editServiceModal = document.getElementById('editServiceModal');
  const editServiceForm = document.getElementById('editServiceForm');
  const closeEditServiceBtn = document.getElementById('closeEditServiceBtn');

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

  if (closeEditServiceBtn) {
    closeEditServiceBtn.addEventListener('click', closeEditModal);
  }

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

  // 5. Add Service Modal Logic with Dynamic Subcategories
  const newServiceCategorySelect = document.getElementById('newServiceCategory');
  const newServiceSubcategorySelect = document.getElementById('newServiceSubcategorySelect');
  const customSubcategoryWrap = document.getElementById('customSubcategoryWrap');
  const newServiceCustomSubcategory = document.getElementById('newServiceCustomSubcategory');

  function populateSubcategoriesForCategory(catId) {
    if (!newServiceSubcategorySelect) return;
    const services = window.evoData.getServices();
    // Get unique existing subcategories for this category
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
    
    // Reset custom input
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
      // Populate subcategories for current category
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
      if (e.target === addServiceModal) {
        closeServiceModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && addServiceModal && addServiceModal.classList.contains('active')) {
      closeServiceModal();
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
      
      // Switch to services tab to show newly added item
      const srvTabNav = document.querySelector('.admin-nav-item[data-tab="services"]');
      if (srvTabNav) {
        srvTabNav.click();
      }
      renderServices();
      renderKPIs();
      
      alert(`Услуга «${newService.name}» успешно добавлена в раздел «${newService.subCategory}» и доступна на сайте!`);
    });
  }

  // 6. Filter listeners
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

  function renderAll() {
    renderKPIs();
    renderAppointments();
    renderServices();
  }

  // Initialize CRM
  renderAll();
});
