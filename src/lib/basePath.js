/**
 * Deployment base path — the one place that knows NARA (public site *and*
 * CMS) is mounted under Vite's `base` (`/demo/nara-realestate/`).
 *
 * The router carries that base as its `basename` (set in `main.jsx`), so
 * react-router hands components NARA-local paths (`/`, `/ar/`,
 * `/admin-login`, `/admin/properties`) while the address bar always shows
 * `/demo/nara-realestate/...`. These helpers are for the opposite direction:
 * code that reads or writes a raw `window.location` path (canonical URLs,
 * hreflang, the legacy-URL repair) needs the base added back on or taken off:
 *
 *   stripSiteBase('/demo/nara-realestate/ar/')  → '/ar/'
 *   withSiteBase('/ar/')                        → '/demo/nara-realestate/ar/'
 *   isAdminPath('/admin-login')                 → true
 *
 * Absolute URLs (canonical, hreflang, share links) are built from
 * `window.location`, which already carries the base.
 */

/** Vite always yields a leading + trailing slash: '/' or '/demo/nara-realestate/'. */
const RAW_BASE = import.meta.env?.BASE_URL || '/'

/** Normalised base with no trailing slash: '' for the domain root, else '/demo/nara-realestate'. */
export const SITE_BASE = (() => {
  const withLead = RAW_BASE.startsWith('/') ? RAW_BASE : `/${RAW_BASE}`
  return withLead.length > 1 ? withLead.replace(/\/+$/, '') : ''
})()

/** Canonical English root: `/` at the domain root, `/demo/nara-realestate/` under a base. */
export const SITE_HOME = SITE_BASE ? `${SITE_BASE}/` : '/'

/**
 * Remove the deployment base from a pathname, leaving the NARA-local path.
 * Paths outside the base (another app's routes, an origin-root URL) are
 * returned untouched so callers never rewrite something they do not own.
 */
export function stripSiteBase(pathname) {
  const path = String(pathname || '/')
  if (!SITE_BASE) return path || '/'
  if (path === SITE_BASE) return '/'
  if (path.startsWith(`${SITE_BASE}/`)) return path.slice(SITE_BASE.length)
  return path
}

/** Re-apply the deployment base to a NARA-local path (`'/'` → the site root). */
export function withSiteBase(pathname) {
  const path = String(pathname || '/')
  if (!SITE_BASE) return path
  if (path === '/') return SITE_HOME
  return path.startsWith('/') ? `${SITE_BASE}${path}` : `${SITE_BASE}/${path}`
}

/**
 * The CMS namespace, NARA-local: `/admin`, `/admin/*` and the standalone
 * `/admin-login`. In the address bar that is always
 * `/demo/nara-realestate/admin[...]` — never the origin root, and never behind
 * an `/ar` segment (the language system must not touch it).
 */
export function isAdminPath(pathname) {
  const path = stripSiteBase(pathname)
  return path === '/admin' || path.startsWith('/admin/') || path === '/admin-login'
}
