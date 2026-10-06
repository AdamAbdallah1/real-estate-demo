/**
 * Firebase foundation.
 *
 * The web config below comes from Vite environment variables (.env.local).
 * This is *client configuration*, not a credential: knowing it does not grant
 * access to any data. Everything that matters is enforced by Firebase
 * Authentication and by Firestore Security Rules.
 *
 * Firebase Storage is intentionally NOT initialised — billing/Storage setup is
 * unavailable, and images are stored as external HTTPS URLs instead.
 */
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig, firebaseEnabled } from './firebaseEnv'

// Re-exported for modules that already live inside the (lazily loaded) Firebase
// chunk. Anything on the public first-paint path must import ./firebaseEnv
// instead, so the SDK never lands in the main bundle.
export { firebaseConfig, firebaseEnabled }

let app = null
let db = null
let auth = null

if (firebaseEnabled) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
  } catch (err) {
    app = null
    db = null
    auth = null
    // Not fatal: the app falls back to local demo data (see the repository).
    console.warn('[nara] Firebase could not be initialised — using local fallback.', err)
  }
}

export { app, db, auth }

/** Normalised error message for UI display (never leaks raw SDK internals). */
export function readableAuthError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Email or password is incorrect.'
  }
  if (code.includes('too-many-requests')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (code.includes('network')) {
    return 'Network error. Check your connection and try again.'
  }
  if (code.includes('operation-not-allowed')) {
    return 'Sign-in is not enabled for this project yet.'
  }
  if (code.includes('user-disabled')) {
    return 'This account has been disabled.'
  }
  return 'Unable to sign in right now. Please try again.'
}
