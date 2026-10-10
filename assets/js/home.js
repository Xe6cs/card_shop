/* الصفحة الرئيسية */
(function () {
  'use strict';
  const { $, esc, icon, skus, brands } = CS;

  // البحث الكبير في الواجهة
  $('#hero-search').innerHTML = CS.searchHTML('hero', { lg: true, placeholder: 'ابحث: بلايستيشن 50، ببجي 660، زين 25 ألف…' });
  CS.bindSearch($('#hero-search form'));

  // اختصارات البحث الأكثر استخداماً
  const quick = [['بلايستيشن', 'playstation'], ['شدات ببجي', 'pubg'], ['iTunes', 'itunes'], ['زين', 'zain'], ['آسياسيل', 'asiacell'], ['كريم', 'careem']];
  $('#hero-quick').insertAdjacentHTML('beforeend', quick
    .filter(([, b]) => skus.some((s) => s.fam.brand === b))
    .map(([label, b]) => `<a class="chip" href="${CS.catalogUrl({ brand: b })}">${esc(label)}</a>`).join(''));

  // بطاقات العرض في الواجهة
  const art = ['playstation-us--50', 'itunes-us--25', 'zain-iq--25000'].map(CS.skuById).filter(Boolean);
  $('#hero-art').insertAdjacentHTML('beforeend', art.map((s, i) => CS.gcardHTML(s, { cls: `gc-${i + 1}`, ignoreStock: true })).join(''));

  // الأقسام (المنشورة فقط)
  $('#cat-grid').innerHTML = CS.visibleCats.map((c) => {
    const inCat = skus.filter((s) => s.fam.category === c.id);
    const brandNames = Array.from(new Set(inCat.map((s) => brands[s.fam.brand].name)));
    return `<a class="cat-card" href="${CS.catalogUrl({ cat: c.id })}">
        <span class="ico">${icon(c.icon, 'i-lg')}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(brandNames.join(' · '))}</p>
        <span class="count"><span>${CS.plural(inCat.length, CS.W.product)}</span>${icon('chevronLeft', 'i-sm')}</span>
      </a>`;
  }).join('');

  // الأكثر طلباً (من حقل pop في مصدر البيانات — يُحدَّث من تقارير المبيعات)
  const popular = skus.filter((s) => s.pop && s.available).sort((a, b) => a.pop - b.pop).slice(0, 8);
  $('#popular-grid').innerHTML = popular.map(CS.cardHTML).join('');
  CS.trackOnce('home-pop', 'view_item_list', { item_list_name: 'الأكثر طلباً', ecommerce: { items: popular.map(CS.gaItem) } });

  $('#contact').innerHTML = CS.contactHTML();
})();
