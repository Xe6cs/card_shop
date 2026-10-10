#!/usr/bin/env node
// فحص الأسرار: يمنع حفظ أو رفع أي مفتاح سري أو ملف مفاتيح إلى GitHub.
//   node tools/check-secrets.js --staged   يفحص الملفات المجهّزة للحفظ (يستخدمه .githooks/pre-commit)
//   node tools/check-secrets.js --all      يفحص كل الملفات في المستودع (يستخدمه GitHub Actions)
// لاستثناء سطر تأكدت أنه آمن: أضف في السطر نفسه التعليق  secret-scan:allow
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');

const mode = process.argv.includes('--all') ? 'all' : 'staged';
const git = (args, buffer) => execFileSync('git', args, { encoding: buffer ? 'buffer' : 'utf8', maxBuffer: 64 * 1024 * 1024 });

const files = (mode === 'all'
  ? git(['ls-files', '-z'])
  : git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
).split('\0').filter(Boolean);

// ملفات لا يجوز رفعها مهما كان محتواها
const BLOCKED_FILES = [
  { re: /(^|\/)\.env(\.(?!example$)[^/]+)?$/, why: 'ملف متغيرات بيئة (.env) — مكانه جهازك أو إعدادات Netlify فقط' },
  { re: /\.(pem|key|p12|pfx|jks|keystore)$/i, why: 'ملف مفتاح أو شهادة خاصة' },
  { re: /(^|\/)id_(rsa|ed25519|ecdsa|dsa)$/, why: 'مفتاح SSH خاص' },
  { re: /service[-_]?account[^/]*\.json$/i, why: 'ملف حساب خدمة' }
];

// أنماط مفاتيح معروفة
const RULES = [
  { re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY(?: BLOCK)?-----/, why: 'مفتاح خاص (Private key)' },
  { re: /\bsb_secret_[A-Za-z0-9_-]{16,}/, why: 'مفتاح Supabase السري' },
  { re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})/, why: 'رمز وصول GitHub' },
  { re: /\bphx_[A-Za-z0-9]{30,}/, why: 'مفتاح PostHog الشخصي (السري)' },
  { re: /\bnfp_[A-Za-z0-9]{30,}/, why: 'رمز وصول Netlify' },
  { re: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/, why: 'مفتاح دفع حقيقي (Stripe)' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, why: 'مفتاح AWS' },
  { re: /\bxox[abpors]-[A-Za-z0-9-]{10,}/, why: 'رمز Slack' }
];

// متغير باسم سري وقيمة حقيقية، مثل SUPABASE_SERVICE_ROLE_KEY=abc...
const ASSIGN = /\b([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE_KEY|SERVICE_ROLE|API_KEY|ACCESS_KEY)[A-Z0-9_]*)\s*[:=]\s*["'`]?([^\s"'`#,;)]{12,})/g;
const PLACEHOLDER = /^(your|xxx|change|example|placeholder|dummy|test|<|\$\{|\$[A-Z_]|process\.env|import\.meta|env\(|\*{3})/i;
const JWT = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

const mask = (s) => s.slice(0, 6) + '…';
const findings = [];
const add = (file, line, why, sample) => findings.push({ file, line, why, sample });

for (const file of files) {
  const blocked = BLOCKED_FILES.find((b) => b.re.test(file));
  if (blocked) { add(file, 0, blocked.why, ''); continue; }

  let buf;
  try { buf = mode === 'all' ? fs.readFileSync(file) : git(['show', `:${file}`], true); } catch { continue; }
  if (buf.subarray(0, 8000).includes(0)) continue; // ملف ثنائي (صورة مثلاً)

  buf.toString('utf8').split(/\r?\n/).forEach((text, i) => {
    if (text.includes('secret-scan:allow')) return;
    const line = i + 1;
    for (const r of RULES) {
      const m = text.match(r.re);
      if (m) add(file, line, r.why, mask(m[0]));
    }
    for (const m of text.matchAll(JWT)) {
      try {
        const payload = JSON.parse(Buffer.from(m[0].split('.')[1], 'base64url').toString('utf8'));
        if (payload.role && payload.role !== 'anon') add(file, line, `رمز JWT بصلاحية «${payload.role}» (سري)`, mask(m[0]));
      } catch { /* ليس JWT حقيقياً */ }
    }
    for (const m of text.matchAll(ASSIGN)) {
      const [, name, value] = m;
      if (PLACEHOLDER.test(value)) continue;
      if (/^NEXT_PUBLIC_/.test(name) && !/SECRET|SERVICE_ROLE|PRIVATE|PASSWORD/.test(name)) continue;
      add(file, line, `قيمة سرية في المتغير ${name}`, mask(value));
    }
  });
}

if (findings.length) {
  console.error('\n✗ فحص الأسرار: تم إيقاف العملية لوجود مفاتيح أو ملفات سرية:\n');
  for (const f of findings) console.error(`  - ${f.file}${f.line ? ':' + f.line : ''} — ${f.why}${f.sample ? ` (${f.sample})` : ''}`);
  console.error('\nالحل: احذف المفتاح من الملف وضعه في .env.local (لا يُرفع) أو في إعدادات Netlify.');
  console.error('إذا كان المفتاح قد رُفع سابقاً إلى GitHub فاعتبره مكشوفاً وأنشئ مفتاحاً جديداً من لوحة الخدمة.\n');
  process.exit(1);
}
const n = files.length, m = n % 100;
const count = n === 1 ? 'ملف واحد' : n === 2 ? 'ملفان' : m >= 3 && m <= 10 ? `${n} ملفات` : m >= 11 ? `${n} ملفاً` : `${n} ملف`;
console.log(`✓ فحص الأسرار: لا توجد مفاتيح سرية (${count})`);
