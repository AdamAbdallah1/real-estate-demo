import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { auth as firebaseAuth, firebaseEnabled } from '../lib/firebase'
import { observeAuth, signIn as firebaseSignIn, signOutUser } from '../lib/auth'
import { getAdminProfile, subscribeAdminProfile } from '../lib/firestore/admins'
import { errorMessage } from '../lib/firestore/shared'

const AuthContext = createContext(null)

const initialState = firebaseEnabled && firebaseAuth
  ? { status: 'loading', user: null, admin: null, error: null }
  : { status: 'unauthenticated', user: null, admin: null, error: null }

/**
 * status:
 *  'loading'        — Firebase auth state not known yet
 *  'authorizing'    — signed in, checking admins/{uid}
 *  'authenticated'  — signed in + active admin document  (full CMS access)
 *  'signedIn'       — signed in but NOT an admin         (access denied)
 *  'unauthenticated' — no session
 */
export function AuthProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    if (!firebaseEnabled || !firebaseAuth) return undefined

    let disposed = false
    let unsubscribeProfile = () => {}

    const unsubscribeUser = observeAuth((user) => {
      if (disposed) return
      unsubscribeProfile()
      if (!user) {
        setState({ status: 'unauthenticated', user: null, admin: null, error: null })
        return
      }
      setState((prev) => ({ ...prev, status: 'authorizing', user, admin: prev.admin, error: null }))

      getAdminProfile(user.uid)
        .then((profile) => {
          if (disposed) return
          if (!profile || !profile.active) {
            setState({ status: 'signedIn', user, admin: profile, error: null })
            return
          }
          setState({ status: 'authenticated', user, admin: profile, error: null })
          // Keep role/active changes live while the admin works.
          unsubscribeProfile = subscribeAdminProfile(user.uid, ({ profile: next, error }) => {
            if (disposed) return
            setState((prev) =>
              prev.user?.uid === user.uid
                ? {
                    ...prev,
                    admin: next,
                    status: next && next.active ? 'authenticated' : 'signedIn',
                    error: error || null,
                  }
                : prev,
            )
          })
        })
        .catch((err) => {
          if (disposed) return
          // The read failed (rules/network) — that is NOT "not an admin".
          console.warn('[nara] admins/' + user.uid + ' could not be read', err?.code || err?.message)
          setState({ status: 'signedIn', user, admin: null, error: errorMessage(err) })
        })
    })

    return () => {
      disposed = true
      unsubscribeProfile()
      unsubscribeUser()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const user = await firebaseSignIn(email, password)

    // Three distinct outcomes — never conflated:
    //   1. the admins/{uid} read FAILS  → "could not be verified" (a read
    //      failure is not proof that the account is not an admin);
    //   2. no record / active !== true  → "does not have CMS access";
    //   3. active record                → authenticated.
    // Collapsing 1 into 2 is what made a Firestore permission-denied read
    // report itself as "This account does not have CMS access."
    let profile = null
    try {
      profile = await getAdminProfile(user.uid)
    } catch (err) {
      console.warn('[nara] admins/' + user.uid + ' could not be read', err?.code || err?.message)
      setState({ status: 'signedIn', user, admin: null, error: errorMessage(err) })
      const error = new Error('CMS access could not be verified right now. Please try again in a moment.')
      error.code = 'nara/unverified'
      throw error
    }

    if (!profile || !profile.active) {
      setState({ status: 'signedIn', user, admin: profile, error: null })
      const error = new Error('This account does not have CMS access.')
      error.code = 'nara/unauthorized'
      throw error
    }
    setState({ status: 'authenticated', user, admin: profile, error: null })
    return user
  }, [])

  const logout = useCallback(async () => {
    await signOutUser()
    setState({ status: 'unauthenticated', user: null, admin: null, error: null })
  }, [])

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
