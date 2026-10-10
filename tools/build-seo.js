// يولّد sitemap.xml و _redirects (تحويلات 301 من روابط card-shop.net القديمة) من ملف البيانات نفسه.
// التشغيل:  node tools/build-seo.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
const D = ctx.window.CS_DATA;
const SITE = D.meta.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

/* ---------- sitemap.xml ---------- */
const xmlEsc = (s) => s.replace(/&/g, '&amp;');
const urls = ['/', '/catalog.html', '/help.html', '/about.html', '/policies.html'];
const usedCats = D.categories.filter((c) => D.products.some((p) => p.category === c.id));
usedCats.forEach((c) => urls.push(`/catalog.html?cat=${c.id}`));
D.products.forEach((p) => urls.push(`/product.html?id=${p.id}`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${xmlEsc(SITE + u)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

/* ---------- _redirects (صيغة Netlify / Cloudflare Pages) ---------- */
const lines = ['# روابط Card Shop القديمة ← الروابط الجديدة (301). مولّد آلياً بواسطة tools/build-seo.js', ''];
const oldCats = {
  'الاتصالات': 'cat=mobile',
  'الاتصالات/كارتات-كورك': 'brand=korek',
  'الاتصالات/كارتات-زين-العراق': 'brand=zain',
  'الاتصالات/كارتات-آسياسيل': 'brand=asiacell',
  'الاتصالات/عراق-سيل': 'brand=iraqcell',
  'بطاقات-الإنترنت': 'cat=internet',
  'بطاقات-الإنترنت/فاستلينك': 'brand=fastlink',
  'بطاقات-الإنترنت/تشك-نت': 'brand=tishknet',
  'بطاقات-الإنترنت/ftth': 'brand=ftth',
  'المتاجر-الرقمية': 'cat=stores',
  'المتاجر-الرقمية/كارتات-أيتونز': 'brand=itunes',
  'المتاجر-الرقمية/كريم-العراق': 'brand=careem',
  'منصات-الألعاب': 'cat=games',
  'منصات-الألعاب/شدات-ببجي': 'brand=pubg',
  'منصات-الألعاب/بلايستيشن': 'brand=playstation'
};
lines.push('# التصنيفات (الفرعية أولاً لأن أول قاعدة مطابقة هي التي تُطبَّق)');
Object.entries(oldCats).sort(([a], [b]) => b.split('/').length - a.split('/').length).forEach(([from, to]) => {
  lines.push(`/product-category/${from}/*  /catalog.html?${to}  301`);
  lines.push(`/product-category/${from}/  /catalog.html?${to}  301`);
});
lines.push('', '# المنتجات (كل فئة قديمة تذهب إلى صفحة المنتج الموحدة مع اختيار الفئة نفسها)');
D.products.forEach((p) => p.variants.forEach((v) => {
  const slug = v.legacy || (p.legacy && v.v != null ? p.legacy.replace('{v}', v.v) : null);
  if (!slug) return;
  lines.push(`/product/${slug}/  /product.html?id=${p.id}&v=${v.key || v.v}  301`);
}));
fs.writeFileSync(path.join(ROOT, '_redirects'), lines.join('\n') + '\n');

console.log(`sitemap.xml: ${urls.length} روابط`);
console.log(`_redirects: ${lines.filter((l) => l.startsWith('/')).length} تحويل`);
