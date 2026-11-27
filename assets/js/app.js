/* ZEBIKE storefront — shared chrome, catalogue rendering, cart and demo checkout */
(function () {
  'use strict';

  const PRODUCTS = window.ZEBIKE_PRODUCTS || [];
  const CART_KEY = 'xdao_cart_v1';
  const CURRENCY_KEY = 'xdao_currency_v1';
  let currency = localStorage.getItem(CURRENCY_KEY) || 'GBP';

  const getBase = () => (window.location.pathname.indexOf('/products/') > -1 ? '../' : '');

  function money(value) {
    if (currency === 'EUR') return '€' + Number(value).toLocaleString('de-DE');
    return '£' + Number(value).toLocaleString('en-GB');
  }

  function priceOf(product) {
    return currency === 'EUR' ? product.priceEUR : product.price;
  }

  function oldPriceOf(product) {
    return currency === 'EUR' ? Math.round(product.oldPrice * 1.16) : product.oldPrice;
  }

  function productById(id) {
    return PRODUCTS.find(function (p) { return p.id === id; });
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function cartLines() {
    const cart = getCart();
    return Object.keys(cart).map(function (key) {
      const item = cart[key];
      const product = productById(item.id);
      if (!product) return null;
      return Object.assign({}, item, { product: product, key: key });
    }).filter(Boolean);
  }

  function cartCount() {
    return cartLines().reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function cartSubtotal() {
    return cartLines().reduce(function (sum, line) { return sum + priceOf(line.product) * line.qty; }, 0);
  }

  function findSelected(selector) {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : '';
  }

  function addToCart(id, qty, size, colour) {
    const product = productById(id);
    if (!product) return;
    const amount = Math.max(1, parseInt(qty, 10) || 1);
    const cart = getCart();
    const key = [id, size || 'standard', colour || 'graphite'].join('|');
    if (cart[key]) cart[key].qty += amount;
    else cart[key] = { id: id, qty: amount, size: size || 'Standard', colour: colour || 'Graphite' };
    saveCart(cart);
    refresh();
    toast(product.short + ' added to your basket');
  }

  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ---------- shared chrome ---------- */
  function renderChrome() {
    const base = getBase();
    const mount = document.getElementById('siteHeaderMount');
    if (mount) {
      mount.innerHTML =
        '<div class="topbar"><div class="container"><span>UK-first delivery</span><span class="sep">/</span><span>2-year warranty</span><span class="sep">/</span><span>Free UK mainland delivery</span></div></div>' +
        '<header class="site-header"><div class="container nav-wrap">' +
        '<a class="brand" href="' + base + 'index.html" aria-label="ZEBIKE home"><span class="brand-mark">z</span><span class="brand-name">ZEBIKE</span><span class="brand-sub">Electric mobility</span></a>' +
        '<nav class="main-nav" aria-label="Main navigation">' +
        '<div class="nav-item"><a class="nav-link" href="' + base + 'bikes.html">Bikes <span class="caret">▼</span></a><div class="dropdown">' +
        '<a href="' + base + 'bikes.html"><strong>All e-bikes</strong><span>Four UK EAPC models</span></a>' +
        '<a href="' + base + 'bikes.html?category=urban"><strong>Urban</strong><span>Metro One & Strada Pro</span></a>' +
        '<a href="' + base + 'bikes.html?category=trekking"><strong>Trekking</strong><span>Horizon X</span></a>' +
        '<a href="' + base + 'bikes.html?category=cargo"><strong>Cargo</strong><span>Carrier LT</span></a></div></div>' +
        '<div class="nav-item"><a class="nav-link" href="' + base + 'catalog.html">Catalogue <span class="caret">▼</span></a><div class="dropdown">' +
        '<a href="' + base + 'catalog.html"><strong>All 48 models</strong><span>Complete 2026 factory catalogue</span></a>' +
        '<a href="' + base + 'catalog.html?category=motorcycle"><strong>Motorcycles</strong><span>4 models</span></a>' +
        '<a href="' + base + 'catalog.html?category=scooter"><strong>Scooters</strong><span>28 models</span></a>' +
        '<a href="' + base + 'catalog.html?category=tricycle"><strong>Tricycles</strong><span>8 models</span></a>' +
        '<a href="' + base + 'catalog.html?category=bicycle"><strong>Bicycles</strong><span>8 models</span></a></div></div>' +
        '<div class="nav-item"><a class="nav-link" href="' + base + 'support.html#technology">Technology <span class="caret">▼</span></a><div class="dropdown">' +
        '<a href="' + base + 'support.html#eapc"><strong>UK EAPC rules</strong><span>250W · 15.5 mph assist</span></a>' +
        '<a href="' + base + 'support.html#battery"><strong>Battery & range</strong><span>Care and charging</span></a>' +
        '<a href="' + base + 'support.html#service"><strong>Service & warranty</strong><span>UK support network</span></a></div></div>' +
        '<a class="nav-link" href="' + base + 'trade.html">Trade & fleet</a>' +
        '<div class="nav-item"><a class="nav-link" href="' + base + 'network.html">Global network <span class="caret">▼</span></a><div class="dropdown">' +
        '<a href="' + base + 'network.html#directory"><strong>Partner directory</strong><span>Find retailers and agents</span></a>' +
        '<a href="' + base + 'network.html#service"><strong>Service desk</strong><span>Claims, parts and tickets</span></a>' +
        '<a href="' + base + 'network.html#resources"><strong>Resource hub</strong><span>Catalogue and guides</span></a>' +
        '<a href="' + base + 'network.html#apply"><strong>Become a partner</strong><span>Application and onboarding</span></a></div></div>' +
        '<a class="nav-link" href="' + base + 'support.html">Support</a>' +
        '</nav>' +
        '<div class="header-actions">' +
        '<div class="currency-switch" aria-label="Currency selector"><button class="currency-btn" data-currency="GBP">£ GBP</button><button class="currency-btn" data-currency="EUR">€ EUR</button></div>' +
        '<a class="cart-btn" href="' + base + 'cart.html">Basket <span class="cart-count" data-cart-count>0</span></a>' +
        '<a class="btn btn-primary btn-sm" href="' + base + 'bikes.html">Shop bikes</a>' +
        '<button class="menu-toggle" id="menuToggle" aria-label="Open menu">☰</button>' +
        '</div></div></header>';
    }

    const foot = document.getElementById('siteFooterMount');
    if (foot) {
      foot.innerHTML =
        '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
        '<div class="footer-brand"><a class="brand" href="' + base + 'index.html"><span class="brand-mark">z</span><span class="brand-name">ZEBIKE</span></a><p>Manufactured in China. Engineered for British roads. Built for the next chapter of European mobility.</p><span class="badge badge-neutral">UK EAPC · 250W · 15.5 MPH</span></div>' +
        '<div class="footer-col"><h4>Shop</h4><a href="' + base + 'bikes.html">All e-bikes</a><a href="' + base + 'catalog.html">Catalogue</a><a href="' + base + 'catalog.html?category=motorcycle">Motorcycles</a><a href="' + base + 'catalog.html?category=scooter">Scooters</a><a href="' + base + 'catalog.html?category=tricycle">Tricycles</a><a href="' + base + 'catalog.html?category=bicycle">Bicycles</a><a href="' + base + 'cart.html">Your basket</a></div>' +
        '<div class="footer-col"><h4>Company</h4><a href="' + base + 'trade.html">Trade & distribution</a><a href="' + base + 'network.html">Global network</a><a href="' + base + 'support.html#technology">Technology</a><a href="' + base + 'support.html#service">Warranty & service</a></div>' +
        '<div class="footer-col"><h4>Support</h4><a href="' + base + 'support.html#delivery">Delivery & assembly</a><a href="' + base + 'support.html#eapc">Legal requirements</a><a href="' + base + 'support.html#faq">FAQ</a><a href="' + base + 'checkout.html">Checkout demo</a></div>' +
        '</div><div class="footer-bottom"><span>© <span id="footerYear"></span> ZEBIKE Mobility. All rights reserved.</span><span>Indicative storefront concept · no live payments are processed.</span></div></div></footer>';
      const year = document.getElementById('footerYear');
      if (year) year.textContent = new Date().getFullYear();
    }

    let panel = document.getElementById('mobilePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'mobile-panel';
      panel.id = 'mobilePanel';
      panel.innerHTML =
        '<div class="mobile-panel-head"><span class="brand-name">ZEBIKE</span><button class="menu-toggle" id="menuClose" aria-label="Close menu">✕</button></div>' +
        '<a href="' + base + 'index.html">Home</a><a href="' + base + 'bikes.html">All e-bikes</a>' +
        '<a href="' + base + 'catalog.html">Catalogue</a><a href="' + base + 'catalog.html?category=motorcycle">Motorcycles</a><a href="' + base + 'catalog.html?category=scooter">Scooters</a><a href="' + base + 'catalog.html?category=tricycle">Tricycles</a><a href="' + base + 'catalog.html?category=bicycle">Bicycles</a>' +
        '<a href="' + base + 'bikes.html?category=urban">Urban</a><a href="' + base + 'bikes.html?category=trekking">Trekking</a>' +
        '<a href="' + base + 'bikes.html?category=cargo">Cargo</a><a href="' + base + 'trade.html">Trade & fleet</a>' +
        '<a href="' + base + 'network.html">Global network</a><a href="' + base + 'network.html#directory">Partner directory</a><a href="' + base + 'network.html#service">Service desk</a>' +
        '<a href="' + base + 'support.html">Support</a><a href="' + base + 'cart.html">Basket</a>' +
        '<a class="btn btn-primary btn-block" href="' + base + 'bikes.html">Shop bikes</a>';
      document.body.appendChild(panel);
    }

    const toggle = document.getElementById('menuToggle');
    const close = document.getElementById('menuClose');
    if (toggle) toggle.addEventListener('click', function () { panel.classList.add('open'); document.body.classList.add('menu-open'); });
    if (close) close.addEventListener('click', function () { panel.classList.remove('open'); document.body.classList.remove('menu-open'); });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { panel.classList.remove('open'); document.body.classList.remove('menu-open'); });
    });
  }

  /* ---------- product rendering ---------- */
  function productCard(product) {
    const price = priceOf(product);
    const old = oldPriceOf(product);
    return '<article class="product-card" data-product-id="' + product.id + '">' +
      '<div class="product-media"><img src="' + getBase() + (product.photo || product.image) + '" alt="' + product.name + '" loading="lazy"><span class="badge">' + product.badge + '</span></div>' +
      '<div class="product-body"><span class="product-kicker">' + product.series + ' · ' + product.categoryLabel + '</span>' +
      '<h3>' + product.name + '</h3><p>' + product.tagline + '</p>' +
      '<div class="spec-mini"><div><span>Motor</span><strong>' + product.specs[0][1].split('·')[0].trim() + '</strong></div>' +
      '<div><span>Battery</span><strong>' + product.specs[1][1].split('·')[1].trim() + '</strong></div>' +
      '<div><span>Range</span><strong>' + product.specs[2][1].replace('Up to ', '') + '</strong></div></div>' +
      '<div class="product-foot"><div><span class="price" data-price-id="' + product.id + '">' + money(price) + '</span>' +
      '<span class="price-old" data-oldprice-id="' + product.id + '">' + money(old) + '</span><span class="price-note">Indicative UK retail price</span></div>' +
      '<div class="flex gap-8"><a class="btn btn-sm" href="' + getBase() + 'products/' + product.id + '.html">View</a>' +
      '<button class="btn btn-primary btn-sm" data-add-to-cart data-product-id="' + product.id + '" data-qty="1">Add</button></div></div></div></article>';
  }

  function renderStaticGrids() {
    document.querySelectorAll('[data-product-grid]:not([data-filterable])').forEach(function (grid) {
      const limit = parseInt(grid.getAttribute('data-limit'), 10) || PRODUCTS.length;
      const category = grid.getAttribute('data-category');
      let list = PRODUCTS.slice();
      if (category && category !== 'all') list = list.filter(function (p) { return p.category === category; });
      grid.innerHTML = list.slice(0, limit).map(productCard).join('');
    });
  }

  function initFilters() {
    const grid = document.querySelector('[data-product-grid][data-filterable]');
    if (!grid) return;
    const search = document.getElementById('productSearch');
    const sort = document.getElementById('productSort');
    const buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    let active = 'all';

    const params = new URLSearchParams(window.location.search);
    const initial = params.get('category');
    if (initial && ZEBIKE_CATEGORY_LABELS[initial]) active = initial;

    function render() {
      const term = (search && search.value || '').toLowerCase().trim();
      let list = PRODUCTS.filter(function (p) {
        const categoryMatch = active === 'all' || p.category === active;
        const text = (p.name + ' ' + p.tagline + ' ' + p.categoryLabel + ' ' + p.highlights.join(' ')).toLowerCase();
        return categoryMatch && (!term || text.indexOf(term) > -1);
      });
      if (sort && sort.value === 'low') list.sort(function (a, b) { return priceOf(a) - priceOf(b); });
      if (sort && sort.value === 'high') list.sort(function (a, b) { return priceOf(b) - priceOf(a); });
      if (sort && sort.value === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      grid.innerHTML = list.length ? list.map(productCard).join('') :
        '<div class="empty-state" style="grid-column:1/-1"><h3>No bikes found</h3><p>Try another category or search term.</p></div>';
      buttons.forEach(function (btn) { btn.classList.toggle('active', btn.getAttribute('data-category') === active); });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () { active = btn.getAttribute('data-category'); render(); });
    });
    if (search) search.addEventListener('input', render);
    if (sort) sort.addEventListener('change', render);
    render();
  }

  function renderDetail() {
    const root = document.getElementById('productDetailRoot');
    if (!root) return;
    const product = productById(root.getAttribute('data-product-id'));
    if (!product) { root.innerHTML = '<div class="empty-state">Product not found.</div>'; return; }

    const specs = product.specs.map(function (row) { return '<tr><th>' + row[0] + '</th><td>' + row[1] + '</td></tr>'; }).join('');
    const highlights = product.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join('');

    root.innerHTML =
      '<div class="breadcrumb"><a href="' + getBase() + 'index.html">Home</a><span>/</span><a href="' + getBase() + 'bikes.html">Bikes</a><span>/</span><span>' + product.short + '</span></div>' +
      '<div class="product-detail"><div><div class="detail-media"><img id="detailMainImage" src="' + getBase() + (product.photo || product.image) + '" alt="' + product.name + '"></div>' +
      '<div class="detail-thumbs"><button class="active" type="button" data-gallery-src="' + getBase() + (product.photo || product.image) + '">01 / Original photo</button>' +
      '<button type="button" data-gallery-src="' + getBase() + product.image + '">02 / Technical view</button>' +
      '<button type="button" data-scroll-to="specSection">03 / Specifications</button></div></div>' +
      '<div class="detail-info"><span class="eyebrow">' + product.series + '</span><h1>' + product.name + '</h1><p class="lead">' + product.description + '</p>' +
      '<div class="detail-price"><span class="price" data-price-id="' + product.id + '">' + money(priceOf(product)) + '</span><span class="price-old" data-oldprice-id="' + product.id + '">' + money(oldPriceOf(product)) + '</span><span class="badge">' + product.stock + '</span></div>' +
      '<div class="option-group" data-product-id="' + product.id + '"><span>Frame size</span><div class="option-row">' +
      '<button class="option-chip active" data-option="size">S</button><button class="option-chip" data-option="size">M</button><button class="option-chip" data-option="size">L</button></div></div>' +
      '<div class="option-group" data-product-id="' + product.id + '"><span>Finish</span><div class="option-row">' +
      '<button class="option-chip active" data-option="colour">Graphite</button><button class="option-chip" data-option="colour">Emerald</button><button class="option-chip" data-option="colour">Silver</button></div></div>' +
      '<div class="option-group" data-product-id="' + product.id + '"><span>Quantity</span><div class="qty-row"><div class="qty-control">' +
      '<button type="button" data-qty-change="-1">−</button><input data-qty value="1" min="1" max="20"><button type="button" data-qty-change="1">+</button></div>' +
      '<span class="muted" style="font-size:12px">Free UK mainland delivery</span></div></div>' +
      '<div class="detail-actions"><button class="btn btn-primary btn-lg" data-add-to-cart data-product-id="' + product.id + '">Add to basket · ' + money(priceOf(product)) + '</button>' +
      '<a class="btn btn-lg" href="' + getBase() + 'trade.html">Fleet pricing</a></div>' +
      '<div class="detail-assurance"><div><strong>2-year warranty</strong>Frame, motor, battery & controller</div><div><strong>30-day returns</strong>Unused, original packaging</div><div><strong>UK EAPC legal</strong>250W · 15.5 mph assist</div><div><strong>Assembly guide</strong>85% assembled on arrival</div></div>' +
      '</div></div>' +
      '<div class="section" id="specSection"><div class="grid grid-2"><div><span class="eyebrow">Technical specification</span><h2 style="margin-top:14px">Built to the spec. No shortcuts.</h2><p style="margin-top:12px">Best for ' + product.bestFor.toLowerCase() + '. All figures taken from the ZEBIKE UK specification sheet.</p></div>' +
      '<div class="form-card"><table class="spec-table">' + specs + '</table></div></div></div>' +
      '<div class="section section-alt" id="techSection"><div class="split"><div><span class="eyebrow">Why ZEBIKE</span><h2 style="margin-top:14px">China-manufactured. UK-calibrated.</h2><p class="lead" style="margin-top:14px">Non-folding architectures, IP67 harnesses and UK 3-pin charging come standard across the range.</p><div class="feature-list">' + highlights.replace(/<li>/g, '<div class="feature-item"><span class="feature-icon">✓</span><div><strong>').replace(/<\/li>/g, '</strong></div></div>') + '</div></div>' +
      '<div class="visual-panel"><img src="' + getBase() + product.image + '" alt="' + product.name + ' technical view"><div class="visual-panel-grid"><div class="mini-stat"><strong>0%</strong><span>Anti-dumping code 8100</span></div><div class="mini-stat"><strong>IP67</strong><span>Waterproof harness</span></div></div></div></div></div>';
  }

  /* ---------- cart, checkout ---------- */
  function renderCartPage() {
    const root = document.getElementById('cartRoot');
    if (!root) return;
    const lines = cartLines();
    if (!lines.length) {
      root.innerHTML = '<div class="empty-state"><h3>Your basket is empty</h3><p>Explore the four-model ZEBIKE UK lineup and add your first bike.</p><a class="btn btn-primary" style="margin-top:20px" href="' + getBase() + 'bikes.html">Shop e-bikes</a></div>';
      return;
    }
    const items = lines.map(function (line) {
      return '<div class="cart-item"><img src="' + getBase() + line.product.image + '" alt="' + line.product.name + '"><div><h3>' + line.product.name + '</h3><p>' + line.size + ' · ' + line.colour + ' · ' + line.product.stock + '</p><button class="link-btn" data-remove-cart="' + line.key + '">Remove</button></div>' +
        '<div class="cart-item-actions"><div class="qty-control"><button type="button" data-cart-qty="' + line.key + '" data-delta="-1">−</button><input value="' + line.qty + '" readonly><button type="button" data-cart-qty="' + line.key + '" data-delta="1">+</button></div><strong class="accent">' + money(priceOf(line.product) * line.qty) + '</strong></div></div>';
    }).join('');

    root.innerHTML = '<div class="cart-layout"><div><div class="section-head"><div><span class="eyebrow">Your selection</span><h2 style="margin-top:12px">Basket</h2></div><span class="pill">' + cartCount() + ' item(s)</span></div><div class="cart-list">' + items + '</div><p class="form-note">Prices are indicative retail placeholders. Final order confirmation and payment are not enabled in this concept.</p></div>' +
      '<aside class="summary-card"><h3>Order summary</h3><div class="summary-row"><span>Subtotal</span><strong>' + money(cartSubtotal()) + '</strong></div><div class="summary-row"><span>UK mainland delivery</span><strong>Free</strong></div><div class="summary-row"><span>Assembly</span><strong>85% pre-assembled</strong></div><div class="summary-total"><span>Total</span><strong>' + money(cartSubtotal()) + '</strong></div><a class="btn btn-primary btn-block btn-lg" href="' + getBase() + 'checkout.html">Continue to checkout</a><a class="btn btn-ghost btn-block" href="' + getBase() + 'bikes.html">Continue shopping</a></aside></div>';
  }

  function renderCheckoutSummary() {
    const root = document.getElementById('checkoutSummary');
    if (!root) return;
    const lines = cartLines();
    if (!lines.length) {
      root.innerHTML = '<aside class="summary-card"><h3>Order summary</h3><p>Your basket is empty.</p><a class="btn btn-primary btn-block" href="' + getBase() + 'bikes.html">Shop bikes</a></aside>';
      return;
    }
    const rows = lines.map(function (line) {
      return '<div class="summary-row"><span>' + line.product.short + ' × ' + line.qty + '</span><strong>' + money(priceOf(line.product) * line.qty) + '</strong></div>';
    }).join('');
    root.innerHTML = '<aside class="summary-card"><h3>Order summary</h3>' + rows + '<div class="summary-row"><span>Delivery</span><strong>Free</strong></div><div class="summary-total"><span>Total</span><strong>' + money(cartSubtotal()) + '</strong></div><p class="form-note">Demo checkout only. No payment will be taken.</p></aside>';
  }

  function initCheckout() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!cartCount()) { toast('Your basket is empty'); return; }
      const ref = 'ZEBIKE-UK-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const modal = document.getElementById('confirmModal');
      const code = document.getElementById('confirmRef');
      if (code) code.textContent = ref;
      if (modal) modal.classList.remove('hidden');
      saveCart({});
      refresh();
      const root = document.getElementById('checkoutSummary');
      if (root) root.innerHTML = '<aside class="summary-card"><h3>Order summary</h3><p>Your basket is empty.</p></aside>';
    });
    const close = document.getElementById('confirmClose');
    if (close) close.addEventListener('click', function () {
      const modal = document.getElementById('confirmModal');
      if (modal) modal.classList.add('hidden');
      window.location.href = getBase() + 'index.html';
    });
  }

  /* ---------- trade calculator & forms ---------- */
  function initTradeCalculator() {
    const root = document.getElementById('tradeCalc');
    if (!root) return;
    const inputs = Array.prototype.slice.call(root.querySelectorAll('[data-calc-id]'));
    const fob = document.getElementById('calcFob');
    const ddp = document.getElementById('calcDdp');
    const units = document.getElementById('calcUnits');
    const bar = document.getElementById('calcFillBar');
    const label = document.getElementById('calcFillLabel');

    function update() {
      let totalFob = 0, totalDdp = 0, totalUnits = 0, totalCbm = 0;
      inputs.forEach(function (input) {
        const product = productById(input.getAttribute('data-calc-id'));
        const qty = Math.max(0, parseInt(input.value, 10) || 0);
        if (!product) return;
        totalFob += qty * product.fobUSD;
        totalDdp += qty * product.ddpGBP;
        totalUnits += qty;
        totalCbm += qty * product.cbm;
      });
      if (fob) fob.textContent = '$' + totalFob.toLocaleString('en-US');
      if (ddp) ddp.textContent = '£' + totalDdp.toLocaleString('en-GB');
      if (units) units.textContent = totalUnits.toLocaleString('en-GB') + ' units';
      const pct = Math.min(100, Math.round(totalCbm / 70 * 100));
      if (bar) bar.style.width = pct + '%';
      if (label) label.textContent = pct + '% of 40\' HQ · ' + totalCbm.toFixed(1) + ' CBM';
    }
    inputs.forEach(function (input) { input.addEventListener('input', update); });
    update();
  }

  function initFormsAndFAQ() {
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () { btn.parentElement.classList.toggle('open'); });
    });
    document.querySelectorAll('[data-demo-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        form.reset();
        toast('Enquiry received — this is a demo form, no message was sent.');
      });
    });
  }

  /* ---------- events ---------- */
  function initInteractions() {
    document.addEventListener('click', function (event) {
      const add = event.target.closest('[data-add-to-cart]');
      if (add) {
        const scope = add.closest('.detail-info, .product-card') || document;
        const input = scope.querySelector('[data-qty]');
        const sizeEl = scope.querySelector('[data-option="size"].active');
        const colourEl = scope.querySelector('[data-option="colour"].active');
        addToCart(add.getAttribute('data-product-id'), input ? input.value : 1,
          sizeEl ? sizeEl.textContent.trim() : 'Standard',
          colourEl ? colourEl.textContent.trim() : 'Graphite');
        return;
      }
      const step = event.target.closest('[data-qty-change]');
      if (step) {
        const input = step.parentElement.querySelector('input');
        if (input) input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(step.getAttribute('data-qty-change'), 10));
        return;
      }
      const chip = event.target.closest('.option-chip');
      if (chip) {
        chip.parentElement.querySelectorAll('.option-chip').forEach(function (el) { el.classList.remove('active'); });
        chip.classList.add('active');
        return;
      }
      const remove = event.target.closest('[data-remove-cart]');
      if (remove) {
        const cart = getCart();
        delete cart[remove.getAttribute('data-remove-cart')];
        saveCart(cart); refresh(); toast('Item removed from basket'); return;
      }
      const cartStep = event.target.closest('[data-cart-qty]');
      if (cartStep) {
        const cart = getCart();
        const key = cartStep.getAttribute('data-cart-qty');
        if (cart[key]) {
          cart[key].qty += parseInt(cartStep.getAttribute('data-delta'), 10);
          if (cart[key].qty < 1) delete cart[key];
          saveCart(cart); refresh();
        }
        return;
      }
      const galleryBtn = event.target.closest('[data-gallery-src]');
      if (galleryBtn) {
        const main = document.getElementById('detailMainImage');
        if (main) main.src = galleryBtn.getAttribute('data-gallery-src');
        galleryBtn.parentElement.querySelectorAll('[data-gallery-src]').forEach(function (btn) { btn.classList.toggle('active', btn === galleryBtn); });
        return;
      }
      const scrollBtn = event.target.closest('[data-scroll-to]');
      if (scrollBtn) {
        const target = document.getElementById(scrollBtn.getAttribute('data-scroll-to'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const currBtn = event.target.closest('[data-currency]');
      if (currBtn) {
        currency = currBtn.getAttribute('data-currency');
        localStorage.setItem(CURRENCY_KEY, currency);
        refresh();
        toast(currency === 'EUR' ? 'Prices shown in EUR (indicative)' : 'Prices shown in GBP');
      }
    });
  }

  function updateCartUI() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = cartCount(); });
    document.querySelectorAll('[data-currency]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-currency') === currency);
    });
    document.querySelectorAll('[data-price-id]').forEach(function (el) {
      const product = productById(el.getAttribute('data-price-id'));
      if (product) el.textContent = money(priceOf(product));
    });
    document.querySelectorAll('[data-oldprice-id]').forEach(function (el) {
      const product = productById(el.getAttribute('data-oldprice-id'));
      if (product) el.textContent = money(oldPriceOf(product));
    });
    document.querySelectorAll('[data-add-to-cart]').forEach(function (el) {
      const product = productById(el.getAttribute('data-product-id'));
      if (product && el.classList.contains('btn-lg')) el.textContent = 'Add to basket · ' + money(priceOf(product));
    });
  }

  function refresh() {
    updateCartUI();
    renderStaticGrids();
    renderDetail();
    renderCartPage();
    renderCheckoutSummary();
  }

  function init() {
    renderChrome();
    initInteractions();
    initFilters();
    initCheckout();
    initTradeCalculator();
    initFormsAndFAQ();
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
