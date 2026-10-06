/**
 * React binding for the language system.
 *
 * Components never branch on the language themselves — they ask for a string
 * (`t('nav.buy')`) or a resolved content value (`geo(p.city, lang)`). Direction
 * and `lang` are applied to <html> exactly once by the provider.
 *
 * The provider lives inside <BrowserRouter> so the Arabic URL prefix (/ar) and
 * the language are kept in step without a reload, which also means switching
 * language never loses the current property, filters or scroll state.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { I18nContext } from './context.js'
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
  const isAdmin = location.pathname.startsWith('/admin')

  // An explicit /ar deep link always wins; otherwise the stored preference
  // decides until the user toggles. Default is English.
  const [lang, setLangState] = useState(() => {
    const fromPath = localeFromPath(location.pathname)
    if (fromPath === 'ar') return 'ar'
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
  // so Back never walks through language states).
  useEffect(() => {
    if (isAdmin) return
    if (localeFromPath(location.pathname) === lang) return
    navigate(
      {
        pathname: pathForLocale(lang, location.pathname),
        search: location.search,
        hash: location.hash,
      },
      { replace: true },
    )
  }, [lang, isAdmin, location.pathname, location.search, location.hash, navigate])

  const setLang = useCallback((next) => {
    const value = next === 'ar' ? 'ar' : DEFAULT_LOCALE
    setLocale(value)
    setLangState(value)
  }, [])

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
