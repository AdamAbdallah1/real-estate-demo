import { useEffect, useRef, useState } from 'react'

/**
 * Subscribes to one Firestore data-layer function.
 * The callback receives { items, error }; failures become an error state
 * instead of a screen that never resolves.
 *
 * The subscription runs once per mount — the latest factory is kept in a ref,
 * so no listener is created or destroyed on unrelated re-renders.
 */
export function useSubscription(subscribe) {
  const subscribeRef = useRef(subscribe)
  const [state, setState] = useState({ items: null, loading: true, error: null })

  useEffect(() => {
    subscribeRef.current = subscribe
  })

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    try {
      unsubscribe = subscribeRef.current(({ items, error }) => {
        if (!active) return
        setState({ items, loading: false, error: error || null })
      }) || (() => {})
    } catch (err) {
      // Deferred: subscribe() can throw synchronously (Firebase disabled), and a
      // synchronous setState here would cascade renders from inside the effect.
      const message = err?.message || 'Could not load this collection.'
      queueMicrotask(() => {
        if (!active) return
        setState({ items: null, loading: false, error: message })
      })
    }

    return () => {
      active = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  return state
}

export default useSubscription
