/* ZEBIKE full catalogue — category / model browser */
(function () {
  'use strict';

  const MODELS = window.ZEBIKE_CATALOG || [];
  const CATS = [
    { key: 'all', label: 'All models', note: '48 models across 4 categories' },
    { key: 'motorcycle', label: 'Electric Motorcycle', note: '4 high-power two-wheelers' },
    { key: 'scooter', label: 'Electric Scooter', note: '28 commuter scooters' },
    { key: 'tricycle', label: 'Electric Tricycle', note: '8 cargo & passenger trikes' },
    { key: 'bicycle', label: 'Electric Bicycle', note: '8 pedal-assist bicycles' }
  ];
  const params = new URLSearchParams(window.location.search);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = (id) => MODELS.find((m) => m.id === id);
  const catLabel = (key) => (CATS.find((c) => c.key === key) || {}).label || key;
  const specValue = (m, keys) => {
    for (const k of keys) {
      const hit = m.specs.find((s) => s[0].toLowerCase().indexOf(k) > -1);
      if (hit) return hit[1];
    }
    return '—';
  };

  function card(m) {
    const motor = specValue(m, ['motor']);
    const battery = specValue(m, ['battery']);
    const speed = specValue(m, ['max speed']);
    const range = specValue(m, ['range']);
    return '<a class="cat-card" href="catalog-model.html?id=' + encodeURIComponent(m.id) + '">' +
      '<div class="cat-card-media"><img src="' + m.image + '" alt="' + esc(m.name) + '" loading="lazy">' +
      '<span class="cat-card-cat">' + esc(m.categoryLabel) + '</span></div>' +
      '<div class="cat-card-body"><span class="cat-card-page">CATALOGUE P.' + String(m.page).padStart(2, '0') + '</span>' +
      '<h3>' + esc(m.name) + '</h3>' +
      '<div class="cat-card-specs"><div><span>Motor</span><strong>' + esc(motor) + '</strong></div>' +
      '<div><span>Battery</span><strong>' + esc(battery) + '</strong></div>' +
      '<div><span>Top speed</span><strong>' + esc(speed) + '</strong></div>' +
      '<div><span>Range</span><strong>' + esc(range) + '</strong></div></div>' +
      '<span class="cat-card-link">View full specification <b>→</b></span></div></a>';
  }

  function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    const search = document.getElementById('catalogSearch');
    const buttons = Array.prototype.slice.call(document.querySelectorAll('[data-cat-filter]'));
    let active = params.get('category') || 'all';
    if (!CATS.some((c) => c.key === active)) active = 'all';

    function render() {
      const term = (search && search.value || '').toLowerCase().trim();
      const list = MODELS.filter((m) => {
        const catOK = active === 'all' || m.category === active;
        const text = (m.name + ' ' + m.categoryLabel + ' ' + m.specs.map((s) => s.join(' ')).join(' ')).toLowerCase();
        return catOK && (!term || text.indexOf(term) > -1);
      });
      grid.innerHTML = list.length ? list.map(card).join('') :
        '<div class="empty-state" style="grid-column:1/-1"><h3>No models found</h3><p>Try a different search term.</p></div>';
      const count = document.getElementById('catalogCount');
      if (count) count.textContent = list.length + (list.length === 1 ? ' model' : ' models');
      buttons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-cat-filter') === active));
      const note = document.getElementById('catalogCatNote');
      if (note) note.textContent = (CATS.find((c) => c.key === active) || CATS[0]).note;
    }
    buttons.forEach((b) => b.addEventListener('click', () => { active = b.getAttribute('data-cat-filter'); render(); }));
    if (search) search.addEventListener('input', render);
    render();
  }

  function renderModel() {
    const root = document.getElementById('catalogModelRoot');
    if (!root) return;
    const m = byId(params.get('id'));
    if (!m) {
      root.innerHTML = '<div class="empty-state"><h3>Model not found</h3><p><a class="accent" href="catalog.html">Back to full catalogue</a></p></div>';
      return;
    }
    const idx = MODELS.indexOf(m);
    const prev = MODELS[(idx - 1 + MODELS.length) % MODELS.length];
    const next = MODELS[(idx + 1) % MODELS.length];
    const same = MODELS.filter((x) => x.category === m.category && x.id !== m.id).slice(0, 4);
    const rows = m.specs.map((s) => '<tr><th>' + esc(s[0]) + '</th><td>' + esc(s[1]) + '</td></tr>').join('');
    root.innerHTML =
      '<div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="catalog.html">Catalogue</a><span>/</span>' +
      '<a href="catalog.html?category=' + m.category + '">' + esc(m.categoryLabel) + '</a><span>/</span><span>' + esc(m.name) + '</span></div>' +
      '<div class="model-hero"><div class="model-image"><img src="' + m.image + '" alt="' + esc(m.name) + '">' +
      '<span class="model-page-tag">Original catalogue page ' + String(m.page).padStart(2, '0') + '</span></div>' +
      '<div class="model-info"><span class="eyebrow">' + esc(m.categoryLabel) + ' · 2026</span><h1>' + esc(m.name) + '</h1>' +
      '<p class="lead">Factory specification as printed in the ZEBIKE 2026 catalogue. No retail price is listed in the source document — use the trade enquiry channel for quotation.</p>' +
      '<div class="model-actions"><a class="btn btn-primary" href="trade.html">Request a quotation</a>' +
      '<a class="btn" href="assets/catalog/xdao-2026-catalog.pdf" target="_blank" rel="noopener">Download full PDF</a></div>' +
      '<div class="model-quick"><div><strong>' + esc(specValue(m, ['motor'])) + '</strong><span>Motor</span></div>' +
      '<div><strong>' + esc(specValue(m, ['battery'])) + '</strong><span>Battery</span></div>' +
      '<div><strong>' + esc(specValue(m, ['max speed'])) + '</strong><span>Top speed</span></div></div></div></div>' +
      '<div class="model-lower"><div><div class="section-head"><div><span class="eyebrow">Technical data</span><h2 class="section-title">Specification</h2></div></div>' +
      '<div class="spec-table-wrap"><table class="spec-table"><tbody>' + rows + '</tbody></table></div>' +
      '<p class="form-note" style="margin-top:18px">Specifications reproduced from the supplier catalogue. Final market configuration, certification and pricing must be confirmed before order.</p></div>' +
      '<aside class="model-aside"><h3>Browse this category</h3>' +
      (same.length ? same.map((x) => '<a class="model-aside-link" href="catalog-model.html?id=' + encodeURIComponent(x.id) + '"><img src="' + x.image + '" alt="" loading="lazy"><span><strong>' + esc(x.name) + '</strong><small>' + esc(specValue(x, ['motor'])) + '</small></span></a>').join('') : '<p>No other models in this category.</p>') +
      '<a class="btn btn-block" style="margin-top:18px" href="catalog.html?category=' + m.category + '">All ' + esc(m.categoryLabel) + ' models →</a></aside></div>' +
      '<div class="model-nav"><a href="catalog-model.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.name) + '</a>' +
      '<a href="catalog.html">Back to catalogue</a><a href="catalog-model.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.name) + ' →</a></div>';
    document.title = m.name + ' | ZEBIKE 2026 Catalogue';
  }

  function init() {
    renderCatalog();
    renderModel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
