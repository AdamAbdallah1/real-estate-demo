import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'
import { useI18n } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

export default function Contact({ contact }) {
  const ref = useRef(null)
  const { t } = useI18n()

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } })
        .fromTo('[data-contact-heading]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
        .fromTo('[data-contact-copy]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15)
        .fromTo('[data-contact-cta]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
    }, ref)
    return () => ctx.revert()
  }, [])

  const whatsapp = String(contact?.whatsapp || '9611000000').replace(/[^0-9]/g, '')

  return (
    <section id="contact" ref={ref} className="border-t border-line">
      <div className="mx-auto max-w-3xl px-5 py-24 md:px-8">
        <h2 data-contact-heading className="font-serif text-3xl md:text-5xl">{t('contact.title')}</h2>
        <p data-contact-copy className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {t('contact.body')}
        </p>
        <div data-contact-cta className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="#properties" onClick={(e) => { e.preventDefault(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }) }} className="border border-ink px-8 py-4 text-[12px] tracking-[0.25em] transition-colors hover:bg-ink hover:text-ivory">
            {t('contact.browse')}
          </a>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="px-8 py-4 text-[12px] tracking-[0.25em] text-ink-soft underline underline-offset-[10px] transition-colors hover:text-ink">
            {t('contact.talk')}
          </a>
        </div>

        <InquiryForm />
      </div>
    </section>
  )
}

function InquiryForm() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | done | failed
  const { t } = useI18n()
  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!values.name.trim()) errs.name = t('contact.errName')
    if (!values.email.trim() && !values.phone.trim()) errs.contact = t('contact.errContact')
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errs.email = t('contact.errEmail')
    if (values.phone.trim() && !/^\+?[0-9 ()-]{6,}$/.test(values.phone.trim())) errs.phone = t('contact.errPhone')
    if (!values.message.trim()) errs.message = t('contact.errMessage')
    setErrors(errs)
    if (Object.keys(errs).length) return

    setState('sending')
    try {
      const { createInquiry } = await import('../lib/firestore/inquiries')
      await createInquiry({ ...values, source: 'contact' })
      setState('done')
      setValues({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      console.warn('[nara] inquiry not stored:', err?.code || err?.message || err)
      setState('failed')
    }
  }

  return (
    <div className="mx-auto mt-16 border-t border-line pt-10 text-start">
      <p className="text-[11px] tracking-[0.4em] text-stone">{t('contact.formEyebrow')}</p>

      {state === 'done' ? (
        <div className="mt-6" role="status" aria-live="polite">
          <p className="font-serif text-2xl">{t('contact.doneTitle')}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            {t('contact.doneBody')}
          </p>
          <button type="button" onClick={() => setState('idle')} className="mt-6 text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
            {t('contact.sendAnother')}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6 space-y-6" aria-label={t('contact.formAria')}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label={t('contact.name')} error={errors.name}>
              <input value={values.name} onChange={set('name')} type="text" autoComplete="name" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
            </Field>
            <Field label={t('contact.email')} error={errors.email || errors.contact}>
              <input value={values.email} onChange={set('email')} type="email" autoComplete="email" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label={t('contact.phone')} error={errors.phone}>
              <input value={values.phone} onChange={set('phone')} type="tel" autoComplete="tel" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
            </Field>
            <Field label={t('contact.message')} error={errors.message}>
              <input value={values.message} onChange={set('message')} type="text" placeholder={t('contact.messagePlaceholder')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] placeholder:text-stone/60 focus:border-ink focus:outline-none" />
            </Field>
          </div>

          {state === 'failed' && (
            <p role="alert" className="text-[13px] text-ink">
              {t('contact.failed')}
            </p>
          )}

          <button type="submit" disabled={state === 'sending'} className="w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10">
            {state === 'sending' ? t('contact.sending') : t('contact.send')}
          </button>
          <p className="text-[11px] leading-relaxed text-stone">
            {t('contact.note')}
          </p>
        </form>
      )}
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] tracking-[0.3em] text-stone">{label.toUpperCase()}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-[12px] text-ink">{error}</span>}
    </label>
  )
}
