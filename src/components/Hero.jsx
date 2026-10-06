import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { REGIONS, PROPERTY_TYPES } from '../data'
import { prefersReduced } from '../lib/motion'
import { useI18n } from '../i18n'
import { geoLabel, resolveText, typeLabel } from '../i18n/translations'

const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+']
const PRICE_BUY = ['Any', '≤ $250k', '≤ $400k', '≤ $650k', '≤ $1M']
const PRICE_RENT = ['Any', '≤ $1,500', '≤ $2,000', '≤ $2,500']

export default function Hero({ filters, setFilters, content }) {
  const ref = useRef(null)
  const { t, lang } = useI18n()
  const purpose = filters.purpose
  const heading = resolveText(content?.heroHeading, lang) || t('hero.headingDefault')
  const headingLines = heading.split('\n')
  const description = resolveText(content?.heroDescription, lang) || t('hero.descriptionDefault')

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('[data-hero-img]', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.2 })
        .fromTo('[data-hero-img] img', { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .fromTo('[data-hero-line]', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.12 }, 0.5)
        .fromTo('[data-hero-copy]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.9)
        .fromTo('[data-hero-search]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.05)
    }, ref)
    return () => ctx.revert()
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setFilters({
      purpose,
      region: form.get('region'),
      type: form.get('type'),
      beds: form.get('beds'),
      price: form.get('price'),
    })
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={ref} id="top" className="relative pt-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 md:grid-cols-12 md:gap-10 md:px-8 md:pt-16">
        <div className="md:col-span-5 md:pt-10">
          <p className="mb-5 text-[11px] tracking-[0.4em] text-stone">{t('hero.eyebrow')}</p>
          <h1 className="font-serif text-[2.6rem] leading-[1.08] text-ink md:text-5xl lg:text-[3.4rem]">
            {(headingLines.length ? headingLines : t('hero.headingDefault').split('\n')).slice(0, 4).map((line, i) => (
              <span key={i} className="block overflow-hidden"><span data-hero-line className="block">{line}</span></span>
            ))}
          </h1>
          <p data-hero-copy className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            {description}
          </p>
        </div>

        <div data-hero-img className="relative md:col-span-7 aspect-[4/5] w-full overflow-hidden md:aspect-[4/4.6]">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
            alt={t('hero.imageAlt')}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </div>

      <form data-hero-search onSubmit={submit} className="mx-auto mt-10 max-w-6xl px-5 md:px-8" aria-label={t('hero.searchLabel')}>
        <div className="flex gap-6 border-b border-line pb-3">
          {['buy', 'rent'].map((p) => (
            <button key={p} type="button" aria-pressed={purpose === p} onClick={() => setFilters({ ...filters, purpose: p })}
              className={`text-[12px] tracking-[0.25em] pb-1 transition-colors ${purpose === p ? 'text-ink border-b border-ink' : 'text-stone'}`}>
              {p === 'buy' ? t('hero.buy') : t('hero.rent')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 py-6 md:grid-cols-5">
          <label className="block">
            <span className="block text-[10px] tracking-[0.3em] text-stone">{t('hero.location')}</span>
            <select name="region" defaultValue={filters.region} className="mt-1.5 w-full border-b border-line bg-transparent pb-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none">
              <option value="any">{t('hero.allLebanon')}</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{geoLabel(r.name, lang)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.3em] text-stone">{t('hero.type')}</span>
            <select name="type" defaultValue={filters.type} className="mt-1.5 w-full border-b border-line bg-transparent pb-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none">
              <option value="any">{t('hero.allTypes')}</option>
              {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type, lang)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.3em] text-stone">{t('hero.bedrooms')}</span>
            <select name="beds" defaultValue={filters.beds} className="mt-1.5 w-full border-b border-line bg-transparent pb-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none">
              {BED_OPTIONS.map((b) => <option key={b} value={b}>{b === 'Any' ? t('common.any') : b}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-[0.3em] text-stone">{t('hero.price')}</span>
            <select name="price" defaultValue={filters.price} className="mt-1.5 w-full border-b border-line bg-transparent pb-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none">
              {(purpose === 'buy' ? PRICE_BUY : PRICE_RENT).map((p) => <option key={p} value={p}>{p === 'Any' ? t('common.any') : p}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-ink py-3.5 text-[12px] tracking-[0.25em] text-ivory transition-opacity hover:opacity-85">
              {t('hero.search')}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
