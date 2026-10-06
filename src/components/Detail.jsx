import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { formatPrice, specLine } from '../data'
import { prefersReduced } from '../lib/motion'

export default function Detail({ p, onClose }) {
  const [active, setActive] = useState(0)

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

  const wa = `https://wa.me/9611000000?text=${encodeURIComponent(`Hello NARA — I'm interested in: ${p.title}, ${p.city} (${formatPrice(p)}).`)}`

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
            <button onClick={() => window.open(`https://wa.me/9611000000?text=${encodeURIComponent(`Viewing request: ${p.title}, ${p.city}`)}`)}
              className="mt-8 w-full bg-ink py-4 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
              REQUEST A VIEWING
            </button>
            <a href={wa} target="_blank" rel="noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 border border-line py-4 text-[12px] tracking-[0.25em] text-ink-soft transition-colors hover:border-ink hover:text-ink">
              <FaWhatsapp size={15} /> WHATSAPP ABOUT THIS PROPERTY
            </a>
            <p className="mt-6 text-[11px] leading-relaxed text-stone">Concept website · Property details shown for demonstration.</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
