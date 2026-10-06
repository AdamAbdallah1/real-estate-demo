import { useState } from 'react'
import { FEATURE_SUGGESTIONS } from '../../lib/schema'
import { featureLabel } from '../../i18n/translations'
import { Button, Input } from './ui'

/**
 * Feature selection with both languages side by side.
 *
 * The English label is the identity (it is what the public dictionary and the
 * search index know); the Arabic column is free text with a translated default
 * prefilled for every suggested trait.
 *
 * `features` is a list of `{ en, ar }` pairs — the shape the property editor
 * works in. Storage converts it (`toStoredFeatures`).
 */
export default function FeaturePicker({ features = [], onChange, errors = {} }) {
  const [customEn, setCustomEn] = useState('')
  const [customAr, setCustomAr] = useState('')
  const [error, setError] = useState('')

  const setPair = (index, side, value) => {
    onChange(features.map((feature, i) => (i === index ? { ...feature, [side]: value } : feature)))
  }

  const toggle = (name) => {
    const existing = features.findIndex((feature) => feature.en.toLowerCase() === name.toLowerCase())
    if (existing >= 0) {
      onChange(features.filter((_, i) => i !== existing))
      return
    }
    onChange([...features, { en: name, ar: featureLabel(name, 'ar') }])
  }

  const remove = (index) => onChange(features.filter((_, i) => i !== index))

  const addCustom = () => {
    const en = customEn.trim()
    if (!en) return
    if (features.some((feature) => feature.en.toLowerCase() === en.toLowerCase())) {
      setError('That feature is already added.')
      return
    }
    setError('')
    onChange([...features, { en, ar: customAr.trim() }])
    setCustomEn('')
    setCustomAr('')
  }

  return (
    <section aria-labelledby="features-heading" className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 id="features-heading" className="text-[11px] tracking-[0.3em] text-stone">FEATURES</h2>
        <p className="text-[11px] text-stone">{features.length} selected</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {FEATURE_SUGGESTIONS.map((name) => {
          const active = features.some((feature) => feature.en.toLowerCase() === name.toLowerCase())
          return (
            <li key={name}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => toggle(name)}
                className={`border px-3 py-2 text-[12px] transition-colors ${active ? 'border-ink bg-ink text-ivory' : 'border-line text-ink-soft hover:border-ink hover:text-ink'}`}
              >
                {name}
                <span className={`ms-2 text-[11px] ${active ? 'text-ivory/70' : 'text-stone'}`}>
                  {featureLabel(name, 'ar')}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {features.length > 0 && (
        <div className="border border-line">
          <div className="grid grid-cols-[1fr_1fr_36px] gap-3 border-b border-line bg-paper px-3 py-2">
            <span className="text-[10px] tracking-[0.25em] text-stone">ENGLISH</span>
            <span dir="rtl" className="text-[10px] tracking-normal text-stone">العربية</span>
            <span className="sr-only">Row actions</span>
          </div>
          <ul>
            {features.map((feature, index) => (
              <li key={`${index}-${feature.en}`} className="grid grid-cols-[1fr_1fr_36px] items-center gap-3 border-b border-line px-3 py-2 last:border-b-0">
                <Input
                  value={feature.en}
                  onChange={(e) => setPair(index, 'en', e.target.value)}
                  aria-label={`English feature ${index + 1}`}
                  placeholder="Balcony"
                />
                <Input
                  dir="rtl"
                  lang="ar"
                  value={feature.ar}
                  onChange={(e) => setPair(index, 'ar', e.target.value)}
                  aria-label={`العربية — feature ${index + 1}`}
                  placeholder="شرفة"
                  className="text-end"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove feature ${feature.en || index + 1}`}
                  className="text-stone transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-[10px] tracking-[0.25em] text-stone">ADD FEATURE (ENGLISH)</span>
          <Input
            value={customEn}
            onChange={(e) => { setCustomEn(e.target.value); setError('') }}
            placeholder="Quiet street"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          />
        </label>
        <label className="block flex-1">
          <span className="mb-1 block text-[10px] tracking-normal text-stone" dir="rtl">الميزة (العربية) — اختياري</span>
          <Input
            dir="rtl"
            lang="ar"
            value={customAr}
            onChange={(e) => setCustomAr(e.target.value)}
            placeholder="شارع هادئ"
            className="text-end"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          />
        </label>
        <Button type="button" onClick={addCustom}>ADD</Button>
      </div>

      {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
      {Object.entries(errors)
        .filter(([key]) => key.startsWith('features.'))
        .map(([key, value]) => (
          <p key={key} role="alert" className="text-[12px] text-stone">{value}</p>
        ))}
      <p className="text-[12px] text-stone">
        Suggested traits are prefilled in both languages; edit any cell. Arabic may stay empty — the English label is used as the fallback.
      </p>
    </section>
  )
}
