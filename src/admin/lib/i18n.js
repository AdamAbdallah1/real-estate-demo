/**
 * Reading bilingual content inside the CMS.
 *
 * Admin chrome stays English (desktop-first, LTR), but every piece of *content*
 * — property titles, descriptions, features, article copy, settings text — is
 * shown in the editor's current language with the other language falling back.
 */
import { geoLabel, resolveText, typeLabel } from '../../i18n/translations'
import { getLocale } from '../../i18n/locale'

/** Current editor language (`en` | `ar`) — follows the stored locale. */
export function adminLang() {
  return getLocale()
}

/** Resolve any translatable value (string | {en,ar}) for display. */
export function txt(value) {
  return resolveText(value, adminLang())
}

/** Property type identifier → display label. */
export function typeTxt(value) {
  return typeLabel(value, adminLang())
}

/** City / region identifier → display label. */
export function geoTxt(value) {
  return geoLabel(value, adminLang())
}

/** Read one language out of a translatable value (string | {en,ar}). */
export function sideOf(value, side) {
  if (value && typeof value === 'object') return String(value[side] ?? '')
  return side === 'en' ? String(value ?? '') : ''
}

/** Both languages joined — used for search haystacks so either finds a record. */
export function both(value) {
  const text = resolveText(value, 'en')
  const arabic = resolveText(value, 'ar')
  return arabic && arabic !== text ? `${text} ${arabic}` : text
}

/** Shorten copy for dense admin lists. */
export function excerpt(value, max = 90) {
  const text = txt(value)
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
