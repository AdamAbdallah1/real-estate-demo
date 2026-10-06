import { useEffect } from 'react'
import gsap from 'gsap'
import { REGIONS, PROPERTY_TYPES, PROPERTIES, filterProperties } from '../data'
import PropertyCard from './PropertyCard'
import { prefersReduced } from '../lib/motion'

const BED_OPTIONS = ['Any', '1+', '2+', '3+', '4+']

export default function Results({ filters, setFilters, onOpen }) {
  const results = filterProperties(PROPERTIES, filters)

  useEffect(() => {
    if (prefersReduced()) return
    const items = document.querySelectorAll('#properties article')
    if (!items.length) return
    gsap.fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' })
  }, [filters])

  return (
    <section id="properties" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.4em] text-stone">COLLECTION</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">Properties</h2>
        </div>
        <p className="text-[12px] tracking-wide text-stone">{results.length} result{results.length === 1 ? '' : 's'}</p>
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
        {(filters.region !== 'any' || filters.type !== 'any' || filters.beds !== 'Any' || filters.price !== 'Any') && (
          <button onClick={() => setFilters({ ...filters, region: 'any', type: 'any', beds: 'Any', price: 'Any' })} className="text-[12px] tracking-[0.2em] text-stone underline underline-offset-4">
            CLEAR
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => <PropertyCard key={p.id} p={p} onOpen={onOpen} />)}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-stone">No properties match these filters. Try widening the search.</p>
      )}
    </section>
  )
}
