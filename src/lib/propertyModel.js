/**
 * Property model boundary.
 *
 * Firestore stores the canonical property schema; the public NARA website keeps
 * its existing (deliberately simple) view-model shape. Everything conversion
 * related lives here so neither side leaks into the other.
 *
 * Two shapes exist and they are deliberately kept apart:
 *
 *  1. Canonical content shape — bilingual objects for the translatable fields
 *     ({ en, ar } title / shortDescription / description / features).
 *  2. Display shape — `resolvePropertyView(property, lang)` produces plain
 *     strings for one language plus a `keywords` haystack that still covers
 *     BOTH languages, so search works in English while Arabic is selected and
 *     vice versa.
 */
import { REGIONS } from '../data'
import { getCoverImage, getImageUrls, normalizeCoverImage, normalizeImages } from './images'
import {
  featureLabel,
  geoLabel,
  localizedAr,
  localizedEn,
  placeLabel,
  resolveText,
  toFeaturePairs,
  toLocalized,
  toStoredFeatures,
  toStoredText,
  viewLabel,
} from '../i18n/translations.js'

export function regionLabelFor(regionId) {
  return REGIONS.find((r) => r.id === regionId)?.name || ''
}

function toMillis(value) {
  if (!value) return null
  if (typeof value === 'number') return value
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (typeof value.seconds === 'number') return value.seconds * 1000
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Firestore document → public site property (canonical, bilingual).
 * Returns null for unusable documents.
 *
 * Legacy documents written before the bilingual migration store plain strings;
 * `toLocalized` accepts both, so nothing has to be migrated to render.
 */
export function toPublicProperty(raw, id) {
  if (!raw || typeof raw !== 'object') return null
  const images = getImageUrls(raw)
  const cover = getCoverImage(raw)
  const region = raw.location?.region || ''
  const purpose = raw.purpose === 'rent' ? 'rent' : 'buy'

  return {
    id,
    title: toLocalized(raw.title),
    slug: raw.slug || '',
    purpose,
    type: raw.propertyType || 'Apartment',
    region,
    regionLabel: raw.regionLabel || regionLabelFor(region),
    city: raw.location?.city || '',
    district: raw.location?.district || '',
    address: raw.location?.address || '',
    surface: Number(raw.area) || 0,
    beds: Number(raw.bedrooms) || 0,
    baths: Number(raw.bathrooms) || 0,
    parking: Number(raw.parking) || 0,
    floor: raw.floor || '—',
    view: raw.view || '',
    price: Number(raw.price) || 0,
    perMonth: purpose === 'rent',
    currency: raw.currency || 'USD',
    images,
    coverImage: cover?.url || '',
    shortDescription: toLocalized(raw.shortDescription),
    description: toLocalized(raw.description),
    features: toFeaturePairs(raw.features),
    featured: Boolean(raw.featured),
    status: raw.status || 'draft',
    createdAt: toMillis(raw.createdAt),
    updatedAt: toMillis(raw.updatedAt),
    publishedAt: toMillis(raw.publishedAt),
  }
}

/** Both-language search haystack: an Arabic query and an English query both hit. */
function buildKeywords(p) {
  const both = (value) => {
    const en = resolveText(value, 'en')
    const ar = resolveText(value, 'ar')
    return en === ar ? [en] : [en, ar]
  }
  const parts = [
    ...both(p.title),
    ...both(p.description),
    ...both(p.shortDescription),
    p.slug,
    p.type,
    p.city, geoLabel(p.city, 'ar'),
    p.district, geoLabel(p.district, 'ar'),
    p.address,
    p.region, p.regionLabel, geoLabel(p.regionLabel, 'ar'),
    ...(p.features || []).flatMap(both),
  ]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

/**
 * Canonical property → display property for one language.
 * Pure: called from a `useMemo` keyed on the active language.
 */
export function resolvePropertyView(p, lang) {
  if (!p) return p
  return {
    ...p,
    title: resolveText(p.title, lang),
    shortDescription: resolveText(p.shortDescription, lang),
    description: resolveText(p.description, lang),
    features: (p.features || []).map((f) => featureLabel(f, lang)).filter(Boolean),
    city: geoLabel(p.city, lang),
    district: geoLabel(p.district, lang),
    address: resolveText(p.address, lang),
    regionLabel: geoLabel(p.regionLabel, lang),
    view: viewLabel(p.view, lang),
    keywords: buildKeywords(p),
  }
}

/** Public site view-model → Firestore write payload (no timestamps). */
export function fromPublicProperty(p) {
  const title = toStoredText(p.title)
  const description = toStoredText(p.description)
  const shortDescription = toStoredText({
    en: firstSentence(localizedEn(p.description)),
    ar: firstSentence(localizedAr(p.description)),
  })
  const enTitle = localizedEn(p.title) || p.id
  const enCity = resolveText(p.city, 'en')
  const images = normalizeImages(
    (p.images || []).map((url, i) => ({ url, alt: `${enTitle} in ${enCity} — view ${i + 1}`, order: i })),
  )
  const cover = normalizeCoverImage({ url: images[0]?.url || '', alt: images[0]?.alt || '' })
  return {
    title,
    slug: p.slug || p.id,
    purpose: p.purpose === 'rent' ? 'rent' : 'sale',
    status: 'published',
    propertyType: p.type,
    regionLabel: p.regionLabel || regionLabelFor(p.region),
    location: {
      city: p.city,
      district: '',
      region: p.region,
      address: '',
    },
    price: p.price,
    currency: p.currency || 'USD',
    area: p.surface,
    bedrooms: p.beds,
    bathrooms: p.baths,
    parking: p.parking,
    floor: p.floor || '',
    view: p.view || '',
    shortDescription,
    description,
    features: toStoredFeatures(p.features),
    images,
    coverImage: cover,
    featured: Boolean(p.featured),
    source: 'demo-seed',
  }
}

function firstSentence(text = '') {
  const value = String(text || '')
  if (!value) return ''
  const match = value.match(/^[^.!?۔]+[.!?۔]/)
  return (match ? match[0] : value).trim()
}

/**
 * Mark the most recently published properties as "latest" so the public
 * Latest section keeps working without a bespoke flag in the schema.
 */
export function withLatestFlag(list, count = 4) {
  const dated = [...list]
  const key = (p) => p.publishedAt || p.updatedAt || p.createdAt || 0
  dated.sort((a, b) => key(b) - key(a))
  const latestIds = new Set(dated.slice(0, count).map((p) => p.id))
  return list.map((p) => ({ ...p, latest: latestIds.has(p.id) }))
}

export { placeLabel }
