/**
 * Public document metadata: title, description, canonical URL and Open Graph
 * tags, plus JSON-LD structured data for property pages.
 * All values come from real CMS content — nothing here is invented.
 */
import { getLocale } from '../i18n/locale.js'

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }
  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value))
  return tag
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

export function applySeo({ title, description, image, canonical } = {}) {
  if (title) document.title = title
  if (description) {
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
  }
  if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  if (title) upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  if (description) upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  if (canonical) upsertLink('canonical', canonical)
}

function removeStructuredData() {
  document.head.querySelectorAll('script[data-nara-schema]').forEach((node) => node.remove())
}

function injectStructuredData(payload) {
  removeStructuredData()
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute('data-nara-schema', 'true')
  script.textContent = JSON.stringify(payload)
  document.head.appendChild(script)
}

/** RealEstateListing markup for an open property. */
export function applyPropertySchema(property, url) {
  if (!property) {
    removeStructuredData()
    return
  }
  injectStructuredData({
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.shortDescription || property.description,
    url,
    image: property.images?.slice(0, 5) || [],
    datePosted: property.publishedAt ? new Date(property.publishedAt).toISOString() : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    floorSize: property.surface
      ? { '@type': 'QuantitativeValue', value: property.surface, unitCode: 'MTK' }
      : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.regionLabel,
      addressCountry: 'LB',
    },
  })
}

export function clearStructuredData() {
  removeStructuredData()
}

function upsertHreflang(hreflang, href) {
  let tag = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'alternate')
    tag.setAttribute('hreflang', hreflang)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

/**
 * Language alternates for the current document.
 * English lives at /, Arabic at /ar — both keep the same query string, so a
 * property deep link has a valid alternate in each language.
 */
export function applyLanguageAlternates(pathname = window.location.pathname) {
  const origin = window.location.origin
  const search = window.location.search
  const path = String(pathname || '/')
  const stripped = path === '/ar' ? '/' : path.startsWith('/ar/') ? path.slice(3) : path
  const enUrl = `${origin}${stripped}${search}`
  const arUrl = `${origin}${stripped === '/' ? '/ar' : `/ar${stripped}`}${search}`

  upsertHreflang('en', enUrl)
  upsertHreflang('ar', arUrl)
  upsertHreflang('x-default', enUrl)
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: getLocale() === 'ar' ? 'ar_AR' : 'en_US',
  })
}
