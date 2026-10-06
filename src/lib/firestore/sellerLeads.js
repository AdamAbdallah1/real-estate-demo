/**
 * sellerLeads/{leadId} — the public "Sell your property" flow.
 * Public clients may only create brand-new documents in the `new` status.
 */
import {
  addDoc, collection, deleteDoc, doc, limit as fbLimit, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { requireDb, errorMessage } from './shared'

const COLLECTION = 'sellerLeads'

export const SELLER_STATUSES = ['new', 'contacted', 'qualified', 'closed']

export function validateSellerLead(input) {
  const errors = {}
  const phone = String(input.phone || '').trim()
  if (!String(input.name || '').trim()) errors.name = 'Name is required.'
  if (!/^\+?[0-9 ()-]{6,}$/.test(phone)) errors.phone = 'Enter a valid phone / WhatsApp number.'
  if (!String(input.propertyLocation || '').trim()) errors.propertyLocation = 'Property location is required.'
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email).trim())) errors.email = 'Enter a valid email address.'
  if (input.message && String(input.message).length > 2000) errors.message = 'Message is too long.'
  return errors
}

/** Public write: constrained fields only. */
export async function createSellerLead(input) {
  const errors = validateSellerLead(input)
  if (Object.keys(errors).length) throw new Error('invalid-seller-lead')
  await addDoc(collection(requireDb(), COLLECTION), {
    name: String(input.name).trim(),
    phone: String(input.phone).trim(),
    email: String(input.email || '').trim(),
    propertyLocation: String(input.propertyLocation).trim(),
    propertyType: String(input.propertyType || '').trim(),
    message: String(input.message || '').trim(),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeSellerLeads(onChange, { max = 200 } = {}) {
  const q = query(collection(requireDb(), COLLECTION), orderBy('createdAt', 'desc'), fbLimit(max))
  return onSnapshot(
    q,
    (snap) => onChange({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: null }),
    (error) => onChange({ items: [], error: errorMessage(error) }),
  )
}

export async function updateSellerLeadStatus(id, status, uid) {
  if (!SELLER_STATUSES.includes(status)) throw new Error('invalid-status')
  await updateDoc(doc(requireDb(), COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
  })
}

export async function deleteSellerLead(id) {
  await deleteDoc(doc(requireDb(), COLLECTION, id))
}
