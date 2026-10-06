/**
 * properties/{propertyId} — data access layer.
 * The public site only ever calls getPublishedProperties(); every admin
 * operation lives here so components stay free of Firestore syntax.
 */
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit as fbLimit, onSnapshot,
  orderBy, query, serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'
import { requireDb, errorMessage } from './shared'
import { normalizeCoverImage, normalizeImages } from '../images'
import { slugify } from '../schema'
import { localizedAr, localizedEn, toStoredFeatures, toStoredText } from '../../i18n/translations'
import { fromPublicProperty, toPublicProperty, withLatestFlag } from '../propertyModel'

const COLLECTION = 'properties'

function propertiesCollection() {
  return collection(requireDb(), COLLECTION)
}

/** Strip editor-only fields and normalise images before any write. */
export function sanitizePropertyInput(input) {
  const title = toStoredText(input.title)
  const images = normalizeImages(input.images)
  const cover = normalizeCoverImage(input.coverImage) || (images[0] ? { url: images[0].url, alt: images[0].alt } : null)
  return {
    title,
    slug: String(input.slug || '').trim() || slugify(localizedEn(input.title) || localizedAr(input.title)),
    purpose: input.purpose === 'rent' ? 'rent' : 'sale',
    status: ['draft', 'published', 'archived'].includes(input.status) ? input.status : 'draft',
    propertyType: input.propertyType,
    regionLabel: input.regionLabel || '',
    location: {
      city: String(input.location?.city || '').trim(),
      district: String(input.location?.district || '').trim(),
      region: input.location?.region || '',
      address: toStoredText(input.location?.address),
    },
    price: Number(input.price) || 0,
    currency: input.currency || 'USD',
    area: Number(input.area) || 0,
    bedrooms: Number(input.bedrooms) || 0,
    bathrooms: Number(input.bathrooms) || 0,
    parking: Number(input.parking) || 0,
    floor: String(input.floor || '').trim(),
    view: String(input.view || '').trim(),
    shortDescription: toStoredText(input.shortDescription),
    description: toStoredText(input.description),
    features: toStoredFeatures(input.features),
    images,
    coverImage: cover,
    featured: Boolean(input.featured),
  }
}

function snapshotToProperty(snap) {
  return toPublicProperty(snap.data(), snap.id)
}

/* ---------------------------------- public reads --------------------------------- */

/** Published properties only — the single public query. */
export async function getPublishedProperties(max = 60) {
  if (!firebaseEnabled || !db) throw new Error('firebase-disabled')
  const sortPublished = (list) => withLatestFlag(
    [...list].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0)),
  )

  try {
    const q = query(
      propertiesCollection(),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      fbLimit(max),
    )
    const snap = await getDocs(q)
    return sortPublished(snap.docs.map(snapshotToProperty).filter(Boolean))
  } catch (err) {
    // Composite index not deployed yet: retry with an un-ordered query instead
    // of failing the whole public listing.
    if (!['failed-precondition', 'invalid-argument', 'unimplemented'].includes(err?.code)) throw err
    const fallback = query(propertiesCollection(), where('status', '==', 'published'), fbLimit(max))
    const snap = await getDocs(fallback)
    return sortPublished(snap.docs.map(snapshotToProperty).filter(Boolean))
  }
}

/** Look a published property up by its public URL id or slug. */
export async function getPublishedProperty(idOrSlug) {
  const byId = await getPropertyById(idOrSlug)
  if (byId?.status === 'published') return byId
  return getPropertyBySlug(idOrSlug)
}

/* ---------------------------------- admin reads ---------------------------------- */

export async function getPropertyById(id) {
  const snap = await getDoc(doc(requireDb(), COLLECTION, id))
  return snap.exists() ? toPublicProperty(snap.data(), snap.id) : null
}

export async function getPropertyBySlug(slug) {
  const q = query(propertiesCollection(), where('slug', '==', slug), fbLimit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return toPublicProperty(docSnap.data(), docSnap.id)
}

/** Full raw document (editor needs the un-flattened shape). */
export async function getPropertyRecord(id) {
  const snap = await getDoc(doc(requireDb(), COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function listAllPropertyRecords() {
  const snap = await getDocs(query(propertiesCollection(), orderBy('updatedAt', 'desc'), fbLimit(500)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/** Live admin list: bounded query + ordered by most recent update. */
export function subscribeAdminProperties(onChange, { max = 300 } = {}) {
  const q = query(propertiesCollection(), orderBy('updatedAt', 'desc'), fbLimit(max))
  return onSnapshot(
    q,
    (snap) => onChange({ properties: snap.docs.map(snapshotToProperty).filter(Boolean), error: null }),
    (error) => onChange({ properties: [], error: errorMessage(error) }),
  )
}

/* ---------------------------------- admin writes --------------------------------- */

export async function createProperty(input, uid) {
  const data = sanitizePropertyInput(input)
  const ref = await addDoc(propertiesCollection(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === 'published' ? serverTimestamp() : null,
    createdBy: uid || null,
    updatedBy: uid || null,
  })
  return ref.id
}

export async function updateProperty(id, input, uid) {
  const data = sanitizePropertyInput(input)
  await updateDoc(doc(requireDb(), COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
  })
  return id
}

/** draft | published | archived — keeps publishedAt authoritative. */
export async function setPropertyStatus(id, status, uid, previousStatus) {
  const patch = { status, updatedAt: serverTimestamp(), updatedBy: uid || null }
  if (status === 'published' && previousStatus !== 'published') patch.publishedAt = serverTimestamp()
  await updateDoc(doc(requireDb(), COLLECTION, id), patch)
}

export async function setPropertyFeatured(id, featured, uid) {
  await updateDoc(doc(requireDb(), COLLECTION, id), {
    featured: Boolean(featured),
    updatedAt: serverTimestamp(),
    updatedBy: uid || null,
  })
}

export async function deleteProperty(id) {
  await deleteDoc(doc(requireDb(), COLLECTION, id))
}

/** Clone a property into a new draft with a unique slug. */
export async function duplicateProperty(id, uid) {
  const record = await getPropertyRecord(id)
  if (!record) throw new Error('Property not found')
  const {
    createdAt: _createdAt, updatedAt: _updatedAt, publishedAt: _publishedAt,
    createdBy: _createdBy, updatedBy: _updatedBy, ...rest
  } = record
  const enTitle = localizedEn(record.title)
  const arTitle = localizedAr(record.title)
  const slug = await uniqueSlug(slugify(`${enTitle || 'property'}-copy`))
  const ref = await addDoc(propertiesCollection(), {
    ...rest,
    title: toStoredText({ en: `${enTitle} (copy)`, ar: arTitle ? `${arTitle} (نسخة)` : '' }),
    slug,
    status: 'draft',
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
    createdBy: uid || null,
    updatedBy: uid || null,
  })
  return ref.id
}

export async function saveProperty(id, input, uid) {
  if (id) {
    await updateProperty(id, input, uid)
    return id
  }
  return createProperty(input, uid)
}

export async function uniqueSlug(base, ignoreId = '') {
  const candidate = base || 'property'
  let slug = candidate
  for (let i = 2; i < 50; i += 1) {
    const existing = await getPropertyBySlug(slug)
    if (!existing || existing.id === ignoreId) return slug
    slug = `${candidate}-${i}`
  }
  return `${candidate}-${Date.now()}`
}

/* ------------------------------------ seeding ------------------------------------ */

/**
 * Explicit, idempotent migration of the local demo properties.
 * Fixed ids (p1..p12) mean re-running never duplicates; existing documents are
 * only touched when `overwrite` is explicitly requested.
 */
export async function seedDemoProperties(demoList, uid, { overwrite = false } = {}) {
  const results = { created: 0, skipped: 0, updated: 0, errors: [] }
  for (const demo of demoList) {
    try {
      const data = fromPublicProperty(demo)
      const ref = doc(requireDb(), COLLECTION, demo.id)
      const existing = await getDoc(ref)
      if (existing.exists() && !overwrite) {
        results.skipped += 1
        continue
      }
      if (existing.exists()) {
        await updateDoc(ref, { ...data, updatedAt: serverTimestamp(), updatedBy: uid || null })
        results.updated += 1
      } else {
        await setDoc(ref, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          publishedAt: serverTimestamp(),
          createdBy: uid || null,
          updatedBy: uid || null,
        })
        results.created += 1
      }
    } catch (err) {
      results.errors.push(`${demo.id}: ${errorMessage(err)}`)
    }
  }
  return results
}
