/**
 * Centralised schema constants + validation.
 * Admin UI, Firestore writes and Security Rules all agree on these values.
 *
 * Bilingual model
 * ---------------
 * Translatable fields (`title`, `shortDescription`, `description`, `features`,
 * `contact.address`, homepage/SEO copy, editorial title/excerpt/content) are
 * stored as `{ en, ar }`. Everything else (price, area, beds, images, purpose,
 * identifiers, phone/WhatsApp/email/social URLs, currency) is shared by both
 * languages. A plain string is still accepted everywhere: existing documents
 * keep working and simply behave as English-only content.
 */
import { PROPERTY_TYPES, REGIONS } from '../data'
import { localizedAr, localizedEn } from '../i18n/translations'

export { PROPERTY_TYPES, REGIONS }

export const PROPERTY_STATUS = ['draft', 'published', 'archived']
export const PURPOSES = ['sale', 'rent']
export const CURRENCIES = ['USD', 'EUR', 'LBP']
export const ROLES = ['owner', 'admin', 'editor']

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed']
export const VIEWING_STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'closed']
export const SELLER_STATUSES = ['new', 'contacted', 'qualified', 'closed']
export const EDITORIAL_STATUSES = ['draft', 'published', 'archived']

export const SETTINGS_SECTIONS = ['general', 'contact', 'social', 'homepage', 'seo']

/** Field name → character cap, applied to each language independently. */
export const LOCALIZED_LIMITS = { title: 120, shortDescription: 400, description: 20000, feature: 120 }

export const DEFAULT_SETTINGS = {
  general: { siteName: 'NARA', tagline: 'Real Estate', defaultCurrency: 'USD' },
  contact: {
    whatsapp: '9611000000',
    phone: '+961 1 000 000',
    email: 'hello@nara.example',
    address: { en: 'Beirut, Lebanon', ar: 'بيروت، لبنان' },
  },
  social: { instagram: '', facebook: '', linkedin: '' },
  homepage: {
    heroHeading: {
      en: 'The right address,\nfound properly.',
      ar: 'العنوان الصحيح،\nيُعثر عليه كما ينبغي.',
    },
    heroDescription: {
      en: 'A considered collection of homes across Beirut, the coast and the mountains.',
      ar: 'مجموعة مختارة بعناية من المنازل في بيروت والساحل والجبال.',
    },
    featuredPropertyIds: [],
    editorialPropertyId: '',
  },
  seo: {
    title: {
      en: 'NARA Real Estate — Lebanon',
      ar: 'نارا العقار — لبنان',
    },
    description: { en: '', ar: '' },
    ogImage: '',
  },
}

export const FEATURE_SUGGESTIONS = [
  'Balcony', 'Terrace', 'Sea view', 'Garden view', 'Elevator', 'Concierge', 'Parking',
  'Storage room', 'Fireplace', 'Pool', 'Furnished', 'Generator', '24h electricity',
  'Solar panels', 'Gym', 'Pets allowed', 'Near port', 'Quiet street', 'Renovated',
]

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

/** English side of a translatable value (legacy plain strings count as English). */
export const englishPart = localizedEn

/** Arabic side of a translatable value — a plain string has no Arabic. */
export const arabicPart = localizedAr

export function emptyLocalized() {
  return { en: '', ar: '' }
}

export function emptyProperty() {
  return {
    title: emptyLocalized(),
    slug: '',
    purpose: 'sale',
    status: 'draft',
    propertyType: 'Apartment',
    regionLabel: '',
    location: { city: '', district: '', region: 'beirut', address: '' },
    price: '',
    currency: 'USD',
    area: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    floor: '',
    view: '',
    shortDescription: emptyLocalized(),
    description: emptyLocalized(),
    features: [],
    images: [],
    coverImage: null,
    featured: false,
  }
}

function num(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : NaN
}

/**
 * Validate the editor's property object.
 * Returns { field: message } — empty object means valid.
 * Security Rules repeat these checks at the database boundary.
 *
 * English and Arabic are validated independently: filling one language is
 * enough to save, the other may stay empty (it falls back at render time).
 */
export function validateProperty(data) {
  const errors = {}

  const enTitle = englishPart(data.title)
  const arTitle = arabicPart(data.title)
  const title = enTitle || arTitle

  if (!title) errors.title = 'Title is required.'
  if (enTitle && enTitle.length < 3) errors.title = 'Title is too short.'
  if (enTitle && enTitle.length > LOCALIZED_LIMITS.title) errors['title.en'] = 'Title must be 120 characters or fewer (English).'
  if (arTitle && arTitle.length > LOCALIZED_LIMITS.title) errors['title.ar'] = 'يجب ألا يتجاوز العنوان 120 حرفاً (العربية).'

  if (!PURPOSES.includes(data.purpose)) errors.purpose = 'Choose sale or rent.'
  if (!PROPERTY_STATUS.includes(data.status)) errors.status = 'Choose a valid status.'
  if (!PROPERTY_TYPES.includes(data.propertyType)) errors.propertyType = 'Choose a property type.'
  if (!REGIONS.some((r) => r.id === data.location?.region)) errors['location.region'] = 'Choose a region.'
  if (!String(data.location?.city || '').trim()) errors['location.city'] = 'City is required.'

  const price = num(data.price)
  if (price === null) errors.price = 'Price is required.'
  else if (Number.isNaN(price)) errors.price = 'Price must be a number.'
  else if (price < 0) errors.price = 'Price cannot be negative.'
  else if (price > 0 && price < 100 && data.purpose === 'sale') errors.price = 'Price looks too low for a sale.'

  const area = num(data.area)
  if (area !== null && (Number.isNaN(area) || area < 0)) errors.area = 'Area must be a positive number.'
  for (const field of ['bedrooms', 'bathrooms', 'parking']) {
    const value = num(data[field])
    if (value !== null && (Number.isNaN(value) || value < 0)) errors[field] = 'Must be zero or more.'
  }

  const enShort = englishPart(data.shortDescription)
  const arShort = arabicPart(data.shortDescription)
  if (!enShort && !arShort) errors.shortDescription = 'Short description is required.'
  if (enShort && enShort.length > LOCALIZED_LIMITS.shortDescription) errors['shortDescription.en'] = 'Short description must be 400 characters or fewer (English).'
  if (arShort && arShort.length > LOCALIZED_LIMITS.shortDescription) errors['shortDescription.ar'] = 'يجب ألا يتجاوز الوصف المختصر 400 حرف (العربية).'

  const enBody = englishPart(data.description)
  const arBody = arabicPart(data.description)
  if (enBody.length < 20 && arBody.length < 20) {
    errors.description = 'Add a full description (20 characters minimum).'
  }
  if (enBody.length > LOCALIZED_LIMITS.description) errors['description.en'] = 'Description is too long (English).'
  if (arBody.length > LOCALIZED_LIMITS.description) errors['description.ar'] = 'الوصف طويل جداً (العربية).'

  const features = Array.isArray(data.features) ? data.features : []
  features.forEach((feature, i) => {
    const en = englishPart(feature)
    const ar = arabicPart(feature)
    if (!en && !ar) errors[`features.${i}`] = 'Feature text is required.'
    else if (en.length > LOCALIZED_LIMITS.feature) errors[`features.${i}`] = 'Feature must be 120 characters or fewer (English).'
    else if (ar.length > LOCALIZED_LIMITS.feature) errors[`features.${i}`] = 'يجب ألا يتجاوز الميزة 120 حرفاً (العربية).'
  })

  // Arabic cannot produce a URL slug, so English (or a manual entry) is needed.
  const slug = String(data.slug || '').trim() || slugify(enTitle)
  if (!slug) errors.slug = 'Slug is required — add one manually (it cannot be derived from Arabic text).'
  else if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Use lowercase letters, numbers and dashes.'

  const images = Array.isArray(data.images) ? data.images : []
  if (!images.length) errors.images = 'Add at least one image URL.'
  else {
    images.forEach((image, i) => {
      if (!image?.url) errors[`images.${i}`] = 'Image URL is required.'
      else if (!isSecureUrl(image.url)) errors[`images.${i}`] = 'Use an external https:// image URL.'
    })
  }
  return errors
}

function isSecureUrl(value) {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Strip empty strings / undefined so documents stay tidy. */
export function pruneDeep(value) {
  if (Array.isArray(value)) return value.map(pruneDeep).filter((v) => v !== undefined)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue
      const next = pruneDeep(val)
      if (next === '' || next === null) continue
      out[key] = next
    }
    return out
  }
  return value
}
