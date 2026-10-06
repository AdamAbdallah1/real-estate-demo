/**
 * admins/{uid} — authorization records.
 *
 * Authorization is enforced by Firestore Security Rules, never by the UI.
 * The client can only READ its own admin document; there is no client-side
 * path to create one or to change a role (see firestore.rules).
 */
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { requireDb, errorMessage } from './shared'

const COLLECTION = 'admins'

function normalize(snap) {
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid: snap.id,
    email: data.email || '',
    displayName: data.displayName || '',
    role: data.role || '',
    active: data.active !== false,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  }
}

/** Reads admins/{uid}. Returns null when the user has no admin record. */
export async function getAdminProfile(uid) {
  if (!db || !uid) return null
  const snap = await getDoc(doc(requireDb(), COLLECTION, uid))
  return normalize(snap)
}

/** True when the document exists and active === true. */
export async function isAdmin(uid) {
  const profile = await getAdminProfile(uid)
  return Boolean(profile && profile.active)
}

/** Live view of the signed-in user's admin record (role/active changes apply). */
export function subscribeAdminProfile(uid, onChange) {
  if (!db || !uid) return () => {}
  return onSnapshot(
    doc(requireDb(), COLLECTION, uid),
    (snap) => onChange({ profile: normalize(snap), error: null }),
    (error) => onChange({ profile: null, error: errorMessage(error) }),
  )
}

export const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', editor: 'Editor' }
