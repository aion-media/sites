/**
 * EVO Beauty Space - Client Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeCategory = 'all';
  let searchQuery = '';

  const categoriesContainer = document.getElementById('categoryTabs');
  const servicesGrid = document.getElementById('servicesGrid');
  const searchInput = document.getElementById('serviceSearchInput');
  const specialistsGrid = document.getElementById('specialistsGrid');

  // 1. Render Category Tabs
  function renderCategories() {
    if (!categoriesContainer) return;
    const categories = window.evoData.getCategories();
    
    let html = `
      <button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        ✨ Все направления
      </button>
    `;

    categories.forEach(cat => {
      html += `
        <button class="cat-tab ${activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          ${cat.icon} ${cat.name}
        </button>
      `;
    });

    categoriesContainer.innerHTML = html;

    categoriesContainer.querySelectorAll('.cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        categoriesContainer.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderServices();
      });
    });
  }

  // 2. Render Services Grouped by Subcategories
  function renderServices() {
    if (!servicesGrid) return;
    const allServices = window.evoData.getServices();
    const categories = window.evoData.getCategories();

    // Filter by category, search and visibility
    let filtered = allServices.filter(s => {
      if (s.isHidden) return false;
      const matchCategory = (activeCategory === 'all') || (s.categoryId === activeCategory);
      const matchSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.subCategory && s.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
      servicesGrid.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: var(--color-bg); border-radius: 16px;">
          <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
          <h4 class="font-serif" style="font-size: 20px; margin-bottom: 8px;">Процедуры не найдены</h4>
          <p class="text-muted" style="font-size: 14px;">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
        </div>
      `;
      return;
    }

    // Group filtered services by subCategory
    const groups = {};
    filtered.forEach(s => {
      const sub = s.subCategory || "Другие процедуры";
      if (!groups[sub]) {
        groups[sub] = [];
      }
      groups[sub].push(s);
    });

    let html = '';
    const subCategories = Object.keys(groups);

    subCategories.forEach((subName, index) => {
      const items = groups[subName];
      // Keep closed by default, open only if active search query exists
      const isOpen = searchQuery.length > 0;

      html += `
        <div class="subcategory-group ${isOpen ? 'open' : ''}" data-group="${subName}">
          <div class="subcategory-header" onclick="toggleSubcategory(this)">
            <div class="subcategory-title-wrap">
              <span class="subcategory-chevron">▾</span>
              <h3 class="subcategory-title">${subName}</h3>
              <span class="subcategory-count">${items.length} ${pluralizeServices(items.length)}</span>
            </div>
            <span class="btn-toggle-accordion">
              ${isOpen ? 'Свернуть ▴' : 'Раскрыть ▾'}
            </span>
          </div>
          
          <div class="subcategory-content">
            ${items.map(s => `
              <div class="service-card" data-id="${s.id}">
                <div class="service-card-top">
                  <div class="service-badges">
                    <span class="badge-cat">${s.subCategory}</span>
                    ${s.isPopular ? '<span class="badge-pop">★ Топ выбор</span>' : ''}
                  </div>
                  <h4 class="service-title" style="font-size: 18px;">${s.name}</h4>
                  <p class="service-desc">${s.desc || 'Индивидуальный протокол премиального преображения в EVO Beauty Space.'}</p>
                </div>
                <div class="service-card-bottom">
                  <div class="service-price-block">
                    <span class="service-duration">⏱ ${s.duration || 'По протоколу'}</span>
                    <span class="service-price">${window.evoData.formatMoney(s.price)}</span>
                  </div>
                  <button class="btn-book-sm" onclick="window.bookingEngine.open('${s.id}')">
                    Записаться ➔
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    servicesGrid.innerHTML = html;
  }

  // Pluralization helper
  function pluralizeServices(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'процедура';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'процедуры';
    return 'процедур';
  }

  // Expose toggleSubcategory globally
  window.toggleSubcategory = function(headerEl) {
    const group = headerEl.closest('.subcategory-group');
    if (group) {
      const isNowOpen = group.classList.toggle('open');
      const btn = group.querySelector('.btn-toggle-accordion');
      if (btn) {
        btn.textContent = isNowOpen ? 'Свернуть ▴' : 'Раскрыть ▾';
      }
    }
  };

  // 3. Render Specialists
  function renderSpecialists() {
    if (!specialistsGrid) return;
    const specialists = window.evoData.getSpecialists();

    let html = '';
    specialists.forEach(sp => {
      html += `
        <div class="spec-card">
          <div class="spec-img-wrap">
            <img src="${sp.photo}" alt="${sp.name}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80';">
          </div>
          <div class="spec-info">
            <h4 class="spec-name">${sp.name}</h4>
            <div class="spec-role">${sp.role}</div>
            <p class="spec-exp">${sp.experience}</p>
          </div>
        </div>
      `;
    });

    specialistsGrid.innerHTML = html;
  }

  // 4. Search Handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderServices();
    });
  }

  // Init
  renderCategories();
  renderServices();
  renderSpecialists();

  // Global listeners for buttons with data-action="book"
  document.querySelectorAll('[data-action="book-general"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.bookingEngine) {
        window.bookingEngine.open();
      }
    });
  });
});
