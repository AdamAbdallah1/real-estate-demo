import { PROPERTIES } from '../data'

export const WHATSAPP_NUMBER = '9611000000'

export function openWhatsApp(message) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener')
}

export function propertyInquiryMessage(p) {
  return `Hello NARA, I'm interested in the ${p.title} in ${p.city} listed at ${formatPriceForMessage(p)}. I'd like to know more about the property and its availability.`
}

function formatPriceForMessage(p) {
  const n = '$' + p.price.toLocaleString('en-US')
  return p.perMonth ? n + ' per month' : n
}

export function viewingRequestMessage(p, { name, phone, day, time, message }) {
  const lines = [
    `Hello NARA, I'd like to request a viewing for the ${p.title} in ${p.city} listed at ${formatPriceForMessage(p)}.`,
    ``,
    `Name: ${name}`,
    `Phone / WhatsApp: ${phone}`,
    `Preferred day: ${day}`,
    `Preferred time: ${time}`,
  ]
  if (message?.trim()) lines.push(`Message: ${message.trim()}`)
  return lines.join('\n')
}

export function shareMessage(p, url) {
  return `${p.title} in ${p.city} — ${formatPriceForMessage(p)} via NARA Real Estate\n${url}`
}

export function sellerInquiryMessage({ name, phone, location, type, size, message }) {
  const lines = [
    `Hello NARA, I'd like to discuss selling a property.`,
    ``,
    `Name: ${name}`,
    `Phone / WhatsApp: ${phone}`,
    `Location: ${location}`,
    `Type: ${type}`,
    `Approximate size: ${size}`,
  ]
  if (message?.trim()) lines.push(`Message: ${message.trim()}`)
  return lines.join('\n')
}

export function similarProperties(p, count = 3) {
  return PROPERTIES
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

export function matchesQuery(p, q) {
  if (!q) return true
  const haystack = [p.title, p.type, p.city, p.regionLabel, p.region, p.view, ...(p.features || [])]
    .join(' ')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
  const needle = q.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  return haystack.includes(needle)
}

export function propertyUrl(p) {
  const url = new URL(window.location.href)
  url.searchParams.set('property', p.id)
  return url.toString()
}
