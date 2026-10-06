/**
 * inquiries/{inquiryId} — public contact submissions + admin management.
 *
 * The public create path is intentionally narrow: it may only ever set the
 * contact fields and a `new` status. Firestore Security Rules repeat this
 * restriction, so a hand-crafted request cannot write anything else.
 */
import {
  addDoc, collection, deleteDoc, doc, limit as fbLimit, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { requireDb, errorMessage } from './shared'

const COLLECTION = 'inquiries'

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed']

export function validateInquiry(input) {
  const errors = {}
  const name = String(input.name || '').trim()
  const email = String(input.email || '').trim()
  const phone = String(input.phone || '').trim()
  const message = String(input.message || '').trim()
  if (!name) errors.name = 'Name is required.'
  if (!email && !phone) errors.contact = 'Add an email or a phone number.'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (phone && !/^\+?[0-9 ()-]{6,}$/.test(phone)) errors.phone = 'Enter a valid phone number.'
  if (!message) errors.message = 'Message is required.'
  else if (message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.'
  return errors
}

/** Public write: constrained fields only. */
export async function createInquiry(input) {
  const errors = validateInquiry(input)
  if (Object.keys(errors).length) throw new Error('invalid-inquiry')
  await addDoc(collection(requireDb(), COLLECTION), {
    name: String(input.name).trim(),
    email: String(input.email || '').trim(),
    phone: String(input.phone || '').trim(),
    message: String(input.message).trim(),
    source: String(input.source || 'website').trim().slice(0, 40),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function subscribeInquiries(onChange, { max = 200 } = {}) {
  const q = query(collection(requireDb(), COLLECTION), orderBy('createdAt', 'desc'), fbLimit(max))
  return onSnapshot(
    q,
    (snap) => onChange({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })), error: null }),
    (error) => onChange({ items: [], error: errorMessage(error) }),
  )
}

export async function updateInquiryStatus(id, status, uid) {
  if (!INQUIRY_STATUSES.includes(status)) throw new Error('invalid-status')
  await updateDoc(doc(requireDb(), COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
  })
}

export async function deleteInquiry(id) {
  await deleteDoc(doc(requireDb(), COLLECTION, id))
}
