/**
 * Image handling abstraction.
 *
 * Firebase Storage is not available for this project, so images are stored as
 * external HTTPS URLs in Firestore. Every image value that enters or leaves the
 * database passes through this module, so switching to Firebase Storage later
 * only means changing how a URL is resolved here — the property model and the
 * public components stay untouched.
 *
 * Stored shape:
 *   images:    [{ url, alt, order }]
 *   coverImage: { url, alt }
 */

/** Absolute http(s) URL, rejects data:/blob:/relative values. */
export function isHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Strict check used by the editor: external images must be HTTPS. */
export function isSecureImageUrl(value) {
  if (!isHttpUrl(value)) return false
  return new URL(value.trim()).protocol === 'https:'
}

/** Rejects base64 payloads and anything that is not a plain URL. */
export function isStoredImageValue(value) {
  if (typeof value !== 'string') return false
  if (value.startsWith('data:') || value.startsWith('blob:')) return false
  return isHttpUrl(value)
}

/** Normalise one image record. Returns null when unusable. */
export function normalizeImage(raw, index = 0) {
  if (!raw) return null
  const url = typeof raw === 'string' ? raw.trim() : String(raw.url || '').trim()
  if (!isStoredImageValue(url)) return null
  const alt = typeof raw === 'string' ? '' : String(raw.alt || '').trim()
  const order = Number.isFinite(Number(raw?.order)) ? Number(raw.order) : index
  return { url, alt, order }
}

/** Filter invalid records, sort by order, re-index. */
export function normalizeImages(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((item, i) => normalizeImage(item, i))
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)
    .map((item, i) => ({ ...item, order: i }))
}

/** Normalise the optional cover image record. */
export function normalizeCoverImage(raw) {
  if (!raw) return null
  const image = normalizeImage(raw, 0)
  return image ? { url: image.url, alt: image.alt } : null
}

/** Resolve the URL of any accepted image shape (record, string or null). */
export function getImageUrl(image) {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.url || ''
}

/**
 * Single source of truth for "the picture of this property":
 * explicit cover, otherwise the first ordered image.
 */
export function getCoverImage(property) {
  if (!property) return null
  const cover = normalizeCoverImage(property.coverImage)
  if (cover) return cover
  const images = normalizeImages(property.images)
  if (images.length) return { url: images[0].url, alt: images[0].alt }
  return null
}

/** Ordered image URLs (what the public gallery consumes). */
export function getImageUrls(property) {
  return normalizeImages(property?.images).map((image) => image.url)
}

/** Move an image to a new index (used by "reorder" in the editor). */
export function moveImage(images, from, to) {
  const list = normalizeImages(images)
  if (from < 0 || from >= list.length) return list
  const target = Math.max(0, Math.min(list.length - 1, to))
  const [item] = list.splice(from, 1)
  list.splice(target, 0, item)
  return list.map((image, i) => ({ ...image, order: i }))
}
