import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { formatPrice, specLine } from '../data'
import { prefersReduced } from '../lib/motion'
import { propertyInquiryMessage, shareMessage, similarProperties, viewingRequestMessage, openWhatsApp, propertyUrl } from '../lib/properties'
import PropertyCard from './PropertyCard'

export default function Detail({ p, onClose, saved, onToggleSave, compare, onToggleCompare, compareFull, onOpen }) {
  const [active, setActive] = useState(0)
  const [showViewing, setShowViewing] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const wa = `https://wa.me/9611000000?text=${encodeURIComponent(propertyInquiryMessage(p))}`
  const similar = similarProperties(p, 3)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl(p))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', propertyUrl(p))
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label={p.title}>
      <div data-detail className="mx-auto max-w-6xl px-5 py-6 md:px-8">
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.4em] text-stone">{p.city.toUpperCase()} · {p.regionLabel.toUpperCase()}</p>
          <button onClick={onClose} aria-label="Close property detail" className="p-2 -mr-2 text-ink"><HiX size={22} /></button>
        </div>

        <div className="mt-4 aspect-[16/10] w-full overflow-hidden">
          <img src={p.images[active]} alt={`${p.title} — view ${active + 1}`} className="h-full w-full object-cover" />
        </div>
        <div className="mt-3 flex gap-3">
          {p.images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
              className={`h-16 w-24 overflow-hidden border ${i === active ? 'border-ink' : 'border-transparent opacity-60'}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-serif text-3xl md:text-4xl">{p.title}</h2>
            <p className="mt-3 text-[13px] tracking-wide text-ink-soft">{specLine(p)} · {p.type} · {p.view}</p>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{p.description}</p>
            <h3 className="mt-10 text-[11px] tracking-[0.35em] text-stone">FEATURES</h3>
            <ul className="mt-4 space-y-2 text-[14px]">
              {p.features.map((f) => <li key={f} className="border-b border-line pb-2">{f}</li>)}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-[11px] tracking-[0.2em]">
              <button onClick={onToggleSave} aria-pressed={saved} className={`transition-colors ${saved ? 'text-ink underline underline-offset-4' : 'text-stone hover:text-ink'}`}>
                {saved ? 'SAVED' : '+ SAVE'}
              </button>
              <button onClick={onToggleCompare} aria-pressed={compare} disabled={!compare && compareFull} className={`transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${compare ? 'text-ink underline underline-offset-4' : 'text-stone hover:text-ink'}`}>
                {compare ? 'COMPARING' : '+ COMPARE'}
              </button>
              <button onClick={copyLink} className="text-stone transition-colors hover:text-ink" aria-label="Copy link to this property">
                {copied ? 'LINK COPIED' : 'COPY LINK'}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage(p, propertyUrl(p)))}`} target="_blank" rel="noreferrer" className="text-stone transition-colors hover:text-ink">
                SHARE VIA WHATSAPP
              </a>
            </div>
          </div>

          <aside className="md:col-span-5 md:pl-8 md:border-l md:border-line">
            <p className="text-[11px] tracking-[0.35em] text-stone">PRICE</p>
            <p className="mt-2 font-serif text-3xl">{formatPrice(p)}</p>
            <dl className="mt-8 space-y-3 text-[14px]">
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">Area</dt><dd>{p.surface} m²</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">Bedrooms</dt><dd>{p.beds || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">Bathrooms</dt><dd>{p.baths || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">Parking</dt><dd>{p.parking || '—'}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">Floor</dt><dd>{p.floor}</dd></div>
              <div className="flex justify-between border-b border-line pb-3"><dt className="text-stone">View</dt><dd>{p.view}</dd></div>
            </dl>

            {!showViewing ? (
              <>
                <button onClick={() => setShowViewing(true)}
                  className="mt-8 w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
                  REQUEST A VIEWING
                </button>
                <a href={wa} target="_blank" rel="noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 border border-line py-4 text-[12px] tracking-[0.25em] text-ink-soft transition-colors hover:border-ink hover:text-ink">
                  <FaWhatsapp size={15} /> WHATSAPP ABOUT THIS PROPERTY
                </a>
              </>
            ) : (
              <ViewingForm p={p} onCancel={() => setShowViewing(false)} onSent={() => setShowViewing(false)} />
            )}
            <p className="mt-6 text-[11px] leading-relaxed text-stone">Concept website · Property details shown for demonstration.</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-24 border-t border-line pt-12">
            <p className="text-[11px] tracking-[0.4em] text-stone">CONTINUE</p>
            <h3 className="mt-3 font-serif text-2xl md:text-3xl">You may also consider</h3>
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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [values, setValues] = useState({ name: '', phone: '', day: days[0], time: 'Morning', message: '' })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!values.name.trim()) errs.name = 'Please enter your name.'
    if (!/^\+?[0-9 ()-]{6,}$/.test(values.phone.trim())) errs.phone = 'Enter a valid phone / WhatsApp number.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    openWhatsApp(viewingRequestMessage(p, values))
    onSent()
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-label="Request a viewing">
      <p className="font-serif text-xl">Request a viewing</p>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">NAME</span>
        <input value={values.name} onChange={set('name')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
        {errors.name && <span role="alert" className="mt-1 block text-[12px]">{errors.name}</span>}
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">PHONE / WHATSAPP</span>
        <input value={values.phone} onChange={set('phone')} type="tel" className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
        {errors.phone && <span role="alert" className="mt-1 block text-[12px]">{errors.phone}</span>}
      </label>
      <div className="grid grid-cols-2 gap-5">
        <label className="block">
          <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">DAY</span>
          <select value={values.day} onChange={set('day')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none">
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">TIME</span>
          <select value={values.time} onChange={set('time')} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none">
            {['Morning', 'Afternoon', 'Evening'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[10px] tracking-[0.3em] text-stone">MESSAGE (OPTIONAL)</span>
        <textarea value={values.message} onChange={set('message')} rows={2} className="w-full border-b border-line bg-transparent pb-2 text-[14px] focus:border-ink focus:outline-none" />
      </label>
      <button type="submit" className="w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
        SEND VIA WHATSAPP
      </button>
      <button type="button" onClick={onCancel} className="w-full text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
        CANCEL
      </button>
    </form>
  )
}
