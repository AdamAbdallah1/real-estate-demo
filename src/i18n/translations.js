/**
 * NARA translation dictionaries — pure data + pure helpers.
 *
 * No React, no Firebase, no DOM: this module is imported by the public data
 * layer (property model, WhatsApp builders) as well as by components, so it
 * must stay dependency-free.
 *
 * Rules of the system:
 *  - `en` is the source of truth for the key set; `ar` must match it.
 *  - Every key is looked up with dots:  t('nav.buy')
 *  - A missing Arabic string falls back to English (and vice versa), so an
 *    untranslated key never renders as `undefined`.
 *  - Content written by editors (properties, CMS copy) is stored as
 *    { en, ar } and resolved through `resolveText`.
 *  - Internal identifiers (region ids, property types, purposes, statuses,
 *    slugs, statuses) are NEVER translated — only their display labels.
 */

export const LOCALES = ['en', 'ar']
export const DEFAULT_LOCALE = 'en'

/* -------------------------------------------------------------------------- */
/* Place names, property types, views and feature labels                       */
/* -------------------------------------------------------------------------- */

/**
 * English display name → Arabic display name.
 * Used for cities, districts, regions and area names that exist in the data as
 * stable English identifiers. Unknown values pass through unchanged.
 */
const PLACES_AR = {
  Lebanon: 'لبنان',
  Beirut: 'بيروت',
  'Mount Lebanon': 'جبل لبنان',
  'The Coast': 'الساحل',
  'North Lebanon': 'شمال لبنان',
  'South Lebanon': 'جنوب لبنان',
  Achrafieh: 'الأشرفية',
  Saifi: 'السيفي',
  Sursock: 'سورسوك',
  'Mar Mikhael': 'مار مخائيل',
  Hamra: 'الحمرا',
  Verdun: 'فردان',
  Clemenceau: 'كليمنصو',
  Badaro: 'بدارو',
  'Beit Mery': 'بيت مري',
  Hazmieh: 'حاصمية',
  Baabda: 'بعبدا',
  Broummana: 'برومانة',
  Jounieh: 'جونية',
  Batroun: 'البترون',
  Byblos: 'جبيل',
  Ehden: 'إهدن',
  Saida: 'صيدا',
  Tyre: 'صور',
  'Ain Mreisseh': 'عين المريسيه',
  'Sin el Fil': 'سن الفيل',
  Corniche: 'الكورنيش',
}

const TYPES_AR = {
  Apartment: 'شقة',
  Villa: 'فيلا',
  Penthouse: 'بنتهاوس',
  Chalet: 'شاليه',
  Office: 'مكتب',
  Land: 'أرض',
  Commercial: 'تجاري',
}

const VIEWS_AR = {
  'Sea view': 'إطلالة على البحر',
  'Garden view': 'إطلالة على الحديقة',
  'City view': 'إطلالة على المدينة',
  'Mountain view': 'إطلالة على الجبل',
  'Valley view': 'إطلالة على الوادي',
  'Sea and pine view': 'إطلالة على البحر والصنوبر',
  'Sea glimpse': 'لمسة من البحر',
}

const FEATURES_AR = {
  Balcony: 'شرفة',
  Terrace: 'تراس',
  'Sea view': 'إطلالة على البحر',
  'Garden view': 'إطلالة على الحديقة',
  Elevator: 'مصعد',
  Concierge: 'حارس عمارة',
  '24h electricity': 'كهرباء على مدار الساعة',
  'Storage room': 'مخزن',
  'Two parking spots': 'موقفا سيارتين',
  'Near port': 'قريب من الميناء',
  'Family-owned building': 'عمارة عائلية',
  Pool: 'مسبح',
  'Large plot': 'قطعة أرض كبيرة',
  'Double-height lounge': 'صالة بسقف مزدوج',
  'Solar panels': 'ألواح شمسية',
  Generator: 'مولد',
  'Close to metro line': 'قريب من خط المترو',
  'Furnished option': 'إمكانية التأثيث',
  Lettable: 'صالح للتأجير',
  '90 m² terrace': 'تراس 90 م²',
  'Valet parking': 'خدمة صف السيارات',
  Gym: 'صالة رياضية',
  "Maid's room": 'غرفة خادمة',
  Fireplace: 'مدفأة',
  'Cedar ceilings': 'أسقف أرزية',
  'Valley view': 'إطلالة على الوادي',
  Privacy: 'خصوصية',
  Heating: 'تدفئة',
  'Corniche nearby': 'الكورنيش على مسافة قريبة',
  'Renovated kitchen': 'مطبخ مجدد',
  Furnished: 'مؤثث',
  'Utilities included': 'الخدمات مشمولة',
  'Pets allowed': 'يُسمح بالحيوانات الأليفة',
  'Walk-up': 'بدون مصعد',
  'Short walk to port': 'مشي قصير حتى الميناء',
  'Deep balcony': 'شرفة عميقة',
  Storage: 'مخزن',
  'Quiet street': 'شارع هادئ',
  'Near Jesuit University': 'قريب من الجامعة اليسوعية',
  'Mountains nearby': 'الجبال قريبة',
  'Corniche access': 'وصول إلى الكورنيش',
  Fitted: 'مجهّز',
  'Reception area': 'استقبال',
  'Zoned for home': 'مخصّص لبناء منزل',
  'Road access': 'وصول عبر طريق',
  'Utilities on site': 'خدمات في الموقع',
  'Old growth pines': 'صنوبر قديم',
}

/* -------------------------------------------------------------------------- */
/* The message catalogue                                                       */
/* -------------------------------------------------------------------------- */

export const MESSAGES = {
  en: {
    /* --- brand / nav -------------------------------------------------- */
    'brand.name': 'NARA',
    'brand.sub': 'REAL ESTATE',
    'nav.primary': 'Primary',
    'nav.home': 'NARA Real Estate — home',
    'nav.buy': 'Buy',
    'nav.rent': 'Rent',
    'nav.sell': 'Sell',
    'nav.locations': 'Locations',
    'nav.about': 'About',
    'nav.saved': 'Saved',
    'nav.savedCount': 'Saved ({n})',
    'nav.letsTalk': "LET'S TALK",
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'nav.menu': 'Menu',
    'nav.footer': 'Footer',
    'nav.beirut': 'Beirut, Lebanon',
    'nav.toggle': 'Switch language',
    'nav.langEn': 'EN',
    'nav.langAr': 'العربية',

    /* --- hero --------------------------------------------------------- */
    'hero.eyebrow': 'LEBANON',
    'hero.headingDefault': 'The right address,\nfound properly.',
    'hero.descriptionDefault': 'A considered collection of homes across Beirut, the coast and the mountains.',
    'hero.searchLabel': 'Search properties',
    'hero.buy': 'BUY',
    'hero.rent': 'RENT',
    'hero.location': 'LOCATION',
    'hero.allLebanon': 'All Lebanon',
    'hero.type': 'TYPE',
    'hero.allTypes': 'All types',
    'hero.bedrooms': 'BEDROOMS',
    'hero.anyBeds': 'Any',
    'hero.price': 'PRICE',
    'hero.search': 'SEARCH',
    'hero.imageAlt': 'A contemporary Lebanese villa facade with clean stone and cedar detailing',

    /* --- results ------------------------------------------------------ */
    'results.eyebrow': 'COLLECTION',
    'common.any': 'Any',
    'results.title': 'Properties',
    'results.filterLocation': 'Filter by location',
    'results.filterType': 'Filter by type',
    'results.filterBeds': 'Filter by bedrooms',
    'results.sort': 'Sort properties',
    'results.all': 'ALL',
    'results.buy': 'BUY',
    'results.rent': 'RENT',
    'results.allLocations': 'All locations',
    'results.allTypes': 'All types',
    'results.anyBeds': 'Any beds',
    'results.clear': 'CLEAR',
    'results.searchPlaceholder': 'Search by location, type or feature…',
    'results.recent': 'RECENTLY VIEWED',
    'results.emptyTitle': 'Nothing matches those filters',
    'results.emptyBody': 'The current search is too narrow. Try widening a filter or two, or start from the full collection.',
    'results.clearFilters': 'CLEAR FILTERS',
    'results.viewAll': 'VIEW ALL PROPERTIES',

    /* --- sort labels --------------------------------------------------- */
    'sort.recommended': 'Recommended',
    'sort.price-asc': 'Price: Low to high',
    'sort.price-desc': 'Price: High to low',
    'sort.area-desc': 'Largest',
    'sort.beds-desc': 'Bedrooms',

    /* --- cards --------------------------------------------------------- */
    'card.view': 'VIEW PROPERTY',
    'card.viewAria': 'View {title}, {city}',
    'card.imageAlt': '{title} in {city}',
    'card.compare': '+ COMPARE',
    'card.comparing': 'COMPARING',
    'card.compareMax': 'Maximum of 3 properties',
    'card.save': 'SAVE',
    'card.saved': 'SAVED',
    'card.saveAria': 'Save property',
    'card.savedAria': 'Remove from saved properties',

    /* --- counts -------------------------------------------------------- */
    'count.property': 'property',
    'count.properties': 'properties',
    'count.in': 'in {place}',
    'count.forRent': 'for rent',
    'count.forSale': 'for sale',
    'price.perMonth': 'month',
    'spec.beds': 'beds',
    'spec.bedsOne': 'bed',
    'spec.baths': 'baths',
    'spec.bathsOne': 'bath',

    /* --- detail -------------------------------------------------------- */
    'detail.close': 'Close property detail',
    'detail.imageAlt': '{title} — view {n}',
    'detail.viewImage': 'View image {n}',
    'detail.features': 'FEATURES',
    'detail.price': 'PRICE',
    'detail.area': 'Area',
    'detail.bedrooms': 'Bedrooms',
    'detail.bathrooms': 'Bathrooms',
    'detail.parking': 'Parking',
    'detail.floor': 'Floor',
    'detail.view': 'View',
    'detail.requestViewing': 'REQUEST A VIEWING',
    'detail.whatsapp': 'WHATSAPP ABOUT THIS PROPERTY',
    'detail.copyLink': 'COPY LINK',
    'detail.linkCopied': 'LINK COPIED',
    'detail.copyPrompt': 'Copy this link:',
    'detail.shareWhatsapp': 'SHARE VIA WHATSAPP',
    'detail.continue': 'CONTINUE',
    'detail.similar': 'You may also consider',
    'detail.concept': 'Concept website · Property details shown for demonstration.',
    'detail.type': 'Type',

    /* --- viewing form --------------------------------------------------- */
    'viewing.title': 'Request a viewing',
    'viewing.name': 'NAME',
    'viewing.phone': 'PHONE / WHATSAPP',
    'viewing.day': 'DAY',
    'viewing.time': 'TIME',
    'viewing.message': 'MESSAGE (OPTIONAL)',
    'viewing.sending': 'SENDING…',
    'viewing.send': 'SEND VIA WHATSAPP',
    'viewing.cancel': 'CANCEL',
    'viewing.errName': 'Please enter your name.',
    'viewing.errPhone': 'Enter a valid phone / WhatsApp number.',
    'viewing.morning': 'Morning',
    'viewing.afternoon': 'Afternoon',
    'viewing.evening': 'Evening',
    'days.monday': 'Monday',
    'days.tuesday': 'Tuesday',
    'days.wednesday': 'Wednesday',
    'days.thursday': 'Thursday',
    'days.friday': 'Friday',
    'days.saturday': 'Saturday',
    'days.sunday': 'Sunday',

    /* --- weekdays ------------------------------------------------------- */
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',

    /* --- saved ---------------------------------------------------------- */
    'saved.aria': 'Saved properties',
    'saved.close': 'Close saved properties',
    'saved.eyebrow': 'SAVED',
    'saved.emptyTitle': 'Nothing saved yet',
    'saved.emptyBody': 'Save properties while you browse and they’ll appear here.',
    'saved.browse': 'BROWSE PROPERTIES',
    'saved.countTitle': '{n} saved {label}',

    /* --- compare --------------------------------------------------------- */
    'compare.aria': 'Compare properties',
    'compare.trayCount': 'COMPARE ({n}/3)',
    'compare.open': 'COMPARE',
    'compare.clear': 'CLEAR',
    'compare.remove': 'Remove {title} from comparison',
    'compare.dialogAria': 'Property comparison',
    'compare.close': 'Close comparison',
    'compare.eyebrow': 'COMPARISON',
    'compare.title': 'Compare properties',
    'compare.price': 'PRICE',
    'compare.location': 'LOCATION',
    'compare.purpose': 'PURPOSE',
    'compare.type': 'TYPE',
    'compare.area': 'AREA',
    'compare.bedrooms': 'BEDROOMS',
    'compare.bathrooms': 'BATHROOMS',
    'compare.parking': 'PARKING',
    'compare.forSale': 'For sale',
    'compare.forRent': 'For rent',
    'compare.concept': 'Concept website · Property details shown for demonstration.',

    /* --- sell ------------------------------------------------------------- */
    'sell.aria': 'Sell your property',
    'sell.close': 'Close sell form',
    'sell.eyebrow': 'SELL',
    'sell.title': 'Present your property properly',
    'sell.body': "Tell us about the property and we'll follow up to discuss presentation and pricing.",
    'sell.name': 'Name',
    'sell.phone': 'Phone / WhatsApp',
    'sell.email': 'Email (optional)',
    'sell.location': 'Property location',
    'sell.locationPlaceholder': 'e.g. Achrafieh, Beirut',
    'sell.type': 'Property type',
    'sell.size': 'Approximate size',
    'sell.sizePlaceholder': 'e.g. 145 m²',
    'sell.message': 'Message (optional)',
    'sell.sending': 'SENDING…',
    'sell.send': 'SEND VIA WHATSAPP',
    'sell.note': 'Your details are sent to the NARA team and WhatsApp opens with the message pre-filled. Nothing has been evaluated or agreed at this stage.',
    'sell.errName': 'Please enter your name.',
    'sell.errPhone': 'Enter a valid phone / WhatsApp number.',
    'sell.errLocation': 'Please enter the property location.',
    'sell.errSize': 'Approximate size in m².',
    'sell.errEmail': 'Enter a valid email address.',

    /* --- contact ---------------------------------------------------------- */
    'contact.title': 'Looking for the right place?',
    'contact.body': "Tell us what you're looking for and we'll help you narrow it down.",
    'contact.browse': 'BROWSE PROPERTIES',
    'contact.talk': 'TALK TO US',
    'contact.formEyebrow': 'SEND A MESSAGE',
    'contact.formAria': 'Send NARA a message',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone / WhatsApp',
    'contact.message': 'Message',
    'contact.messagePlaceholder': 'e.g. two bedrooms in Achrafieh',
    'contact.send': 'SEND',
    'contact.sending': 'SENDING…',
    'contact.sendAnother': 'SEND ANOTHER',
    'contact.doneTitle': 'Thank you — your message is with us.',
    'contact.doneBody': 'We read every enquiry and reply within one working day.',
    'contact.failed': 'Your message could not be sent. Please try again, or reach us on WhatsApp.',
    'contact.note': 'Concept website · Your details are used only to answer this message.',
    'contact.errName': 'Please enter your name.',
    'contact.errContact': 'Add an email or a phone number so we can reply.',
    'contact.errEmail': 'Enter a valid email address.',
    'contact.errPhone': 'Enter a valid phone number.',
    'contact.errMessage': 'Tell us briefly what you are looking for.',

    /* --- footer ------------------------------------------------------------ */
    'footer.linkBuy': 'Buy',
    'footer.linkRent': 'Rent',
    'footer.linkSell': 'Sell',
    'footer.linkLocations': 'Locations',
    'footer.linkAbout': 'About',
    'footer.linkContact': 'Contact',
    'footer.concept': 'Concept website · Property details shown for demonstration',
    'footer.defaultAddress': 'Beirut, Lebanon',
    'footer.email': 'Email',

    /* --- locations ----------------------------------------------------------- */
    'locations.eyebrow': 'REGIONS',
    'locations.title': 'Explore Lebanon',
    'locations.imageAlt': '{name} — Lebanese landscape',
    'locations.see': 'SEE {name} PROPERTIES',
    'locations.areasMore': '{n} areas',

    /* --- paths ---------------------------------------------------------------- */
    'paths.buyTag': 'BUY',
    'paths.rentTag': 'RENT',
    'paths.sellTag': 'SELL',
    'paths.buyHead': 'Find a home that fits the way you live.',
    'paths.rentHead': 'Explore homes across the city, coast and mountains.',
    'paths.sellHead': 'Present your property properly and reach the right buyers.',

    /* --- featured / latest ------------------------------------------------------ */
    'featured.eyebrow': 'SELECTED',
    'featured.title': 'Selected properties',
    'featured.body': 'A considered selection across Beirut, the coast and the mountains.',
    'featured.viewAll': 'VIEW ALL',
    'latest.eyebrow': 'NEW',
    'latest.title': 'Latest properties',

    /* --- about ------------------------------------------------------------------- */
    'about.eyebrow': 'APPROACH',
    'about.title': 'Property should be presented with clarity.',
    'about.body': 'NARA focuses on considered presentation, clear information and direct communication. Every home we represent is seen, described honestly and priced with intent — so the right buyer recognises it, and the wrong one doesn’t waste a viewing.',
    'about.place': 'BEIRUT · LEBANON',

    /* --- editorial ----------------------------------------------------------------- */
    'editorial.altFallback': 'Batroun coastline, Lebanon',
    'editorial.eyebrowFallback': 'BATROUN · LEBANON',
    'editorial.titleFallback': 'Life by the coast',
    'editorial.bodyFallback': 'Old stone walls, a harbour of wooden boats, and a rhythm set by the sea. Batroun asks for a slower kind of ownership.',
    'editorial.view': 'VIEW PROPERTY',
    'editorial.explore': 'EXPLORE BATROUN',

    /* --- states ----------------------------------------------------------------------- */
    'state.loading': 'Loading…',

    /* --- validation (shared) ----------------------------------------------------------- */
    'valid.name': 'Please enter your name.',
    'valid.email': 'Enter a valid email address.',
    'valid.phone': 'Enter a valid phone / WhatsApp number.',

    /* --- WhatsApp messages -------------------------------------------------------------- */
    'wa.inquiry': 'Hello NARA, I’m interested in the {title} in {city} listed at {price}. I’d like to know more about the property and its availability.',
    'wa.viewingHeader': 'Hello NARA, I’d like to request a viewing for the {title} in {city} listed at {price}.',
    'wa.name': 'Name',
    'wa.phone': 'Phone / WhatsApp',
    'wa.day': 'Preferred day',
    'wa.time': 'Preferred time',
    'wa.message': 'Message',
    'wa.share': '{title} in {city} — {price} via NARA Real Estate',
    'wa.sellerHeader': 'Hello NARA, I’d like to discuss selling a property.',
    'wa.location': 'Location',
    'wa.type': 'Type',
    'wa.size': 'Approximate size',
    'wa.perMonth': 'per month',
    'wa.copyLink': 'Copy this link:',

    /* --- SEO fallbacks ------------------------------------------------------------------ */
    'seo.propertyTitle': '{title} in {city} — NARA',
    'seo.defaultTitle': 'NARA Real Estate — Lebanon',
    'seo.defaultDescription': 'NARA Real Estate — a considered collection of homes across Beirut, the coast and the mountains of Lebanon.',
  },

  ar: {
    /* --- brand / nav -------------------------------------------------- */
    'brand.name': 'NARA',
    'brand.sub': 'العقارات',
    'nav.primary': 'التنقل الرئيسي',
    'nav.home': 'NARA العقارات — الصفحة الرئيسية',
    'nav.buy': 'شراء',
    'nav.rent': 'إيجار',
    'nav.sell': 'بيع',
    'nav.locations': 'المواقع',
    'nav.about': 'من نحن',
    'nav.saved': 'المحفوظات',
    'nav.savedCount': 'المحفوظات ({n})',
    'nav.letsTalk': 'تواصل معنا',
    'nav.openMenu': 'فتح القائمة',
    'nav.closeMenu': 'إغلاق القائمة',
    'nav.menu': 'القائمة',
    'nav.footer': 'التذييل',
    'nav.beirut': 'بيروت، لبنان',
    'nav.toggle': 'تغيير اللغة',
    'nav.langEn': 'EN',
    'nav.langAr': 'العربية',

    /* --- hero --------------------------------------------------------- */
    'hero.eyebrow': 'لبنان',
    'hero.headingDefault': 'العنوان الصحيح،\nيُعثر عليه كما ينبغي.',
    'hero.descriptionDefault': 'مجموعة مختارة بعناية من المنازل في بيروت وعلى الساحل وفي الجبال.',
    'hero.searchLabel': 'ابحث عن عقار',
    'hero.buy': 'شراء',
    'hero.rent': 'إيجار',
    'hero.location': 'الموقع',
    'hero.allLebanon': 'كل لبنان',
    'hero.type': 'النوع',
    'hero.allTypes': 'جميع الأنواع',
    'hero.bedrooms': 'غرف النوم',
    'hero.anyBeds': 'الكل',
    'hero.price': 'السعر',
    'hero.search': 'بحث',
    'hero.imageAlt': 'واجهة فيلا لبنانية معاصرة بتفاصيل حجرية وأرزية نظيفة',

    /* --- results ------------------------------------------------------ */
    'results.eyebrow': 'المجموعة',
    'common.any': 'الكل',
    'results.title': 'العقارات',
    'results.filterLocation': 'تصفية حسب الموقع',
    'results.filterType': 'تصفية حسب النوع',
    'results.filterBeds': 'تصفية حسب غرف النوم',
    'results.sort': 'ترتيب العقارات',
    'results.all': 'الكل',
    'results.buy': 'شراء',
    'results.rent': 'إيجار',
    'results.allLocations': 'جميع المواقع',
    'results.allTypes': 'جميع الأنواع',
    'results.anyBeds': 'أي عدد غرف',
    'results.clear': 'مسح',
    'results.searchPlaceholder': 'ابحث حسب الموقع أو النوع أو الميزة…',
    'results.recent': 'شوهد مؤخرًا',
    'results.emptyTitle': 'لا توجد نتائج بهذه الفلاتر',
    'results.emptyBody': 'البحث الحالي ضيّق جدًا. جرّب توسيع أحد الفلاتر، أو ابدأ من المجموعة الكاملة.',
    'results.clearFilters': 'مسح الفلاتر',
    'results.viewAll': 'عرض كل العقارات',

    /* --- sort labels --------------------------------------------------- */
    'sort.recommended': 'مُوصى به',
    'sort.price-asc': 'السعر: من الأقل إلى الأعلى',
    'sort.price-desc': 'السعر: من الأعلى إلى الأقل',
    'sort.area-desc': 'الأكبر مساحة',
    'sort.beds-desc': 'عدد غرف النوم',

    /* --- cards --------------------------------------------------------- */
    'card.view': 'عرض العقار',
    'card.viewAria': 'عرض {title}، {city}',
    'card.imageAlt': '{title} في {city}',
    'card.compare': '+ مقارنة',
    'card.comparing': 'قيد المقارنة',
    'card.compareMax': 'الحد الأقصى 3 عقارات',
    'card.save': 'حفظ',
    'card.saved': 'محفوظ',
    'card.saveAria': 'حفظ العقار',
    'card.savedAria': 'إزالة العقار من المحفوظات',

    /* --- counts -------------------------------------------------------- */
    'count.property': 'عقار',
    'count.properties': 'عقارات',
    'count.in': 'في {place}',
    'count.forRent': 'للإيجار',
    'count.forSale': 'للبيع',
    'price.perMonth': 'شهرًا',
    'spec.beds': 'غرف نوم',
    'spec.bedsOne': 'غرفة نوم',
    'spec.baths': 'حمّامات',
    'spec.bathsOne': 'حمّام',

    /* --- detail -------------------------------------------------------- */
    'detail.close': 'إغلاق صفحة العقار',
    'detail.imageAlt': '{title} — صورة {n}',
    'detail.viewImage': 'عرض الصورة {n}',
    'detail.features': 'المميزات',
    'detail.price': 'السعر',
    'detail.area': 'المساحة',
    'detail.bedrooms': 'غرف النوم',
    'detail.bathrooms': 'الحمّامات',
    'detail.parking': 'موقف سيارات',
    'detail.floor': 'الطابق',
    'detail.view': 'الإطلالة',
    'detail.type': 'النوع',
    'detail.requestViewing': 'طلب معاينة',
    'detail.whatsapp': 'تواصل عبر واتساب بخصوص هذا العقار',
    'detail.copyLink': 'نسخ الرابط',
    'detail.linkCopied': 'تم نسخ الرابط',
    'detail.copyPrompt': 'انسخ هذا الرابط:',
    'detail.shareWhatsapp': 'مشاركة عبر واتساب',
    'detail.continue': 'تابع',
    'detail.similar': 'قد يعجبك أيضًا',
    'detail.concept': 'موقع تجريبي · تفاصيل العقارات معروضة لأغراض العرض.',

    /* --- viewing form --------------------------------------------------- */
    'viewing.title': 'طلب معاينة',
    'viewing.name': 'الاسم',
    'viewing.phone': 'الهاتف / واتساب',
    'viewing.day': 'اليوم',
    'viewing.time': 'الوقت',
    'viewing.message': 'الرسالة (اختياري)',
    'viewing.sending': 'جارٍ الإرسال…',
    'viewing.send': 'إرسال عبر واتساب',
    'viewing.cancel': 'إلغاء',
    'viewing.errName': 'يرجى إدخال اسمك.',
    'viewing.errPhone': 'أدخل رقم هاتف أو واتساب صحيحًا.',
    'viewing.morning': 'صباحًا',
    'viewing.afternoon': 'ظهرًا',
    'viewing.evening': 'مساءً',
    'days.monday': 'الاثنين',
    'days.tuesday': 'الثلاثاء',
    'days.wednesday': 'الأربعاء',
    'days.thursday': 'الخميس',
    'days.friday': 'الجمعة',
    'days.saturday': 'السبت',
    'days.sunday': 'الأحد',

    /* --- weekdays ------------------------------------------------------- */
    'day.monday': 'الإثنين',
    'day.tuesday': 'الثلاثاء',
    'day.wednesday': 'الأربعاء',
    'day.thursday': 'الخميس',
    'day.friday': 'الجمعة',
    'day.saturday': 'السبت',
    'day.sunday': 'الأحد',

    /* --- saved ---------------------------------------------------------- */
    'saved.aria': 'العقارات المحفوظة',
    'saved.close': 'إغلاق العقارات المحفوظة',
    'saved.eyebrow': 'المحفوظات',
    'saved.emptyTitle': 'لا توجد عقارات محفوظة بعد',
    'saved.emptyBody': 'احفظ العقارات أثناء تصفحك وستظهر هنا.',
    'saved.browse': 'تصفّح العقارات',
    'saved.countTitle': 'المحفوظات: {count}',

    /* --- compare --------------------------------------------------------- */
    'compare.aria': 'مقارنة العقارات',
    'compare.trayCount': 'مقارنة ({n}/3)',
    'compare.open': 'مقارنة',
    'compare.clear': 'مسح',
    'compare.remove': 'إزالة {title} من المقارنة',
    'compare.dialogAria': 'مقارنة العقارات',
    'compare.close': 'إغلاق المقارنة',
    'compare.eyebrow': 'المقارنة',
    'compare.title': 'مقارنة العقارات',
    'compare.price': 'السعر',
    'compare.location': 'الموقع',
    'compare.purpose': 'الغرض',
    'compare.type': 'النوع',
    'compare.area': 'المساحة',
    'compare.bedrooms': 'غرف النوم',
    'compare.bathrooms': 'الحمّامات',
    'compare.parking': 'موقف السيارات',
    'compare.forSale': 'للبيع',
    'compare.forRent': 'للإيجار',
    'compare.concept': 'موقع تجريبي · تفاصيل العقارات معروضة لأغراض العرض.',

    /* --- sell ------------------------------------------------------------- */
    'sell.aria': 'بيع عقارك',
    'sell.close': 'إغلاق نموذج البيع',
    'sell.eyebrow': 'بيع',
    'sell.title': 'قدّم عقارك كما ينبغي',
    'sell.body': 'أخبرنا عن العقار وسنتواصل معك لمناقشة طريقة العرض والتسعير.',
    'sell.name': 'الاسم',
    'sell.phone': 'الهاتف / واتساب',
    'sell.email': 'البريد الإلكتروني (اختياري)',
    'sell.location': 'موقع العقار',
    'sell.locationPlaceholder': 'مثال: الأشرفية، بيروت',
    'sell.type': 'نوع العقار',
    'sell.size': 'المساحة التقريبية',
    'sell.sizePlaceholder': 'مثال: 145 م²',
    'sell.message': 'الرسالة (اختياري)',
    'sell.sending': 'جارٍ الإرسال…',
    'sell.send': 'إرسال عبر واتساب',
    'sell.note': 'تُرسل بياناتك إلى فريق NARA ويفتح واتساب بالرسالة جاهزة. لم يُجرى أي تقييم أو اتفاق في هذه المرحلة.',
    'sell.errName': 'يرجى إدخال اسمك.',
    'sell.errPhone': 'أدخل رقم هاتف أو واتساب صحيحًا.',
    'sell.errLocation': 'يرجى إدخال موقع العقار.',
    'sell.errSize': 'المساحة التقريبية بالمتر المربع.',
    'sell.errEmail': 'أدخل بريدًا إلكترونيًا صحيحًا.',

    /* --- contact ---------------------------------------------------------- */
    'contact.title': 'تبحث عن المكان المناسب؟',
    'contact.body': 'أخبرنا بما تبحث عنه وسنعاونك على تحديد الخيار الأنسب.',
    'contact.browse': 'تصفّح العقارات',
    'contact.talk': 'تحدّث إلينا',
    'contact.formEyebrow': 'أرسل رسالة',
    'contact.formAria': 'أرسل رسالة إلى NARA',
    'contact.name': 'الاسم',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف / واتساب',
    'contact.message': 'الرسالة',
    'contact.messagePlaceholder': 'مثال: شقتان في الأشرفية',
    'contact.send': 'إرسال',
    'contact.sending': 'جارٍ الإرسال…',
    'contact.sendAnother': 'إرسال رسالة أخرى',
    'contact.doneTitle': 'شكرًا لك — وصلتنا رسالتك.',
    'contact.doneBody': 'نقرأ كل رسالة ونردّ خلال يوم عمل واحد.',
    'contact.failed': 'تعذّر إرسال رسالتك. حاول مرة أخرى، أو تواصل معنا عبر واتساب.',
    'contact.note': 'موقع تجريبي · تُستخدم بياناتك فقط للرد على هذه الرسالة.',
    'contact.errName': 'يرجى إدخال اسمك.',
    'contact.errContact': 'أضف بريدًا إلكترونيًا أو رقم هاتف حتى نتمكّن من الرد.',
    'contact.errEmail': 'أدخل بريدًا إلكترونيًا صحيحًا.',
    'contact.errPhone': 'أدخل رقم هاتف صحيحًا.',
    'contact.errMessage': 'أخبرنا باختصار عمّا تبحث عنه.',

    /* --- footer ------------------------------------------------------------ */
    'footer.linkBuy': 'شراء',
    'footer.linkRent': 'إيجار',
    'footer.linkSell': 'بيع',
    'footer.linkLocations': 'المواقع',
    'footer.linkAbout': 'من نحن',
    'footer.linkContact': 'تواصل معنا',
    'footer.concept': 'موقع تجريبي · تفاصيل العقارات معروضة لأغراض العرض',
    'footer.defaultAddress': 'بيروت، لبنان',
    'footer.email': 'البريد الإلكتروني',

    /* --- locations ----------------------------------------------------------- */
    'locations.eyebrow': 'المناطق',
    'locations.title': 'اكتشف لبنان',
    'locations.imageAlt': '{name} — منظر لبناني',
    'locations.see': 'عرض عقارات {name}',
    'locations.areasMore': '{n} مناطق',

    /* --- paths ---------------------------------------------------------------- */
    'paths.buyTag': 'شراء',
    'paths.rentTag': 'إيجار',
    'paths.sellTag': 'بيع',
    'paths.buyHead': 'اعثر على منزل يناسب أسلوب حياتك.',
    'paths.rentHead': 'استكشف المنازل في المدينة وعلى الساحل وفي الجبال.',
    'paths.sellHead': 'قدّم عقارك كما ينبغي وواصل المشترين المناسبين.',

    /* --- featured / latest ------------------------------------------------------ */
    'featured.eyebrow': 'مختارة',
    'featured.title': 'عقارات مختارة',
    'featured.body': 'مختارات مدروسة من بيروت والساحل والجبال.',
    'featured.viewAll': 'عرض الكل',
    'latest.eyebrow': 'جديد',
    'latest.title': 'أحدث العقارات',

    /* --- about ------------------------------------------------------------------- */
    'about.eyebrow': 'منهجنا',
    'about.title': 'يجب أن يُعرض العقار بوضوح.',
    'about.body': 'تركّز NARA على العرض المدروس، والمعلومات الواضحة، والتواصل المباشر. كل منزل نمثّله يُشاهد، ويُوصف بصدق، ويُسعّر بقصد — فيتعرّف عليه المشتري المناسب، ولا يُضيّع المشتري الخطأ وقته في معاينة.',
    'about.place': 'بيروت · لبنان',

    /* --- editorial ----------------------------------------------------------------- */
    'editorial.altFallback': 'ساحل البترون، لبنان',
    'editorial.eyebrowFallback': 'البترون · لبنان',
    'editorial.titleFallback': 'الحياة على الساحل',
    'editorial.bodyFallback': 'أسوار حجرية قديمة، وميناء ترسو فيه قوارب خشبية، وإيقاع يفرضه البحر. البترون تدعوك إلى ملكية أكثر هدوءًا.',
    'editorial.view': 'عرض العقار',
    'editorial.explore': 'اكتشف البترون',

    /* --- states ----------------------------------------------------------------------- */
    'state.loading': 'جارٍ التحميل…',

    /* --- validation (shared) ----------------------------------------------------------- */
    'valid.name': 'يرجى إدخال اسمك.',
    'valid.email': 'أدخل بريدًا إلكترونيًا صحيحًا.',
    'valid.phone': 'أدخل رقم هاتف أو واتساب صحيحًا.',

    /* --- WhatsApp messages -------------------------------------------------------------- */
    'wa.inquiry': 'مرحبًا NARA، أنا مهتم بالعقار «{title}» في {city} والمعروض بسعر {price}. أودّ التعرف على المزيد عن العقار وهل ما زال متاحًا.',
    'wa.viewingHeader': 'مرحبًا NARA، أودّ طلب معاينة للعقار «{title}» في {city} والمعروض بسعر {price}.',
    'wa.name': 'الاسم',
    'wa.phone': 'الهاتف / واتساب',
    'wa.day': 'اليوم المفضّل',
    'wa.time': 'الوقت المفضّل',
    'wa.message': 'الرسالة',
    'wa.share': '{title} في {city} — {price} عبر NARA Real Estate',
    'wa.sellerHeader': 'مرحبًا NARA، أودّ التحدث حول بيع عقار.',
    'wa.location': 'الموقع',
    'wa.type': 'النوع',
    'wa.size': 'المساحة التقريبية',
    'wa.perMonth': 'شهريًا',
    'wa.copyLink': 'انسخ هذا الرابط:',

    /* --- SEO fallbacks ------------------------------------------------------------------ */
    'seo.propertyTitle': '{title} في {city} — NARA',
    'seo.defaultTitle': 'NARA العقارات — لبنان',
    'seo.defaultDescription': 'NARA العقارات — مجموعة مختارة بعناية من المنازل في بيروت وعلى الساحل وفي جبال لبنان.',
  },
}

/** Region display copy (kept next to the message catalogue, not in data). */
export const REGION_COPY = {
  en: {
    beirut: 'The city — apartments, penthouses and offices between the port, Hamra and the eastern hills of Achrafieh.',
    'mount-lebanon': 'High ground above the city — villas, chalets and family houses with views over the coastline.',
    coast: 'Sea-facing homes along the Mediterranean, from Jounieh’s bay to Batroun’s old port.',
    north: 'Slower towns above the water — stone houses, boutique chalets and land with a view.',
    south: 'Coastal towns and inland villages, with land and homes still priced for thoughtful buyers.',
  },
  ar: {
    beirut: 'المدينة — شقق وبنتهاوس ومكاتب بين الميناء والحمرا والتلال الشرقية للأشرفية.',
    'mount-lebanon': 'أرضٌ مرتفعة فوق المدينة — فلل وشاليهات ومنازل عائلية بإطلالة على الساحل.',
    coast: 'منازل تطلّ على البحر المتوسط، من خليج جونية إلى ميناء البترون القديم.',
    north: 'مدنٌ أهدأ فوق الماء — منازل حجرية وشاليهات أنيقة وأرض بإطلالة.',
    south: 'مدن ساحلية وقرى داخلية، بأرض ومنازل ما زالت أسعارها مناسبة لمشترين دقيقين.',
  },
}

/** Property type labels by their stable English identifier. */
export const TYPE_LABELS = { en: {}, ar: TYPES_AR }

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                                */
/* -------------------------------------------------------------------------- */

/** Is this value in the bilingual content shape ({ en, ar })? */
export function isLocalized(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    && ('en' in value || 'ar' in value)
}

/** Normalise any editor value (string | {en,ar}) into a clean { en, ar }. */
export function toLocalized(value) {
  if (value === null || value === undefined) return { en: '', ar: '' }
  if (typeof value === 'string') return { en: value, ar: '' }
  if (isLocalized(value)) {
    return {
      en: String(value.en ?? ''),
      ar: String(value.ar ?? ''),
    }
  }
  return { en: '', ar: '' }
}

/**
 * Resolve a bilingual value for display.
 * Arabic falls back to English; English falls back to Arabic only when the
 * English value is empty (never for a populated English field).
 */
export function resolveText(value, lang) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (isLocalized(value)) {
    const en = value.en == null ? '' : String(value.en)
    const ar = value.ar == null ? '' : String(value.ar)
    if (lang === 'ar') return ar || en
    return en || ar
  }
  return String(value)
}

/**
 * English side of a translatable value.
 * A plain string is English-only (legacy documents predate the bilingual model).
 */
export function localizedEn(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return String(value.en ?? '').trim()
  return typeof value === 'string' ? value.trim() : ''
}

/** Arabic side of a translatable value — a plain string carries no Arabic. */
export function localizedAr(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return String(value.ar ?? '').trim()
  return ''
}

/**
 * Compact storage shape: a plain English string whenever there is no Arabic
 * copy (byte-identical to pre-i18n documents), `{en, ar}` only when Arabic
 * exists. Both keys are always present in the map so Security Rules can check
 * them without an `in` test.
 */
export function toStoredText(value) {
  const en = localizedEn(value)
  const ar = localizedAr(value)
  if (!en && !ar) return ''
  if (!ar || ar === en) return en
  return { en, ar }
}

/**
 * Feature list → storage shape.
 *
 * Rules can only afford a cheap check on a feature list, and the cheapest sound
 * check is `list.join(' ')` — which needs plain strings. So an English-only list
 * is stored exactly as before (`['Balcony', …]`) and only lists that actually
 * carry Arabic switch to the parallel `{ en: [...], ar: [...] }` form.
 *
 * The editor and the public site both keep the friendlier `[{en, ar}]` pairs;
 * `toFeaturePairs` converts the stored form back.
 */
export function toStoredFeatures(value) {
  const pairs = toFeaturePairs(value)
  if (!pairs.length) return []
  if (!pairs.some((p) => p.ar)) return pairs.map((p) => p.en)
  return { en: pairs.map((p) => p.en), ar: pairs.map((p) => p.ar) }
}

/** Any stored/editor feature list → `[{ en, ar }]` pairs (legacy strings included). */
export function toFeaturePairs(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => (item && typeof item === 'object' && !Array.isArray(item)
        ? { en: localizedEn(item), ar: localizedAr(item) }
        : { en: localizedEn(item), ar: '' }))
      .filter((pair) => pair.en || pair.ar)
  }
  if (typeof value === 'object') {
    const side = (v) => (Array.isArray(v) ? v.map((x) => String(x ?? '').trim()) : [])
    const en = side(value.en)
    const ar = side(value.ar)
    const total = Math.max(en.length, ar.length)
    const pairs = []
    for (let i = 0; i < total; i += 1) {
      const english = en[i] || ''
      const arabic = ar[i] || ''
      if (english || arabic) pairs.push({ en: english, ar: arabic })
    }
    return pairs
  }
  return []
}

/** Translate a catalogue key with {token} interpolation and en fallback. */
export function translate(lang, key, vars) {
  const table = MESSAGES[lang] || MESSAGES[DEFAULT_LOCALE]
  let value = table?.[key]
  if (value === undefined) value = MESSAGES[DEFAULT_LOCALE][key]
  if (value === undefined) return key
  if (!vars) return value
  return value.replace(/\{(\w+)\}/g, (match, name) => (
    vars[name] === undefined ? match : String(vars[name])
  ))
}

/** Place / area / region label: English identifiers become Arabic on demand. */
export function placeLabel(value, lang) {
  const text = resolveText(value, lang)
  if (!text || lang !== 'ar') return text
  return PLACES_AR[text] || text
}

/** Content label + place dictionary in one step (property city/region copy). */
export function geoLabel(value, lang) {
  return placeLabel(resolveText(value, lang), lang)
}

/** Property type identifier → display label (identifiers stay English). */
export function typeLabel(value, lang) {
  const text = resolveText(value, lang)
  if (!text || lang !== 'ar') return text
  return TYPES_AR[text] || text
}

/** Free-text view label (English value from the editor) → display label. */
export function viewLabel(value, lang) {
  const text = resolveText(value, lang)
  if (!text || lang !== 'ar') return text
  return VIEWS_AR[text] || text
}

/** Feature entry (string | {en,ar}) → display label. */
export function featureLabel(value, lang) {
  const text = resolveText(value, lang)
  if (!text || lang !== 'ar') return text
  return FEATURES_AR[text] || text
}

/** Region display copy for the Locations section. */
export function regionCopy(regionId, lang) {
  const table = REGION_COPY[lang] || REGION_COPY[DEFAULT_LOCALE]
  return table[regionId] || REGION_COPY.en[regionId] || ''
}

/** Arabic has no single plural rule — pick the right form for a count. */
export function countLabel(n, lang, { one, many } = {}) {
  if (lang !== 'ar') {
    const noun = n === 1 ? (one || 'property') : (many || 'properties')
    return `${n} ${noun}`
  }
  const abs = Math.abs(n)
  if (abs === 0) return `لا ${many || 'عقارات'}`
  if (abs === 1) return `${n} ${one || 'عقار'}`
  if (abs === 2) return one ? `${one}ان` : 'عقاران'
  if (abs >= 3 && abs <= 10) return `${n} ${many || 'عقارات'}`
  return `${n} ${one || 'عقار'}`
}

/**
 * Currency string for display. Digits stay Latin (that is how Lebanon quotes
 * in both languages); only the period suffix is translated.
 */
export function priceLabel(p, lang) {
  if (!p) return ''
  const n = '$' + Number(p.price || 0).toLocaleString('en-US')
  if (!p.perMonth) return n
  return `${n} / ${translate(lang, 'price.perMonth')}`
}

/** Arabic counts: 1 singular, 2 dual, 3–10 plural, 11+ singular accusative. */
function arCount(n, forms) {
  const abs = Math.abs(n)
  if (abs === 1) return forms.one
  if (abs === 2) return forms.two
  if (abs >= 3 && abs <= 10) return `${n} ${forms.few}`
  return `${n} ${forms.many}`
}

export function bedsLabel(n, lang) {
  if (!n) return ''
  if (lang !== 'ar') return `${n} ${n > 1 ? translate(lang, 'spec.beds') : translate(lang, 'spec.bedsOne')}`
  return arCount(n, { one: 'غرفة نوم واحدة', two: 'غرفتا نوم', few: 'غرف نوم', many: 'غرفة نوم' })
}

export function bathsLabel(n, lang) {
  if (!n) return ''
  if (lang !== 'ar') return `${n} ${n > 1 ? translate(lang, 'spec.baths') : translate(lang, 'spec.bathsOne')}`
  return arCount(n, { one: 'حمّام واحد', two: 'حمّامان', few: 'حمّامات', many: 'حمّامًا' })
}

/** "145 m² · 2 beds · 3 baths" in the active language. */
export function specLineLabel(p, lang) {
  const area = `${p.surface} ${lang === 'ar' ? 'م²' : 'm²'}`
  const parts = [area]
  const beds = bedsLabel(p.beds, lang)
  const baths = bathsLabel(p.baths, lang)
  if (beds) parts.push(beds)
  if (baths) parts.push(baths)
  return parts.join(' · ')
}
