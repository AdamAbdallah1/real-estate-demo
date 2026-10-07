/**
 * React binding for the language system.
 *
 * Components never branch on the language themselves — they ask for a string
 * (`t('nav.buy')`) or a resolved content value (`geo(p.city, lang)`). Direction
 * and `lang` are applied to <html> exactly once by the provider.
 *
 * The provider lives inside <BrowserRouter>, whose basename is the deployment
 * base (see lib/basePath.js), so the Arabic URL segment (/ar, which sits
 * *after* that base) and the language are kept in step without a reload —
 * which also means switching language never loses the current property,
 * filters or scroll state.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { I18nContext } from './context.js'
import { SITE_BASE, SITE_HOME, isAdminPath } from '../lib/basePath.js'
import {
  DEFAULT_LOCALE,
  countLabel,
  featureLabel,
  geoLabel,
  isLocalized,
  resolveText,
  toLocalized,
  translate,
  typeLabel,
  viewLabel,
} from './translations.js'
import {
  applyDocumentLocale,
  documentDir,
  getLocale,
  localeFromPath,
  pathForLocale,
  readStoredLocale,
  setLocale,
} from './locale.js'

export function I18nProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // The CMS shares the demo base but not the language namespace: `/admin*`
  // and `/admin-login` never grow an `/ar` segment.
  const isAdmin = isAdminPath(location.pathname)

  // The URL is the single source of truth for the public site: the deployment
  // root is always English and `/ar` is always Arabic, and neither redirects to
  // the other — a stored preference never overrides an explicit URL, so
  // `/demo/nara-realestate/` always loads English. Only the admin, which has no
  // language segment in its URL, still falls back to the stored preference.
  const [lang, setLangState] = useState(() => {
    if (!isAdmin) return localeFromPath(location.pathname)
    return readStoredLocale() === 'ar' ? 'ar' : DEFAULT_LOCALE
  })

  // Make the module-level locale visible to non-React readers before any child
  // renders (WhatsApp builders, property resolution, SEO).
  if (getLocale() !== lang) setLocale(lang)

  // <html lang dir> — centralised, never done by a component.
  useEffect(() => {
    applyDocumentLocale(lang, isAdmin ? 'ltr' : documentDir(lang))
  }, [lang, isAdmin])

  // Public routes mirror the language in the path (replace → no history noise,
  // so Back never walks through language states). The path is NARA-local — the
  // router's basename supplies the deployment base — and only ever touches
  // NARA's own /ar segment. Search and hash are read from the live URL so
  // switching language can never drop `?property=`.
  useEffect(() => {
    if (isAdmin) return
    if (localeFromPath(location.pathname) === lang) return
    navigate(
      {
        pathname: pathForLocale(lang, location.pathname),
        search: window.location.search,
        hash: window.location.hash,
      },
      { replace: true },
    )
  }, [lang, isAdmin, location.pathname, navigate])

  const setLang = useCallback((next) => {
    const value = next === 'ar' ? 'ar' : DEFAULT_LOCALE
    setLocale(value)
    setLangState(value)
  }, [])

  // react-router joins a non-root `basename` with `/` as the bare basename
  // (`/demo/nara-realestate`), so coming back to English would drop the
  // canonical trailing slash of the root. Keep one shape for
  // `/demo/nara-realestate/` — the host, hreflang alternates and copied links
  // all agree on it — without notifying the router.
  useEffect(() => {
    if (isAdmin || !SITE_BASE) return
    if (window.location.pathname !== SITE_BASE) return
    window.history.replaceState(
      window.history.state,
      '',
      `${SITE_HOME}${window.location.search}${window.location.hash}`,
    )
  }, [isAdmin, location])

  const value = useMemo(() => {
    const t = (key, vars) => translate(lang, key, vars)
    return {
      lang,
      dir: documentDir(lang),
      setLang,
      t,
      /** Bilingual CMS value (string | {en,ar}) → display string. */
      txt: (content) => resolveText(content, lang),
      /** City / district / region display label. */
      geo: (content) => geoLabel(content, lang),
      typeLabel: (content) => typeLabel(content, lang),
      viewLabel: (content) => viewLabel(content, lang),
      featureLabel: (content) => featureLabel(content, lang),
      count: (n, forms) => countLabel(n, lang, forms),
      isLocalized,
      toLocalized,
    }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
