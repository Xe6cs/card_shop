/*
 * Card Shop — مصدر البيانات الموحّد (الأسعار، التوفر، الفئات، التعليمات)
 * ---------------------------------------------------------------------
 * هذا الملف هو المصدر الوحيد لكل ما يظهر في الواجهة. لا يوجد سعر أو حالة توفر
 * مكتوبة داخل صفحات HTML. في بيئة الإنتاج يُستبدل هذا الملف بملف تولّده مهمة
 * مزامنة آلية من Card Quick (API أو تصدير مجدول) وتحدّث `meta.pricesSyncedAt`.
 *
 * مصدر الأسعار الحالية: الأسعار المنشورة على card-shop.net بتاريخ 2026-10-09،
 * مع تصحيح منتجين تم التحقق منهما مباشرة على Card Quick بالتاريخ نفسه:
 *   - iTunes 2 USD (أمريكي): 4,400 د.ع وغير متوفر   (كان 3,500 د.ع على Card Shop)
 *   - PlayStation 10 USD (أمريكي): 17,250 د.ع        (كان 14,900 د.ع على Card Shop)
 * يجب مطابقة بقية الأسعار مع Card Quick قبل النشر.
 */
window.CS_DATA = {
  meta: {
    pricesSyncedAt: '2026-10-09T12:00:00+03:00',
    priceSource: 'Card Quick',
    siteUrl: 'https://www.card-shop.net/'
  },

  config: {
    // 'partner' = عرض المنتجات هنا وإكمال الدفع عبر Card Quick (نموذج العمل الحالي)
    checkoutMode: 'partner',
    // بعد هذه المدة من آخر مزامنة لا يُعرض السعر كسعر نهائي بل "آخر سعر معروف"
    priceMaxAgeHours: 72,
    partner: {
      name: 'Card Quick',
      nameAr: 'كارد كويك',
      baseUrl: 'https://www.card-quick.com',
      productPath: '/product/',
      accountUrl: 'https://www.card-quick.com/my-account/',
      ordersUrl: 'https://www.card-quick.com/my-account/orders/',
      policies: {
        privacy: 'https://www.card-quick.com/privacy/',
        terms: 'https://www.card-quick.com/terms-and-conditions/',
        refund: 'https://www.card-quick.com/refund/',
        faq: 'https://www.card-quick.com/faq/',
        contact: 'https://www.card-quick.com/contact/',
        complaints: 'https://www.card-quick.com/complaints-and-suggestion/'
      },
      paymentMethods: ['Visa', 'Mastercard']
    },
    support: {
      whatsapp: '9647706537891',
      whatsappDisplay: '+964 770 653 7891',
      refundsEmail: 'refunds@card-quick.com',
      facebook: 'https://www.facebook.com/cardquick/',
      // أضف ساعات العمل الفعلية هنا عند اعتمادها رسمياً. تُخفى من الواجهة ما دامت فارغة.
      hours: null
    },
    // تُضاف إلى روابط الانتقال إلى Card Quick لقياس الرحلة بين النطاقين
    utm: { utm_source: 'card-shop', utm_medium: 'referral', utm_campaign: 'product-handoff' }
  },

  /* التصنيفات الرئيسية — لا يظهر أي تصنيف في الواجهة ما لم يحتوِ منتجات منشورة */
  categories: [
    { id: 'games', name: 'بطاقات وشحن الألعاب', short: 'الألعاب', icon: 'gamepad',
      desc: 'رصيد PlayStation Store وشدات PUBG Mobile بفئات متعددة.' },
    { id: 'stores', name: 'بطاقات المتاجر الرقمية', short: 'المتاجر الرقمية', icon: 'bag',
      desc: 'بطاقات iTunes وApp Store للحسابات الأمريكية والبريطانية.' },
    { id: 'mobile', name: 'شحن رصيد الهاتف', short: 'رصيد الهاتف', icon: 'phone',
      desc: 'بطاقات تعبئة زين العراق وآسياسيل وكورك وعراق سيل.' },
    { id: 'internet', name: 'بطاقات وخدمات الإنترنت', short: 'الإنترنت', icon: 'wifi',
      desc: 'بطاقات Fastlink وتشك نت وFTTH مع توضيح منطقة كل بطاقة.' },
    { id: 'services', name: 'النقل والخدمات الرقمية', short: 'الخدمات', icon: 'car',
      desc: 'رصيد كريم العراق لرحلات التوصيل والخدمات داخل التطبيق.' },
    { id: 'subscriptions', name: 'الاشتراكات والبرامج', short: 'الاشتراكات', icon: 'repeat',
      desc: 'اشتراكات رقمية وبرامج.' }
  ],

  /* المناطق: تُعرض بجانب السعر وزر الشراء */
  regions: {
    US: { code: 'US', name: 'حساب أمريكي', country: 'الولايات المتحدة', syn: ['امريكي', 'امريكا', 'us', 'usa', 'امريكيه'] },
    UK: { code: 'UK', name: 'حساب بريطاني', country: 'المملكة المتحدة', syn: ['بريطاني', 'بريطانيا', 'uk', 'gb', 'انكليزي', 'انجليزي'] },
    AE: { code: 'AE', name: 'حساب إماراتي', country: 'الإمارات العربية المتحدة', syn: ['اماراتي', 'امارات', 'uae', 'ae', 'دبي'] },
    IQ: { code: 'IQ', name: 'العراق', country: 'العراق', syn: ['عراق', 'العراق', 'iq', 'iraq'] },
    GLOBAL: { code: 'GLOBAL', name: 'كل المناطق', country: 'غير مقيّدة بمنطقة', syn: ['عالمي', 'global'] },
    ERBIL: { code: 'ERBIL', name: 'أربيل فقط', country: 'أربيل — إقليم كوردستان', syn: ['اربيل', 'erbil', 'هولير', 'كوردستان', 'كردستان'] },
    KRD: { code: 'KRD', name: 'أربيل ودهوك', country: 'أربيل ودهوك — إقليم كوردستان', syn: ['اربيل', 'دهوك', 'erbil', 'duhok', 'كوردستان', 'كردستان'] },
    SULAY: { code: 'SULAY', name: 'السليمانية', country: 'السليمانية — إقليم كوردستان', syn: ['السليمانيه', 'سليمانيه', 'sulaymaniyah', 'slemani'] }
  },

  units: {
    USD: { label: 'USD', name: 'دولار أمريكي', syn: ['usd', 'دولار', '$'] },
    GBP: { label: 'GBP', name: 'جنيه إسترليني', syn: ['gbp', 'باوند', 'جنيه', '£', 'استرليني'] },
    IQD: { label: 'د.ع', name: 'دينار عراقي', syn: ['iqd', 'دينار', 'الف'] },
    UC: { label: 'UC', name: 'شدة', syn: ['uc', 'شده', 'شدات', 'شدة'] }
  },

  /* أنواع التسليم — يظهر فلتر نوع التسليم فقط عندما يوجد أكثر من نوع فعلياً */
  deliveryTypes: {
    code: { name: 'رمز رقمي', desc: 'تستلم رمزاً تستخدمه بنفسك في حسابك أو جهازك.' },
    direct: { name: 'شحن مباشر', desc: 'يُشحن الرصيد مباشرة إلى رقمك أو حسابك دون رمز.' },
    manual: { name: 'تنفيذ يدوي', desc: 'ينفذ فريق الدعم الطلب يدوياً خلال وقت يُحدد مع الطلب.' }
  },

  /* العلامات التجارية: ألوان تصميم البطاقة + المرادفات العربية والإنكليزية للبحث */
  brands: {
    playstation: { name: 'PlayStation', ar: 'بلايستيشن', c1: '#0a2a6b', c2: '#0070d1',
      syn: ['بلايستيشن', 'بلاي ستيشن', 'بلستيشن', 'بلاستيشن', 'بلايستيشن ستور', 'سوني', 'playstation', 'play station', 'ps', 'psn', 'ps4', 'ps5', 'ps plus', 'بلس'] },
    itunes: { name: 'iTunes', ar: 'آيتونز', c1: '#d6336c', c2: '#5f3dc4',
      syn: ['ايتونز', 'آيتونز', 'اي تونز', 'itunes', 'apple', 'ابل', 'آبل', 'app store', 'appstore', 'اب ستور', 'ايفون', 'iphone', 'icloud', 'ايكلاود'] },
    pubg: { name: 'PUBG Mobile', ar: 'ببجي', c1: '#3b2a05', c2: '#e8a317', fg: '#fff',
      syn: ['ببجي', 'ببجى', 'بوبجي', 'pubg', 'pubg mobile', 'شدات', 'شده', 'شدة', 'uc', 'midasbuy'] },
    zain: { name: 'Zain', ar: 'زين العراق', c1: '#111827', c2: '#4c1d95',
      syn: ['زين', 'زين العراق', 'zain', 'zain iraq'] },
    asiacell: { name: 'Asiacell', ar: 'آسياسيل', c1: '#7f1d1d', c2: '#dc2626',
      syn: ['اسياسيل', 'آسياسيل', 'اسيا', 'آسيا', 'اسيا سيل', 'asiacell', 'asia cell'] },
    korek: { name: 'Korek', ar: 'كورك', c1: '#1e3a8a', c2: '#ea580c',
      syn: ['كورك', 'كورك تيليكوم', 'korek', 'korek telecom'] },
    iraqcell: { name: 'Iraqcell', ar: 'عراق سيل', c1: '#064e3b', c2: '#059669',
      syn: ['عراق سيل', 'عراقسيل', 'iraqcell', 'iraq cell'] },
    fastlink: { name: 'Fastlink', ar: 'فاستلينك', c1: '#0c4a6e', c2: '#0891b2',
      syn: ['فاستلينك', 'فاست لينك', 'فاستلنك', 'fastlink', 'fast link', 'انترنت', 'نت'] },
    tishknet: { name: 'Tishknet', ar: 'تشك نت', c1: '#312e81', c2: '#7c3aed',
      syn: ['تشك نت', 'تشكنت', 'تيشك نت', 'tishknet', 'tishk net', 'انترنت', 'نت'] },
    ftth: { name: 'FTTH', ar: 'FTTH', c1: '#134e4a', c2: '#0d9488',
      syn: ['ftth', 'فايبر', 'الياف', 'ألياف', 'فايبر نت', 'o3', 'كوردستان نت', 'kurdistan net', 'انترنت', 'نت'] },
    careem: { name: 'Careem', ar: 'كريم العراق', c1: '#14532d', c2: '#16a34a',
      syn: ['كريم', 'كريم العراق', 'careem', 'careem pay', 'تكسي', 'توصيل'] }
  },

  /* منتجات غير متوفرة في المتجر — يعرض البحث رسالة صريحة بدلاً من "لا توجد نتائج" */
  notOffered: [
    { name: 'Steam', syn: ['steam', 'ستيم', 'ستيم كارد'] },
    { name: 'Google Play', syn: ['google play', 'googleplay', 'جوجل بلاي', 'كوكل بلاي', 'غوغل بلاي', 'قوقل بلاي'] },
    { name: 'Xbox', syn: ['xbox', 'اكس بوكس', 'إكس بوكس'] },
    { name: 'Netflix', syn: ['netflix', 'نتفليكس', 'نتفلكس'] },
    { name: 'Free Fire', syn: ['free fire', 'فري فاير'] }
  ],

  /* تعليمات مشتركة لكل نوع بطاقة (وصف أساسي واحد + بيانات مستقلة لكل فئة) */
  guides: {
    playstation: {
      what: 'رصيد يُضاف إلى محفظة حسابك على PlayStation Store لشراء الألعاب والإضافات والاشتراكات.',
      steps: [
        'من جهاز PS5 أو PS4 افتح PlayStation Store.',
        'افتح القائمة واختر «استرداد الرمز» (Redeem Code).',
        'أدخل الرمز كما وصلك ثم أكّد. يُضاف الرصيد إلى محفظة الحساب مباشرة.'
      ],
      alt: 'يمكنك أيضاً الاسترداد من المتصفح بعد تسجيل الدخول إلى حسابك على موقع PlayStation Store.',
      activation: 'حساب PlayStation Network مسجّل على منطقة البطاقة نفسها.'
    },
    itunes: {
      what: 'رصيد يُضاف إلى حساب Apple لاستخدامه في App Store وiTunes والاشتراكات المدعومة.',
      steps: [
        'افتح App Store واضغط على صورة حسابك.',
        'اختر «استرداد بطاقة هدايا أو رمز» ثم «إدخال الرمز يدوياً».',
        'الصق الرمز ثم اضغط «استرداد».'
      ],
      alt: 'يجب أن تكون منطقة حساب Apple مطابقة لمنطقة البطاقة، وإلا سيُرفض الرمز.',
      activation: 'حساب Apple مسجّل على منطقة البطاقة نفسها.'
    },
    pubg: {
      what: 'رمز شدات (UC) يُضاف إلى حسابك في PUBG Mobile. الكمية المذكورة تشمل الشدات الإضافية إن وجدت.',
      steps: [
        'افتح صفحة الاسترداد الرسمية لـ PUBG Mobile (Midasbuy).',
        'أدخل معرّف اللاعب (Player ID) الظاهر في ملفك داخل اللعبة.',
        'أدخل الرمز وأكّد، ثم أعد فتح اللعبة للتحقق من الرصيد.'
      ],
      alt: 'تحقق من معرّف اللاعب قبل التأكيد؛ الشدات المضافة إلى معرّف خاطئ لا يمكن استرجاعها.',
      activation: 'معرّف لاعب (Player ID) صحيح.'
    },
    telecom: {
      what: 'رمز تعبئة رصيد لخطوط المشغّل داخل العراق.',
      steps: [
        'انسخ رمز التعبئة من صفحة الطلب أو من البريد الإلكتروني.',
        'اشحن الرمز عبر كود التعبئة الخاص بالمشغّل أو من تطبيقه الرسمي.',
        'انتظر رسالة تأكيد إضافة الرصيد من المشغّل.'
      ],
      alt: 'الرمز صالح لخطوط المشغّل نفسه فقط ولا يعمل على شبكة أخرى.',
      activation: 'خط فعّال على شبكة المشغّل نفسه.'
    },
    isp: {
      what: 'بطاقة تجديد اشتراك إنترنت لدى مزوّد الخدمة المذكور.',
      steps: [
        'انسخ رمز البطاقة من صفحة الطلب.',
        'أدخل الرمز في بوابة المشترك أو تطبيق المزوّد، أو أرسله إلى خدمة عملاء المزوّد.',
        'تأكد من تجديد الاشتراك في حسابك لدى المزوّد.'
      ],
      alt: 'تأكد أن اشتراكك لدى المزوّد نفسه وفي المنطقة المذكورة قبل الشراء.',
      activation: 'اشتراك فعّال لدى المزوّد نفسه.'
    },
    careem: {
      what: 'رصيد يُضاف إلى محفظة Careem Pay في تطبيق كريم لاستخدامه في الرحلات والخدمات المدعومة.',
      steps: [
        'افتح تطبيق Careem وادخل إلى المحفظة (Careem Pay).',
        'اختر «إضافة رصيد» ثم «بطاقة شحن» أو «قسيمة».',
        'أدخل الرمز وأكّد. قد تختلف تسميات القوائم حسب إصدار التطبيق.'
      ],
      alt: 'الرصيد مخصص لحسابات كريم في العراق.',
      activation: 'حساب Careem في العراق.'
    }
  },

  /*
   * المنتجات: كل منتج = علامة + منطقة، وتحته فئاته (variants).
   * v = القيمة الاسمية بوحدة المنتج — price = سعر البيع بالدينار — cq = رابط المنتج على Card Quick
   * stock: 'in' متوفر | 'out' غير متوفر — cq: null يعني لا يوجد مسار شراء صحيح حالياً
   * pop = ترتيب الأكثر طلباً (يُحدَّث من تقارير المبيعات الفعلية)
   * legacy = مسار الرابط القديم على card-shop.net لإعداد تحويلات 301
   */
  products: [
    {
      id: 'playstation-us', brand: 'playstation', category: 'games', guide: 'playstation',
      region: 'US', unit: 'USD', delivery: 'code', regionLock: true,
      restriction: 'تعمل هذه البطاقة فقط مع حسابات PlayStation المسجّلة على المتجر الأمريكي، ولا تعمل على الحسابات العربية أو البريطانية.',
      confirm: 'أؤكد أن حسابي على PlayStation مسجّل على المتجر الأمريكي.',
      title: 'بطاقة PlayStation Store — حساب أمريكي',
      accountType: 'حساب PlayStation على المتجر الأمريكي',
      legacy: 'بلايستيشن-{v}-للحساب-الأمريكي',
      variants: [
        { v: 10, price: 17250, cq: 'playstation-10-us', stock: 'in', pop: 1 },
        { v: 20, price: 28750, cq: 'playstation-20-us', stock: 'in', pop: 3 },
        { v: 25, price: 38000, cq: 'playstation-25-us', stock: 'in' },
        { v: 50, price: 70750, cq: 'playstation-50-us', stock: 'in', pop: 6 },
        { v: 60, price: 86000, cq: 'playstation-60-us', stock: 'in' },
        { v: 75, price: 107000, cq: 'playstation-75-us', stock: 'in' },
        { v: 100, price: 140240, cq: 'playstation-100-us', stock: 'in' }
      ]
    },
    {
      id: 'playstation-uk', brand: 'playstation', category: 'games', guide: 'playstation',
      region: 'UK', unit: 'GBP', delivery: 'code', regionLock: true,
      restriction: 'تعمل هذه البطاقة فقط مع حسابات PlayStation المسجّلة على المتجر البريطاني.',
      confirm: 'أؤكد أن حسابي على PlayStation مسجّل على المتجر البريطاني.',
      title: 'بطاقة PlayStation Store — حساب بريطاني',
      accountType: 'حساب PlayStation على المتجر البريطاني',
      legacy: 'بلايستيشن-{v}-للحساب-البريطاني',
      variants: [
        { v: 5, price: 12000, cq: 'playstation-5-gbp', stock: 'in' },
        { v: 10, price: 21750, cq: 'playstation-10-gbp', stock: 'in' },
        { v: 20, price: 40250, cq: 'playstation-20-gbp', stock: 'in' },
        { v: 50, price: 98250, cq: 'playstation-50-gbp', stock: 'in' }
      ]
    },
    {
      id: 'playstation-uae', brand: 'playstation', category: 'games', guide: 'playstation',
      region: 'AE', unit: 'USD', delivery: 'code', regionLock: true,
      restriction: 'تعمل هذه البطاقة فقط مع حسابات PlayStation المسجّلة على المتجر الإماراتي.',
      confirm: 'أؤكد أن حسابي على PlayStation مسجّل على المتجر الإماراتي.',
      title: 'بطاقة PlayStation Store — حساب إماراتي',
      accountType: 'حساب PlayStation على المتجر الإماراتي',
      legacy: 'بلايستيشن-{v}-للحساب-الاماراتي',
      variants: [
        { v: 5, price: 8000, cq: 'playstation-5-uae', stock: 'in' },
        { v: 10, price: 15308, cq: 'playstation-10-uae', stock: 'in' },
        { v: 20, price: 30000, cq: 'playstation-20-uae', stock: 'in' },
        { v: 50, price: 73550, cq: 'playstation-50-uae', stock: 'in' }
      ]
    },
    {
      id: 'pubg-uc', brand: 'pubg', category: 'games', guide: 'pubg',
      region: 'GLOBAL', unit: 'UC', delivery: 'code', regionLock: false,
      restriction: 'تُشحن الشدات إلى معرّف اللاعب الذي تُدخله عند الاسترداد، لذا تحقق منه جيداً.',
      title: 'شدات PUBG Mobile',
      accountType: 'أي حساب PUBG Mobile (يلزم معرّف اللاعب)',
      legacy: 'ببجي-{v}-شدة',
      variants: [
        { v: 60, price: 2040, cq: 'pubgm-uc60', stock: 'in' },
        { v: 325, price: 7250, cq: 'pubgm-uc300', stock: 'in', pop: 2 },
        { v: 660, price: 13990, cq: 'pubgm-uc600', stock: 'in', pop: 5 },
        { v: 1800, price: 33295, cq: 'pubgm-uc1500', stock: 'in' },
        { v: 3850, price: 66000, cq: 'pubgm-uc3000', stock: 'in' },
        { v: 8100, price: 131250, cq: 'pubgm-uc8100', stock: 'in', legacy: 'ببجي-موبايل-8100-شدة' },
        { v: 8400, price: 152000, cq: 'pubgm-uc8400', stock: 'in' }
      ]
    },
    {
      id: 'itunes-us', brand: 'itunes', category: 'stores', guide: 'itunes',
      region: 'US', unit: 'USD', delivery: 'code', regionLock: true,
      restriction: 'يعمل هذا الرمز فقط مع حسابات Apple المسجّلة على المتجر الأمريكي.',
      confirm: 'أؤكد أن حساب Apple الخاص بي مسجّل على المتجر الأمريكي.',
      title: 'بطاقة iTunes و App Store — حساب أمريكي',
      accountType: 'حساب Apple على المتجر الأمريكي',
      legacy: 'ايتونز-{v}-دولار-أمريكي',
      variants: [
        { v: 2, price: 4400, cq: 'itunes-2-us', stock: 'out' },
        { v: 3, price: 5000, cq: 'itunes-3-us', stock: 'in' },
        { v: 4, price: 7000, cq: 'itunes-4-us', stock: 'in' },
        { v: 5, price: 8250, cq: 'itunes-5-us', stock: 'in' },
        { v: 10, price: 15750, cq: 'itunes-10-us', stock: 'in', pop: 4 },
        { v: 15, price: 22750, cq: 'itunes-15-us', stock: 'in' },
        { v: 25, price: 38000, cq: 'itunes-25-us', stock: 'in', pop: 8 },
        { v: 50, price: 74500, cq: 'itunes-50-us', stock: 'in' },
        { v: 100, price: 149000, cq: 'itunes-100-us', stock: 'in' },
        { v: 300, price: 469000, cq: 'itunes-300-us', stock: 'in' },
        { v: 400, price: 620000, cq: 'itunes-400-us', stock: 'in' }
      ]
    },
    {
      id: 'itunes-uk', brand: 'itunes', category: 'stores', guide: 'itunes',
      region: 'UK', unit: 'GBP', delivery: 'code', regionLock: true,
      restriction: 'يعمل هذا الرمز فقط مع حسابات Apple المسجّلة على المتجر البريطاني.',
      confirm: 'أؤكد أن حساب Apple الخاص بي مسجّل على المتجر البريطاني.',
      title: 'بطاقة iTunes و App Store — حساب بريطاني',
      accountType: 'حساب Apple على المتجر البريطاني',
      legacy: 'ايتونز-بريطاني-{v}-باوند',
      variants: [
        { v: 10, price: 22500, cq: 'itunes-10-uk', stock: 'in' },
        { v: 15, price: 33500, cq: 'itunes-15-uk', stock: 'in' },
        { v: 25, price: 54000, cq: 'itunes-25-uk', stock: 'in' },
        { v: 50, price: 104000, cq: 'itunes-50-uk', stock: 'in' },
        { v: 100, price: 200000, cq: 'itunes-100-uk', stock: 'in' }
      ]
    },
    {
      id: 'zain-iq', brand: 'zain', category: 'mobile', guide: 'telecom',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لخطوط زين العراق فقط.',
      title: 'رصيد زين العراق',
      accountType: 'خطوط زين العراق المسبقة الدفع',
      variants: [
        { v: 5000, price: 6620, cq: 'zainiq-5000iqd', stock: 'in' },
        { v: 10000, price: 12750, cq: 'zainiq-10000iqd', stock: 'in', pop: 7 },
        { v: 15000, price: 19500, cq: 'zainiq-15000iqd', stock: 'in' },
        { v: 25000, price: 31160, cq: 'zainiq-25000iqd', stock: 'in' },
        { v: 35000, price: 43420, cq: 'zainiq-35000iqd', stock: 'in' },
        { v: 50000, price: 62000, cq: 'zainiq-50000iqd', stock: 'in' },
        { v: 100000, price: 124000, cq: 'zainiq-100000iqd', stock: 'in' }
      ]
    },
    {
      id: 'asiacell-iq', brand: 'asiacell', category: 'mobile', guide: 'telecom',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لخطوط آسياسيل فقط.',
      title: 'رصيد آسياسيل',
      accountType: 'خطوط آسياسيل المسبقة الدفع',
      variants: [
        { v: 5000, price: 6600, cq: 'asiacell-5000iqd', stock: 'in' },
        { v: 10000, price: 12600, cq: 'asiacell-10000iqd', stock: 'in', pop: 9 },
        { v: 15000, price: 19250, cq: 'asiacell-15000iqd', stock: 'in' },
        { v: 25000, price: 31250, cq: 'asiacell-25000iqd', stock: 'in' },
        { v: 40000, price: 48950, cq: 'asiacell-40000iqd', stock: 'in' },
        { v: 50000, price: 62500, cq: 'asiacell-50000iqd', stock: 'in' },
        { v: 100000, price: 122000, cq: 'asiacell-100000iqd', stock: 'in' }
      ]
    },
    {
      id: 'korek-iq', brand: 'korek', category: 'mobile', guide: 'telecom',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لخطوط كورك فقط.',
      title: 'رصيد كورك',
      accountType: 'خطوط كورك المسبقة الدفع',
      variants: [
        { v: 5000, price: 6500, cq: 'korek-telecom-5000iqd', stock: 'in' },
        { v: 10000, price: 12550, cq: 'korek-telecom-10000iqd', stock: 'in' },
        { v: 15000, price: 18950, cq: 'korek-telecom-15000iqd', stock: 'in' },
        { v: 30000, price: 37250, cq: 'korek-telecom-30000iqd', stock: 'in' },
        { v: 60000, price: 73500, cq: 'korek-telecom-60000iqd', stock: 'in' },
        { v: 70000, price: 86000, cq: 'korek-telecom-70000iqd', stock: 'in' },
        { v: 100000, price: 125000, cq: 'korek-telecom-100000iqd', stock: 'in' }
      ]
    },
    {
      id: 'iraqcell-iq', brand: 'iraqcell', category: 'mobile', guide: 'telecom',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لخطوط عراق سيل فقط.',
      title: 'رصيد عراق سيل',
      accountType: 'خطوط عراق سيل',
      variants: [
        { v: 5000, price: 7000, cq: 'iraqcell-5000iqd', stock: 'in' },
        { v: 10000, price: 13000, cq: 'iraqcell-10000iqd', stock: 'in' }
      ]
    },
    {
      id: 'fastlink', brand: 'fastlink', category: 'internet', guide: 'isp',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لمشتركي Fastlink فقط. لمشتركي السليمانية توجد بطاقة مخصصة.',
      title: 'بطاقات واشتراكات Fastlink',
      accountType: 'مشتركو Fastlink',
      variants: [
        { v: 15000, price: 15750, cq: null, stock: 'out', legacy: 'فاستلينك-15000-دينار', note: 'لا يوجد مسار شراء إلكتروني لهذه البطاقة حالياً.' },
        { v: 18000, label: 'باقة بيانات بقيمة 18,000 د.ع', chip: '18,000 بيانات', price: 19100, cq: 'fastlink-data-bundle-18000iqd', stock: 'in' },
        { v: 39000, label: 'اشتراك شهري بقيمة 39,000 د.ع', chip: '39,000 شهري', price: 39750, cq: 'fastlink-card-39000-monthly', stock: 'in' },
        { v: 69000, label: 'اشتراك شهري بقيمة 69,000 د.ع', chip: '69,000 شهري', price: 69750, cq: 'fastlink-card-69000-monthly', stock: 'in' },
        { v: null, key: '6m', label: 'اشتراك نصف سنوي', chip: 'نصف سنوي', price: 92000, cq: 'fastlink-recharge-6months', stock: 'in' },
        { v: null, key: '12m', label: 'اشتراك سنوي', chip: 'سنوي', price: 173100, cq: 'fastlink-1year', stock: 'in' }
      ]
    },
    {
      id: 'fastlink-sulaymaniyah', brand: 'fastlink', category: 'internet', guide: 'isp',
      region: 'SULAY', unit: 'IQD', delivery: 'code', regionLock: true,
      restriction: 'هذه البطاقة مخصصة لمشتركي Fastlink في السليمانية فقط.',
      confirm: 'أؤكد أن اشتراكي في Fastlink ضمن منطقة السليمانية.',
      title: 'بطاقة Fastlink — السليمانية',
      accountType: 'مشتركو Fastlink في السليمانية',
      variants: [
        { v: 15000, label: 'اشتراك شهري بقيمة 15,000 د.ع', chip: '15,000 شهري', price: 16000, cq: 'fastlink-sulaymaniyah-15000-monthly', stock: 'in' }
      ]
    },
    {
      id: 'tishknet', brand: 'tishknet', category: 'internet', guide: 'isp',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: false,
      restriction: 'صالحة لمشتركي تشك نت فقط.',
      title: 'بطاقات تشك نت',
      accountType: 'مشتركو تشك نت',
      variants: [
        { v: 5000, price: 5750, cq: 'tishknet-5000', stock: 'in' },
        { v: 10000, price: 11000, cq: 'tishknet-10000', stock: 'in' },
        { v: 25000, price: 26000, cq: 'tishknet-25000', stock: 'in' },
        { v: 35000, price: 36000, cq: 'tishknet-35000', stock: 'in' }
      ]
    },
    {
      id: 'ftth-o3-erbil', brand: 'ftth', category: 'internet', guide: 'isp',
      region: 'ERBIL', unit: 'IQD', delivery: 'code', regionLock: true,
      restriction: 'هذه البطاقة صالحة فقط في أربيل — إقليم كوردستان، ولمشتركي O3 Telecom.',
      confirm: 'أؤكد أن اشتراكي في FTTH لدى O3 Telecom في أربيل.',
      title: 'بطاقة FTTH من O3 Telecom — أربيل',
      accountType: 'مشتركو FTTH لدى O3 Telecom في أربيل',
      provider: 'O3 Telecom',
      variants: [
        { v: 20000, price: 21750, cq: 'ftth-20iqd-koya', stock: 'in' },
        { v: 29000, price: 30750, cq: 'ftth-29iqd', stock: 'in' },
        { v: 39000, price: 40250, cq: 'ftth-39iqd', stock: 'in' },
        { v: 59000, price: 60350, cq: 'ftth-59iqd', stock: 'in' }
      ]
    },
    {
      id: 'ftth-kurdistannet', brand: 'ftth', category: 'internet', guide: 'isp',
      region: 'KRD', unit: 'IQD', delivery: 'code', regionLock: true,
      restriction: 'مخصصة لمشتركي FTTH لدى Kurdistan Net (أربيل ودهوك). لا تعمل مع مزوّدي FTTH الآخرين.',
      confirm: 'أؤكد أن اشتراكي في FTTH لدى Kurdistan Net.',
      title: 'بطاقة FTTH من Kurdistan Net',
      accountType: 'مشتركو FTTH لدى Kurdistan Net',
      provider: 'Kurdistan Net',
      variants: [
        { v: 25000, price: 26500, cq: 'ftth-rechrage-25000iqd', stock: 'in' }
      ]
    },
    {
      id: 'careem-iq', brand: 'careem', category: 'services', guide: 'careem',
      region: 'IQ', unit: 'IQD', delivery: 'code', regionLock: true,
      restriction: 'الرصيد مخصص لحسابات Careem في العراق فقط.',
      confirm: 'أؤكد أن حسابي على Careem مسجّل في العراق.',
      title: 'رصيد كريم العراق',
      accountType: 'حسابات Careem في العراق',
      variants: [
        { v: 10000, price: 11000, cq: 'careem-10iqd', stock: 'in' },
        { v: 15000, price: 16000, cq: 'careem-15iqd', stock: 'in' },
        { v: 25000, price: 26000, cq: 'careem-25iqd', stock: 'in', pop: 10 },
        { v: 50000, price: 51000, cq: 'careem-50iqd', stock: 'in' }
      ]
    }
  ]
};
