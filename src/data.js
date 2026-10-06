export const REGIONS = [
  // `id` is the stable identifier (filters, URLs, CMS references) and `name` /
  // `areas` are English display labels: Arabic is provided by the label
  // dictionaries in src/i18n/translations.js, never by a second copy of the data.
  { id: 'beirut', name: 'Beirut', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80', areas: ['Achrafieh', 'Saifi', 'Sursock', 'Mar Mikhael', 'Hamra', 'Verdun', 'Clemenceau', 'Badaro'] },
  { id: 'mount-lebanon', name: 'Mount Lebanon', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80', areas: ['Beit Mery', 'Hazmieh', 'Baabda', 'Broummana'] },
  { id: 'coast', name: 'The Coast', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', areas: ['Jounieh', 'Batroun', 'Byblos'] },
  { id: 'north', name: 'North Lebanon', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', areas: ['Batroun', 'Byblos', 'Ehden'] },
  { id: 'south', name: 'South Lebanon', img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80', areas: ['Saida', 'Tyre'] },
]

const img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/**
 * Demo properties in the bilingual content shape.
 *
 * Translatable fields (title / description / features) are authored per
 * language; everything else — ids, prices, numbers, region & type identifiers,
 * image URLs — is shared by both languages and stored once.
 */
export const PROPERTIES = [
  {
    id: 'p1', purpose: 'buy', featured: true, latest: true,
    title: { en: 'Modern Apartment', ar: 'شقة عصرية' }, type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Achrafieh', surface: 145, beds: 2, baths: 3, parking: 1, floor: '4th', view: 'Garden view',
    price: 285000, images: [img('photo-1600607687939-ce8a6c25118c'), img('photo-1600566752355-35792bedcfea'), img('photo-1600607687920-4e2a09cf159d')],
    description: {
      en: 'A restored 1930s shell reworked for modern life: high ceilings held in place, a generous living space opening onto a deep balcony, and a quiet residential street five minutes from Sursock.',
      ar: 'هيكل من ثلاثينيات القرن الماضي أُعيد تجهيزه لحياة عصرية: سقوف عالية كما كانت، ومساحة معيشة واسعة تنفتح على شرفة عميقة، وشارع سكني هادئ على بعد خمس دقائق من سورسوك.',
    },
    features: ['Balcony', 'Elevator', 'Concierge', '24h electricity', 'Storage room'],
  },
  {
    id: 'p2', purpose: 'buy', featured: true, latest: false,
    title: { en: 'Sea View Apartment', ar: 'شقة بإطلالة على البحر' }, type: 'Apartment', region: 'coast', regionLabel: 'North Lebanon',
    city: 'Batroun', surface: 175, beds: 3, baths: 2, parking: 2, floor: '2nd', view: 'Sea view',
    price: 320000, images: [img('photo-1507525428034-b723cf961d3e'), img('photo-1600585154340-be6161a56a0c'), img('photo-1605276374104-dee2a0ed3cd6')],
    description: {
      en: 'Two minutes from Batroun’s old port and its restaurants. Full-width terrace facing the water, open kitchen, and a building that has been well kept by its owners.',
      ar: 'على بعد دقيقتين من ميناء البترون القديم ومطاعمه. تراس بعرض الواجهة يطلّ على الماء، ومطبخ مفتوح، وعمارة اعتنى أصحابها بها جيدًا.',
    },
    features: ['Terrace', 'Sea view', 'Two parking spots', 'Near port', 'Family-owned building'],
  },
  {
    id: 'p3', purpose: 'buy', featured: true, latest: true,
    title: { en: 'Contemporary Villa', ar: 'فيلا عصرية' }, type: 'Villa', region: 'mount-lebanon', regionLabel: 'Mount Lebanon',
    city: 'Beit Mery', surface: 420, beds: 4, baths: 5, parking: 3, floor: 'Ground + 1', view: 'Sea and pine view',
    price: 780000, images: [img('photo-1600596542815-ffad4c1539a9'), img('photo-1613490493576-7fde63acd811'), img('photo-1600210492486-724fe5c67fb0')],
    description: {
      en: 'A composed concrete-and-cedar villa set on a quiet plot in Beit Mery. Large windows frame the pines; the plan is open between kitchen, dining and the double-height lounge.',
      ar: 'فيلا هادئة من الخرسانة والأرز على قطعة أرض مطلقة في بيت مري. نوافذ كبيرة تؤطر الصنوبر، والمساحة مفتوحة بين المطبخ وغرفة الطعام والصالة ذات السقف المزدوج.',
    },
    features: ['Pool', 'Large plot', 'Double-height lounge', 'Solar panels', 'Generator'],
  },
  {
    id: 'p4', purpose: 'buy', featured: true, latest: false,
    title: { en: 'City Apartment', ar: 'شقة في المدينة' }, type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Hamra', surface: 120, beds: 2, baths: 2, parking: 1, floor: '3rd', view: 'City view',
    price: 210000, images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1560448204-e02f11c3d0e2'), img('photo-1560185007-cde436f6a4d0')],
    description: {
      en: 'A bright two-bedroom apartment in the heart of Hamra, close to cafes, Corniche and AUB. Ideal as a first home or a pied-\u00e0-terre in the city.',
      ar: 'شقة مضيئة من غرفتي نوم في قلب الحمرا، قريبة من المقاهي والكورنيش من الجامعة الأميركية في بيروت. مناسبة كأول منزل أو كسكن صغير في المدينة.',
    },
    features: ['Balcony', 'Elevator', 'Close to metro line', 'Furnished option', 'Lettable'],
  },
  {
    id: 'p5', purpose: 'buy', featured: false, latest: true,
    title: { en: 'Penthouse with Terrace', ar: 'بنتهاوس بتراس' }, type: 'Penthouse', region: 'beirut', regionLabel: 'Beirut',
    city: 'Verdun', surface: 265, beds: 3, baths: 4, parking: 2, floor: '9th', view: 'Sea view',
    price: 640000, images: [img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600210492486-724fe5c67fb0'), img('photo-1600566753086-00f18fb6b3ea')],
    description: {
      en: 'Top-floor penthouse over Verdun with a 90 m\u00b2 terrace, uninterrupted sea view and a plan built around entertaining. Building with valet parking and gym.',
      ar: 'بنتهاوس في الطابق الأخير فوق فردان، بتراس 90 م² وإطلالة متواصلة على البحر ومساحة مصمّمة للاستقبال. العمارة مزوّدة بخدمة صف السيارات وصالة رياضية.',
    },
    features: ['90 m\u00b2 terrace', 'Sea view', 'Valet parking', 'Gym', 'Maid\u2019s room'],
  },
  {
    id: 'p6', purpose: 'buy', featured: false, latest: false,
    title: { en: 'Stone Chalet', ar: 'شاليه حجري' }, type: 'Chalet', region: 'north', regionLabel: 'North Lebanon',
    city: 'Ehden', surface: 210, beds: 3, baths: 3, parking: 2, floor: 'Ground + 1', view: 'Mountain view',
    price: 390000, images: [img('photo-1518780664697-55e3ad937233'), img('photo-1469474968028-56623f02e42e'), img('photo-1493809842364-78817add7ffb')],
    description: {
      en: 'A proper Lebanese chalet of exposed stone and cedar beams, with a fireplace lounge, wood stove and decks that catch the last sun over the valley.',
      ar: 'شاليه لبناني أصيل من الحجر المكشوف وجوائز الأرز، بصالة مدفأة وموقد حطب وأفنية تلتقط آخر شمس فوق الوادي.',
    },
    features: ['Fireplace', 'Cedar ceilings', 'Valley view', 'Privacy', 'Heating'],
  },
  {
    id: 'p7', purpose: 'buy', featured: false, latest: false,
    title: { en: 'Apartment near Corniche', ar: 'شقة قرب الكورنيش' }, type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Clemenceau', surface: 98, beds: 1, baths: 1, parking: 1, floor: '6th', view: 'Sea glimpse',
    price: 165000, images: [img('photo-1502672260266-1c1ef2d93688'), img('photo-1522708323590-d24dbb6b0267'), img('photo-1493809842364-78817add7ffb')],
    description: {
      en: 'A compact, light-filled one-bedroom ten minutes from the Corniche and Beirut\u2019s commercial heart. Popular floor plan with a true balcony.',
      ar: 'شقة صغيرة مضيئة من غرفة نوم واحدة، على بعد عشر دقائق من الكورنيش ووسط بيروت التجاري. طابق شائع مع شرفة حقيقية.',
    },
    features: ['Balcony', 'Elevator', 'Corniche nearby', 'Renovated kitchen'],
  },
  {
    id: 'p8', purpose: 'rent', featured: true, latest: true,
    title: { en: 'Furnished Apartment', ar: 'شقة مؤثثة' }, type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Mar Mikhael', surface: 95, beds: 1, baths: 1, parking: 0, floor: '5th', view: 'City view',
    price: 1400, perMonth: true, images: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1600566753086-00f18fb6b3ea'), img('photo-1605276374104-dee2a0ed3cd6')],
    description: {
      en: 'Designed and furnished one-bedroom in a Mar Mikhael walk-up, two streets from the port\u2019s restaurants and bars. Flexible twelve-month lease, utilities included up to a cap.',
      ar: 'شقة مصمّمة ومؤثثة من غرفة نوم واحدة في عمارة مار مخائيل، على بُعد شارعين من مطاعم الميناء وحاناته. إيجار مرن لمدة اثني عشر شهرًا، مع الخدمات مشمولة حتى حدّ معيّن.',
    },
    features: ['Furnished', 'Utilities included', 'Pets allowed', 'Walk-up', 'Short walk to port'],
  },
  {
    id: 'p9', purpose: 'rent', featured: true, latest: false,
    title: { en: 'Family Apartment', ar: 'شقة عائلية' }, type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Badaro', surface: 160, beds: 3, baths: 2, parking: 1, floor: '3rd', view: 'Garden view',
    price: 2200, perMonth: true, images: [img('photo-1560185007-cde436f6a4d0'), img('photo-1502672260266-1c1ef2d93688'), img('photo-1582719478250-c89cae4dc85b')],
    description: {
      en: 'A wide three-bedroom apartment on a calm Badaro street, with a deep balcony, storage room and a building kept by a small number of resident families.',
      ar: 'شقة واسعة من ثلاث غرف نوم في شارع هادئ ببدارو، بشرفة عميقة ومخزن، وعمارة يعتنى بها عدد قليل من العائلات الساكنة.',
    },
    features: ['Deep balcony', 'Storage', 'Quiet street', 'Near Jesuit University', 'Elevator'],
  },
  {
    id: 'p10', purpose: 'rent', featured: false, latest: true,
    title: { en: 'Coastal Apartment', ar: 'شقة ساحلية' }, type: 'Apartment', region: 'coast', regionLabel: 'Mount Lebanon',
    city: 'Jounieh', surface: 130, beds: 2, baths: 2, parking: 1, floor: '1st', view: 'Sea view',
    price: 1800, perMonth: true, images: [img('photo-1520250497591-112f2f40a3f4'), img('photo-1507525428034-b723cf961d3e'), img('photo-1600607687939-ce8a6c25118c')],
    description: {
      en: 'A two-bedroom apartment above Jounieh bay, ten minutes to the Casino and Maameltein\u2019s waterfront. Summer and annual leases considered.',
      ar: 'شقة من غرفتي نوم تعلو خليج جونية، على بعد عشر دقائق من الكازينو وواجهة معامطين البحرية. تُقبل عقود الصيف والسنة.',
    },
    features: ['Sea view', 'Terrace', 'Close to Corniche', 'Mountains nearby'],
  },
  {
    id: 'p11', purpose: 'buy', featured: false, latest: false,
    title: { en: 'Office with Sea View', ar: 'مكتب بإطلالة على البحر' }, type: 'Office', region: 'beirut', regionLabel: 'Beirut',
    city: 'Ain Mreisseh', surface: 85, beds: 0, baths: 1, parking: 1, floor: '7th', view: 'Sea view',
    price: 195000, images: [img('photo-1600566752355-35792bedcfea'), img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600210492486-724fe5c67fb0')],
    description: {
      en: 'A compact office with sea view on a Corniche-adjacent street, suitable for a consultancy or clinic. Fully fitted, ready to move in.',
      ar: 'مكتب مدمج بإطلالة على البحر في شارع ملاصق للكورنيش، مناسب لاستشارات أو عيادة. مجهّز بالكامل وجاهز للدخول.',
    },
    features: ['Sea view', 'Corniche access', 'Fitted', 'Reception area'],
  },
  {
    id: 'p12', purpose: 'buy', featured: false, latest: false,
    title: { en: 'Land Plot · Sea View', ar: 'أرض · إطلالة على البحر' }, type: 'Land', region: 'south', regionLabel: 'South Lebanon',
    city: 'Saida', surface: 1200, beds: 0, baths: 0, parking: 0, floor: '—', view: 'Sea view',
    price: 145000, images: [img('photo-1469474968028-56623f02e42e'), img('photo-1469474968028-56623f02e42e'), img('photo-1506905925346-21bda4d32df4')],
    description: {
      en: 'A 1,200 m\u00b2 plot above Saida with old pine trees and a direct view over the gulf, zoned for a single family home. Road access and utilities on the parcel.',
      ar: 'قطعة أرض بمساحة 1,200 م² تعلو صيدا، فيها صنوبر قديم وإطلالة مباشرة على الخليج، مخصّصة لبناء منزل لعائلة واحدة. يوجد طريق وخدمات على الأرض.',
    },
    features: ['Zoned for home', 'Road access', 'Utilities on site', 'Old growth pines'],
  },
]

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Chalet', 'Office', 'Land', 'Commercial']

export function formatPrice(p) {
  const n = '$' + p.price.toLocaleString('en-US')
  return p.perMonth ? n + ' / month' : n
}

export function specLine(p) {
  const parts = [`${p.surface} m\u00b2`]
  if (p.beds > 0) parts.push(`${p.beds} bed${p.beds > 1 ? 's' : ''}`)
  if (p.baths > 0) parts.push(`${p.baths} bath${p.baths > 1 ? 's' : ''}`)
  return parts.join(' \u00b7 ')
}

export const PRICE_MAP = {
  'Any': Infinity, '\u2264 $250k': 250000, '\u2264 $400k': 400000, '\u2264 $650k': 650000, '\u2264 $1M': 1000000,
  '\u2264 $1,500': 1500, '\u2264 $2,000': 2000, '\u2264 $2,500': 2500,
}

export const BED_MIN = { 'Any': 0, '1+': 1, '2+': 2, '3+': 3, '4+': 4 }

export function filterProperties(list, f) {
  return list.filter((p) => {
    if (f.purpose !== 'any' && p.purpose !== f.purpose) return false
    if (f.region !== 'any' && p.region !== f.region) return false
    if (f.type !== 'any' && p.type !== f.type) return false
    if ((BED_MIN[f.beds] ?? 0) > p.beds) return false
    if (p.price > (PRICE_MAP[f.price] ?? Infinity)) return false
    return true
  })
}
