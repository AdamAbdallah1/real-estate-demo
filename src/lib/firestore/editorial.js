/**
 * editorial/{articleId} — long-form content for the NARA site.
 * Cover image is an external HTTPS URL (Storage is not available yet).
 */
import {
  addDoc, collection, deleteDoc, doc, getDocs, limit as fbLimit, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where,
} from 'firebase/firestore'
import { requireDb, errorMessage } from './shared'
import { normalizeCoverImage } from '../images'
import { slugify } from '../schema'
import { localizedAr, localizedEn, toStoredText } from '../../i18n/translations'

const COLLECTION = 'editorial'

export const ARTICLE_STATUSES = ['draft', 'published', 'archived']

export function validateArticle(input) {
  const errors = {}
  const enTitle = localizedEn(input.title)
  const arTitle = localizedAr(input.title)
  if (!enTitle && !arTitle) errors.title = 'Title is required (English or Arabic).'
  else if (enTitle && enTitle.length < 3) errors.title = 'Title is too short.'
  if (enTitle.length > 160) errors['title.en'] = 'Title must be 160 characters or fewer (English).'
  if (arTitle.length > 160) errors['title.ar'] = 'يجب ألا يتجاوز العنوان 160 حرفاً (العربية).'
  if (!localizedEn(input.excerpt) && !localizedAr(input.excerpt)) errors.excerpt = 'Excerpt is required.'
  if (Math.max(localizedEn(input.content).length, localizedAr(input.content).length) < 20) {
    errors.content = 'Content is too short.'
  }
  if (!ARTICLE_STATUSES.includes(input.status)) errors.status = 'Invalid status.'
  const cover = normalizeCoverImage(input.coverImage)
  if (input.coverImage && input.coverImage.url && !cover) errors.coverImage = 'Use an external https:// image URL.'
  return errors
}

export function sanitizeArticle(input) {
  const title = toStoredText(input.title)
  const enTitle = localizedEn(input.title)
  return {
    title,
    slug: String(input.slug || '').trim() || slugify(enTitle),
    excerpt: toStoredText(input.excerpt),
    content: toStoredText(input.content),
    seoTitle: toStoredText(input.seoTitle),
    seoDescription: toStoredText(input.seoDescription),
    coverImage: normalizeCoverImage(input.coverImage),
    status: ARTICLE_STATUSES.includes(input.status) ? input.status : 'draft',
  }
}

function toArticle(snap) {
  const data = snap.data()
  return {
    id: snap.id,
    title: data.title || '',
    slug: data.slug || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    seoTitle: data.seoTitle || '',
    seoDescription: data.seoDescription || '',
    coverImage: data.coverImage || null,
    status: data.status || 'draft',
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    publishedAt: data.publishedAt || null,
    createdBy: data.createdBy || null,
    updatedBy: data.updatedBy || null,
  }
}

export function subscribeEditorial(onChange, { max = 100 } = {}) {
  const q = query(collection(requireDb(), COLLECTION), orderBy('updatedAt', 'desc'), fbLimit(max))
  return onSnapshot(
    q,
    (snap) => onChange({ items: snap.docs.map(toArticle), error: null }),
    (error) => onChange({ items: [], error: errorMessage(error) }),
  )
}

export async function getArticleBySlug(slug) {
  const q = query(collection(requireDb(), COLLECTION), where('slug', '==', slug), fbLimit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return toArticle(snap.docs[0])
}

export async function createArticle(input, uid) {
  const data = sanitizeArticle(input)
  const ref = await addDoc(collection(requireDb(), COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === 'published' ? serverTimestamp() : null,
    createdBy: uid || null,
    updatedBy: uid || null,
  })
  return ref.id
}

export async function updateArticle(id, input, uid) {
  const data = sanitizeArticle(input)
  const patch = { ...data, updatedAt: serverTimestamp(), updatedBy: uid || null }
  if (data.status === 'published') patch.publishedAt = serverTimestamp()
  await updateDoc(doc(requireDb(), COLLECTION, id), patch)
}

export async function deleteArticle(id) {
  await deleteDoc(doc(requireDb(), COLLECTION, id))
}
