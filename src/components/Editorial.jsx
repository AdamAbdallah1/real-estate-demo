import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'
import { useI18n } from '../i18n'
import { geoLabel } from '../i18n/translations'

gsap.registerPlugin(ScrollTrigger)

export default function Editorial({ onFilterRegion, properties = [], editorialPropertyId, onOpen }) {
  const reduced = useState(() => prefersReduced())[0]
  const sectionRef = useRef(null)
  const { t, lang } = useI18n()
  const feature = editorialPropertyId
    ? properties.find((p) => p.id === editorialPropertyId) || null
    : null

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-editorial-img]', { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      })
      gsap.fromTo('[data-editorial-copy]', { y: 16, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.2,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="editorial" className="relative">
      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[16/7]">
        <img data-editorial-img src={feature ? feature.coverImage || feature.images[0] : 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80'} alt={feature ? t('card.imageAlt', { title: feature.title, city: feature.city }) : t('editorial.altFallback')} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/25" />
        <div data-editorial-copy className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-16">
          <p className="text-[11px] tracking-[0.4em] text-ivory/80">{feature ? `${geoLabel(feature.city, lang).toUpperCase()} · ${geoLabel(feature.regionLabel, lang).toUpperCase()}` : t('editorial.eyebrowFallback')}</p>
          <h2 className="mt-3 font-serif text-4xl text-ivory md:text-6xl">{feature ? feature.title : t('editorial.titleFallback')}</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory/85">
            {feature
              ? feature.shortDescription || feature.description
              : t('editorial.bodyFallback')}
          </p>
          {feature && onOpen ? (
            <button onClick={() => onOpen(feature)} className="mt-6 border border-ivory/70 px-6 py-3 text-[12px] tracking-[0.25em] text-ivory transition-colors hover:bg-ivory hover:text-ink">
              {t('editorial.view')}
            </button>
          ) : (
            <button onClick={() => onFilterRegion('coast')} className="mt-6 border border-ivory/70 px-6 py-3 text-[12px] tracking-[0.25em] text-ivory transition-colors hover:bg-ivory hover:text-ink">
              {t('editorial.explore')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
