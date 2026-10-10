/* صفحة المنتج: كل فئات المنتج في صفحة واحدة، والمعلومات المؤثرة على الشراء أولاً */
(function () {
  'use strict';
  const { $, $$, esc, icon, brands, regions, units, catById, famById, skus, money, priceHTML } = CS;
  const D = CS.data, CFG = CS.config;
  const root = $('#pdp-root');
  const p = CS.params();
  const fam = famById[p.get('id')];

  if (!fam) {
    document.title = 'المنتج غير موجود | Card Shop';
    root.innerHTML = `<div class="empty" style="margin-top:32px"><div class="ico">${icon('search', 'i-lg')}</div>
      <h1 style="font-size:1.4rem">لم نجد هذا المنتج</h1>
      <p>ربما تغيّر رابط المنتج أو أصبح غير متاح. ابحث عن البطاقة بالاسم أو تصفح الأقسام.</p>
      <div style="max-width:520px;margin:0 auto 16px">${CS.searchHTML('nf')}</div>
      <div class="actions"><a class="btn btn-primary" href="catalog.html">تصفح كل المنتجات</a></div></div>`;
    CS.bindSearch($('form[data-search="nf"]'));
    return;
  }

  const b = brands[fam.brand], r = regions[fam.region], cat = catById[fam.category];
  const guide = D.guides[fam.guide], delivery = D.deliveryTypes[fam.delivery];
  const byPop = (a, c) => (a.pop || 999) - (c.pop || 999) || a.order - c.order;
  let sku = fam.skus.find((s) => s.key === p.get('v'))
    || fam.skus.filter((s) => s.available).sort(byPop)[0]
    || fam.skus[0];

  /* ---------- Helpers ---------- */
  const unitLabel = (s) => (fam.unit === 'IQD' ? '' : fam.unit === 'UC' ? ' UC' : ` ${fam.unit}`);
  function breakdownHTML(s) {
    const rows = [];
    if (fam.unit === 'IQD' && s.v != null) {
      rows.push([fam.guide === 'isp' ? 'قيمة البطاقة' : 'قيمة الرصيد', priceHTML(s.v)]);
      const diff = s.price - s.v;
      if (diff > 0) rows.push(['فرق السعر (تكلفة الخدمة)', priceHTML(diff)]);
    } else if (fam.unit === 'USD' || fam.unit === 'GBP') {
      rows.push(['قيمة البطاقة', `<span class="ltr">${s.v} ${fam.unit}</span> <span class="muted">(${esc(units[fam.unit].name)})</span>`]);
    } else if (fam.unit === 'UC') {
      rows.push(['الكمية', `<span class="ltr">${money(s.v)} UC</span>`]);
    } else {
      rows.push(['الباقة', esc(s.label)]);
    }
    return `<dl class="breakdown">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      <div class="total"><dt>الإجمالي المطلوب</dt><dd>${priceHTML(s.price)}</dd></div></dl>`;
  }

  // البدائل عند نفاد الفئة: أقرب قيم من المنتج نفسه، ثم المنتج نفسه في منطقة أخرى
  function alternatives(s) {
    const same = fam.skus.filter((x) => x.available && x !== s)
      .sort((x, y) => Math.abs(x.price - s.price) - Math.abs(y.price - s.price)).slice(0, 2);
    const other = skus.filter((x) => x.available && x.fam.brand === fam.brand && x.fam.id !== fam.id)
      .sort((x, y) => Math.abs(x.price - s.price) - Math.abs(y.price - s.price)).slice(0, 1);
    return same.concat(other);
  }

  // المنتجات المشابهة: أقرب قيمتين من المنتج نفسه، ثم العلامة نفسها بمنطقة أخرى، ثم القسم نفسه — بالأقرب سعراً
  function related(s, n) {
    const near = (x, y) => Math.abs(x.price - s.price) - Math.abs(y.price - s.price);
    const onePerFamily = (list) => list.filter((x, i) => list.findIndex((y) => y.fam.id === x.fam.id) === i);
    const pool = skus.filter((x) => x.available && x !== s && x.fam.category === fam.category);
    const tier1 = pool.filter((x) => x.fam.id === fam.id).sort(near).slice(0, 2);
    const tier2 = onePerFamily(pool.filter((x) => x.fam.id !== fam.id && x.fam.brand === fam.brand).sort(near)).slice(0, 2);
    const tier3 = onePerFamily(pool.filter((x) => x.fam.brand !== fam.brand).sort(near));
    const rest = pool.filter((x) => x.fam.id === fam.id).sort(near).slice(2);
    return tier1.concat(tier2, tier3, rest).slice(0, n);
  }

  /* ---------- Static layout ---------- */
  const infoNav = [['what', 'ما الذي ستحصل عليه؟'], ['delivery', 'التسليم'], ['usage', 'طريقة الاستخدام'], ['support', 'الدعم والاسترجاع']];
  root.innerHTML = `
    <nav class="crumbs" aria-label="مسار التنقل"><ol>
      <li><a href="index.html">الرئيسية</a></li>
      <li><a href="${CS.catalogUrl({ cat: cat.id })}">${esc(cat.name)}</a></li>
      <li><a href="${CS.catalogUrl({ cat: cat.id, brand: fam.brand })}">${esc(b.ar)}</a></li>
      <li aria-current="page">${esc(fam.title)}</li>
    </ol></nav>
    <div class="pdp">
      <div class="pdp-media">
        <div class="media-panel" id="art"></div>
        <ul class="media-facts">
          <li>${icon('pin')}<strong>${esc(r.name)}</strong><span>${esc(r.country)}</span></li>
          <li>${icon('key')}<strong>${esc(delivery.name)}</strong><span>يُسلَّم إلكترونياً</span></li>
          <li>${icon('shield')}<strong>دفع آمن</strong><span>عبر Card Quick</span></li>
        </ul>
      </div>

      <div class="pdp-buy">
        <div class="pdp-head">
          <div class="pdp-kicker"><a href="${CS.catalogUrl({ brand: fam.brand })}">${esc(b.name)}</a><span>·</span><a href="${CS.catalogUrl({ cat: cat.id })}">${esc(cat.name)}</a></div>
          <h1 id="p-title"></h1>
          <div class="p-meta" id="p-meta"></div>
        </div>
        <div class="buybox" id="buybox">
          <div class="notice ${fam.regionLock ? 'notice-warn' : 'notice-info'}" id="restriction">
            ${icon(fam.regionLock ? 'alert' : 'info')}<p><strong>${fam.regionLock ? 'تنبيه المنطقة: ' : 'صلاحية الاستخدام: '}</strong>${esc(fam.restriction)}</p>
          </div>
          <div class="price-block" id="price"></div>
          <div class="stock-line" id="stock"></div>
          <fieldset class="variants${fam.skus.some((s) => s.chip) ? ' is-text' : ''}" id="variants">
            <legend>${fam.unit === 'IQD' ? 'اختر الفئة (د.ع)' : fam.unit === 'UC' ? 'اختر عدد الشدات' : `اختر قيمة البطاقة (${fam.unit})`}</legend>
            ${fam.skus.map((s) => `<div class="variant${s.available ? '' : ' is-out'}">
                <input type="radio" name="variant" id="v-${esc(s.key)}" value="${esc(s.key)}"${s === sku ? ' checked' : ''}>
                <label for="v-${esc(s.key)}"><b>${esc(CS.chipText(s))}${s.chip ? '' : esc(unitLabel(s))}</b>${s.available ? '' : '<small>غير متوفر</small>'}</label>
              </div>`).join('')}
          </fieldset>
          <div id="cta"></div>
        </div>
      </div>

      <div class="pdp-info">
        <nav class="on-this-page" aria-label="أقسام الصفحة">${infoNav.map(([id, t]) => `<a class="chip" href="#${id}">${t}</a>`).join('')}</nav>
        <div class="pdp-sections">
          <section class="info-card" id="what" aria-labelledby="what-t">
            <h2 id="what-t">${icon('tag')}ما الذي ستحصل عليه؟</h2>
            <p>${esc(guide.what)}</p>
            <dl class="facts" id="facts"></dl>
          </section>
          <section class="info-card" id="delivery" aria-labelledby="delivery-t">
            <h2 id="delivery-t">${icon('bolt')}كيف تستلم المنتج؟</h2>
            <ol>
              <li>بعد الضغط على «شراء الآن» تراجع ملخص الطلب، ثم تنتقل إلى صفحة المنتج نفسه على Card Quick.</li>
              <li>أضف المنتج إلى السلة وادفع ببطاقة ${CFG.partner.paymentMethods.join(' أو ')}. يلزم حساب على Card Quick (التسجيل مجاني).</li>
              <li>بعد تأكيد الدفع يظهر الرمز في «طلباتي» ويُرسل إلى بريدك الإلكتروني، وتُعالج الطلبات عادةً خلال دقائق.</li>
            </ol>
            <p class="small muted">لم يصلك البريد؟ تحقق من الرسائل غير المرغوب فيها، أو افتح <a class="link" href="${CFG.partner.ordersUrl}" rel="noopener">طلباتي على Card Quick</a>.</p>
          </section>
          <section class="info-card" id="usage" aria-labelledby="usage-t">
            <h2 id="usage-t">${icon('key')}طريقة الاستخدام</h2>
            <ol>${guide.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
            <div class="notice notice-info">${icon('info')}<p>${esc(guide.alt)}</p></div>
          </section>
          <section class="info-card" id="support" aria-labelledby="support-t">
            <h2 id="support-t">${icon('shield')}الدعم والاسترجاع</h2>
            <ul>
              <li>المنتجات الرقمية لا تُسترجع بعد تسليم الرمز.</li>
              <li>يُقبل طلب الاستبدال أو الاسترجاع خلال <strong>48 ساعة</strong> من الشراء إذا كان الرمز مستخدماً قبل تسليمه لك، أو إذا منعك خطأ تقني من استلامه.</li>
              ${fam.regionLock ? '<li>شراء بطاقة لا تطابق منطقة حسابك لا يُعد من حالات الاسترجاع، لذلك نطلب تأكيد المنطقة قبل الدفع.</li>' : ''}
              <li>أرسل الطلب إلى <a class="link ltr" href="mailto:${CFG.support.refundsEmail}">${CFG.support.refundsEmail}</a> مع رقم الطلب واسم المنتج ووصف المشكلة، ويتم الرد خلال يومي عمل.</li>
            </ul>
            <p><a class="link" href="policies.html#refund">سياسة الاستبدال والاسترجاع الكاملة</a> · <a class="link" href="${CS.waUrl(`مرحباً، لدي استفسار عن: ${fam.title}`)}" target="_blank" rel="noopener">اسأل الدعم عبر واتساب</a></p>
          </section>
        </div>
      </div>
    </div>
    <section class="section" aria-labelledby="rel-t" id="related-wrap">
      <div class="sec-head"><div><h2 id="rel-t">منتجات مشابهة</h2><p>من القسم نفسه وبأسعار قريبة.</p></div><a class="link" href="${CS.catalogUrl({ cat: cat.id })}">كل ${esc(cat.short)}</a></div>
      <div class="p-grid" id="related"></div>
    </section>`;

  const bar = document.createElement('div');
  bar.className = 'buybar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  document.body.classList.add('has-buybar');

  /* ---------- Dynamic parts (تتغير مع اختيار الفئة) ---------- */
  function render() {
    const name = CS.skuName(sku);
    $('#p-title').textContent = name;
    $('#art').innerHTML = CS.gcardHTML(sku);
    $('#p-meta').innerHTML = `<span class="badge badge-neutral">${icon('tag', 'i-sm')}<span>${esc(CS.valueText(sku))}</span></span>${CS.regionBadge(fam)}`;

    $('#price').innerHTML = `<div class="price-main"><span class="label">${CS.priceFresh ? 'السعر النهائي' : 'آخر سعر معروف'}</span>
        <span class="amount num">${money(sku.price)}</span><span class="cur">د.ع</span></div>
      ${breakdownHTML(sku)}
      <p class="synced">${icon('refresh', 'i-sm')}<span>${CS.priceFresh ? 'السعر والتوفر محدّثان من Card Quick' : 'لم يُحدَّث السعر منذ'} — ${esc(CS.syncedText)}</span></p>`;

    $('#stock').innerHTML = `${CS.stockBadge(sku)}<span class="small muted">${esc(delivery.name)} · يُسلَّم في «طلباتي» وعلى بريدك</span>`;

    const cta = $('#cta');
    if (sku.available) {
      cta.innerHTML = `<button type="button" class="btn btn-primary btn-lg btn-block" id="buy">${icon('card')}شراء الآن عبر Card Quick</button>
        <p class="cta-note" style="margin-top:10px">${icon('shield', 'i-sm')}تراجع ملخص الطلب قبل الانتقال، والدفع وإصدار الرمز عبر Card Quick.</p>`;
    } else {
      const alts = alternatives(sku);
      cta.innerHTML = `<button type="button" class="btn btn-lg btn-block" disabled>غير متوفر حالياً</button>
        ${sku.note ? `<p class="small muted" style="margin:8px 0 0">${esc(sku.note)}</p>` : ''}
        ${alts.length ? `<div style="margin-top:14px"><h2>بدائل متوفرة الآن</h2><div class="alt-list">
          ${alts.map((a) => `<a href="${CS.productUrl(a)}" data-alt="${esc(a.id)}"><span>${esc(CS.skuName(a))}</span><span class="num">${money(a.price)} د.ع</span></a>`).join('')}
        </div></div>` : ''}
        <a class="btn btn-outline btn-block" style="margin-top:12px" href="${CS.waUrl(`مرحباً، أرغب بإشعاري عند توفر: ${CS.skuName(sku)}`)}" target="_blank" rel="noopener">${icon('whatsapp')}أعلمني عند التوفر عبر واتساب</a>`;
    }
    const buy = $('#buy');
    if (buy) buy.addEventListener('click', () => CS.openHandoff(sku));

    $('#facts').innerHTML = [
      ['نوع المنتج', esc(delivery.name)],
      [fam.unit === 'UC' ? 'الكمية' : 'القيمة', esc(CS.valueText(sku))],
      ['الدولة أو المنطقة', esc(r.country)],
      ['نوع الحساب المدعوم', esc(fam.accountType)],
      fam.provider ? ['مزوّد الخدمة', `<span class="ltr">${esc(fam.provider)}</span>`] : null,
      ['متطلبات التفعيل', esc(guide.activation)],
      ['صلاحية الرمز', 'تحددها الجهة المُصدرة، وتظهر مع الرمز إن وُجدت'],
      ['طريقة التسليم', 'في «طلباتي» على Card Quick وعبر البريد الإلكتروني']
    ].filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');

    const rel = related(sku, 4);
    $('#related-wrap').hidden = !rel.length;
    $('#related').innerHTML = rel.map(CS.cardHTML).join('');

    bar.innerHTML = `<div class="bb-info"><strong><span class="num">${money(sku.price)}</span> د.ع</strong><span>${esc(name)}</span></div>
      ${sku.available ? `<button type="button" class="btn btn-primary" tabindex="-1">شراء الآن</button>` : '<button type="button" class="btn" disabled tabindex="-1">غير متوفر</button>'}`;
    const bb = $('button:not([disabled])', bar);
    if (bb) bb.addEventListener('click', () => CS.openHandoff(sku));
  }

  function setMeta() {
    const avail = fam.skus.filter((s) => s.available);
    const prices = fam.skus.map((s) => s.price);
    const min = CS.minPrice(fam);
    CS.setMeta({
      title: `${fam.title} — الفئات والأسعار | Card Shop`,
      description: `${fam.title}: ${CS.plural(fam.skus.length, CS.W.variant)}${isFinite(min) ? ` تبدأ من ${money(min)} د.ع` : ''}. ${fam.restriction} التسليم برمز رقمي عبر Card Quick.`,
      canonical: `product.html?id=${fam.id}`
    });
    const url = new URL(`product.html?id=${fam.id}`, D.meta.siteUrl).toString();
    CS.setJsonLd('ld-product', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product', name: fam.title, url, sku: fam.id, category: cat.name, description: guide.what,
          brand: { '@type': 'Brand', name: b.name },
          image: new URL('assets/img/icon-512.png', D.meta.siteUrl).toString(),
          offers: {
            '@type': 'AggregateOffer', priceCurrency: 'IQD', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: fam.skus.length,
            availability: avail.length ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: { '@type': 'Organization', name: 'Card Quick', url: CFG.partner.baseUrl + '/' }
          }
        },
        {
          '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: D.meta.siteUrl },
            { '@type': 'ListItem', position: 2, name: cat.name, item: new URL(`catalog.html?cat=${cat.id}`, D.meta.siteUrl).toString() },
            { '@type': 'ListItem', position: 3, name: fam.title, item: url }
          ]
        }
      ]
    });
  }

  /* ---------- Events ---------- */
  $('#variants').addEventListener('change', (e) => {
    const next = fam.skus.find((s) => s.key === e.target.value);
    if (!next || next === sku) return;
    sku = next;
    history.replaceState(null, '', CS.productUrl(sku));
    render();
    CS.track('select_item', { item_list_name: fam.title, ecommerce: { items: [CS.gaItem(sku)] } });
  });

  // شريط الشراء السفلي في الهاتف: يظهر عندما يخرج صندوق الشراء من الشاشة
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', String(!show));
      $$('button', bar).forEach((x) => { x.tabIndex = show ? 0 : -1; });
    }).observe($('#cta'));
  }

  render();
  setMeta();
  CS.trackOnce('view:' + fam.id, 'view_item', { ecommerce: { currency: 'IQD', value: sku.price, items: [CS.gaItem(sku)] } });
})();
