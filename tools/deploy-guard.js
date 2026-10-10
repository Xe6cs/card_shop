#!/usr/bin/env node
// حارس النشر — يعمل تلقائياً عند كل بناء على Netlify (انظر netlify.toml)، ولا يعمل على جهازك.
//
// 1) منع الفهرسة: كل نسخة تُمنع من محركات البحث (X-Robots-Tag + robots.txt) ما لم تتحقق
//    الشروط معاً: البناء من الفرع الرسمي (CONTEXT=production) و CS_ALLOW_INDEXING=true.
//    CS_ALLOW_INDEXING لا يُفعَّل إلا يوم الإطلاق الرسمي وبموافقة صاحب المشروع.
// 2) منع خلط البيئات: يفشل بناء المعاينة إذا وجد فيه أي معرّف من موارد الإنتاج
//    (CS_PROD_FINGERPRINTS: معرّفات علنية مثل رقم مشروع Supabase، وليست مفاتيح سرية).
// لا يطبع أي قيمة لأي متغير بيئة، فقط أسماء المتغيرات.
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.NETLIFY !== 'true') {
  console.log('deploy-guard: يعمل على Netlify فقط — لا شيء لفعله على هذا الجهاز.');
  process.exit(0);
}

const context = process.env.CONTEXT || 'unknown';            // production | deploy-preview | branch-deploy
const branch = process.env.BRANCH || process.env.HEAD || '?';
const publishDir = path.resolve(process.argv[2] || '.');
const isProduction = context === 'production';
const allowIndexing = isProduction && process.env.CS_ALLOW_INDEXING === 'true';

console.log(`deploy-guard: البيئة=${context} الفرع=${branch}`);

// --- 2) منع استخدام موارد الإنتاج في المعاينة ---
const fingerprints = (process.env.CS_PROD_FINGERPRINTS || '').split(',').map((s) => s.trim()).filter((s) => s.length >= 6);
if (!isProduction && fingerprints.length) {
  // مفاتيح Supabase القديمة (JWT) تخفي رقم المشروع داخلها مشفّراً، فنفك ترميزها للمقارنة
  const decoded = (v) => {
    const m = String(v).match(/eyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/);
    if (!m) return '';
    try { return Buffer.from(m[1], 'base64url').toString('utf8'); } catch { return ''; }
  };
  const offenders = Object.keys(process.env).filter((k) => {
    if (k === 'CS_PROD_FINGERPRINTS') return false;
    const v = String(process.env[k]);
    return fingerprints.some((fp) => v.includes(fp) || decoded(v).includes(fp));
  });
  if (offenders.length) {
    console.error(`✗ deploy-guard: بيئة المعاينة تستخدم موارد الإنتاج في المتغيرات: ${offenders.join(', ')}`);
    console.error('  ضع لهذه المتغيرات قيماً من مشروع التطوير في إعدادات Netlify (سياق Branch deploys / Deploy previews).');
    process.exit(1);
  }
}

// --- 1) منع الفهرسة ---
if (allowIndexing) {
  console.log('deploy-guard: الفهرسة مسموحة (الموقع الرسمي بعد الإطلاق).');
  process.exit(0);
}
fs.writeFileSync(path.join(publishDir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
const headersFile = path.join(publishDir, '_headers');
const existing = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, 'utf8') + '\n' : '';
fs.writeFileSync(headersFile, existing + '/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n');
console.log(`deploy-guard: الفهرسة ممنوعة لهذه النسخة (${isProduction ? 'قبل الإطلاق الرسمي' : 'نسخة معاينة'}).`);
