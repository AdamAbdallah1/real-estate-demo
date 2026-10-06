/**
 * Module-level settings snapshot.
 * Lets helpers that are called outside React (WhatsApp builders, share links)
 * read the current contact configuration without prop drilling.
 */
import { DEFAULT_SETTINGS } from './schema'

let snapshot = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

export function getSettingsSnapshot() {
  return snapshot
}

export function setSettingsSnapshot(next) {
  snapshot = { ...snapshot, ...(next || {}) }
}

export function getWhatsAppNumber() {
  const raw = String(snapshot?.contact?.whatsapp || '').replace(/[^0-9]/g, '')
  return raw || '9611000000'
}

export function getContact() {
  return { ...DEFAULT_SETTINGS.contact, ...(snapshot?.contact || {}) }
}

export function getSocial() {
  return { ...DEFAULT_SETTINGS.social, ...(snapshot?.social || {}) }
}
