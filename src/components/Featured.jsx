import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTIES, formatPrice, specLine } from '../data'
import SaveButton from './SaveButton'

import { prefersReduced } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function Featured({ onOpen, savedIds, toggleSave, compareIds, toggleCompare, compareFull }) {
  const ref = useRef(null)
  const featured = PROPERTIES.filter((p) => p.featured).slice(0, 4)

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-featured-media]').forEach((media, i) => {
        const from = i % 2 === 0 ? 'inset(0 0 100% 0)' : 'inset(0 100% 0 0)'
        gsap.fromTo(
          media,
          { clipPath: from },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: media, start: 'top 85%', once: true },
          },
        )
        gsap.fromTo(
          media.querySelector('img'),
          { scale: 1.025 },
          { scale: 1, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: media, start: 'top 85%', once: true } },
        )
      })
      gsap.utils.toArray('[data-featured-meta]').forEach((meta) => {
        gsap.fromTo(meta, { y: 12, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: meta, start: 'top 92%', once: true },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="featured" ref={ref} className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <p className="text-[11px] tracking-[0.4em] text-stone" data-reveal>SELECTED</p>
      <div className="mt-3 flex items-end justify-between">
        <h2 className="font-serif text-3xl md:text-4xl">Selected properties</h2>
        <a href="#properties" onClick={(e) => { e.preventDefault(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }) }} className="hidden text-[12px] tracking-[0.2em] sm:block">VIEW ALL &rarr;</a>
      </div>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
        A considered selection across Beirut, the coast and the mountains.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
        {featured.map((p, i) => (
          <div key={p.id} className={i % 2 === 1 ? 'sm:mt-16' : ''} data-featured={i}>
            <FeaturedCard p={p} onOpen={onOpen} saved={savedIds?.includes(p.id)} onToggleSave={() => toggleSave?.(p.id)} compare={compareIds?.includes(p.id)} onToggleCompare={() => toggleCompare?.(p.id)} compareFull={compareFull?.(p.id)} />
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturedCard({ p, onOpen, saved, onToggleSave, compare, onToggleCompare, compareFull }) {
  return (
    <article className="relative">
      {onToggleSave && (
        <span className="absolute right-2 top-2 z-10">
          <SaveButton saved={saved} onToggle={onToggleSave} />
        </span>
      )}
      <button onClick={() => onOpen(p)} className="group block w-full text-left" aria-label={`View ${p.title}, ${p.city}`}>
        <div data-featured-media className="aspect-[16/11] overflow-hidden">
          <img src={p.images[0]} alt={`${p.title} in ${p.city}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        </div>
        <div data-featured-meta>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="text-[10px] tracking-[0.35em] text-stone">{p.city.toUpperCase()} · {p.regionLabel.toUpperCase()}</p>
            <p className="font-serif text-lg">{formatPrice(p)}</p>
          </div>
          <h3 className="mt-1.5 font-serif text-xl transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:underline decoration-line underline-offset-4">{p.title}</h3>
          <p className="mt-1 text-[13px] text-ink-soft">{specLine(p)}</p>
          <p className="mt-3 text-[12px] tracking-[0.2em] text-ink">
            VIEW PROPERTY <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">&rarr;</span>
          </p>
        </div>
      </button>
      {onToggleCompare && (
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={onToggleCompare} aria-pressed={!!compare} disabled={!compare && compareFull} className={`text-[11px] tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${compare ? 'text-ink underline underline-offset-4' : 'text-stone hover:text-ink'}`}>
            {compare ? 'COMPARING' : '+ COMPARE'}
          </button>
        </div>
      )}
    </article>
  )
}
