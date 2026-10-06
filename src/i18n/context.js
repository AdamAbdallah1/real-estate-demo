/**
 * The i18n context and its hooks.
 *
 * Kept out of `index.jsx` so that file exports exactly one thing — the
 * provider component — and fast refresh keeps working across the app.
 */
import { createContext, useContext } from 'react'

export const I18nContext = createContext(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

/** Shorthand for components that only need the translator. */
export function useT() {
  return useI18n().t
}
