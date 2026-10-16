/**
 * NOIR Hair Atelier - Showcase Landing Page Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentCategoryFilter = 'all';

function initApp() {
  renderCategoryTabs();
  renderServicesGrid();
  renderSpecialistsGrid();
  setupFAQ();
  setupSmoothScroll();
}

function renderCategoryTabs() {
  const container = document.getElementById('categoryTabsContainer');
  if (!container) return;

  const categories = window.noirData.getCategories();
  const services = window.noirData.getServices();

  let html = `
    <button type="button" class="cat-tab-btn ${currentCategoryFilter === 'all' ? 'active' : ''}" onclick="filterCategory('all')">
      <span>Все направления</span>
      <span class="cat-badge">${services.length}</span>
    </button>
  `;

  categories.forEach(cat => {
    const count = services.filter(s => s.categoryId === cat.id).length;
    const isActive = currentCategoryFilter === cat.id;
    html += `
      <button type="button" class="cat-tab-btn ${isActive ? 'active' : ''}" onclick="filterCategory('${cat.id}')">
        <span>${cat.name}</span>
        <span class="cat-badge">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

window.filterCategory = function(categoryId) {
  currentCategoryFilter = categoryId;
  renderCategoryTabs();
  renderServicesGrid();
};

function renderServicesGrid() {
  const container = document.getElementById('servicesGridContainer');
  if (!container) return;

  const services = window.noirData.getServices();
  const categories = window.noirData.getCategories();

  const filtered = currentCategoryFilter === 'all' 
    ? services 
    : services.filter(s => s.categoryId === currentCategoryFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
        В этой категории пока нет услуг
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(s => {
    const cat = categories.find(c => c.id === s.categoryId);
    const catName = cat ? cat.name : "Услуга";

    html += `
      <div class="service-card">
        <div>
          <div class="service-header">
            <h3 class="service-name">${s.name}</h3>
            <span class="service-price-pill">${window.noirData.formatMoney(s.price)}</span>
          </div>
          <div class="service-meta">
            <span>⏱️ ${s.duration} минут</span>
            <span>•</span>
            <span class="service-category-tag">${catName}</span>
          </div>
          <p class="service-desc">${s.shortDesc}</p>
        </div>

        <div class="service-footer">
          <button type="button" class="btn btn-secondary" style="padding: 8px 16px; font-size: 13px;" onclick="openBookingModal('${s.id}')">
            Выбрать время →
          </button>
          <button type="button" class="btn btn-primary" style="padding: 8px 18px; font-size: 13px;" onclick="openBookingModal('${s.id}')">
            Записаться
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderSpecialistsGrid() {
  const container = document.getElementById('specialistsGridContainer');
  if (!container) return;

  const specialists = window.noirData.getSpecialists();

  let html = '';
  specialists.forEach(sp => {
    html += `
      <div class="specialist-card">
        <div class="spec-avatar-wrapper">
          <img src="${sp.avatar}" alt="${sp.name}" class="spec-avatar-img" loading="lazy">
          <div class="spec-badge-status">
            <span class="spec-badge-dot"></span>
            <span>Принимает запись</span>
          </div>
        </div>
        <div class="spec-info">
          <h4 class="spec-name">${sp.name}</h4>
          <div class="spec-role">${sp.role}</div>
          <p class="spec-exp">${sp.experience}</p>
          <button type="button" class="spec-action-btn" onclick="openBookingModal(null, '${sp.id}')">
            Записаться к мастеру
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setupFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const q = item.querySelector('.faq-question');
    if (q) {
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
