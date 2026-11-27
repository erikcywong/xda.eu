/* ZEBIKE global partner network — illustrative directory with local filters. */
(function () {
  'use strict';

  const PARTNERS = [
    { name: 'London Retail Hub', city: 'London', market: 'United Kingdom', region: 'uk', type: 'retail', coverage: 'Greater London', languages: 'English', capabilities: 'Demo stock · Assembly · Lead referral', contact: 'london@partner.example' },
    { name: 'North West Service Point', city: 'Manchester', market: 'United Kingdom', region: 'uk', type: 'service', coverage: 'North West England', languages: 'English', capabilities: 'Warranty · Spare parts · Diagnostics', contact: 'manchester@partner.example' },
    { name: 'Dublin Mobility Partners', city: 'Dublin', market: 'Ireland', region: 'uk', type: 'retail', coverage: 'Leinster', languages: 'English', capabilities: 'Retail · Fleet enquiries', contact: 'dublin@partner.example' },
    { name: 'Berlin Regional Desk', city: 'Berlin', market: 'Germany', region: 'eu', type: 'agent', coverage: 'DACH', languages: 'German · English', capabilities: 'Dealer recruitment · Compliance', contact: 'berlin@partner.example' },
    { name: 'Amsterdam Service Hub', city: 'Amsterdam', market: 'Netherlands', region: 'eu', type: 'service', coverage: 'Randstad', languages: 'Dutch · English', capabilities: 'Warranty · Spare parts · Training', contact: 'amsterdam@partner.example' },
    { name: 'Paris Retail Collective', city: 'Paris', market: 'France', region: 'eu', type: 'retail', coverage: 'Île-de-France', languages: 'French · English', capabilities: 'Retail · Demo events', contact: 'paris@partner.example' },
    { name: 'Madrid Partner Office', city: 'Madrid', market: 'Spain', region: 'eu', type: 'agent', coverage: 'Central Spain', languages: 'Spanish · English', capabilities: 'Territory management · Dealer support', contact: 'madrid@partner.example' },
    { name: 'Milan Service Point', city: 'Milan', market: 'Italy', region: 'eu', type: 'service', coverage: 'Lombardy', languages: 'Italian · English', capabilities: 'Warranty · Diagnostics', contact: 'milan@partner.example' },
    { name: 'Gulf Regional Desk', city: 'Dubai', market: 'United Arab Emirates', region: 'mena', type: 'agent', coverage: 'GCC', languages: 'English · Arabic', capabilities: 'Distribution · Dealer onboarding', contact: 'gulf@partner.example' },
    { name: 'Riyadh Retail Partner', city: 'Riyadh', market: 'Saudi Arabia', region: 'mena', type: 'retail', coverage: 'Central Region', languages: 'Arabic · English', capabilities: 'Retail · Fleet enquiries', contact: 'riyadh@partner.example' },
    { name: 'Singapore Network Office', city: 'Singapore', market: 'Singapore', region: 'apac', type: 'agent', coverage: 'South-east Asia', languages: 'English · Mandarin', capabilities: 'Distribution · Dealer support', contact: 'singapore@partner.example' },
    { name: 'Sydney Service Hub', city: 'Sydney', market: 'Australia', region: 'apac', type: 'service', coverage: 'New South Wales', languages: 'English', capabilities: 'Warranty · Spare parts · Training', contact: 'sydney@partner.example' }
  ];

  const TYPE_LABEL = { retail: 'Retail partner', agent: 'Regional agent', service: 'Service centre' };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function card(partner) {
    return '<article class="partner-card">' +
      '<div class="flex items-center justify-between gap-8"><span class="badge">' + esc(TYPE_LABEL[partner.type]) + '</span><span class="partner-city">' + esc(partner.city) + '</span></div>' +
      '<h3>' + esc(partner.name) + '</h3>' +
      '<p class="partner-meta">' + esc(partner.market) + ' · ' + esc(partner.coverage) + '</p>' +
      '<div class="chip-row"><span class="pill">' + esc(partner.capabilities) + '</span></div>' +
      '<div class="partner-foot"><span>' + esc(partner.languages) + '</span><a class="accent" href="mailto:' + esc(partner.contact) + '">Contact →</a></div>' +
      '</article>';
  }

  function init() {
    const grid = document.querySelector('[data-network-grid]');
    if (!grid) return;
    const search = document.querySelector('[data-network-search]');
    const region = document.querySelector('[data-network-region]');
    const type = document.querySelector('[data-network-type]');
    const count = document.querySelector('[data-network-count]');

    function render() {
      const q = (search && search.value || '').trim().toLowerCase();
      const r = region && region.value || 'all';
      const t = type && type.value || 'all';
      const list = PARTNERS.filter(function (p) {
        if (r !== 'all' && p.region !== r) return false;
        if (t !== 'all' && p.type !== t) return false;
        if (!q) return true;
        return [p.name, p.city, p.market, p.coverage, p.capabilities, p.languages].join(' ').toLowerCase().indexOf(q) !== -1;
      });
      grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty-state"><h3>No partners found</h3><p>Try another region, type or search term.</p></div>';
      if (count) count.textContent = list.length + (list.length === 1 ? ' partner' : ' partners');
    }

    if (search) search.addEventListener('input', render);
    if (region) region.addEventListener('change', render);
    if (type) type.addEventListener('change', render);
    render();

    const correct = document.querySelector('[data-network-correct]');
    if (correct) {
      correct.addEventListener('click', function () {
        const target = document.querySelector('#apply textarea[name="message"]');
        if (target) {
          target.value = 'Network entry correction: ';
          setTimeout(function () { target.focus(); }, 400);
        }
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
