import { useEffect, useState } from 'react'
import { DEFAULT_SETTINGS } from '../lib/schema'
import { firebaseEnabled } from '../lib/firebaseEnv'
import { getSettingsSnapshot, setSettingsSnapshot } from '../lib/settingsStore'

/**
 * Site-wide configurable content (hero copy, contact, social, SEO).
 * One-shot read on load — the public site does not need a live subscription.
 * Local defaults keep every section working before the first read resolves.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    let cancelled = false
    import('../lib/firestore/settings')
      .then(({ getSettings }) => getSettings())
      .then((next) => {
        if (cancelled) return
        setSettings(next)
        setSettingsSnapshot(next)
      })
      .catch((err) => {
        console.warn('[nara] site settings unavailable — using defaults.', err?.code || err?.message || err)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return settings
}

export { getSettingsSnapshot }
export default useSiteSettings
