export const REGIONS = [
  { id: 'beirut', name: 'Beirut', copy: 'The city — apartments, penthouses and offices between the port, Hamra and the eastern hills of Achrafieh.', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80', areas: ['Achrafieh', 'Saifi', 'Sursock', 'Mar Mikhael', 'Hamra', 'Verdun', 'Clemenceau', 'Badaro'] },
  { id: 'mount-lebanon', name: 'Mount Lebanon', copy: 'High ground above the city — villas, chalets and family houses with views over the coastline.', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80', areas: ['Beit Mery', 'Hazmieh', 'Baabda', 'Broummana'] },
  { id: 'coast', name: 'The Coast', copy: 'Sea-facing homes along the Mediterranean, from Jounieh\u2019s bay to Batroun\u2019s old port.', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80', areas: ['Jounieh', 'Batroun', 'Byblos'] },
  { id: 'north', name: 'North Lebanon', copy: 'Slower towns above the water — stone houses, boutique chalets and land with a view.', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80', areas: ['Batroun', 'Byblos', 'Ehden'] },
  { id: 'south', name: 'South Lebanon', copy: 'Coastal towns and inland villages, with land and homes still priced for thoughtful buyers.', img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80', areas: ['Saida', 'Tyre'] },
]

const img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const PROPERTIES = [
  {
    id: 'p1', purpose: 'buy', featured: true, latest: true,
    title: 'Modern Apartment', type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Achrafieh', surface: 145, beds: 2, baths: 3, parking: 1, floor: '4th', view: 'Garden view',
    price: 285000, images: [img('photo-1600607687939-ce8a6c25118c'), img('photo-1600566752355-35792bedcfea'), img('photo-1600607687920-4e2a09cf159d')],
    description: 'A restored 1930s shell reworked for modern life: high ceilings held in place, a generous living space opening onto a deep balcony, and a quiet residential street five minutes from Sursock.',
    features: ['Balcony', 'Elevator', 'Concierge', '24h electricity', 'Storage room'],
  },
  {
    id: 'p2', purpose: 'buy', featured: true, latest: false,
    title: 'Sea View Apartment', type: 'Apartment', region: 'coast', regionLabel: 'North Lebanon',
    city: 'Batroun', surface: 175, beds: 3, baths: 2, parking: 2, floor: '2nd', view: 'Sea view',
    price: 320000, images: [img('photo-1507525428034-b723cf961d3e'), img('photo-1600585154340-be6161a56a0c'), img('photo-1605276374104-dee2a0ed3cd6')],
    description: 'Two minutes from Batroun\u2019s old port and its restaurants. Full-width terrace facing the water, open kitchen, and a building that has been well kept by its owners.',
    features: ['Terrace', 'Sea view', 'Two parking spots', 'Near port', 'Family-owned building'],
  },
  {
    id: 'p3', purpose: 'buy', featured: true, latest: true,
    title: 'Contemporary Villa', type: 'Villa', region: 'mount-lebanon', regionLabel: 'Mount Lebanon',
    city: 'Beit Mery', surface: 420, beds: 4, baths: 5, parking: 3, floor: 'Ground + 1', view: 'Sea and pine view',
    price: 780000, images: [img('photo-1600596542815-ffad4c1539a9'), img('photo-1613490493576-7fde63acd811'), img('photo-1600210492486-724fe5c67fb0')],
    description: 'A composed concrete-and-cedar villa set on a quiet plot in Beit Mery. Large windows frame the pines; the plan is open between kitchen, dining and the double-height lounge.',
    features: ['Pool', 'Large plot', 'Double-height lounge', 'Solar panels', 'Generator'],
  },
  {
    id: 'p4', purpose: 'buy', featured: true, latest: false,
    title: 'City Apartment', type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Hamra', surface: 120, beds: 2, baths: 2, parking: 1, floor: '3rd', view: 'City view',
    price: 210000, images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1560448204-e02f11c3d0e2'), img('photo-1560185007-cde436f6a4d0')],
    description: 'A bright two-bedroom apartment in the heart of Hamra, close to cafes, Corniche and AUB. Ideal as a first home or a pied-\u00e0-terre in the city.',
    features: ['Balcony', 'Elevator', 'Close to metro line', 'Furnished option', 'Lettable'],
  },
  {
    id: 'p5', purpose: 'buy', featured: false, latest: true,
    title: 'Penthouse with Terrace', type: 'Penthouse', region: 'beirut', regionLabel: 'Beirut',
    city: 'Verdun', surface: 265, beds: 3, baths: 4, parking: 2, floor: '9th', view: 'Sea view',
    price: 640000, images: [img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600210492486-724fe5c67fb0'), img('photo-1600566753086-00f18fb6b3ea')],
    description: 'Top-floor penthouse over Verdun with a 90 m\u00b2 terrace, uninterrupted sea view and a plan built around entertaining. Building with valet parking and gym.',
    features: ['90 m\u00b2 terrace', 'Sea view', 'Valet parking', 'Gym', 'Maid\u2019s room'],
  },
  {
    id: 'p6', purpose: 'buy', featured: false, latest: false,
    title: 'Stone Chalet', type: 'Chalet', region: 'north', regionLabel: 'North Lebanon',
    city: 'Ehden', surface: 210, beds: 3, baths: 3, parking: 2, floor: 'Ground + 1', view: 'Mountain view',
    price: 390000, images: [img('photo-1518780664697-55e3ad937233'), img('photo-1469474968028-56623f02e42e'), img('photo-1493809842364-78817add7ffb')],
    description: 'A proper Lebanese chalet of exposed stone and cedar beams, with a fireplace lounge, wood stove and decks that catch the last sun over the valley.',
    features: ['Fireplace', 'Cedar ceilings', 'Valley view', 'Privacy', 'Heating'],
  },
  {
    id: 'p7', purpose: 'buy', featured: false, latest: false,
    title: 'Apartment near Corniche', type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Clemenceau', surface: 98, beds: 1, baths: 1, parking: 1, floor: '6th', view: 'Sea glimpse',
    price: 165000, images: [img('photo-1502672260266-1c1ef2d93688'), img('photo-1522708323590-d24dbb6b0267'), img('photo-1493809842364-78817add7ffb')],
    description: 'A compact, light-filled one-bedroom ten minutes from the Corniche and Beirut\u2019s commercial heart. Popular floor plan with a true balcony.',
    features: ['Balcony', 'Elevator', 'Corniche nearby', 'Renovated kitchen'],
  },
  {
    id: 'p8', purpose: 'rent', featured: true, latest: true,
    title: 'Furnished Apartment', type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Mar Mikhael', surface: 95, beds: 1, baths: 1, parking: 0, floor: '5th', view: 'City view',
    price: 1400, perMonth: true, images: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1600566753086-00f18fb6b3ea'), img('photo-1605276374104-dee2a0ed3cd6')],
    description: 'Designed and furnished one-bedroom in a Mar Mikhael walk-up, two streets from the port\u2019s restaurants and bars. Flexible twelve-month lease, utilities included up to a cap.',
    features: ['Furnished', 'Utilities included', 'Pets allowed', 'Walk-up', 'Short walk to port'],
  },
  {
    id: 'p9', purpose: 'rent', featured: true, latest: false,
    title: 'Family Apartment', type: 'Apartment', region: 'beirut', regionLabel: 'Beirut',
    city: 'Badaro', surface: 160, beds: 3, baths: 2, parking: 1, floor: '3rd', view: 'Garden view',
    price: 2200, perMonth: true, images: [img('photo-1560185007-cde436f6a4d0'), img('photo-1502672260266-1c1ef2d93688'), img('photo-1582719478250-c89cae4dc85b')],
    description: 'A wide three-bedroom apartment on a calm Badaro street, with a deep balcony, storage room and a building kept by a small number of resident families.',
    features: ['Deep balcony', 'Storage', 'Quiet street', 'Near Jesuit University', 'Elevator'],
  },
  {
    id: 'p10', purpose: 'rent', featured: false, latest: true,
    title: 'Coastal Apartment', type: 'Apartment', region: 'coast', regionLabel: 'Mount Lebanon',
    city: 'Jounieh', surface: 130, beds: 2, baths: 2, parking: 1, floor: '1st', view: 'Sea view',
    price: 1800, perMonth: true, images: [img('photo-1520250497591-112f2f40a3f4'), img('photo-1507525428034-b723cf961d3e'), img('photo-1600607687939-ce8a6c25118c')],
    description: 'A two-bedroom apartment above Jounieh bay, ten minutes to the Casino and Maameltein\u2019s waterfront. Summer and annual leases considered.',
    features: ['Sea view', 'Terrace', 'Close to Corniche', 'Mountains nearby'],
  },
  {
    id: 'p11', purpose: 'buy', featured: false, latest: false,
    title: 'Office with Sea View', type: 'Office', region: 'beirut', regionLabel: 'Beirut',
    city: 'Ain Mreisseh', surface: 85, beds: 0, baths: 1, parking: 1, floor: '7th', view: 'Sea view',
    price: 195000, images: [img('photo-1600566752355-35792bedcfea'), img('photo-1600047509807-ba8f99d2cdde'), img('photo-1600210492486-724fe5c67fb0')],
    description: 'A compact office with sea view on a Corniche-adjacent street, suitable for a consultancy or clinic. Fully fitted, ready to move in.',
    features: ['Sea view', 'Corniche access', 'Fitted', 'Reception area'],
  },
  {
    id: 'p12', purpose: 'buy', featured: false, latest: false,
    title: 'Land Plot · Sea View', type: 'Land', region: 'south', regionLabel: 'South Lebanon',
    city: 'Saida', surface: 1200, beds: 0, baths: 0, parking: 0, floor: '—', view: 'Sea view',
    price: 145000, images: [img('photo-1469474968028-56623f02e42e'), img('photo-1469474968028-56623f02e42e'), img('photo-1506905925346-21bda4d32df4')],
    description: 'A 1,200 m\u00b2 plot above Saida with old pine trees and a direct view over the gulf, zoned for a single family home. Road access and utilities on the parcel.',
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
