/**
 * H&D Hair Lab - Client Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderCategories();
  renderServices();
  renderSpecialists();
  setupEventListeners();
  setupServiceModal();
}

let activeGroup = window.preselectedGroup || 'all';
let activeSubCategory = 'all';
let currentSearch = '';

function renderCategories() {
  const container = document.getElementById('categoryTabs');
  const subContainer = document.getElementById('subCategoryTabs');
  if (!container) return;

  const groups = window.hdData.getCategoryGroups();
  const allServices = window.hdData.getServices();
  const allCategories = window.hdData.getCategories();

  // 1. Основные кнопки объединенных групп
  let html = `
    <button class="cat-tab-btn ${activeGroup === 'all' ? 'active' : ''}" data-group="all">
      Все услуги <span class="cat-tab-count">${allServices.length}</span>
    </button>
  `;

  groups.forEach(group => {
    const count = allServices.filter(s => group.categoryIds.includes(s.categoryId)).length;
    html += `
      <button class="cat-tab-btn ${activeGroup === group.id ? 'active' : ''}" data-group="${group.id}">
        <span>${group.icon}</span> ${group.name} <span class="cat-tab-count">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.cat-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeGroup = btn.getAttribute('data-group');
      activeSubCategory = 'all';
      renderCategories();
      renderServices();
    });
  });

  // 2. Дополнительные чипы подкатегорий (для групп, где 2 и более направлений)
  if (!subContainer) return;

  if (activeGroup === 'all') {
    subContainer.style.display = 'none';
    subContainer.innerHTML = '';
    return;
  }

  const currentGroupObj = groups.find(g => g.id === activeGroup);
  if (currentGroupObj && currentGroupObj.categoryIds.length > 1) {
    const subCats = allCategories.filter(c => currentGroupObj.categoryIds.includes(c.id));

    let subHtml = `
      <button class="sub-cat-btn ${activeSubCategory === 'all' ? 'active' : ''}" data-sub="all">
        Все в группе
      </button>
    `;

    subCats.forEach(c => {
      const subCount = allServices.filter(s => s.categoryId === c.id).length;
      subHtml += `
        <button class="sub-cat-btn ${activeSubCategory === c.id ? 'active' : ''}" data-sub="${c.id}">
          ${c.icon} ${c.name} (${subCount})
        </button>
      `;
    });

    subContainer.innerHTML = subHtml;
    subContainer.style.display = 'flex';

    subContainer.querySelectorAll('.sub-cat-btn').forEach(subBtn => {
      subBtn.addEventListener('click', () => {
        activeSubCategory = subBtn.getAttribute('data-sub');
        subContainer.querySelectorAll('.sub-cat-btn').forEach(b => b.classList.remove('active'));
        subBtn.classList.add('active');
        renderServices();
      });
    });
  } else {
    subContainer.style.display = 'none';
    subContainer.innerHTML = '';
  }
}

function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;

  let services = window.hdData.getServices();

  if (activeGroup !== 'all') {
    const groups = window.hdData.getCategoryGroups();
    const currentGroup = groups.find(g => g.id === activeGroup);

    if (activeSubCategory !== 'all') {
      services = services.filter(s => s.categoryId === activeSubCategory);
    } else if (currentGroup) {
      services = services.filter(s => currentGroup.categoryIds.includes(s.categoryId));
    }
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase().trim();
    services = services.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.shortDesc.toLowerCase().includes(q) ||
      (s.fullDesc && s.fullDesc.toLowerCase().includes(q))
    );
  }

  if (services.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
        <h3 style="font-size: 22px; margin-bottom: 8px;">Ничего не найдено</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Попробуйте изменить поисковый запрос или выберите другую категорию</p>
      </div>
    `;
    return;
  }

  const categoriesMap = {};
  window.hdData.getCategories().forEach(c => categoriesMap[c.id] = c.name);

  let html = '';
  services.forEach(srv => {
    const catName = categoriesMap[srv.categoryId] || 'Услуга';
    const hasVariants = srv.priceVariants && srv.priceVariants.length > 0;
    const basePrice = hasVariants ? srv.priceVariants[0].price : srv.price;

    html += `
      <div class="service-card" data-service-id="${srv.id}">
        <div>
          <div class="card-top-meta">
            <span class="card-category-label">${catName}</span>
            ${srv.badge ? `<span class="badge-tag badge-tag-white">${srv.badge}</span>` : ''}
          </div>

          <h3 class="service-name">${srv.name}</h3>
          <p class="service-short-desc">${srv.shortDesc}</p>

          ${srv.includes && srv.includes.length > 0 ? `
            <ul class="service-includes-list">
              ${srv.includes.slice(0, 3).map(inc => `<li>${inc}</li>`).join('')}
            </ul>
          ` : ''}

          ${hasVariants ? `
            <div class="service-variants-box">
              ${srv.priceVariants.map(v => `
                <div class="variant-row">
                  <span class="variant-name">${v.name}</span>
                  <span class="variant-price">${window.hdData.formatMoney(v.price)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="card-bottom-actions">
          <div class="card-price-row">
            <span class="price-prefix">${hasVariants ? 'от' : 'стоимость'}</span>
            <span class="price-val">${window.hdData.formatMoney(basePrice)}</span>
          </div>

          <div class="card-buttons-row">
            <button class="btn btn-glass btn-detail-open" data-service-id="${srv.id}" title="Подробнее о процедуре">
              О процедуре
            </button>
            <button class="btn btn-primary" onclick="window.bookingEngine.open('${srv.id}')">
              Записаться ✨
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Слушатели кнопки «О процедуре»
  container.querySelectorAll('.btn-detail-open').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sId = btn.getAttribute('data-service-id');
      openServiceDetailModal(sId);
    });
  });
}

function renderSpecialists() {
  const container = document.getElementById('specialistsGrid');
  if (!container) return;

  const specialists = window.hdData.getSpecialists();
  let html = '';

  specialists.forEach(sp => {
    html += `
      <div class="specialist-card">
        <div class="specialist-photo-wrap">
          <img src="${sp.avatar}" alt="${sp.name}">
        </div>
        <div class="specialist-details">
          <div class="specialist-role">${sp.role}</div>
          <h4 class="specialist-name">${sp.name}</h4>
          <p class="specialist-exp">${sp.experience}</p>
          <button class="btn btn-outline" onclick="window.bookingEngine.open()" style="width: 100%; padding: 10px; font-size: 13px;">
            Записаться к мастеру
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setupEventListeners() {
  const searchInput = document.getElementById('serviceSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderServices();
    });
  }

  // Общие кнопки вызова бронирования
  document.querySelectorAll('[data-action="book-general"]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.bookingEngine.open();
    });
  });
}

// Модальное окно с деталями о процедуре
function setupServiceModal() {
  let modalEl = document.getElementById('serviceDetailModal');
  if (!modalEl) {
    const div = document.createElement('div');
    div.id = 'serviceDetailModal';
    div.className = 'modal-overlay';
    div.innerHTML = `
      <div class="booking-modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <h3 id="modalDetailTitle">О процедуре</h3>
          <button class="modal-close-btn" id="modalDetailClose">&times;</button>
        </div>
        <div class="modal-body" id="modalDetailBody"></div>
        <div class="modal-detail-footer">
          <div id="modalDetailPriceBox"></div>
          <button class="btn btn-primary" id="modalDetailBookBtn">Записаться на процедуру ✨</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    div.querySelector('#modalDetailClose').addEventListener('click', () => {
      div.classList.remove('active');
      document.body.style.overflow = '';
    });
    div.addEventListener('click', (e) => {
      if (e.target === div) {
        div.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

function openServiceDetailModal(serviceId) {
  const services = window.hdData.getServices();
  const srv = services.find(s => s.id === serviceId);
  if (!srv) return;

  const modal = document.getElementById('serviceDetailModal');
  const title = document.getElementById('modalDetailTitle');
  const body = document.getElementById('modalDetailBody');
  const priceBox = document.getElementById('modalDetailPriceBox');
  const bookBtn = document.getElementById('modalDetailBookBtn');

  title.textContent = srv.name;

  let bodyHtml = `
    <div style="margin-bottom: 20px;">
      <p style="font-size: 15px; color: var(--text-sub); line-height: 1.7; margin-bottom: 20px;">${srv.fullDesc || srv.shortDesc}</p>
      
      ${srv.includes && srv.includes.length > 0 ? `
        <div style="background: var(--bg-card); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 20px;">
          <h5 style="font-size: 13px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 12px; letter-spacing: 0.05em;">В стоимость процедуры входит:</h5>
          <ul class="service-includes-list" style="margin-bottom: 0;">
            ${srv.includes.map(inc => `<li>${inc}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${srv.priceVariants && srv.priceVariants.length > 0 ? `
        <div style="background: var(--bg-card); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
          <h5 style="font-size: 13px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 12px; letter-spacing: 0.05em;">Стоимость в зависимости от длины:</h5>
          ${srv.priceVariants.map(v => `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px;">
              <span style="color: var(--text-muted);">${v.name}</span>
              <strong style="font-family: var(--font-mono); color: #FFF;">${window.hdData.formatMoney(v.price)}</strong>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${srv.note ? `
        <div style="font-size: 12px; color: var(--accent-amber); display: flex; align-items: center; gap: 8px;">
          <span>ℹ️</span> <span>${srv.note}</span>
        </div>
      ` : ''}
    </div>
  `;

  body.innerHTML = bodyHtml;

  const hasVariants = srv.priceVariants && srv.priceVariants.length > 0;
  const basePrice = hasVariants ? srv.priceVariants[0].price : srv.price;
  priceBox.innerHTML = `
    <span style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; display: block;">${hasVariants ? 'от' : 'итог'}</span>
    <span style="font-family: var(--font-mono); font-size: 20px; font-weight: 700; color: #FFFFFF;">${window.hdData.formatMoney(basePrice)}</span>
  `;

  bookBtn.onclick = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    window.bookingEngine.open(srv.id);
  };

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
