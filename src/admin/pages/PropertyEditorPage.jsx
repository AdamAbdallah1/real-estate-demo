import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import {
  deleteProperty, getPropertyRecord, saveProperty, uniqueSlug,
} from '../../lib/firestore/properties'
import {
  PROPERTY_TYPES, PURPOSES, REGIONS, emptyProperty, englishPart, slugify, validateProperty,
} from '../../lib/schema'
import { errorMessage } from '../../lib/firestore/shared'
import { toDraft } from '../lib/propertyDraft'
import { formatDate } from '../lib/format'
import ImageManager from '../components/ImageManager'
import FeaturePicker from '../components/FeaturePicker'
import BilingualField from '../components/BilingualField'
import { Button, Field, Input, PageHeader, Select, StatusPill, Textarea, Toggle } from '../components/ui'
import { cx } from '../lib/cx'

function Section({ title, hint, children }) {
  return (
    <section className="grid gap-5 border-t border-line pt-8 md:grid-cols-[180px_1fr] md:gap-8">
      <div>
        <h2 className="text-[11px] tracking-[0.3em] text-stone">{title}</h2>
        {hint && <p className="mt-2 text-[12px] leading-relaxed text-stone/80">{hint}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

/**
 * One language inside a bilingual section. The two blocks never depend on each
 * other: an editor can complete English, save, and come back for Arabic later.
 */
function LanguageBlock({ label, children }) {
  const isArabic = label === 'العربية'
  return (
    <fieldset className="border border-line px-5 py-6" {...(isArabic ? { dir: 'rtl', lang: 'ar' } : {})}>
      <legend className="px-2 text-[11px] tracking-[0.3em] text-stone">
        {label}
      </legend>
      <div className="space-y-5">{children}</div>
    </fieldset>
  )
}

export default function PropertyEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [confirmNode, askConfirm] = useConfirm()

  const [draft, setDraft] = useState(emptyProperty)
  const [baseline, setBaseline] = useState(() => JSON.stringify(emptyProperty()))
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    // A new record keeps its initial state (never reset from an effect); an
    // existing one is loaded here, after mount, once the id is known.
    if (isNew) return undefined
    let active = true
    // loading already starts as true for an existing id; this only matters when
    // navigating from one property to another, so it must not cascade renders.
    queueMicrotask(() => { if (active) setLoading(true) })
    getPropertyRecord(id)
      .then((record) => {
        if (!active) return
        if (!record) {
          setLoadError('That property could not be found. It may have been deleted.')
          return
        }
        const next = toDraft(record)
        setDraft(next)
        setBaseline(JSON.stringify(next))
      })
      .catch((err) => active && setLoadError(errorMessage(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id, isNew])

  const dirty = Boolean(baseline) && JSON.stringify(draft) !== baseline

  useEffect(() => {
    if (!dirty) return undefined
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setFeedback(null)
  }
  const setLocation = (key, value) => {
    setDraft((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }))
    setFeedback(null)
  }
  /** Edit one language of a translatable field without touching the other. */
  const setLocalized = (key, side, value) => {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], [side]: value } }))
    setFeedback(null)
  }

  const persist = async (status, successText) => {
    const candidate = { ...draft, status }
    const found = validateProperty(candidate)
    setErrors(found)
    if (Object.keys(found).length) {
      setFeedback({ tone: 'error', text: 'Fix the highlighted fields before saving.' })
      const first = document.querySelector('[role="alert"]')
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return false
    }

    setSaving(true)
    try {
      let slug = candidate.slug || slugify(englishPart(candidate.title) || String(candidate.slug || ''))
      if (!isNew && slug !== draft.slug) slug = await uniqueSlug(slug, id)
      const payload = { ...candidate, slug }
      const savedId = await saveProperty(id || null, payload, user?.uid)
      setDraft(payload)
      setBaseline(JSON.stringify(payload))
      setErrors({})
      setFeedback({ tone: 'ok', text: successText })
      if (isNew && savedId) navigate(`/admin/properties/${savedId}`, { replace: true })
      return true
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
      return false
    } finally {
      setSaving(false)
    }
  }

  const archive = async () => {
    const confirmed = await askConfirm({
      title: 'Archive this property?',
      body: 'Archived properties stay in the database but disappear from the public website.',
      confirmLabel: 'ARCHIVE',
    })
    if (confirmed) persist('archived', 'Property archived.')
  }

  const remove = async () => {
    const confirmed = await askConfirm({
      title: 'Delete this property?',
      body: `“${englishPart(draft.title) || draft.title.ar || 'this property'}” will be permanently removed. This cannot be undone.`,
      confirmLabel: 'DELETE',
      danger: true,
    })
    if (!confirmed) return
    setSaving(true)
    try {
      await deleteProperty(id)
      navigate('/admin/properties', { replace: true })
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
      setSaving(false)
    }
  }

  const publicUrl = useMemo(() => (isNew || draft.status !== 'published' ? null : `/?property=${id}`), [isNew, draft.status, id])

  if (loading) {
    return <p role="status" className="text-[13px] text-stone">Loading property…</p>
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Property" />
        <p className="text-[14px] text-ink">{loadError}</p>
        <Link to="/admin/properties"><Button>BACK TO PROPERTIES</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={isNew ? 'New property' : englishPart(draft.title) || draft.title.ar || 'Property'}
        subtitle={isNew ? 'Create a listing. It stays private until you publish it.' : `Last updated ${formatDate(draft.updatedAt)} · status`}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={draft.status} />
            <Button variant="primary" onClick={() => persist(draft.status, isNew ? 'Draft saved.' : 'Changes saved.')} disabled={saving}>
              {saving ? 'SAVING…' : 'SAVE'}
            </Button>
            {draft.status !== 'published' && (
              <Button onClick={() => persist('published', 'Property published.')} disabled={saving}>PUBLISH</Button>
            )}
            {draft.status === 'published' && (
              <Button onClick={() => persist('draft', 'Property returned to draft.')} disabled={saving}>UNPUBLISH</Button>
            )}
            <a href={publicUrl || '/'} target="_blank" rel="noreferrer" className={cx('text-[11px] tracking-[0.16em] text-stone underline underline-offset-4 hover:text-ink', !publicUrl && 'pointer-events-none opacity-40')}>
              VIEW PUBLIC PAGE
            </a>
          </div>
        }
      />

      {feedback && (
        <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>
          {feedback.text}
        </p>
      )}
      {dirty && !saving && (
        <p className="text-[12px] text-stone">Unsaved changes.</p>
      )}

      {/* GENERAL */}
      <Section title="GENERAL" hint="How the listing is classified. Title and copy live in CONTENT.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Slug" hint="URL id" error={errors.slug}>
            <Input
              value={draft.slug}
              onChange={(e) => setField('slug', e.target.value.toLowerCase())}
              onBlur={() => {
                if (!draft.slug) {
                  const source = englishPart(draft.title) || draft.title.ar
                  if (source) setField('slug', slugify(source))
                }
              }}
              placeholder={englishPart(draft.title) ? slugify(englishPart(draft.title)) : 'modern-apartment'}
            />
          </Field>
          <Field label="Purpose" required error={errors.purpose}>
            <Select value={draft.purpose} onChange={(e) => setField('purpose', e.target.value)}>
              {PURPOSES.map((p) => <option key={p} value={p}>{p === 'sale' ? 'For sale' : 'For rent'}</option>)}
            </Select>
          </Field>
          <Field label="Property type" required error={errors.propertyType}>
            <Select value={draft.propertyType} onChange={(e) => setField('propertyType', e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      {/* LOCATION */}
      <Section title="LOCATION" hint="Region drives the public location filters.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="City" required error={errors['location.city']}>
            <Input value={draft.location.city} onChange={(e) => setLocation('city', e.target.value)} placeholder="Achrafieh" />
          </Field>
          <Field label="District" error={errors['location.district']}>
            <Input value={draft.location.district} onChange={(e) => setLocation('district', e.target.value)} placeholder="Sin el Fil" />
          </Field>
          <Field label="Region" required error={errors['location.region']}>
            <Select value={draft.location.region} onChange={(e) => setLocation('region', e.target.value)}>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
        </div>
        <BilingualField
          label="Address"
          error={errors['location.address']}
          value={draft.location.address}
          onChange={(v) => setLocation('address', v)}
          enPlaceholder="Street, building"
          arPlaceholder="الشارع، البناية"
        />
      </Section>

      {/* PRICING */}
      <Section title="PRICING" hint="USD by default. Rent listings are shown per month.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Price" required error={errors.price}>
            <Input type="number" min="0" value={draft.price} onChange={(e) => setField('price', e.target.value)} placeholder="285000" />
          </Field>
          <Field label="Currency" error={errors.currency}>
            <Select value={draft.currency} onChange={(e) => setField('currency', e.target.value)}>
              {['USD', 'EUR', 'LBP'].map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
      </Section>

      {/* DETAILS */}
      <Section title="PROPERTY DETAILS" hint="Shown in the listing summary and the comparison table.">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <Field label="Area (m²)" error={errors.area}>
            <Input type="number" min="0" value={draft.area} onChange={(e) => setField('area', e.target.value)} placeholder="145" />
          </Field>
          <Field label="Bedrooms" error={errors.bedrooms}>
            <Input type="number" min="0" value={draft.bedrooms} onChange={(e) => setField('bedrooms', e.target.value)} placeholder="2" />
          </Field>
          <Field label="Bathrooms" error={errors.bathrooms}>
            <Input type="number" min="0" value={draft.bathrooms} onChange={(e) => setField('bathrooms', e.target.value)} placeholder="3" />
          </Field>
          <Field label="Parking" error={errors.parking}>
            <Input type="number" min="0" value={draft.parking} onChange={(e) => setField('parking', e.target.value)} placeholder="1" />
          </Field>
          <Field label="Floor" hint="optional">
            <Input value={draft.floor} onChange={(e) => setField('floor', e.target.value)} placeholder="4th" />
          </Field>
          <Field label="View" hint="optional">
            <Input value={draft.view} onChange={(e) => setField('view', e.target.value)} placeholder="Sea view" />
          </Field>
        </div>
      </Section>

      {/* CONTENT — one document, two independent languages */}
      <Section
        title="CONTENT"
        hint="English and Arabic are saved independently: complete one language, save, and fill the other later. The empty language falls back to the populated one on the website."
      >
        <LanguageBlock label="ENGLISH">
          <Field label="Title" required error={errors.title || errors['title.en']}>
            <Input value={draft.title.en} onChange={(e) => setLocalized('title', 'en', e.target.value)} placeholder="Modern Apartment" />
          </Field>
          <Field label="Short description" required error={errors.shortDescription || errors['shortDescription.en']}>
            <Textarea rows={2} value={draft.shortDescription.en} onChange={(e) => setLocalized('shortDescription', 'en', e.target.value)} placeholder="One sentence for cards and sharing." />
          </Field>
          <Field label="Full description" required error={errors.description || errors['description.en']}>
            <Textarea rows={7} value={draft.description.en} onChange={(e) => setLocalized('description', 'en', e.target.value)} placeholder="Describe the property honestly: plan, light, orientation, condition." />
          </Field>
        </LanguageBlock>

        <LanguageBlock label="العربية">
          <Field label="العنوان" error={errors['title.ar']}>
            <Input dir="rtl" lang="ar" className="text-end" value={draft.title.ar} onChange={(e) => setLocalized('title', 'ar', e.target.value)} placeholder="شقة عصرية" />
          </Field>
          <Field label="الوصف المختصر" error={errors['shortDescription.ar']}>
            <Textarea rows={2} dir="rtl" lang="ar" className="text-end" value={draft.shortDescription.ar} onChange={(e) => setLocalized('shortDescription', 'ar', e.target.value)} placeholder="جملة واحدة للبطاقات والمشاركة." />
          </Field>
          <Field label="الوصف الكامل" error={errors['description.ar']}>
            <Textarea rows={7} dir="rtl" lang="ar" className="text-end" value={draft.description.ar} onChange={(e) => setLocalized('description', 'ar', e.target.value)} placeholder="صف العقار بصدق: المخطط، الإضاءة، الاتجاه، الحالة." />
          </Field>
        </LanguageBlock>
      </Section>

      {/* FEATURES */}
      <Section title="FEATURES">
        <FeaturePicker features={draft.features} onChange={(next) => setField('features', next)} />
      </Section>

      {/* IMAGES */}
      <Section title="IMAGES" hint="External https URLs — Storage uploads arrive later.">
        <ImageManager
          images={draft.images}
          coverImage={draft.coverImage}
          onChange={({ images, coverImage }) => setDraft((prev) => ({ ...prev, images, coverImage }))}
        />
        {errors.images && <p role="alert" className="text-[12px] text-ink">{errors.images}</p>}
        {Object.entries(errors).filter(([k]) => k.startsWith('images.')).map(([k, v]) => (
          <p key={k} role="alert" className="text-[12px] text-ink">{v}</p>
        ))}
      </Section>

      {/* PUBLISHING */}
      <Section title="PUBLISHING" hint="Only published properties appear on the public website.">
        <div className="flex flex-wrap items-center gap-6 border border-line bg-paper px-5 py-4">
          <Toggle checked={draft.featured} onChange={(v) => setField('featured', v)} label="Featured on the homepage" />
          <span className="text-[12px] text-stone">Status: {draft.status}</span>
          {draft.publishedAt && <span className="text-[12px] text-stone">Published {formatDate(draft.publishedAt)}</span>}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="primary" onClick={() => persist(draft.status, isNew ? 'Draft saved.' : 'Changes saved.')} disabled={saving}>
            {saving ? 'SAVING…' : isNew ? 'SAVE DRAFT' : 'SAVE CHANGES'}
          </Button>
          {draft.status !== 'published' && <Button onClick={() => persist('published', 'Property published.')} disabled={saving}>PUBLISH</Button>}
          {draft.status !== 'archived' && !isNew && <Button onClick={archive} disabled={saving}>ARCHIVE</Button>}
          {!isNew && <Button variant="danger" onClick={remove} disabled={saving}>DELETE</Button>}
        </div>
      </Section>

      {confirmNode}
    </div>
  )
}
