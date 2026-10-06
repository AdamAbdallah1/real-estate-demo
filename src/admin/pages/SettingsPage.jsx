import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsForm } from '../hooks/useSettingsForm'
import { useConfirm } from '../hooks/useConfirm'
import { seedDemoProperties } from '../../lib/firestore/properties'
import { errorMessage } from '../../lib/firestore/shared'
import { PROPERTIES } from '../../data'
import { Button, ErrorState, Field, Input, LoadingRows, PageHeader, Toggle } from '../components/ui'
import BilingualField from '../components/BilingualField'
import { cx } from '../lib/cx'

function Section({ title, hint, children, footer }) {
  return (
    <section className="grid gap-5 border-t border-line pt-8 md:grid-cols-[180px_1fr] md:gap-8" aria-labelledby={`settings-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div>
        <h2 id={`settings-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-[11px] tracking-[0.3em] text-stone">{title}</h2>
        {hint && <p className="mt-2 text-[12px] leading-relaxed text-stone/80">{hint}</p>}
      </div>
      <div className="space-y-5">{children}{footer}</div>
    </section>
  )
}

/** General, contact and social settings + the explicit demo data migration. */
export default function SettingsPage() {
  const { user } = useAuth()
  const { loading, error, form, setSectionValue, saveSection, savingSection, feedback } = useSettingsForm()
  const [confirmNode, askConfirm] = useConfirm()
  const [overwrite, setOverwrite] = useState(false)
  const [migration, setMigration] = useState(null)
  const [migrating, setMigrating] = useState(false)

  if (loading) return <LoadingRows rows={6} />
  if (error && !form) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <ErrorState message={`${error} Settings can only be edited when Firestore is reachable.`} onRetry={() => window.location.reload()} />
      </div>
    )
  }
  if (!form) return <LoadingRows rows={6} />

  const note = (section) => (feedback?.section === section ? (
    <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>{feedback.text}</p>
  ) : null)

  const runMigration = async () => {
    const confirmed = await askConfirm({
      title: overwrite ? 'Overwrite existing properties?' : 'Migrate demo properties?',
      body: overwrite
        ? `${PROPERTIES.length} demo properties will replace whatever is currently stored under the same ids. This cannot be undone.`
        : `${PROPERTIES.length} demo properties will be written into Firestore under their original ids (p1–p12). Existing documents are left untouched unless you tick overwrite.`,
      confirmLabel: overwrite ? 'OVERWRITE' : 'MIGRATE',
      danger: overwrite,
    })
    if (!confirmed) return

    setMigrating(true)
    setMigration(null)
    try {
      const result = await seedDemoProperties(PROPERTIES, user?.uid, { overwrite })
      setMigration(result)
    } catch (err) {
      setMigration({ created: 0, skipped: 0, updated: 0, errors: [errorMessage(err)] })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="space-y-10">
      <PageHeader title="Settings" subtitle="Identity, contact details and social profiles used across the public site." />

      {/* GENERAL */}
      <Section
        title="GENERAL"
        hint="Brand strings used in the footer and document defaults."
        footer={note('general')}
      >
        <Field label="Site name">
          <Input value={form.general.siteName} onChange={(e) => setSectionValue('general', 'siteName', e.target.value)} />
        </Field>
        <Field label="Tagline">
          <Input value={form.general.tagline} onChange={(e) => setSectionValue('general', 'tagline', e.target.value)} />
        </Field>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => saveSection('general')} disabled={savingSection === 'general'}>
            {savingSection === 'general' ? 'SAVING…' : 'SAVE GENERAL'}
          </Button>
        </div>
      </Section>

      {/* CONTACT */}
      <Section
        title="CONTACT"
        hint="The WhatsApp number drives every WhatsApp action on the website."
        footer={note('contact')}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="WhatsApp number" hint="digits only" error={form.contact.whatsapp && !/^\+?[0-9]{6,15}$/.test(String(form.contact.whatsapp).replace(/[\s()-]/g, '')) ? 'Digits only, optional leading +.' : ''}>
            <Input value={form.contact.whatsapp} onChange={(e) => setSectionValue('contact', 'whatsapp', e.target.value)} placeholder="9611000000" />
          </Field>
          <Field label="Phone (display)">
            <Input value={form.contact.phone} onChange={(e) => setSectionValue('contact', 'phone', e.target.value)} />
          </Field>
          <Field label="Email" error={form.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.email) ? 'Enter a valid email address.' : ''}>
            <Input type="email" value={form.contact.email} onChange={(e) => setSectionValue('contact', 'email', e.target.value)} />
          </Field>
        </div>
        <BilingualField
          label="Address"
          hint="the only contact field editors translate — phone, WhatsApp, email and social links are shared"
          value={form.contact.address}
          onChange={(v) => setSectionValue('contact', 'address', v)}
          enPlaceholder="Beirut, Lebanon"
          arPlaceholder="بيروت، لبنان"
        />
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => saveSection('contact')} disabled={savingSection === 'contact'}>
            {savingSection === 'contact' ? 'SAVING…' : 'SAVE CONTACT'}
          </Button>
        </div>
      </Section>

      {/* SOCIAL */}
      <Section title="SOCIAL" hint="Empty links are simply not rendered." footer={note('social')}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {['instagram', 'facebook', 'linkedin'].map((key) => (
            <Field
              key={key}
              label={key}
              error={form.social[key] && !/^https?:\/\//.test(form.social[key]) ? 'Use a full https:// URL.' : ''}
            >
              <Input value={form.social[key]} onChange={(e) => setSectionValue('social', key, e.target.value)} placeholder="https://…" />
            </Field>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => saveSection('social')} disabled={savingSection === 'social'}>
            {savingSection === 'social' ? 'SAVING…' : 'SAVE SOCIAL'}
          </Button>
        </div>
      </Section>

      {/* MIGRATION */}
      <Section
        title="DEMO DATA"
        hint="Runs only when you press the button — never on page load."
        footer={
          migration ? (
            <div className="border border-line bg-paper p-4 text-[13px] text-ink" role="status" aria-live="polite">
              <p>Created {migration.created} · updated {migration.updated} · skipped {migration.skipped}</p>
              {migration.errors?.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-stone">
                  {migration.errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
            </div>
          ) : null
        }
      >
        <p className="text-[13px] leading-relaxed text-ink-soft">
          Writes the {PROPERTIES.length} existing NARA demo properties into Firestore under their original ids, preserving
          their image URLs and public fields. Re-running is safe: documents that already exist are skipped unless you
          explicitly allow an overwrite.
        </p>
        <Toggle checked={overwrite} onChange={setOverwrite} label="Allow overwriting properties that already exist" />
        <div className="flex gap-3">
          <Button variant={overwrite ? 'danger' : 'primary'} onClick={runMigration} disabled={migrating}>
            {migrating ? 'MIGRATING…' : 'MIGRATE DEMO PROPERTIES'}
          </Button>
        </div>
      </Section>

      {confirmNode}
    </div>
  )
}
