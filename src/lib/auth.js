/**
 * Firebase Authentication helpers.
 * Firebase Auth is the authority — nothing here persists a password or a
 * custom token, and localStorage is never treated as a session store.
 */
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, readableAuthError } from './firebase'

/** Subscribe to auth state. Returns an unsubscribe function. */
export function observeAuth(callback) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback, (error) => {
    console.warn('[nara] auth state listener failed', error?.code || error)
    callback(null)
  })
}

/** Sign in; throws an Error with a human-readable message on failure. */
export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase Authentication is not configured.')
  try {
    const credential = await signInWithEmailAndPassword(auth, String(email).trim(), password)
    return credential.user
  } catch (err) {
    const error = new Error(readableAuthError(err))
    error.code = err?.code
    throw error
  }
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}

export { auth }
