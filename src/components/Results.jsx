import { useEffect } from 'react'
import gsap from 'gsap'
import { REGIONS, PROPERTY_TYPES, PROPERTIES, filterProperties } from '../data'
import PropertyCard from './PropertyCard'
import { prefersReduced } from '../lib/motion'
import { SORTS, matchesQuery, sortProperties } from '../lib/properties'

const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+']

export default function Results({ filters, setFilters, sort, setSort, q, setQ, onOpen, savedIds, toggleSave, compareIds, toggleCompare, compareFull, recentProperties }) {
  const results = sortProperties(filterProperties(PROPERTIES, filters).filter((p) => matchesQuery(p, q)), sort)

  useEffect(() => {
    if (prefersReduced()) return
    const items = document.querySelectorAll('#properties article')
    if (!items.length) return
    gsap.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' })
  }, [filters, sort, q])

  const region = REGIONS.find((r) => r.id === filters.region)
  const countLabel = (() => {
    const n = results.length
    const base = n === 1 ? '1 property' : `${n} properties`
    if (region && filters.region !== 'any') return `${base} in ${region.name}`
    if (filters.purpose === 'rent') return `${base} for rent`
    if (filters.purpose === 'buy') return `${base} for sale`
    return base
  })()

  return (
    <section id="properties" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.4em] text-stone">COLLECTION</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Properties</h2>
        </div>
        <p className="text-[12px] tracking-wide text-stone" role="status" aria-live="polite">{countLabel}</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-5">
        <div className="flex gap-4">
          {['any', 'buy', 'rent'].map((v) => (
            <button key={v} onClick={() => setFilters({ ...filters, purpose: v })}
              className={`text-[12px] tracking-[0.2em] pb-1 ${filters.purpose === v ? 'text-ink border-b border-ink' : 'text-stone'}`}>
              {v === 'any' ? 'ALL' : v.toUpperCase()}
            </button>
          ))}
        </div>
        <select aria-label="Filter by location" value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          <option value="any">All locations</option>
          {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select aria-label="Filter by type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          <option value="any">All types</option>
          {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select aria-label="Filter by bedrooms" value={filters.beds} onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          {BED_OPTIONS.map((b) => <option key={b}>{b === 'Any' ? 'Any beds' : b}</option>)}
        </select>
        <select aria-label="Sort properties" value={sort} onChange={(e) => setSort(e.target.value)}
          className="border-b border-line bg-transparent pb-1 text-[13px] focus:outline-none">
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        {(filters.region !== 'any' || filters.type !== 'any' || filters.beds !== 'Any' || filters.price !== 'Any' || q) && (
          <button onClick={() => { setFilters({ ...filters, region: 'any', type: 'any', beds: 'Any', price: 'Any' }); setQ('') }} className="text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
            CLEAR
          </button>
        )}
      </div>

      <div className="mt-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location, type or feature…"
          aria-label="Search properties"
          className="w-full border-b border-line bg-transparent pb-2 text-[14px] text-ink placeholder:text-stone/70 focus:border-ink focus:outline-none"
        />
      </div>

      {recentProperties.length > 0 && (
        <div className="mt-8">
          <p className="text-[10px] tracking-[0.35em] text-stone">RECENTLY VIEWED</p>
          <div className="mt-3 flex gap-6 overflow-x-auto pb-2">
            {recentProperties.map((p) => (
              <button key={p.id} onClick={() => onOpen(p)} className="group flex shrink-0 items-center gap-3 text-left">
                <span className="block h-14 w-20 overflow-hidden">
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                </span>
                <span>
                  <span className="block text-[13px] text-ink group-hover:underline decoration-line underline-offset-4">{p.title}</span>
                  <span className="block text-[11px] text-stone">{p.city} · ${p.price.toLocaleString('en-US')}{p.perMonth ? ' / month' : ''}</span>
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
          <h3 className="font-serif text-2xl text-ink">Nothing matches those filters</h3>
          <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
            The current search is too narrow. Try widening a filter or two, or start from the full collection.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => { setFilters({ ...filters, region: 'any', type: 'any', beds: 'Any', price: 'Any' }); setQ('') }}
              className="border border-ink px-8 py-3.5 text-[12px] tracking-[0.25em] transition-colors hover:bg-ink hover:text-ivory">
              CLEAR FILTERS
            </button>
            <button onClick={() => setFilters({ ...filters, purpose: 'any', region: 'any', type: 'any', beds: 'Any', price: 'Any' })}
              className="text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
              VIEW ALL PROPERTIES
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
