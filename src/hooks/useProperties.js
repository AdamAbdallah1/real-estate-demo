import { useEffect, useMemo, useState } from 'react'
import { PROPERTIES } from '../data'
import { firebaseEnabled } from '../lib/firebaseEnv'
import { resolvePropertyView } from '../lib/propertyModel'
import { useI18n } from '../i18n'

/**
 * Public property repository.
 *
 * Firestore is the source of truth for published properties. The local demo
 * array is only used as an instant fallback so the site never renders empty
 * while the first read is in flight (or when Firebase is unavailable/not yet
 * seeded). Draft and archived documents never enter this list.
 *
 * Text is resolved for the active language here — once — so every component
 * keeps reading `p.title` / `p.description` as plain strings. Search still
 * matches both languages because the resolver also builds a bilingual
 * `keywords` haystack.
 */
export function useProperties() {
  const { lang } = useI18n()
  const [state, setState] = useState({
    properties: PROPERTIES,
    loading: firebaseEnabled,
    source: 'local',
    error: null,
  })

  useEffect(() => {
    if (!firebaseEnabled) return undefined
    let cancelled = false

    // Firestore is loaded on demand so the public first paint is not delayed
    // by the Firebase SDK.
    import('../lib/firestore/properties')
      .then(({ getPublishedProperties }) => getPublishedProperties())
      .then((list) => {
        if (cancelled) return
        if (list.length > 0) {
          setState({ properties: list, loading: false, source: 'firestore', error: null })
        } else {
          // Firestore reachable but empty: keep the demo content visible until
          // an admin runs the explicit seed migration.
          setState((prev) => ({ ...prev, loading: false, source: 'local', error: null }))
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[nara] published properties unavailable — using local demo data.', err?.code || err?.message || err)
        setState((prev) => ({ ...prev, loading: false, source: 'local', error: 'unavailable' }))
      })

    return () => {
      cancelled = true
    }
  }, [])

  const properties = useMemo(
    () => state.properties.map((p) => resolvePropertyView(p, lang)),
    [state.properties, lang],
  )

  return { ...state, properties }
}

export default useProperties
