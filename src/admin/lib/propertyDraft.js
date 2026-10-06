import { emptyProperty, emptyLocalized, englishPart, arabicPart } from '../../lib/schema'
import { normalizeCoverImage, normalizeImages } from '../../lib/images'
import { toFeaturePairs } from '../../i18n/translations'

/**
 * Normalise any stored translatable value into the editor's `{en, ar}` shape.
 * A plain string (legacy document) becomes `{ en: <value>, ar: '' }`.
 */
export function toDraftLocalized(value) {
  if (value && typeof value === 'object') return { en: englishPart(value), ar: arabicPart(value) }
  return { en: englishPart(value), ar: '' }
}

/**
 * Feature rows keep the same identity in both languages so the editor can show
 * one row per feature (English field + Arabic field).
 */
export const toDraftFeatures = toFeaturePairs

/** Firestore record → editor working copy (strings, so inputs behave). */
export function toDraft(record) {
  if (!record) return emptyProperty()
  const base = emptyProperty()
  return {
    ...base,
    title: toDraftLocalized(record.title),
    slug: record.slug || '',
    purpose: record.purpose || 'sale',
    status: record.status || 'draft',
    propertyType: record.propertyType || base.propertyType,
    regionLabel: record.regionLabel || '',
    location: {
      city: record.location?.city || '',
      district: record.location?.district || '',
      region: record.location?.region || base.location.region,
      address: toDraftLocalized(record.location?.address),
    },
    price: record.price ?? '',
    currency: record.currency || 'USD',
    area: record.area ?? '',
    bedrooms: record.bedrooms ?? '',
    bathrooms: record.bathrooms ?? '',
    parking: record.parking ?? '',
    floor: record.floor || '',
    view: record.view || '',
    shortDescription: toDraftLocalized(record.shortDescription),
    description: toDraftLocalized(record.description),
    features: toDraftFeatures(record.features),
    images: normalizeImages(record.images),
    coverImage: normalizeCoverImage(record.coverImage),
    featured: Boolean(record.featured),
    createdAt: record.createdAt || null,
    updatedAt: record.updatedAt || null,
    publishedAt: record.publishedAt || null,
    createdBy: record.createdBy || null,
    updatedBy: record.updatedBy || null,
  }
}

/** Keep the cover in sync when images are reordered or removed. */
export function syncCover(images, coverImage) {
  const list = normalizeImages(images)
  if (!list.length) return { images: list, coverImage: null }
  const stillThere = list.some((image) => image.url === coverImage?.url)
  if (stillThere) return { images: list, coverImage }
  return { images: list, coverImage: { url: list[0].url, alt: list[0].alt || '' } }
}

export { emptyProperty, emptyLocalized }
