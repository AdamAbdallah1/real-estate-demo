/**
 * Locale runtime: persistence, document attributes and URL prefix.
 *
 * Deliberately React-free so that the data layer (WhatsApp builders, the
 * property resolver, SEO) can read the active language without prop drilling —
 * the same pattern as `lib/settingsStore.js`.
 *
 * URL contract (all paths below are NARA-local; the deployment base
 * `/demo/nara-realestate` sits in front of them in the address bar):
 *   English  /demo/nara-realestate/           ?property=p1
 *   Arabic   /demo/nara-realestate/ar/        ?property=p1
 *   CMS      /demo/nara-realestate/admin-login
 *            /demo/nara-realestate/admin/*
 * `/ar` is an NARA-local segment that always sits *after* the base path and
 * never in front of it. It is the single canonical statement of the document
 * language, so `/ar` deep links survive reloads and the language toggle can
 * move the user between them without losing the query string (`?property=`).
 * The CMS is part of the same base but not of this contract: it has one fixed
 * namespace (`/admin-login`, `/admin/*`), never an `/ar` prefix, and is
 * detected by `isAdminPath()`.
 */
import { SITE_BASE, stripSiteBase, withSiteBase } from '../lib/basePath.js'
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

/**
 * `/ar/...` → 'ar', everything else → 'en'.
 * The deployment base (`/demo/nara-realestate`) is stripped first, so the
 * Arabic segment is only ever recognised in NARA's own path.
 */
export function localeFromPath(pathname) {
  const path = stripSiteBase(pathname)
  return path === '/ar' || path.startsWith('/ar/') ? 'ar' : 'en'
}

/**
 * Add or remove the NARA-local `/ar` segment for a pathname, leaving it
 * NARA-local (the router's `basename` already supplies the deployment base in
 * the address bar):
 *   pathForLocale('ar', '/')     → '/ar/'
 *   pathForLocale('en', '/ar/')  → '/'
 * Trailing-slash shape of the input is preserved so neither language is
 * silently redirected by the host. Callers that build an *absolute* URL —
 * canonical/hreflang in `lib/seo.js` — wrap the result in `withSiteBase()`.
 */
export function pathForLocale(localeValue, pathname) {
  const original = String(pathname || '/')
  const relative = stripSiteBase(original)
  const stripped = relative === '/ar' ? '/' : relative.startsWith('/ar/') ? relative.slice(3) : relative
  const target = localeValue === 'ar'
    ? (stripped === '/' ? '/ar' : `/ar${stripped}`)
    : (stripped || '/')
  return original.endsWith('/') && !target.endsWith('/') ? `${target}/` : target
}

/**
 * Repair the pre-fix shape `/ar/demo/nara-realestate/...`, where `/ar` had
 * been written in front of the deployment base, back to
 * `/demo/nara-realestate/ar/...`. Returns null when the pathname is already
 * correct, so nothing navigates for no reason. Any duplicated `/ar` left by
 * the old logic is collapsed on the way through.
 *
 * This takes an *address-bar* path and is applied once in `main.jsx` before
 * <BrowserRouter> mounts: the legacy URL sits outside the router's basename,
 * which would otherwise render nothing.
 */
export function misplacedArPrefixTarget(pathname) {
  if (!SITE_BASE) return null
  const path = String(pathname || '')
  if (!path.startsWith(`/ar${SITE_BASE}`)) return null

  // '/ar/demo/nara-realestate/ar/...' → site-relative '/ar/...'
  let relative = path.slice(3).slice(SITE_BASE.length) || '/'
  if (relative === '/ar' || relative === '/ar/') relative = '/'
  else if (relative.startsWith('/ar/')) relative = relative.slice(3)

  const target = relative === '/' ? '/ar' : `/ar${relative}`
  const joined = withSiteBase(target)
  return path.endsWith('/') && !joined.endsWith('/') ? `${joined}/` : joined
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
