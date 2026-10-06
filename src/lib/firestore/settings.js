/**
 * siteSettings/{general|contact|social|homepage|seo}
 *
 * Small documents (five in total) — one bounded query covers the whole set, so
 * the public site reads settings in a single round trip.
 */
import { collection, doc, getDocs, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { requireDb, errorMessage } from './shared'
import { DEFAULT_SETTINGS, SETTINGS_SECTIONS } from '../schema'
import { isHttpUrl } from '../images'
import { localizedAr, localizedEn, toStoredText } from '../../i18n/translations'

const COLLECTION = 'siteSettings'

export const SETTINGS_IDS = SETTINGS_SECTIONS

/** Settings fields that editors write in both languages. */
export const LOCALIZED_SETTING_KEYS = {
  contact: ['address'],
  homepage: ['heroHeading', 'heroDescription'],
  seo: ['title', 'description'],
}

function normalize(section, data) {
  const base = DEFAULT_SETTINGS[section] || {}
  return { ...base, ...(data && typeof data === 'object' ? data : {}) }
}

function docsToSettings(snap) {
  const out = {}
  for (const section of SETTINGS_SECTIONS) out[section] = { ...DEFAULT_SETTINGS[section] }
  snap.docs.forEach((d) => {
    if (SETTINGS_SECTIONS.includes(d.id)) out[d.id] = normalize(d.id, d.data())
  })
  return out
}

export async function getSettings() {
  if (!requireDb()) return { ...DEFAULT_SETTINGS }
  const snap = await getDocs(collection(requireDb(), COLLECTION))
  return docsToSettings(snap)
}

/** Live settings for the admin; the public site uses a one-shot read. */
export function subscribeSettings(onChange) {
  return onSnapshot(
    collection(requireDb(), COLLECTION),
    (snap) => onChange({ settings: docsToSettings(snap), error: null }),
    (error) => onChange({ settings: null, error: errorMessage(error) }),
  )
}

export function validateSettings(section, data) {
  const errors = {}
  if (section === 'contact') {
    if (data.whatsapp && !/^\+?[0-9]{6,15}$/.test(String(data.whatsapp).replace(/[\s()-]/g, ''))) {
      errors.whatsapp = 'Digits only, with optional leading +.'
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) errors.email = 'Enter a valid email address.'
  }
  if (section === 'social') {
    for (const key of ['instagram', 'facebook', 'linkedin']) {
      const value = String(data[key] || '').trim()
      if (value && !isHttpUrl(value)) errors[key] = 'Enter a full URL starting with https://'
    }
  }
  if (section === 'seo') {
    if (data.ogImage && !isHttpUrl(String(data.ogImage))) errors.ogImage = 'Enter a full URL starting with https://'
    if (localizedEn(data.title).length > 70) errors['title.en'] = 'Keep the English title under 70 characters.'
    if (localizedAr(data.title).length > 70) errors['title.ar'] = 'يجب أن يبقى العنوان أقل من 70 حرفاً (العربية).'
  }
  if (section === 'homepage') {
    if (!localizedEn(data.heroHeading).trim() && !localizedAr(data.heroHeading).trim()) {
      errors.heroHeading = 'Hero heading is required.'
    }
  }
  return errors
}

export async function saveSettingsSection(section, data, uid) {
  if (!SETTINGS_SECTIONS.includes(section)) throw new Error('unknown-settings-section')
  const clean = { ...normalize(section, data) }
  for (const key of LOCALIZED_SETTING_KEYS[section] || []) clean[key] = toStoredText(clean[key])
  delete clean.updatedAt
  await setDoc(
    doc(requireDb(), COLLECTION, section),
    { ...clean, updatedAt: serverTimestamp(), updatedBy: uid || null },
    { merge: true },
  )
}
