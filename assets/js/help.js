/* مركز المساعدة: بطاقات التواصل، نموذج الاستفسار، وبيانات الأسئلة الشائعة المنظمة */
(function () {
  'use strict';
  const { $, $$ } = CS;

  $('#contact-cards').innerHTML = CS.contactHTML();

  // نموذج الاستفسار: يجهّز رسالة واتساب (لا يوجد خادم يستقبل النماذج في هذه النسخة)
  const form = $('#inquiry'), msg = $('#f-msg'), err = $('#f-msg-e');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!msg.value.trim()) {
      err.hidden = false;
      msg.setAttribute('aria-invalid', 'true');
      msg.focus();
      return;
    }
    err.hidden = true;
    msg.removeAttribute('aria-invalid');
    const order = $('#f-order').value.trim();
    const text = [`نوع الاستفسار: ${$('#f-type').value}`, order ? `رقم الطلب: ${order}` : '', `الرسالة: ${msg.value.trim()}`, '(مرسلة من Card Shop)']
      .filter(Boolean).join('\n');
    CS.track('support_inquiry', { inquiry_type: $('#f-type').value });
    window.open(CS.waUrl(text), '_blank', 'noopener');
  });
  msg.addEventListener('input', () => { if (msg.value.trim()) { err.hidden = true; msg.removeAttribute('aria-invalid'); } });

  // فتح السؤال المطلوب عند الوصول إليه برابط مباشر
  if (location.hash === '#faq') { const first = $('#faq-list details'); if (first) first.open = true; }

  // FAQPage structured data من الأسئلة المعروضة نفسها (لا تكرار للمحتوى)
  CS.setJsonLd('ld-faq', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: $$('#faq-list details').map((d) => ({
      '@type': 'Question',
      name: d.querySelector('summary').textContent.trim(),
      acceptedAnswer: { '@type': 'Answer', text: d.querySelector('div').textContent.trim() }
    }))
  });
})();
