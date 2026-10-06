import { useEffect } from 'react'
import gsap from 'gsap'
import { REGIONS, PROPERTY_TYPES, filterProperties } from '../data'
import PropertyCard from './PropertyCard'
import { prefersReduced } from '../lib/motion'
import { SORTS, matchesQuery, sortProperties } from '../lib/properties'
import { useI18n } from '../i18n'
import { geoLabel, priceLabel, typeLabel } from '../i18n/translations'

const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+']

export default function Results({ properties = [], filters, setFilters, sort, setSort, q, setQ, onOpen, savedIds, toggleSave, compareIds, toggleCompare, compareFull, recentProperties }) {
  const { t, lang, count } = useI18n()
  const results = sortProperties(filterProperties(properties, filters).filter((p) => matchesQuery(p, q)), sort)

  useEffect(() => {
    if (prefersReduced()) return
    const items = document.querySelectorAll('#properties article')
    if (!items.length) return
    gsap.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' })
  }, [filters, sort, q, lang])

  const region = REGIONS.find((r) => r.id === filters.region)
  const countLabel = (() => {
    const base = count(results.length, { one: t('count.property'), many: t('count.properties') })
    if (region && filters.region !== 'any') return `${base} ${t('count.in', { place: geoLabel(region.name, lang) })}`
    if (filters.purpose === 'rent') return `${base} ${t('count.forRent')}`
    if (filters.purpose === 'buy') return `${base} ${t('count.forSale')}`
    return base
  })()

  return (
    <section id="properties" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.4em] text-stone">{t('results.eyebrow')}</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">{t('results.title')}</h2>
        </div>
        <p className="text-[12px] tracking-wide text-stone" role="status" aria-live="polite">{countLabel}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-5">
        <div className="flex gap-4">
          {['any', 'buy', 'rent'].map((v) => (
            <button key={v} onClick={() => setFilters({ ...filters, purpose: v })}
              className={`text-[12px] tracking-[0.2em] pb-1 ${filters.purpose === v ? 'text-ink border-b border-ink' : 'text-stone'}`}>
              {v === 'any' ? t('results.all') : v === 'buy' ? t('results.buy') : t('results.rent')}
            </button>
          ))}
        </div>
        <select aria-label={t('results.filterLocation')} value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          <option value="any">{t('results.allLocations')}</option>
          {REGIONS.map((r) => <option key={r.id} value={r.id}>{geoLabel(r.name, lang)}</option>)}
        </select>
        <select aria-label={t('results.filterType')} value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          <option value="any">{t('results.allTypes')}</option>
          {PROPERTY_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type, lang)}</option>)}
        </select>
        <select aria-label={t('results.filterBeds')} value={filters.beds} onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          {BED_OPTIONS.map((b) => <option key={b} value={b}>{b === 'Any' ? t('results.anyBeds') : b}</option>)}
        </select>
        <select aria-label={t('results.sort')} value={sort} onChange={(e) => setSort(e.target.value)}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{t(`sort.${s.id}`)}</option>)}
        </select>
        {(filters.region !== 'any' || filters.type !== 'any' || filters.beds !== 'Any' || filters.price !== 'Any' || q) && (
          <button onClick={() => { setFilters({ ...filters, region: 'any', type: 'any', beds: 'Any', price: 'Any' }); setQ('') }} className="text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
            {t('results.clear')}
          </button>
        )}
      </div>

      <div className="mt-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('results.searchPlaceholder')}
          aria-label={t('hero.searchLabel')}
          className="w-full border-b border-line bg-transparent pb-2 text-[14px] text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none"
        />
      </div>

      {recentProperties.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] tracking-[0.35em] text-stone">{t('results.recent')}</p>
          <div className="mt-3 flex gap-6 overflow-x-auto pb-2">
            {recentProperties.map((p) => (
              <button key={p.id} onClick={() => onOpen(p)} className="group flex shrink-0 items-center gap-3 text-left">
                <span className="block h-14 w-20 overflow-hidden">
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                </span>
                <span>
                  <span className="block text-[13px] text-ink group-hover:underline decoration-line underline-offset-4">{p.title}</span>
                  <span className="block text-[11px] text-stone">{p.city} · {priceLabel(p, lang)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              onOpen={onOpen}
              saved={savedIds.includes(p.id)}
              onToggleSave={toggleSave}
              compare={compareIds.includes(p.id)}
              onToggleCompare={toggleCompare}
              compareFull={compareFull(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="font-serif text-2xl text-ink">{t('results.emptyTitle')}</h3>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
            {t('results.emptyBody')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => { setFilters({ ...filters, region: 'any', type: 'any', beds: 'Any', price: 'Any' }); setQ('') }}
              className="border border-ink px-8 py-3.5 text-[12px] tracking-[0.25em] transition-colors hover:bg-ink hover:text-ivory">
              {t('results.clearFilters')}
            </button>
            <button onClick={() => setFilters({ ...filters, purpose: 'any', region: 'any', type: 'any', beds: 'Any', price: 'Any' })}
              className="text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
              {t('results.viewAll')}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
