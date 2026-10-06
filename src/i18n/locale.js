/**
 * Locale runtime: persistence, document attributes and URL prefix.
 *
 * Deliberately React-free so that the data layer (WhatsApp builders, the
 * property resolver, SEO) can read the active language without prop drilling —
 * the same pattern as `lib/settingsStore.js`.
 *
 * URL contract (public site only):
 *   English  /                ?property=p1&purpose=buy
 *   Arabic   /ar              ?property=p1&purpose=buy
 * The prefix is the single canonical statement of the document language, so
 * `/ar` deep links survive reloads and the language toggle can move the user
 * between them without losing the query string (search, filters, property).
 */
import { DEFAULT_LOCALE, LOCALES, translate } from './translations.js'

const STORAGE_KEY = 'nara:lang'

let locale = DEFAULT_LOCALE
const listeners = new Set()

export function getLocale() {
  return locale
}

/** Non-React readers can subscribe (the document <html> sync uses this). */
export function onLocaleChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setLocale(next) {
  const value = LOCALES.includes(next) ? next : DEFAULT_LOCALE
  if (value === locale) return locale
  locale = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* private mode / storage disabled — the URL prefix still carries it */
  }
  listeners.forEach((fn) => fn(value))
  return locale
}

/** Stored preference (used only to seed the first paint). */
export function readStoredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (LOCALES.includes(stored)) return stored
  } catch {
    /* ignore */
  }
  return null
}

/** `/ar/...` → 'ar', everything else → 'en'. */
export function localeFromPath(pathname) {
  const path = String(pathname || '')
  return path === '/ar' || path.startsWith('/ar/') ? 'ar' : 'en'
}

/** Strip the Arabic prefix so a locale can be turned back into a path. */
export function pathForLocale(localeValue, pathname) {
  const path = String(pathname || '/')
  const stripped = path === '/ar' ? '/' : path.startsWith('/ar/') ? path.slice(3) : path
  if (localeValue === 'ar') return stripped === '/' ? '/ar' : `/ar${stripped}`
  return stripped
}

export function documentDir(localeValue) {
  return localeValue === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Set `lang`/`dir` on <html> once, centrally.
 * No component ever writes direction attributes of its own.
 *
 * `dirOverride` exists for the admin CMS: it stays LTR so the desktop-first
 * console keeps its layout, while the strings (and the Arabic font) follow the
 * selected language. The public site always mirrors the language.
 */
export function applyDocumentLocale(localeValue, dirOverride) {
  const dir = dirOverride || documentDir(localeValue)
  const root = document.documentElement
  if (root.getAttribute('lang') !== localeValue) root.setAttribute('lang', localeValue)
  if (root.getAttribute('dir') !== dir) root.setAttribute('dir', dir)
  document.body?.setAttribute('lang', localeValue)
}

/** Bound translation helper for the current locale (outside React). */
export function tr(key, vars) {
  return translate(locale, key, vars)
}
