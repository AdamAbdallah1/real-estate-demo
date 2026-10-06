import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsForm } from '../hooks/useSettingsForm'
import { useSubscription } from '../hooks/useSubscription'
import { subscribeAdminProperties } from '../../lib/firestore/properties'
import { formatMoney } from '../lib/format'
import { Button, ErrorState, Field, Input, LoadingRows, PageHeader, Select } from '../components/ui'
import BilingualField from '../components/BilingualField'
import { both, geoTxt, sideOf, txt } from '../lib/i18n'
import { cx } from '../lib/cx'

const asItems = (cb) => subscribeAdminProperties(({ properties, error }) => cb({ items: properties || [], error }))

/** Site content: what the public homepage says and how it shares. */
export default function ContentPage() {
  const { loading, error, form, setSectionValue, saveSection, savingSection, feedback } = useSettingsForm()
  const { items: properties } = useSubscription(asItems)
  const [featuredQuery, setFeaturedQuery] = useState('')

  const homepage = form?.homepage
  const seo = form?.seo

  const candidates = useMemo(() => {
    const list = (properties || []).filter((p) => p.status === 'published')
    const needle = featuredQuery.trim().toLowerCase()
    if (!needle) return list
    return list.filter((p) => `${both(p.title)} ${p.city}`.toLowerCase().includes(needle))
  }, [properties, featuredQuery])

  const toggleFeatured = (id) => {
    const current = homepage?.featuredPropertyIds || []
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    setSectionValue('homepage', 'featuredPropertyIds', next)
  }

  if (loading) return <LoadingRows rows={6} />
  if (error && !form) {
    return (
      <div className="space-y-6">
        <PageHeader title="Site content" />
        <ErrorState message={`${error} Settings can only be edited when Firestore is reachable.`} onRetry={() => window.location.reload()} />
      </div>
    )
  }
  if (!homepage || !seo) return <LoadingRows rows={6} />

  const sectionFeedback = (section) =>
    feedback?.section === section ? (
      <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>
        {feedback.text}
      </p>
    ) : null

  return (
    <div className="space-y-10">
      <PageHeader
        title="Site content"
        subtitle="Copy and selections the public homepage reads from Firestore."
        actions={<Link to="/"><Button>OPEN THE WEBSITE</Button></Link>}
      />

      {/* HOMEPAGE */}
      <section className="grid gap-5 border-t border-line pt-8 md:grid-cols-[180px_1fr] md:gap-8" aria-labelledby="content-homepage">
        <div>
          <h2 id="content-homepage" className="text-[11px] tracking-[0.3em] text-stone">HOMEPAGE</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-stone/80">One line per heading. The public hero renders up to four lines.</p>
        </div>
        <div className="space-y-5">
          <BilingualField
            label="Hero heading"
            required
            rows={2}
            value={homepage.heroHeading}
            onChange={(v) => setSectionValue('homepage', 'heroHeading', v)}
            enPlaceholder={'The right address,\nfound properly.'}
            arPlaceholder={'العنوان الصحيح،\nيُعثر عليه كما ينبغي.'}
          />
          <BilingualField
            label="Hero description"
            rows={2}
            value={homepage.heroDescription}
            onChange={(v) => setSectionValue('homepage', 'heroDescription', v)}
            enPlaceholder="A considered collection of homes."
            arPlaceholder="مجموعة مختارة بعناية من المنازل."
          />

          <Field label="Featured properties" hint="leave empty to use the featured flag">
            <div className="space-y-3">
              <Input
                value={featuredQuery}
                onChange={(e) => setFeaturedQuery(e.target.value)}
                placeholder="Search published properties…"
                aria-label="Search published properties"
              />
              <ul className="max-h-72 divide-y divide-line overflow-y-auto border border-line">
                {candidates.map((p) => {
                  const checked = (homepage.featuredPropertyIds || []).includes(p.id)
                  return (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-paper">
                        <input type="checkbox" checked={checked} onChange={() => toggleFeatured(p.id)} className="h-4 w-4 accent-[#1e1b16]" />
                        <span className="h-9 w-12 shrink-0 overflow-hidden bg-sand">
                          {p.coverImage && <img src={p.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-ink">{txt(p.title)}</span>
                          <span className="block truncate text-[11px] text-stone">{geoTxt(p.city)} · {formatMoney(p.price, p.currency, p.purpose === 'rent')}</span>
                        </span>
                      </label>
                    </li>
                  )
                })}
                {!candidates.length && <li className="px-3 py-4 text-[13px] text-stone">No published properties match.</li>}
              </ul>
              <p className="text-[11px] text-stone">{(homepage.featuredPropertyIds || []).length} selected</p>
            </div>
          </Field>

          <Field label="Editorial feature" hint="optional — replaces the coast block">
            <Select
              value={homepage.editorialPropertyId || ''}
              onChange={(e) => setSectionValue('homepage', 'editorialPropertyId', e.target.value)}
            >
              <option value="">Default (Batroun block)</option>
              {(properties || []).filter((p) => p.status === 'published').map((p) => (
                <option key={p.id} value={p.id}>{txt(p.title)} — {geoTxt(p.city)}</option>
              ))}
            </Select>
          </Field>

          {sectionFeedback('homepage')}
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => saveSection('homepage')} disabled={savingSection === 'homepage'}>
              {savingSection === 'homepage' ? 'SAVING…' : 'SAVE HOMEPAGE'}
            </Button>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="grid gap-5 border-t border-line pt-8 md:grid-cols-[180px_1fr] md:gap-8" aria-labelledby="content-seo">
        <div>
          <h2 id="content-seo" className="text-[11px] tracking-[0.3em] text-stone">SEO</h2>
          <p className="mt-2 text-[12px] leading-relaxed text-stone/80">Default document metadata. Property pages write their own.</p>
        </div>
        <div className="space-y-5">
          <BilingualField
            label="Site title"
            required
            error={sideOf(seo.title, 'en').length > 70 ? 'Keep the English title under 70 characters.' : ''}
            arError={sideOf(seo.title, 'ar').length > 70 ? 'يجب أن يبقى العنوان أقل من 70 حرفاً.' : ''}
            hint={`${sideOf(seo.title, 'en').length}/70 · ${sideOf(seo.title, 'ar').length}/70`}
            value={seo.title}
            onChange={(v) => setSectionValue('seo', 'title', v)}
          />
          <BilingualField
            label="Meta description"
            rows={3}
            hint={`${sideOf(seo.description, 'en').length} chars · ${sideOf(seo.description, 'ar').length} حرف`}
            value={seo.description}
            onChange={(v) => setSectionValue('seo', 'description', v)}
          />
          <Field label="Default share image URL" hint="external https:// URL" error={seo.ogImage && !/^https:\/\//.test(seo.ogImage) ? 'Use an https:// URL.' : ''}>
            <Input value={seo.ogImage} onChange={(e) => setSectionValue('seo', 'ogImage', e.target.value)} placeholder="https://…" />
          </Field>

          {sectionFeedback('seo')}
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => saveSection('seo')} disabled={savingSection === 'seo'}>
              {savingSection === 'seo' ? 'SAVING…' : 'SAVE SEO'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
