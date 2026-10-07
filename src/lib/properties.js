import { PROPERTIES } from '../data'
import { getWhatsAppNumber } from './settingsStore'
import { getLocale, tr } from '../i18n/locale.js'
import { geoLabel, resolveText } from '../i18n/translations.js'

/** Kept for backwards compatibility — the live value comes from siteSettings. */
export const WHATSAPP_NUMBER = '9611000000'

export function whatsappNumber() {
  return getWhatsAppNumber()
}

export function openWhatsApp(message, number = getWhatsAppNumber()) {
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
}

/** Text of a property field in the active language (messages run outside React). */
function field(value, lang) {
  return resolveText(value, lang)
}

function formatPriceForMessage(p) {
  const n = '$' + p.price.toLocaleString('en-US')
  return p.perMonth ? `${n} ${tr('wa.perMonth')}` : n
}

/** Property-aware WhatsApp message, written in the currently selected language. */
export function propertyInquiryMessage(p) {
  const lang = getLocale()
  return tr('wa.inquiry', {
    title: field(p.title, lang),
    city: geoLabel(p.city, lang),
    price: formatPriceForMessage(p),
  })
}

export function viewingRequestMessage(p, { name, phone, day, time, message }) {
  const lang = getLocale()
  const lines = [
    tr('wa.viewingHeader', {
      title: field(p.title, lang),
      city: geoLabel(p.city, lang),
      price: formatPriceForMessage(p),
    }),
    '',
    `${tr('wa.name')}: ${name}`,
    `${tr('wa.phone')}: ${phone}`,
    `${tr('wa.day')}: ${day}`,
    `${tr('wa.time')}: ${time}`,
  ]
  if (message?.trim()) lines.push(`${tr('wa.message')}: ${message.trim()}`)
  return lines.join('\n')
}

export function shareMessage(p, url) {
  const lang = getLocale()
  return `${tr('wa.share', {
    title: field(p.title, lang),
    city: geoLabel(p.city, lang),
    price: formatPriceForMessage(p),
  })}\n${url}`
}

export function sellerInquiryMessage({ name, phone, location, type, size, message }) {
  const lines = [
    tr('wa.sellerHeader'),
    '',
    `${tr('wa.name')}: ${name}`,
    `${tr('wa.phone')}: ${phone}`,
    `${tr('wa.location')}: ${location}`,
    `${tr('wa.type')}: ${type}`,
    `${tr('wa.size')}: ${size}`,
  ]
  if (message?.trim()) lines.push(`${tr('wa.message')}: ${message.trim()}`)
  return lines.join('\n')
}

export function similarProperties(p, count = 3, list = PROPERTIES) {
  return (list || PROPERTIES)
    .filter((x) => x.id !== p.id)
    .map((x) => ({
      x,
      score:
        (x.region === p.region ? 4 : 0) +
        (x.purpose === p.purpose ? 3 : 0) +
        (x.type === p.type ? 2 : 0) +
        (p.beds > 0 && x.beds > 0 ? Math.max(0, 2 - Math.abs(x.beds - p.beds)) : 0) +
        (p.price > 0 && x.price > 0 ? Math.max(0, 1 - Math.abs(x.price - p.price) / p.price) : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.x)
    .filter((x) => {
      // only keep reasonable matches: same purpose at minimum
      return x.purpose === p.purpose
    })
}

/**
 * Sort ids are language-independent filter state (they live in the query
 * string), so only their labels are translated — at render time.
 */
export const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to high' },
  { id: 'price-desc', label: 'Price: High to low' },
  { id: 'area-desc', label: 'Largest' },
  { id: 'beds-desc', label: 'Bedrooms' },
]

export function sortProperties(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'area-desc':
      return copy.sort((a, b) => b.surface - a.surface)
    case 'beds-desc':
      return copy.sort((a, b) => b.beds - a.beds)
    default:
      return copy
  }
}

/**
 * Search across BOTH language representations.
 * `keywords` is prebuilt by resolvePropertyView (title, description, features,
 * location labels in English and Arabic); the field list is the fallback for
 * property objects that never went through the resolver.
 */
export function matchesQuery(p, q) {
  if (!q) return true
  const haystack = (p.keywords
    || [p.title, p.type, p.city, p.regionLabel, p.region, p.view, ...(p.features || [])].join(' ')
  )
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
  const needle = q.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  return haystack.includes(needle)
}

/**
 * Canonical property URL for the current language (query-param deep links are
 * language-independent, so the path and the id survive a language switch):
 * English  https://host/demo/nara-realestate/?property=p1
 * Arabic   https://host/demo/nara-realestate/ar/?property=p1
 */
export function propertyUrl(p) {
  const url = new URL(window.location.href)
  url.searchParams.set('property', p?.id || '')
  return url.toString()
}
