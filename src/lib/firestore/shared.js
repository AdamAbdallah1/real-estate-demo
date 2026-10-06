/**
 * Shared helpers for every Firestore module.
 *
 * Rules of the data layer:
 *  - no Firestore calls inside JSX,
 *  - server timestamps for authoritative dates,
 *  - every function fails loudly with a readable error instead of hanging.
 */
import { db } from '../firebase'

export class DataUnavailableError extends Error {
  constructor(message = 'Firebase data is unavailable right now.') {
    super(message)
    this.name = 'DataUnavailableError'
  }
}

export function requireDb() {
  if (!db) throw new DataUnavailableError('Firebase is not configured. Set the VITE_FIREBASE_* values in .env.local.')
  return db
}

export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err instanceof DataUnavailableError) return err.message
  const code = err?.code || ''
  if (code.includes('permission-denied')) return 'You do not have permission to do that.'
  if (code.includes('unavailable') || code.includes('failed-precondition')) return 'Firestore is unreachable. Check your connection.'
  if (code.includes('not-found')) return 'That record no longer exists.'
  if (code.includes('already-exists')) return 'A record with that value already exists.'
  if (code.includes('resource-exhausted')) return 'Quota exceeded. Try again shortly.'
  if (code.includes('invalid-argument')) return 'The data was rejected by Firestore.'
  if (code.includes('unauthenticated')) return 'Your session has expired. Please sign in again.'
  return fallback
}

/** Timestamp → display string (e.g. "12 Mar 2026, 14:05"). */
export function formatTimestamp(value, { withTime = true } = {}) {
  if (!value) return '—'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function timestampToInput(value) {
  if (!value) return ''
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
