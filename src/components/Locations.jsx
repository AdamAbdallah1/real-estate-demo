import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REGIONS } from '../data'
import { prefersReduced } from '../lib/motion'
import { useI18n } from '../i18n'
import { geoLabel, regionCopy } from '../i18n/translations'

gsap.registerPlugin(ScrollTrigger)

export default function Locations({ onFilterRegion }) {
  const [active, setActive] = useState(0)
  const reduced = useState(() => prefersReduced())[0]
  const sectionRef = useRef(null)
  const { t, lang } = useI18n()
  const r = REGIONS[active]

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + REGIONS.length * 340,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(REGIONS.length - 1, Math.floor(self.progress * REGIONS.length))
          setActive((current) => (current === idx ? current : idx))
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="locations" className="bg-sand">
      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 py-10 md:px-8 md:py-12">
        <p className="text-[11px] tracking-[0.4em] text-stone">{t('locations.eyebrow')}</p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">{t('locations.title')}</h2>

        <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-12 md:gap-12">
          <div className="relative md:col-span-7 overflow-hidden aspect-[16/10] md:aspect-[4/3.4]">
            {REGIONS.map((loc, i) => (
              <img
                key={loc.id}
                src={loc.img}
                alt={t('locations.imageAlt', { name: geoLabel(loc.name, lang) })}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>

          <div className="md:col-span-5 flex flex-col justify-center">
            <ul>
              {REGIONS.map((loc, i) => (
                <li key={loc.id}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => { setActive(i); onFilterRegion?.(loc.id) }}
                    className={`w-full border-b border-line py-2.5 text-start transition-all duration-500 md:py-4 ${i === active ? 'ps-4' : ''}`}
                    aria-current={i === active}
                  >
                    <span className={`font-serif text-xl md:text-[1.7rem] transition-colors duration-500 ${i === active ? 'text-ink' : 'text-stone'}`}>{geoLabel(loc.name, lang)}</span>
                    <span className="mt-0.5 block text-[12px] text-stone">{loc.areas.map((a) => geoLabel(a, lang)).slice(0, 4).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="relative mt-4 max-w-sm md:mt-6">
              <div className="grid">
                {REGIONS.map((loc, i) => (
                  <p
                    key={loc.id}
                    className={`col-start-1 row-start-1 text-[13px] leading-relaxed text-ink-soft transition-opacity duration-700 md:text-[14px] ${i === active ? 'opacity-100' : 'opacity-0'}`}
                    aria-hidden={i !== active}
                  >
                    {regionCopy(loc.id, lang)}
                  </p>
                ))}
              </div>
            </div>

            <button onClick={() => onFilterRegion?.(r.id)} className="mt-4 text-start text-[12px] tracking-[0.2em] underline underline-offset-4 md:mt-6">
              {t('locations.see', { name: geoLabel(r.name, lang).toUpperCase() })} <span className="arrow-mark">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
