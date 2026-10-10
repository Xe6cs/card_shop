/* Card Shop — النواة المشتركة لكل الصفحات */
(function () {
  'use strict';

  const D = window.CS_DATA;
  const CFG = D.config;
  const CS = (window.CS = {});

  /* ================= Utilities ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('en-US');
  const money = (n) => nf.format(n);
  const priceHTML = (n) => `<span class="num">${money(n)}</span> د.ع`;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  const params = () => new URLSearchParams(location.search);
  // مطابقة العدد والمعدود في العربية: 1 منتج واحد، 2 منتجان، 3-10 منتجات، 11-99 منتجاً، 100 منتج
  const plural = (n, w) => {
    if (n === 1) return w.one;
    if (n === 2) return w.two;
    const m = n % 100;
    if (m >= 3 && m <= 10) return `${n} ${w.few}`;
    if (m >= 11) return `${n} ${w.many}`;
    return `${n} ${w.hundred}`;
  };
  const W = {
    product: { one: 'منتج واحد', two: 'منتجان', few: 'منتجات', many: 'منتجاً', hundred: 'منتج' },
    variant: { one: 'فئة واحدة', two: 'فئتان', few: 'فئات', many: 'فئةً', hundred: 'فئة' },
    result: { one: 'نتيجة واحدة', two: 'نتيجتان', few: 'نتائج', many: 'نتيجة', hundred: 'نتيجة' }
  };
  Object.assign(CS, { $, $$, esc, money, priceHTML, store, params, plural, W, data: D, config: CFG });

  /* ================= Icons ================= */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    gamepad: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-4 3.6l-.9 8.1a2.5 2.5 0 0 0 4.6 1.6L8 16h8l1.6 2.3a2.5 2.5 0 0 0 4.6-1.6l-.9-8.1a4 4 0 0 0-4-3.6z"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14.5 14.5 0 0 1 20 0"/><path d="M12 19.5h.01"/>',
    car: '<path d="M4 17v-5l2-5h12l2 5v5H4z"/><path d="M4 12h16M7 17v2M17 17v2"/><circle cx="8" cy="14.5" r=".8"/><circle cx="16" cy="14.5" r=".8"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    whatsapp: '<path d="M3.5 20.5 4.8 16.6A8.5 8.5 0 1 1 8 19.6l-4.5.9z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a5 5 0 0 1-2.8-2.8l.8-1-1-2L9 8.5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
    facebook: '<path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.5-3.5h-3V7.5a1 1 0 0 1 1-1H15V3z"/>',
    doc: '<path d="M7 3h7l5 5v13H7V3z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    plane: '<path d="M21.5 2.5 2.5 10l7 2.8 2.7 7.2L21.5 2.5z"/><path d="m9.5 12.8 5-4.3"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
    home: '<path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"/>'
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[n] || ''}</svg>`;
  CS.icon = icon;

  /* ================= Catalog index ================= */
  const brands = D.brands, regions = D.regions, units = D.units;
  const catById = Object.fromEntries(D.categories.map((c) => [c.id, c]));
  const famById = {};
  const skus = [];
  D.products.forEach((f, fi) => {
    famById[f.id] = f;
    f.skus = f.variants.map((v, vi) => {
      const key = v.key || String(v.v);
      const s = Object.assign({}, v, { key, fam: f, id: `${f.id}--${key}`, order: fi * 100 + vi });
      s.available = v.stock === 'in' && !!v.cq;
      skus.push(s);
      return s;
    });
  });
  // التصنيفات المرئية فقط: التي تحتوي منتجات منشورة
  const visibleCats = D.categories.filter((c) => skus.some((s) => s.fam.category === c.id));
  Object.assign(CS, { skus, famById, catById, visibleCats, brands, regions, units });

  CS.skuById = (id) => skus.find((s) => s.id === id);
  CS.catCount = (catId) => skus.filter((s) => s.fam.category === catId).length;

  /* ================= Naming (اسم الخدمة + القيمة + العملة + المنطقة) ================= */
  const REGION_CHIP = { US: 'US', UK: 'UK', AE: 'UAE', IQ: 'IQ', GLOBAL: 'GLOBAL', ERBIL: 'ERBIL', KRD: 'ERBIL · DUHOK', SULAY: 'SULAYMANIYAH' };
  function valueText(s) {
    const u = s.fam.unit;
    if (s.v == null) return s.label;
    if (u === 'IQD') return `${money(s.v)} د.ع`;
    if (u === 'UC') return `⁦${money(s.v)} UC⁩`;
    return `⁦${s.v} ${u}⁩`;
  }
  function chipText(s) {
    if (s.chip) return s.chip;
    const u = s.fam.unit;
    if (u === 'IQD') return money(s.v);
    if (u === 'UC') return `${money(s.v)}`;
    return `${s.v}`;
  }
  // LRI…PDI: يعزل "10 USD" كي لا ينقلب ترتيبه داخل النص العربي
  const ltr = (t) => `⁦${t}⁩`;
  function skuName(s) {
    const f = s.fam, b = brands[f.brand], r = regions[f.region];
    const regionSuffix = ['IQ', 'GLOBAL'].includes(f.region) ? '' : ` — ${r.name}`;
    let base;
    if (f.unit === 'USD' || f.unit === 'GBP') base = `بطاقة ${b.name} بقيمة ${ltr(`${s.v} ${f.unit}`)}`;
    else if (f.unit === 'UC') base = `شدات ${b.name} — ${ltr(`${money(s.v)} UC`)}`;
    else if (s.label) base = `${b.ar} — ${s.label}`;
    else if (f.guide === 'isp') base = `بطاقة ${b.ar}${f.provider ? ` (${f.provider})` : ''} بقيمة ${money(s.v)} د.ع`;
    else base = `رصيد ${b.ar} بقيمة ${money(s.v)} د.ع`;
    return base + regionSuffix;
  }
  Object.assign(CS, { valueText, chipText, skuName });
  CS.productUrl = (s) => `product.html?id=${encodeURIComponent(s.fam.id)}&v=${encodeURIComponent(s.key)}`;
  CS.familyUrl = (f) => `product.html?id=${encodeURIComponent(f.id)}`;
  CS.catalogUrl = (q) => 'catalog.html' + (q ? '?' + new URLSearchParams(q).toString() : '');

  /* ================= Prices & sync ================= */
  const syncedAt = new Date(D.meta.pricesSyncedAt);
  const dateFmt = new Intl.DateTimeFormat('ar-IQ-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  const dayFmt = new Intl.DateTimeFormat('ar-IQ-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
  CS.priceFresh = (Date.now() - syncedAt.getTime()) / 36e5 <= CFG.priceMaxAgeHours;
  CS.syncedText = dateFmt.format(syncedAt);
  CS.syncedDay = dayFmt.format(syncedAt);
  CS.minPrice = (f) => Math.min(...f.skus.filter((s) => s.available).map((s) => s.price).concat(Infinity));

  /* ================= Partner (Card Quick) ================= */
  CS.partnerUrl = (s) => {
    const u = new URL(CFG.partner.productPath + s.cq + '/', CFG.partner.baseUrl);
    Object.entries(CFG.utm).forEach(([k, v]) => u.searchParams.set(k, v));
    u.searchParams.set('utm_content', s.id);
    return u.toString();
  };
  CS.waUrl = (text) => `https://wa.me/${CFG.support.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  /* ================= Analytics (dataLayer) ================= */
  window.dataLayer = window.dataLayer || [];
  const debug = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const once = new Set();
  CS.track = (event, p = {}) => {
    const e = Object.assign({ event, page_type: document.body.dataset.page || 'other' }, p);
    window.dataLayer.push(e);
    if (debug) console.debug('[track]', e);
  };
  // لمنع تكرار الأحداث (مثل view_item عند إعادة الرسم)
  CS.trackOnce = (key, event, p) => { if (once.has(key)) return; once.add(key); CS.track(event, p); };
  CS.gaItem = (s) => ({
    item_id: s.id, item_name: skuName(s), item_brand: brands[s.fam.brand].name,
    item_category: catById[s.fam.category].name, item_variant: valueText(s), price: s.price, currency: 'IQD'
  });

  /* ================= Card art ================= */
  CS.gcardHTML = (s, opts = {}) => {
    const f = s.fam, b = brands[f.brand];
    const unit = f.unit === 'IQD' ? 'IQD' : f.unit;
    const val = s.v == null ? esc(s.chip || s.label) : `${f.unit === 'USD' ? '$' : f.unit === 'GBP' ? '£' : ''}${money(s.v)}${f.unit === 'IQD' || f.unit === 'UC' ? `<small>${unit}</small>` : ''}`;
    return `<div class="gcard${s.available || opts.ignoreStock ? '' : ' is-out'}${opts.cls ? ' ' + opts.cls : ''}" style="--c1:${b.c1};--c2:${b.c2}" role="img" aria-label="${esc(skuName(s))}">
      <span class="g-region">${REGION_CHIP[f.region]}</span>
      <span class="g-brand">${esc(b.name)}</span>
      <span class="g-value">${val}</span>
    </div>`;
  };

  CS.regionBadge = (f) => `<span class="badge badge-region">${icon('pin', 'i-sm')}${esc(regions[f.region].name)}</span>`;
  CS.stockBadge = (s) => s.available
    ? '<span class="badge badge-ok"><span class="dot"></span>متوفر</span>'
    : '<span class="badge badge-out"><span class="dot"></span>غير متوفر حالياً</span>';

  CS.cardHTML = (s) => `<article class="p-card">
      ${CS.gcardHTML(s)}
      <div class="p-body">
        <h3><a href="${CS.productUrl(s)}">${esc(skuName(s))}</a></h3>
        <div class="p-meta">${CS.regionBadge(s.fam)}${CS.stockBadge(s)}</div>
        <div class="p-price"><strong>${priceHTML(s.price).replace(' د.ع', ' <span class="cur">د.ع</span>')}</strong></div>
      </div>
    </article>`;

  /* ================= Search ================= */
  const STOP = new Set(['بطاقه', 'بطاقات', 'كارت', 'كارتات', 'رصيد', 'شحن', 'حساب', 'للحساب', 'بقيمه', 'قيمه', 'سعر', 'شراء', 'card', 'cards', 'gift', 'giftcard', 'من', 'في', 'على']);
  function norm(str) {
    return String(str || '').toLowerCase()
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/\$/g, ' usd ').replace(/£/g, ' gbp ')
      .replace(/(\d)[,٬،](?=\d{3})/g, '$1')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/(\d)(\p{L})/gu, '$1 $2').replace(/(\p{L})(\d)/gu, (m, a, b) => (/[a-z]/.test(a) ? m : `${a} ${b}`))
      .replace(/\s+/g, ' ').trim();
  }
  CS.norm = norm;
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = dp[0]; dp[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[b.length];
  }
  skus.forEach((s) => {
    const f = s.fam, b = brands[f.brand], r = regions[f.region], u = units[f.unit];
    s._text = ' ' + norm([b.name, b.ar, ...b.syn, f.title, r.name, r.country, ...r.syn, ...u.syn, u.name, s.label || '', catById[f.category].name, f.provider || ''].join(' ')) + ' ';
    s._words = Array.from(new Set(s._text.trim().split(' ')));
  });
  function parseQuery(q) {
    const n = norm(q).replace(/(\d+) (الف|k)\b/g, (_, d) => String(+d * 1000));
    const tokens = n.split(' ').filter(Boolean);
    const nums = tokens.filter((t) => /^\d+$/.test(t)).map(Number);
    const words = tokens.filter((t) => !/^\d+$/.test(t) && !STOP.has(t));
    return { n, nums, words };
  }
  function wordScore(w, s) {
    if (s._text.includes(' ' + w)) return 3;           // بداية كلمة
    if (s._text.includes(w)) return 2;                 // جزء من كلمة
    if (w.length > 4 && w.startsWith('ال') && s._text.includes(' ' + w.slice(2))) return 2;
    if (w.length >= 4) {                               // تسامح مع الأخطاء الإملائية البسيطة
      const max = w.length >= 7 ? 2 : 1;
      if (s._words.some((x) => x.length >= 3 && lev(w, x) <= max)) return 1;
    }
    return 0;
  }
  CS.search = (q) => {
    const { n, nums, words } = parseQuery(q);
    const notOffered = D.notOffered.find((x) => x.syn.some((syn) => (' ' + n + ' ').includes(' ' + norm(syn) + ' ') || n === norm(syn)));
    if (!n) return { results: [], notOffered: null, empty: true };
    const results = [];
    for (const s of skus) {
      let score = 0, ok = true;
      for (const w of words) { const m = wordScore(w, s); if (!m) { ok = false; break; } score += m; }
      if (!ok) continue;
      for (const num of nums) {
        if (s.v === num) score += 6;
        else if (s.v != null && String(s.v).startsWith(String(num))) score += 1;
        else { ok = false; break; }
      }
      if (!ok || (!words.length && !nums.length)) continue;
      if (s.available) score += 0.5;
      if (s.pop) score += 0.3;
      results.push({ s, score });
    }
    results.sort((a, b) => b.score - a.score || a.s.order - b.s.order);
    return { results: results.map((r) => r.s), notOffered: results.length ? null : notOffered, empty: false };
  };

  function suggestHTML(q, id) {
    const { results, notOffered } = CS.search(q);
    if (!results.length) {
      if (notOffered) {
        return `<div class="suggest-empty"><strong>بطاقات ${esc(notOffered.name)} غير متوفرة حالياً في Card Shop.</strong><br>
          <a class="link" href="${CS.waUrl(`مرحباً، أرغب بشراء بطاقات ${notOffered.name}. هل يمكن توفيرها؟`)}" target="_blank" rel="noopener">اطلب توفيرها عبر واتساب</a></div>`;
      }
      return `<div class="suggest-empty">لا توجد نتائج لـ «${esc(q)}». جرّب اسم العلامة مثل: بلايستيشن، ببجي، زين، iTunes.</div>`;
    }
    const famMap = new Map();
    results.forEach((s) => { if (!famMap.has(s.fam.id)) famMap.set(s.fam.id, s.fam); });
    const hasNumber = /\d/.test(norm(q));
    const fams = Array.from(famMap.values()).slice(0, hasNumber ? 2 : 3);
    const top = results.slice(0, hasNumber ? 5 : 4);
    let i = 0;
    const opt = (href, art, title, sub, price) => `<a role="option" id="${id}-o${i++}" href="${href}" aria-selected="false" tabindex="-1">
        ${art}<span class="s-main"><span class="s-title">${title}</span><span class="s-sub">${sub}</span></span>${price ? `<span class="s-price">${price}</span>` : ''}</a>`;
    const famGroup = () => {
      if (!fams.length) return '';
      return '<div class="suggest-group" role="presentation">المنتجات</div>' + fams.map((f) => {
        const first = f.skus.find((s) => s.available) || f.skus[0];
        const min = CS.minPrice(f);
        return opt(CS.familyUrl(f), CS.gcardHTML(first, { cls: 's-art' }), esc(f.title),
          `${plural(f.skus.length, W.variant)} · ${esc(regions[f.region].name)}`, isFinite(min) ? `من ${priceHTML(min)}` : '');
      }).join('');
    };
    const skuGroup = () => '<div class="suggest-group" role="presentation">الفئات المطابقة</div>' + top.map((s) =>
      opt(CS.productUrl(s), CS.gcardHTML(s, { cls: 's-art' }), esc(skuName(s)), s.available ? 'متوفر' : 'غير متوفر حالياً', priceHTML(s.price))).join('');
    // عند كتابة رقم (مثل «بلايستيشن 50») تظهر الفئات المطابقة أولاً
    let html = hasNumber ? skuGroup() + famGroup() : famGroup() + skuGroup();
    html += `<a class="suggest-all" href="${CS.catalogUrl({ q })}">عرض كل النتائج (${results.length})</a>`;
    return html;
  }

  CS.searchHTML = (id, opts = {}) => `<form class="search${opts.lg ? ' search-lg' : ''}" role="search" action="catalog.html" method="get" data-search="${id}">
      <label class="sr-only" for="q-${id}">ابحث عن بطاقة</label>
      <div class="search-field">
        ${icon('search')}
        <input id="q-${id}" name="q" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search"
          placeholder="${esc(opts.placeholder || 'ابحث عن بطاقة: بلايستيشن، iTunes، زين…')}"
          role="combobox" aria-expanded="false" aria-controls="sg-${id}" aria-autocomplete="list">
        <button type="button" class="search-clear" aria-label="مسح البحث" hidden>${icon('x', 'i-sm')}</button>
        ${opts.lg ? '<button class="btn btn-primary search-submit" type="submit">بحث</button>' : ''}
      </div>
      <div class="suggest" id="sg-${id}" role="listbox" aria-label="اقتراحات البحث" hidden></div>
    </form>`;

  CS.bindSearch = (form) => {
    const input = $('input', form), box = $('.suggest', form), clear = $('.search-clear', form), id = form.dataset.search;
    let active = -1, timer;
    const options = () => $$('[role="option"]', box);
    const close = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
    const setActive = (i) => {
      const opts = options();
      opts.forEach((o) => o.setAttribute('aria-selected', 'false'));
      active = i;
      if (opts[i]) { opts[i].setAttribute('aria-selected', 'true'); input.setAttribute('aria-activedescendant', opts[i].id); opts[i].scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    };
    const update = () => {
      const q = input.value.trim();
      clear.hidden = !q;
      if (!q) return close();
      box.innerHTML = suggestHTML(q, 'sg-' + id);
      box.hidden = false; input.setAttribute('aria-expanded', 'true'); active = -1;
    };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 90); });
    input.addEventListener('focus', () => { if (input.value.trim()) update(); });
    input.addEventListener('keydown', (e) => {
      const opts = options();
      if (e.key === 'ArrowDown') { e.preventDefault(); if (box.hidden) update(); setActive(Math.min(active + 1, opts.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
      else if (e.key === 'Escape') { if (!box.hidden) { e.preventDefault(); close(); } }
      else if (e.key === 'Enter' && active >= 0 && opts[active]) { e.preventDefault(); CS.track('search_suggestion', { search_term: input.value.trim() }); location.href = opts[active].href; }
    });
    box.addEventListener('click', (e) => { if (e.target.closest('[role="option"]')) CS.track('search_suggestion', { search_term: input.value.trim() }); });
    clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
    form.addEventListener('submit', (e) => {
      const q = input.value.trim();
      if (!q) { e.preventDefault(); input.focus(); return; }
      CS.track('search', { search_term: q });
    });
    document.addEventListener('click', (e) => { if (!form.contains(e.target)) close(); });
    form.addEventListener('focusout', (e) => { if (!form.contains(e.relatedTarget)) setTimeout(() => { if (!form.contains(document.activeElement)) close(); }, 0); });
  };

  /* ================= Theme ================= */
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => document.documentElement.dataset.theme || (mql.matches ? 'dark' : 'light');
  function syncThemeBtn() {
    $$('.theme-toggle').forEach((b) => {
      const dark = currentTheme() === 'dark';
      b.innerHTML = icon(dark ? 'sun' : 'moon');
      b.setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
      b.setAttribute('title', dark ? 'الوضع الفاتح' : 'الوضع الداكن');
    });
  }
  CS.toggleTheme = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('cs-theme', next);
    syncThemeBtn();
  };

  /* ================= Header / Footer ================= */
  function catLinks(cls) {
    return visibleCats.map((c) => `<a href="${CS.catalogUrl({ cat: c.id })}" class="${cls || ''}">
        <span class="ico">${icon(c.icon)}</span><span><strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span></span></a>`).join('');
  }
  function renderHeader() {
    const el = $('#site-header');
    if (!el) return;
    const page = document.body.dataset.page;
    const cur = (p) => (page === p ? ' aria-current="page"' : '');
    el.className = 'site-header';
    el.innerHTML = `<div class="container">
      <div class="hdr">
        <button class="icon-btn menu-btn" type="button" aria-label="فتح القائمة" aria-haspopup="dialog" aria-controls="drawer">${icon('menu')}</button>
        <a class="brand" href="index.html" aria-label="Card Shop — الصفحة الرئيسية">
          <img class="mark" src="assets/img/logo-mark.webp" width="42" height="42" alt="">
          <img class="wordmark wm-light" src="assets/img/logo-wordmark.webp" width="94" height="28" alt="Card Shop">
          <img class="wordmark wm-dark" src="assets/img/logo-wordmark-dark.webp" width="94" height="28" alt="" aria-hidden="true">
        </a>
        <nav class="main-nav" aria-label="القائمة الرئيسية">
          <div class="nav-dd">
            <button type="button" aria-expanded="false" aria-controls="nav-cats"${cur('catalog')}>الأقسام ${icon('chevronDown', 'i-sm')}</button>
            <div class="nav-dd-panel" id="nav-cats" hidden>${catLinks()}
              <a href="catalog.html"><span class="ico">${icon('grid')}</span><span><strong>كل المنتجات</strong><span>${skus.length} منتجاً رقمياً</span></span></a>
            </div>
          </div>
          <a href="help.html#how"${cur('how')}>كيف أشتري؟</a>
          <a href="help.html"${cur('help')}>الدعم</a>
          <a href="about.html"${cur('about')}>من نحن</a>
        </nav>
        <div class="hdr-search">${CS.searchHTML('hdr')}</div>
        <div class="hdr-actions">
          <button class="icon-btn search-toggle" type="button" aria-label="فتح البحث" aria-expanded="false" aria-controls="mobile-search">${icon('search')}</button>
          <button class="icon-btn theme-toggle" type="button"></button>
          <a class="btn btn-outline acct-link" href="${CFG.partner.ordersUrl}" rel="noopener" title="حسابك وطلباتك على Card Quick">${icon('receipt')}<span>طلباتي</span></a>
        </div>
      </div>
      <div class="mobile-search" id="mobile-search">${CS.searchHTML('mob')}</div>
    </div>`;

    // Mobile drawer
    const drawer = document.createElement('dialog');
    drawer.className = 'drawer';
    drawer.id = 'drawer';
    drawer.setAttribute('aria-label', 'القائمة');
    drawer.innerHTML = `<div class="drawer-head">
        <a class="brand" href="index.html"><img class="mark" src="assets/img/logo-mark.webp" width="36" height="36" alt=""><img class="wordmark wm-light" src="assets/img/logo-wordmark.webp" width="80" height="24" alt="Card Shop" style="height:24px"><img class="wordmark wm-dark" src="assets/img/logo-wordmark-dark.webp" width="80" height="24" alt="" aria-hidden="true" style="height:24px"></a>
        <button class="icon-btn" type="button" data-close aria-label="إغلاق القائمة">${icon('x')}</button>
      </div>
      <div class="drawer-body">
        <h2>الأقسام</h2>
        ${visibleCats.map((c) => `<a href="${CS.catalogUrl({ cat: c.id })}"><span class="ico">${icon(c.icon)}</span>${esc(c.name)}</a>`).join('')}
        <a href="catalog.html"><span class="ico">${icon('grid')}</span>كل المنتجات</a>
        <h2>المساعدة</h2>
        <a href="help.html#how"><span class="ico">${icon('help')}</span>كيف أشتري وأستلم البطاقة؟</a>
        <a href="help.html#faq"><span class="ico">${icon('info')}</span>الأسئلة الشائعة</a>
        <a href="help.html#contact"><span class="ico">${icon('whatsapp')}</span>الدعم والتواصل</a>
        <a href="policies.html"><span class="ico">${icon('doc')}</span>السياسات والشروط</a>
        <a href="about.html"><span class="ico">${icon('shield')}</span>من نحن</a>
        <h2>حسابي</h2>
        <a href="${CFG.partner.ordersUrl}" rel="noopener"><span class="ico">${icon('receipt')}</span>طلباتي على Card Quick ${icon('external', 'i-sm')}</a>
      </div>`;
    document.body.appendChild(drawer);
    $('.menu-btn', el).addEventListener('click', () => drawer.showModal());
    $('[data-close]', drawer).addEventListener('click', () => drawer.close());
    drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.close(); });

    // Categories dropdown
    const ddBtn = $('.nav-dd > button', el), ddPanel = $('#nav-cats', el);
    const setDd = (open) => { ddBtn.setAttribute('aria-expanded', String(open)); ddPanel.hidden = !open; };
    ddBtn.addEventListener('click', () => setDd(ddPanel.hidden));
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav-dd')) setDd(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ddPanel.hidden) { setDd(false); ddBtn.focus(); } });

    // Mobile search toggle
    const st = $('.search-toggle', el), ms = $('#mobile-search', el);
    st.addEventListener('click', () => {
      const open = !ms.classList.contains('is-open');
      ms.classList.toggle('is-open', open);
      st.setAttribute('aria-expanded', String(open));
      if (open) $('input', ms).focus();
    });

    $$('.theme-toggle').forEach((b) => b.addEventListener('click', CS.toggleTheme));
    syncThemeBtn();
    mql.addEventListener('change', syncThemeBtn);
    $$('form[data-search]', el).forEach(CS.bindSearch);
    // تعبئة حقل البحث بالاستعلام الحالي
    const q = params().get('q');
    if (q) $$('form[data-search] input', el).forEach((i) => { i.value = q; $('.search-clear', i.form).hidden = false; });

    if (!CS.priceFresh) {
      const banner = document.createElement('div');
      banner.className = 'site-banner';
      banner.setAttribute('role', 'status');
      banner.innerHTML = `<div class="container">${icon('alert', 'i-sm')}<span>آخر تحديث للأسعار كان في ${esc(CS.syncedText)}. السعر النهائي المؤكد يظهر في صفحة الدفع على Card Quick قبل تأكيد الطلب.</span></div>`;
      el.after(banner);
    }
  }

  function renderFooter() {
    const el = $('#site-footer');
    if (!el) return;
    const P = CFG.partner, S = CFG.support;
    el.className = 'site-footer';
    el.innerHTML = `<div class="container">
      <div class="ft-grid">
        <div class="ft-brand">
          <img class="logo-light" src="assets/img/logo-full.webp" width="94" height="80" alt="Card Shop" loading="lazy">
          <img class="logo-dark" src="assets/img/logo-full-dark.webp" width="94" height="80" alt="" aria-hidden="true" loading="lazy">
          <p>Card Shop متجر متخصص بالبطاقات الرقمية في العراق، وهو علامة تجارية تابعة لشركة <a class="link" href="${P.baseUrl}/" rel="noopener">Card Quick</a> التي تتولى الدفع وإصدار الرموز والدعم.</p>
          <div class="pay-row" aria-label="وسائل الدفع على Card Quick">${P.paymentMethods.map((m) => `<span class="pm">${esc(m)}</span>`).join('')}</div>
        </div>
        <div>
          <h2>الأقسام</h2>
          <ul>${visibleCats.map((c) => `<li><a href="${CS.catalogUrl({ cat: c.id })}">${esc(c.name)}</a></li>`).join('')}<li><a href="catalog.html">كل المنتجات</a></li></ul>
        </div>
        <div>
          <h2>المساعدة</h2>
          <ul>
            <li><a href="help.html#how">كيف أشتري؟</a></li>
            <li><a href="help.html#delivery">كيف أستلم المنتج؟</a></li>
            <li><a href="help.html#faq">الأسئلة الشائعة</a></li>
            <li><a href="help.html#contact">اتصل بنا</a></li>
            <li><a href="${P.ordersUrl}" rel="noopener">طلباتي على Card Quick</a></li>
          </ul>
        </div>
        <div>
          <h2>معلومات قانونية</h2>
          <ul>
            <li><a href="about.html">من نحن</a></li>
            <li><a href="policies.html#terms">الشروط والأحكام</a></li>
            <li><a href="policies.html#refund">سياسة الاستبدال والاسترجاع</a></li>
            <li><a href="policies.html#privacy">سياسة الخصوصية</a></li>
            <li><a href="${S.facebook}" rel="noopener">صفحتنا على فيسبوك</a></li>
          </ul>
        </div>
      </div>
      <div class="ft-bottom">
        <span>© ${new Date().getFullYear()} Card Shop — تابع لشركة Card Quick. جميع الحقوق محفوظة.</span>
        <span>آخر تحديث للأسعار: ${esc(CS.syncedDay)}</span>
      </div>
    </div>`;
  }

  /* ================= Contact cards (home + help) ================= */
  CS.contactHTML = () => {
    const S = CFG.support, P = CFG.partner;
    return `<div class="contact-grid">
      <a class="contact-card" href="${CS.waUrl('مرحباً، لدي استفسار بخصوص Card Shop')}" target="_blank" rel="noopener">
        <span class="ico">${icon('whatsapp')}</span>
        <span><strong>واتساب الدعم</strong><span class="num">${esc(S.whatsappDisplay)}</span><span>الدعم الفني والاستفسارات عن الطلبات${S.hours ? ` · ${esc(S.hours)}` : ''}</span></span>
      </a>
      <a class="contact-card" href="mailto:${S.refundsEmail}">
        <span class="ico">${icon('mail')}</span>
        <span><strong>طلبات الاسترجاع والاستبدال</strong><span class="ltr">${esc(S.refundsEmail)}</span><span>خلال 48 ساعة من الشراء مع رقم الطلب</span></span>
      </a>
      <a class="contact-card" href="${P.policies.contact}" rel="noopener">
        <span class="ico">${icon('doc')}</span>
        <span><strong>نموذج التواصل</strong><span>عبر موقع Card Quick</span><span>للاقتراحات والشكاوى والاستفسارات العامة</span></span>
      </a>
    </div>`;
  };

  /* ================= Handoff dialog (الانتقال إلى Card Quick) ================= */
  CS.openHandoff = (s) => {
    const f = s.fam, P = CFG.partner;
    let dlg = $('#handoff');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'handoff';
      dlg.className = 'modal';
      dlg.setAttribute('aria-labelledby', 'ho-title');
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    }
    const url = CS.partnerUrl(s);
    dlg.innerHTML = `<div class="modal-head">
        <div>
          <div class="handoff-brand"><img src="assets/img/logo-mark.webp" alt="" width="34" height="34"><span>Card Shop</span><span class="arrow">←</span><span class="cq">Card Quick</span></div>
          <h2 id="ho-title">إكمال الشراء بأمان عبر Card Quick</h2>
        </div>
        <button class="icon-btn" type="button" data-close aria-label="إغلاق">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="summary">${CS.gcardHTML(s)}<div><strong>${esc(skuName(s))}</strong><span>${priceHTML(s.price)} · ${esc(regions[f.region].name)}</span></div></div>
        ${CS.priceFresh ? '' : `<div class="notice notice-warn">${icon('alert')}<p>هذا آخر سعر معروف (${esc(CS.syncedText)}). راجع السعر النهائي في صفحة الدفع قبل التأكيد.</p></div>`}
        <ul class="checklist">
          <li>${icon('checkCircle')}<span><strong>Card Quick</strong> هي الشركة المالكة لـ Card Shop، وهي التي تستلم الدفع وتُصدر الرمز وتتولى الدعم والاسترجاع.</span></li>
          <li>${icon('checkCircle')}<span>ستفتح صفحة هذا المنتج نفسه على Card Quick. أضفه إلى السلة وأكمل الدفع هناك.</span></li>
          <li>${icon('checkCircle')}<span>الدفع ببطاقات ${P.paymentMethods.join(' و')}، ويلزم حساب على Card Quick (التسجيل مجاني).</span></li>
          <li>${icon('checkCircle')}<span>يظهر الرمز في «طلباتي» ويُرسل إلى بريدك الإلكتروني، وتُعالج الطلبات عادةً خلال دقائق من تأكيد الدفع.</span></li>
        </ul>
        ${f.regionLock ? `<label class="confirm"><input type="checkbox" id="ho-confirm"><span>${esc(f.confirm)}</span></label>` : ''}
      </div>
      <div class="modal-foot">
        <a class="btn btn-primary btn-lg" id="ho-go" href="${esc(url)}" rel="noopener"${f.regionLock ? ' aria-disabled="true"' : ''}>متابعة إلى Card Quick ${icon('external', 'i-sm')}</a>
        <button class="btn btn-ghost" type="button" data-close>رجوع</button>
        <p class="small muted" style="grid-column:1/-1;margin:0">ظهر سعر مختلف أو أن المنتج غير متوفر على Card Quick؟ <a class="link" href="${CS.waUrl(`مرحباً، لاحظت اختلافاً في السعر أو التوفر للمنتج: ${skuName(s)} (المعروض على Card Shop: ${money(s.price)} د.ع)`)}" target="_blank" rel="noopener">أبلغنا عبر واتساب</a></p>
      </div>`;
    const go = $('#ho-go', dlg), confirm = $('#ho-confirm', dlg);
    if (confirm) confirm.addEventListener('change', () => go.setAttribute('aria-disabled', String(!confirm.checked)));
    go.addEventListener('click', (e) => {
      if (go.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        confirm.closest('.confirm').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        confirm.focus();
        return;
      }
      CS.track('handoff_to_partner', { partner: P.name, destination: url, ecommerce: { currency: 'IQD', value: s.price, items: [CS.gaItem(s)] } });
    });
    $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
    CS.track('begin_checkout', { ecommerce: { currency: 'IQD', value: s.price, items: [CS.gaItem(s)] } });
    dlg.showModal();
    (confirm || go).focus();
  };

  /* ================= Structured data helper ================= */
  CS.setJsonLd = (id, obj) => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(obj);
  };
  CS.setMeta = ({ title, description, canonical }) => {
    if (title) document.title = title;
    if (description) { const m = $('meta[name="description"]'); if (m) m.setAttribute('content', description); }
    if (canonical) {
      let l = $('link[rel="canonical"]');
      if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
      l.href = new URL(canonical, D.meta.siteUrl).toString();
    }
  };

  /* ================= Boot ================= */
  renderHeader();
  renderFooter();
  $$('form[data-search]').forEach((f) => { if (!f.closest('#site-header')) CS.bindSearch(f); });
})();
