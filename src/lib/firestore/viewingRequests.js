/**
 * viewingRequests/{requestId} — "Request a viewing" submissions.
 * Public clients may only create brand-new documents in the `new` status.
 */
import {
  addDoc, collection, deleteDoc, doc, limit as fbLimit, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { requireDb, errorMessage } from './shared'

const COLLECTION = 'viewingRequests'

export const VIEWING_STATUSES = ['new', 'contacted', 'scheduled', 'completed', 'closed']

export function validateViewingRequest(input) {
  const errors = {}
  const name = String(input.name || '').trim()
  const phone = String(input.phone || '').trim()
  if (!name) errors.name = 'Name is required.'
  if (!/^\+?[0-9 ()-]{6,}$/.test(phone)) errors.phone = 'Enter a valid phone / WhatsApp number.'
  if (!input.propertyId) errors.propertyId = 'A property is required.'
  if (input.message && String(input.message).length > 1000) errors.message = 'Message is too long.'
  return errors
}

/** Public write: constrained fields only. */
export async function createViewingRequest(input) {
  const errors = validateViewingRequest(input)
  if (Object.keys(errors).length) throw new Error('invalid-viewing-request')
  await addDoc(collection(requireDb(), COLLECTION), {
    propertyId: String(input.propertyId),
    propertyTitle: String(input.propertyTitle || ''),
    name: String(input.name).trim(),
    phone: String(input.phone).trim(),
    preferredDay: String(input.preferredDay || ''),
    preferredTime: String(input.preferredTime || ''),
    message: String(input.message || '').trim(),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeViewingRequests(onChange, { max = 200 } = {}) {
  const q = query(collection(requireDb(), COLLECTION), orderBy('createdAt', 'desc'), fbLimit(max))
  return onSnapshot(
    q,
    (snap) => onChange({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: null }),
    (error) => onChange({ items: [], error: errorMessage(error) }),
  )
}

export async function updateViewingRequestStatus(id, status, uid) {
  if (!VIEWING_STATUSES.includes(status)) throw new Error('invalid-status')
  await updateDoc(doc(requireDb(), COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
  })
}

export async function deleteViewingRequest(id) {
  await deleteDoc(doc(requireDb(), COLLECTION, id))
}
