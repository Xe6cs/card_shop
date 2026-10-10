/* صفحة الأقسام ونتائج البحث: فلاتر متخصصة بالمنتجات الرقمية + ترتيب + طريقة العرض */
(function () {
  'use strict';
  const { $, $$, esc, icon, skus, brands, regions, units, catById, visibleCats, money } = CS;
  const D = CS.data;
  const PAGE = 24;
  const PRICE_BUCKETS = [
    { id: '0-10000', label: 'أقل من 10,000 د.ع', min: 0, max: 9999 },
    { id: '10000-25000', label: '10,000 – 25,000 د.ع', min: 10000, max: 25000 },
    { id: '25000-50000', label: '25,000 – 50,000 د.ع', min: 25001, max: 50000 },
    { id: '50000-100000', label: '50,000 – 100,000 د.ع', min: 50001, max: 100000 },
    { id: '100000-', label: 'أكثر من 100,000 د.ع', min: 100001, max: Infinity }
  ];
  const SORTS = { featured: 'المقترح', 'price-asc': 'السعر: من الأقل', 'price-desc': 'السعر: من الأعلى' };
  const FACET_LABEL = { cat: 'القسم', brand: 'العلامة', region: 'المنطقة', price: 'السعر', value: 'القيمة', delivery: 'التسليم', stock: 'التوفر' };

  /* ---------- State (مصدره الرابط، لتعمل المشاركة وزر الرجوع) ---------- */
  const list = (v) => (v ? v.split(',').filter(Boolean) : []);
  const p = CS.params();
  const state = {
    q: (p.get('q') || '').trim(),
    cat: p.get('cat') || '',
    brand: list(p.get('brand')).filter((b) => brands[b]),
    region: list(p.get('region')).filter((r) => regions[r]),
    price: list(p.get('price')).filter((id) => PRICE_BUCKETS.some((b) => b.id === id)),
    value: list(p.get('value')),
    delivery: list(p.get('delivery')),
    stock: p.get('stock') === '1',
    sort: SORTS[p.get('sort')] ? p.get('sort') : 'featured',
    view: p.get('view') === 'list' ? 'list' : 'grid',
    shown: PAGE
  };
  if (state.cat && !visibleCats.some((c) => c.id === state.cat)) state.cat = '';

  let searchCache = null;
  const search = () => {
    if (!state.q) return null;
    if (!searchCache || searchCache.q !== state.q) searchCache = Object.assign({ q: state.q }, CS.search(state.q));
    return searchCache;
  };
  const base = () => (state.q ? search().results : skus);
  const bucket = (id) => PRICE_BUCKETS.find((b) => b.id === id);
  const pred = {
    cat: (s) => !state.cat || s.fam.category === state.cat,
    brand: (s) => !state.brand.length || state.brand.includes(s.fam.brand),
    region: (s) => !state.region.length || state.region.includes(s.fam.region),
    price: (s) => !state.price.length || state.price.some((id) => { const b = bucket(id); return s.price >= b.min && s.price <= b.max; }),
    value: (s) => !state.value.length || state.value.includes(s.key),
    delivery: (s) => !state.delivery.length || state.delivery.includes(s.fam.delivery),
    stock: (s) => !state.stock || s.available
  };
  const filtered = (except) => base().filter((s) => Object.keys(pred).every((k) => k === except || pred[k](s)));
  const uniq = (arr) => Array.from(new Set(arr));

  // فلتر القيمة يظهر فقط عندما تكون النتائج بوحدة واحدة (مثلاً USD فقط)، كي تكون القيم قابلة للمقارنة
  function valueFacet() {
    const set = filtered('value');
    const unitsInSet = uniq(set.map((s) => s.fam.unit));
    if (unitsInSet.length !== 1 || set.length < 2) return null;
    const unit = unitsInSet[0];
    const seen = new Map();
    set.forEach((s) => { if (!seen.has(s.key)) seen.set(s.key, s); });
    const opts = Array.from(seen.values()).sort((a, b) => (a.v ?? 1e12) - (b.v ?? 1e12));
    return opts.length > 1 ? { unit, opts, set } : null;
  }

  function sortList(arr) {
    const a = arr.slice();
    if (state.sort === 'price-asc') a.sort((x, y) => x.price - y.price);
    else if (state.sort === 'price-desc') a.sort((x, y) => y.price - x.price);
    else if (!state.q) a.sort((x, y) => (x.pop || 999) - (y.pop || 999) || x.order - y.order);
    // مع البحث يبقى ترتيب الصلة كما هو. المنتجات غير المتوفرة تأتي في النهاية دائماً
    return a.sort((x, y) => Number(y.available) - Number(x.available));
  }

  /* ---------- Facets ---------- */
  function optHTML(scope, type, f, val, label, n, checked) {
    return `<label class="opt${n === 0 && !checked ? ' is-zero' : ''}">
        <input type="${type}" name="${scope}-${f}" data-f="${f}" value="${esc(val)}"${checked ? ' checked' : ''}>
        <span>${label}</span><span class="n">${n}</span></label>`;
  }
  function facetsHTML(scope) {
    let h = '';
    const catBase = filtered('cat');
    h += `<div class="facet"><h3>القسم</h3><div class="facet-opts" role="radiogroup" aria-label="القسم">
      ${optHTML(scope, 'radio', 'cat', '', 'كل الأقسام', catBase.length, !state.cat)}
      ${visibleCats.map((c) => optHTML(scope, 'radio', 'cat', c.id, esc(c.name), catBase.filter((s) => s.fam.category === c.id).length, state.cat === c.id)).join('')}
    </div></div>`;

    const bBase = filtered('brand');
    const brandIds = uniq(base().filter(pred.cat).map((s) => s.fam.brand));
    if (brandIds.length > 1) {
      h += `<div class="facet"><h3>العلامة التجارية</h3><div class="facet-opts">
        ${brandIds.map((b) => optHTML(scope, 'checkbox', 'brand', b, `${esc(brands[b].ar)} <span class="muted ltr small">${esc(brands[b].name)}</span>`, bBase.filter((s) => s.fam.brand === b).length, state.brand.includes(b))).join('')}
      </div></div>`;
    }

    const rBase = filtered('region');
    const regionIds = uniq(base().filter((s) => pred.cat(s) && pred.brand(s)).map((s) => s.fam.region));
    if (regionIds.length > 1) {
      h += `<div class="facet"><h3>بلد أو منطقة الحساب</h3><div class="facet-opts">
        ${regionIds.map((r) => optHTML(scope, 'checkbox', 'region', r, esc(regions[r].name), rBase.filter((s) => s.fam.region === r).length, state.region.includes(r))).join('')}
      </div></div>`;
    }

    const vf = valueFacet();
    if (vf) {
      h += `<div class="facet"><h3>قيمة البطاقة <span class="muted small">(${esc(units[vf.unit].name)})</span></h3><div class="facet-chips">
        ${vf.opts.map((s) => `<button type="button" class="chip" data-f="value" data-v="${esc(s.key)}" aria-pressed="${state.value.includes(s.key)}">${esc(CS.chipText(s))}</button>`).join('')}
      </div></div>`;
    } else if (state.value.length) {
      state.value = [];
    }

    const pBase = filtered('price');
    h += `<div class="facet"><h3>السعر</h3><div class="facet-opts">
      ${PRICE_BUCKETS.map((b) => optHTML(scope, 'checkbox', 'price', b.id, b.label, pBase.filter((s) => s.price >= b.min && s.price <= b.max).length, state.price.includes(b.id))).join('')}
    </div></div>`;

    const dBase = filtered('delivery');
    const dIds = uniq(base().map((s) => s.fam.delivery));
    if (dIds.length > 1) {
      h += `<div class="facet"><h3>نوع التسليم</h3><div class="facet-opts">
        ${dIds.map((d) => optHTML(scope, 'checkbox', 'delivery', d, esc(D.deliveryTypes[d].name), dBase.filter((s) => s.fam.delivery === d).length, state.delivery.includes(d))).join('')}
      </div></div>`;
    }

    const outCount = filtered('stock').filter((s) => !s.available).length;
    h += `<div class="facet"><label class="toggle-row"><span>المتوفر فقط${outCount ? ` <span class="muted small">(إخفاء ${outCount} غير متوفر)</span>` : ''}</span>
      <span class="switch"><input type="checkbox" role="switch" data-f="stock"${state.stock ? ' checked' : ''}><span></span></span></label></div>`;
    return h;
  }

  function activeFilters() {
    const items = [];
    if (state.q) items.push(['q', state.q, `بحث: «${esc(state.q)}»`]);
    if (state.cat) items.push(['cat', state.cat, esc(catById[state.cat].name)]);
    state.brand.forEach((b) => items.push(['brand', b, esc(brands[b].ar)]));
    state.region.forEach((r) => items.push(['region', r, esc(regions[r].name)]));
    state.value.forEach((v) => { const s = skus.find((x) => x.key === v && pred.cat(x) && pred.brand(x)); items.push(['value', v, s ? esc(CS.chipText(s)) + (s.fam.unit !== 'IQD' ? ' ' + s.fam.unit : '') : esc(v)]); });
    state.price.forEach((id) => items.push(['price', id, esc(bucket(id).label)]));
    state.delivery.forEach((d) => items.push(['delivery', d, esc(D.deliveryTypes[d].name)]));
    if (state.stock) items.push(['stock', '1', 'المتوفر فقط']);
    return items;
  }

  /* ---------- Rendering ---------- */
  function headTitle() {
    if (state.q) return `نتائج البحث عن «${state.q}»`;
    if (state.cat) return catById[state.cat].name;
    if (state.brand.length === 1) return `بطاقات ${brands[state.brand[0]].ar}`;
    return 'كل المنتجات';
  }
  function renderHead() {
    const title = headTitle();
    const cat = state.cat ? catById[state.cat] : null;
    $('#crumbs').innerHTML = `<ol><li><a href="index.html">الرئيسية</a></li>${cat || state.q || state.brand.length === 1 ? '<li><a href="catalog.html">كل المنتجات</a></li>' : ''}<li aria-current="page">${esc(title)}</li></ol>`;
    const desc = state.q ? 'نبحث بالعربية والإنكليزية، مثل «بلايستيشن» أو «PlayStation».'
      : cat ? cat.desc : 'كل البطاقات والخدمات الرقمية المتوفرة، مع منطقة كل بطاقة وسعرها بالدينار العراقي.';
    const pillBrands = uniq(base().filter(pred.cat).map((s) => s.fam.brand));
    $('#page-head').innerHTML = `<h1>${esc(title)}</h1><p>${esc(desc)}</p>
      ${pillBrands.length > 1 ? `<div class="brand-pills" role="group" aria-label="اختيار سريع للعلامة">
        ${pillBrands.map((b) => `<button type="button" class="chip" data-pill="${b}" aria-pressed="${state.brand.includes(b)}">${esc(brands[b].ar)}</button>`).join('')}
      </div>` : ''}`;
    CS.setMeta({ title: `${title} | Card Shop`, description: desc, canonical: state.cat ? `catalog.html?cat=${state.cat}` : 'catalog.html' });
    let robots = $('meta[name="robots"]');
    if (state.q) {
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
      robots.content = 'noindex,follow';
    } else if (robots) robots.remove();
  }

  function renderToolbar() {
    $('#toolbar').innerHTML = `<p class="count" id="count"></p>
      <button class="btn btn-outline filter-btn" type="button" id="open-filters" aria-haspopup="dialog" aria-controls="filters-sheet">${icon('filter')}<span>تصفية</span><span id="filter-n"></span></button>
      <label class="select"><span class="muted">ترتيب حسب</span>
        <select id="sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}"${state.sort === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
      </label>
      <div class="seg" role="group" aria-label="طريقة العرض">
        <button type="button" data-view="grid" aria-pressed="${state.view === 'grid'}" aria-label="عرض شبكي" title="عرض شبكي">${icon('grid')}</button>
        <button type="button" data-view="list" aria-pressed="${state.view === 'list'}" aria-label="عرض قائمة" title="عرض قائمة">${icon('list')}</button>
      </div>`;
    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; state.shown = PAGE; update(); });
    $$('[data-view]').forEach((b) => b.addEventListener('click', () => {
      state.view = b.dataset.view;
      $$('[data-view]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      update();
    }));
    $('#open-filters').addEventListener('click', () => $('#filters-sheet').showModal());
  }

  function renderResults() {
    const all = sortList(filtered());
    const shown = all.slice(0, state.shown);
    const af = activeFilters();
    const nFilters = af.filter(([f]) => f !== 'q').length;

    $('#count').textContent = all.length ? CS.plural(all.length, CS.W.product) : 'لا توجد نتائج';
    $('#filter-n').textContent = nFilters ? `(${nFilters})` : '';
    $('#live-count').textContent = all.length ? CS.plural(all.length, CS.W.result) : 'لا توجد نتائج';
    $('#sheet-apply').textContent = all.length ? `عرض ${CS.plural(all.length, CS.W.result)}` : 'لا توجد نتائج';

    const afEl = $('#active-filters');
    afEl.hidden = !af.length;
    afEl.innerHTML = af.map(([f, v, label]) => `<button type="button" class="chip chip-x" data-remove="${f}" data-v="${esc(v)}" aria-label="إزالة ${FACET_LABEL[f] || 'البحث'}: ${label.replace(/<[^>]+>/g, '')}">${label} ${icon('x')}</button>`).join('')
      + (af.length > 1 ? '<button type="button" class="clear" data-clear-all>مسح الكل</button>' : '');

    const res = $('#results');
    if (!all.length) {
      const sr = search();
      if (sr && sr.notOffered) {
        res.innerHTML = `<div class="empty"><div class="ico">${icon('info', 'i-lg')}</div>
          <h2>بطاقات ${esc(sr.notOffered.name)} غير متوفرة حالياً</h2>
          <p>لا نعرض في Card Shop إلا المنتجات المتاحة للشراء فعلياً. يمكنك طلب توفيرها وسنبلغ الفريق.</p>
          <div class="actions"><a class="btn btn-primary" href="${CS.waUrl(`مرحباً، أرغب بشراء بطاقات ${sr.notOffered.name}. هل يمكن توفيرها؟`)}" target="_blank" rel="noopener">${icon('whatsapp')} اطلب توفيرها</a>
          <a class="btn btn-outline" href="catalog.html">تصفح المنتجات المتوفرة</a></div></div>`;
      } else {
        res.innerHTML = `<div class="empty"><div class="ico">${icon('search', 'i-lg')}</div>
          <h2>لا توجد منتجات مطابقة</h2>
          <p>${state.q ? `لم نجد نتائج لـ «${esc(state.q)}» مع الفلاتر الحالية. جرّب اسم العلامة فقط مثل «زين» أو «PlayStation».` : 'لا توجد منتجات تطابق كل الفلاتر المختارة. أزل بعضها لعرض نتائج أكثر.'}</p>
          <div class="actions"><button type="button" class="btn btn-primary" data-clear-all>مسح الفلاتر</button><a class="btn btn-outline" href="index.html">الرئيسية</a></div></div>`;
      }
    } else {
      res.innerHTML = `<div class="p-grid${state.view === 'list' ? ' is-list' : ''}">${shown.map(CS.cardHTML).join('')}</div>
        ${all.length > shown.length ? `<div class="load-more">
          <span class="muted small">تعرض <span class="num">${shown.length}</span> من <span class="num">${all.length}</span></span>
          <span class="bar" aria-hidden="true"><span style="width:${Math.round((shown.length / all.length) * 100)}%"></span></span>
          <button type="button" class="btn btn-outline" id="more">عرض المزيد</button></div>` : ''}`;
      const more = $('#more');
      if (more) more.addEventListener('click', () => {
        const firstNew = state.shown;
        state.shown += PAGE;
        renderResults();
        const link = $$('.p-card h3 a', res)[firstNew];
        if (link) link.focus();
      });
    }
    return all;
  }

  function renderFacets() {
    const active = document.activeElement;
    const key = active && active.dataset && active.dataset.f ? { f: active.dataset.f, v: active.value || active.dataset.v, inSheet: !!active.closest('#filters-mobile') } : null;
    $('#filters-desktop').innerHTML = `<h2 class="sr-only">تصفية النتائج</h2>${facetsHTML('d')}`;
    $('#filters-mobile').innerHTML = facetsHTML('m');
    if (key) {
      const scope = key.inSheet ? '#filters-mobile' : '#filters-desktop';
      const el = $$(`${scope} [data-f="${key.f}"]`).find((x) => (x.value || x.dataset.v || '') === (key.v || ''));
      if (el) el.focus();
    }
  }

  function syncUrl() {
    const q = new URLSearchParams();
    if (state.q) q.set('q', state.q);
    if (state.cat) q.set('cat', state.cat);
    ['brand', 'region', 'value', 'price', 'delivery'].forEach((k) => { if (state[k].length) q.set(k, state[k].join(',')); });
    if (state.stock) q.set('stock', '1');
    if (state.sort !== 'featured') q.set('sort', state.sort);
    if (state.view !== 'grid') q.set('view', state.view);
    const qs = q.toString();
    history.replaceState(null, '', 'catalog.html' + (qs ? '?' + qs : ''));
  }

  function update() {
    renderHead();
    renderFacets();
    const all = renderResults();
    syncUrl();
    const listKey = `${state.q}|${state.cat}|${state.brand.join()}`;
    CS.trackOnce('list:' + listKey, state.q ? 'view_search_results' : 'view_item_list', {
      search_term: state.q || undefined, item_list_name: headTitle(), results: all.length,
      ecommerce: { items: all.slice(0, 12).map(CS.gaItem) }
    });
  }

  /* ---------- Events ---------- */
  function onFacetChange(e) {
    const t = e.target, f = t.dataset.f;
    if (!f || f === 'value') return;
    if (f === 'cat') { state.cat = t.value; state.brand = []; state.region = []; state.value = []; }
    else if (f === 'stock') state.stock = t.checked;
    else {
      const arr = state[f];
      const i = arr.indexOf(t.value);
      if (t.checked && i < 0) arr.push(t.value);
      if (!t.checked && i >= 0) arr.splice(i, 1);
      if (f === 'brand') state.value = [];
    }
    state.shown = PAGE;
    update();
  }
  function onFacetClick(e) {
    const chip = e.target.closest('[data-f="value"]');
    if (!chip) return;
    const v = chip.dataset.v, i = state.value.indexOf(v);
    if (i >= 0) state.value.splice(i, 1); else state.value.push(v);
    state.shown = PAGE;
    update();
  }
  function clearAll() {
    Object.assign(state, { q: '', cat: '', brand: [], region: [], price: [], value: [], delivery: [], stock: false, shown: PAGE });
    $$('#site-header input[type="search"]').forEach((i) => { i.value = ''; });
    update();
  }
  ['#filters-desktop', '#filters-mobile'].forEach((sel) => {
    $(sel).addEventListener('change', onFacetChange);
    $(sel).addEventListener('click', onFacetClick);
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear-all]')) { clearAll(); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      const f = rm.dataset.remove, v = rm.dataset.v;
      if (f === 'q') { state.q = ''; $$('#site-header input[type="search"]').forEach((i) => { i.value = ''; }); }
      else if (f === 'cat') state.cat = '';
      else if (f === 'stock') state.stock = false;
      else state[f] = state[f].filter((x) => x !== v);
      state.shown = PAGE;
      update();
      $('#results-title').focus();
      return;
    }
    const pill = e.target.closest('[data-pill]');
    if (pill) {
      const b = pill.dataset.pill, i = state.brand.indexOf(b);
      if (i >= 0) state.brand.splice(i, 1); else state.brand.push(b);
      state.value = []; state.shown = PAGE;
      update();
      const again = $(`[data-pill="${b}"]`);
      if (again) again.focus();
    }
  });
  const sheet = $('#filters-sheet');
  $$('[data-close-sheet]', sheet).forEach((b) => b.addEventListener('click', () => sheet.close()));
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

  renderToolbar();
  update();
})();
