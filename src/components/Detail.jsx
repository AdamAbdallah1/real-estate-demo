import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { priceLabel, specLineLabel, typeLabel } from '../i18n/translations'
import { prefersReduced } from '../lib/motion'
import { propertyInquiryMessage, shareMessage, similarProperties, viewingRequestMessage, openWhatsApp, propertyUrl, whatsappNumber } from '../lib/properties'
import { useI18n } from '../i18n'
import PropertyCard from './PropertyCard'

/** Day ids are stable values; only the labels are translated. */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIMES = ['Morning', 'Afternoon', 'Evening']

export default function Detail({ p, properties = [], onClose, saved, onToggleSave, compare, onToggleCompare, compareFull, onOpen }) {
  const [active, setActive] = useState(0)
  const [showViewing, setShowViewing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { t, lang } = useI18n()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    if (!prefersReduced()) {
      gsap.fromTo('[data-detail]', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const wa = `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(propertyInquiryMessage(p))}`
  const similar = similarProperties(p, 3, properties)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl(p))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t('detail.copyPrompt'), propertyUrl(p))
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label={p.title}>
      <div data-detail className="mx-auto max-w-6xl px-5 py-6 md:px-8">
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.4em] text-stone">{p.city.toUpperCase()} · {p.regionLabel.toUpperCase()}</p>
          <button onClick={onClose} aria-label={t('detail.close')} className="p-2 -me-2 text-ink"><HiX size={22} /></button>
        </div>

        <div className="mt-4 aspect-[16/10] w-full overflow-hidden">
          <img src={p.images[active]} alt={t('detail.imageAlt', { title: p.title, n: active + 1 })} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 flex gap-3">
          {p.images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={t('detail.viewImage', { n: i + 1 })}
              className={`h-16 w-24 overflow-hidden border ${i === active ? 'border-ink' : 'border-transparent opacity-60'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-serif text-3xl md:text-4xl">{p.title}</h2>
            <p className="mt-3 text-[13px] tracking-wide text-ink-soft">{specLineLabel(p, lang)} · {typeLabel(p.type, lang)} · {p.view}</p>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{p.description}</p>
            <h3 className="mt-10 text-[11px] tracking-[0.35em] text-stone">{t('detail.features')}</h3>
            <ul className="mt-4 space-y-2 text-[14px]">
              {p.features.map((f) => <li key={f} className="border-b border-line pb-2">{f}</li>)}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-[11px] tracking-[0.2em]">
              <button onClick={onToggleSave} aria-pressed={saved} className={`transition-colors ${saved ? 'text-ink underline underline-offset-4' : 'text-stone hover:text-ink'}`}>
                {saved ? t('card.saved') : t('card.save')}
              </button>
              <button onClick={onToggleCompare} aria-pressed={compare} disabled={!compare && compareFull} className={`transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${compare ? 'text-ink underline underline-offset-4' : 'text-stone hover:text-ink'}`}>
                {compare ? t('card.comparing') : t('card.compare')}
              </button>
              <button onClick={copyLink} className="text-stone transition-colors hover:text-ink" aria-label={t('detail.copyLink')}>
                {copied ? t('detail.linkCopied') : t('detail.copyLink')}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage(p, propertyUrl(p)))}`} target="_blank" rel="noreferrer" className="text-stone transition-colors hover:text-ink">
                {t('detail.shareWhatsapp')}
              </a>
            </div>
          </div>

          <aside className="md:col-span-5 md:ps-8 md:border-s md:border-line">
            <p className="text-[11px] tracking-[0.35em] text-stone">{t('detail.price')}</p>
            <p className="mt-2 font-serif text-3xl">{priceLabel(p, lang)}</p>
            <dl className="mt-8 space-y-3 text-[14px]">
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.area')}</dt><dd>{p.surface} {lang === 'ar' ? 'م²' : 'm²'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.bedrooms')}</dt><dd>{p.beds || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.bathrooms')}</dt><dd>{p.baths || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.parking')}</dt><dd>{p.parking || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.floor')}</dt><dd>{p.floor}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">{t('detail.view')}</dt><dd>{p.view}</dd></div>
            </dl>

            {!showViewing ? (
              <>
                <button onClick={() => setShowViewing(true)}
                  className="mt-8 w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
                  {t('detail.requestViewing')}
                </button>
                <a href={wa} target="_blank" rel="noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 border border-line py-4 text-[12px] tracking-[0.25em] text-ink-soft transition-colors hover:border-ink hover:text-ink">
                  <FaWhatsapp size={15} /> {t('detail.whatsapp')}
                </a>
              </>
            ) : (
              <ViewingForm p={p} onCancel={() => setShowViewing(false)} onSent={() => setShowViewing(false)} />
            )}
            <p className="mt-6 text-[11px] leading-relaxed text-stone">{t('detail.concept')}</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24 border-t border-line pt-12">
            <p className="text-[11px] tracking-[0.4em] text-stone">{t('detail.continue')}</p>
            <h3 className="mt-3 font-serif text-2xl md:text-3xl">{t('detail.similar')}</h3>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} p={s} onOpen={onOpen} />
              ))}
            </div>
          </section>
        )}

        <div className="h-16" />
      </div>
    </div>
  )
}

function ViewingForm({ p, onCancel, onSent }) {
  const { t } = useI18n()
  const [values, setValues] = useState({ name: '', phone: '', day: DAYS[0], time: 'Morning', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!values.name.trim()) errs.name = t('viewing.errName')
    if (!/^\+?[0-9 ()-]{6,}$/.test(values.phone.trim())) errs.phone = t('viewing.errPhone')
    setErrors(errs)
    if (Object.keys(errs).length) return

    setStatus('sending')
    // Record the request in Firestore; a failure never blocks the WhatsApp flow.
    try {
      const { createViewingRequest } = await import('../lib/firestore/viewingRequests')
      await createViewingRequest({
        propertyId: p.id,
        propertyTitle: p.title,
        name: values.name,
        phone: values.phone,
        // Stable English values so the CRM stays language independent.
        preferredDay: values.day,
        preferredTime: values.time,
        message: values.message || '',
      })
      setStatus('sent')
    } catch (err) {
      console.warn('[nara] viewing request not stored:', err?.code || err?.message || err)
      setStatus('sent')
    }
    openWhatsApp(viewingRequestMessage(p, {
      ...values,
      day: t(`days.${values.day.toLowerCase()}`),
      time: t(`viewing.${values.time.toLowerCase()}`),
    }))
    onSent()
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-label={t('viewing.title')}>
      <p className="font-serif text-xl">{t('viewing.title')}</p>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">{t('viewing.name')}</span>
        <input value={values.name} onChange={set('name')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
        {errors.name && <span role="alert" className="mt-1 block text-[12px]">{errors.name}</span>}
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">{t('viewing.phone')}</span>
        <input value={values.phone} onChange={set('phone')} type="tel" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
        {errors.phone && <span role="alert" className="mt-1 block text-[12px]">{errors.phone}</span>}
      </label>
      <div className="grid grid-cols-2 gap-5">
        <label className="block">
          <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">{t('viewing.day')}</span>
          <select value={values.day} onChange={set('day')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none">
            {DAYS.map((d) => <option key={d} value={d}>{t(`days.${d.toLowerCase()}`)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">{t('viewing.time')}</span>
          <select value={values.time} onChange={set('time')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none">
            {TIMES.map((time) => <option key={time} value={time}>{t(`viewing.${time.toLowerCase()}`)}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">{t('viewing.message')}</span>
        <textarea value={values.message} onChange={set('message')} rows={2} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
      </label>
      <button type="submit" disabled={status === 'sending'} className="w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'sending' ? t('viewing.sending') : t('viewing.send')}
      </button>
      <button type="button" onClick={onCancel} className="w-full text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
        {t('viewing.cancel')}
      </button>
    </form>
  )
}
