import { useEffect, useState } from 'react'
import { HiX } from 'react-icons/hi'
import { sellerInquiryMessage, openWhatsApp } from '../lib/properties'

const TYPES = ['Apartment', 'Villa', 'Penthouse', 'Chalet', 'Office', 'Land', 'Commercial']

export default function SellModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const [values, setValues] = useState({ name: '', phone: '', location: '', type: 'Apartment', size: '', message: '' })
  const [errors, setErrors] = useState({})

  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!values.name.trim()) errs.name = 'Please enter your name.'
    if (!/^\+?[0-9 ()-]{6,}$/.test(values.phone.trim())) errs.phone = 'Enter a valid phone / WhatsApp number.'
    if (!values.location.trim()) errs.location = 'Please enter the property location.'
    if (!values.size.trim()) errs.size = 'Approximate size in m².'
    setErrors(errs)
    if (Object.keys(errs).length) return
    openWhatsApp(sellerInquiryMessage(values))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label="Sell your property">
      <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.4em] text-stone">SELL</p>
          <button onClick={onClose} aria-label="Close sell form" className="p-2 -mr-2 text-ink"><HiX size={22} /></button>
        </div>
        <h2 className="mt-6 font-serif text-3xl md:text-4xl">Present your property properly</h2>
        <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
          Tell us about the property and we'll follow up to discuss presentation and pricing.
        </p>

        <form onSubmit={submit} noValidate className="mt-10 space-y-6">
          <Field label="Name" error={errors.name}>
            <input value={values.name} onChange={set('name')} type="text" autoComplete="name" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
          </Field>
          <Field label="Phone / WhatsApp" error={errors.phone}>
            <input value={values.phone} onChange={set('phone')} type="tel" autoComplete="tel" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
          </Field>
          <Field label="Property location" error={errors.location}>
            <input value={values.location} onChange={set('location')} type="text" placeholder="e.g. Achrafieh, Beirut" className="w-full border-b border-line bg-transparent pb-2 text-[14px] placeholder:text-stone/60 focus:border-ink focus:outline-none" />
          </Field>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Property type">
              <select value={values.type} onChange={set('type')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Approximate size" error={errors.size}>
              <input value={values.size} onChange={set('size')} type="text" inputMode="numeric" placeholder="e.g. 145 m²" className="w-full border-b border-line bg-transparent pb-2 text-[14px] placeholder:text-stone/60 focus:border-ink focus:outline-none" />
            </Field>
          </div>
          <Field label="Message (optional)">
            <textarea value={values.message} onChange={set('message')} rows={3} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
          </Field>
          <button type="submit" className="mt-4 w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
            SEND VIA WHATSAPP
          </button>
          <p className="text-[11px] leading-relaxed text-stone">
            This opens WhatsApp with your message pre-filled. NARA has not yet received or evaluated your property.
          </p>
        </form>
      </div>
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
