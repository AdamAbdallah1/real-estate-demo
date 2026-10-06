import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Results from './components/Results'
import Featured from './components/Featured'
import Locations from './components/Locations'
import Paths from './components/Paths'
import Editorial from './components/Editorial'
import About from './components/About'
import Latest from './components/Latest'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Detail from './components/Detail'
import SavedView from './components/SavedView'
import SellModal from './components/SellModal'
import CompareTray from './components/CompareTray'
import { PROPERTIES } from './data'
import { readStorage, writeStorage } from './hooks/useLocalStorage'
import { prefersReduced } from './lib/motion'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_FILTERS = { purpose: 'buy', region: 'any', type: 'any', beds: 'Any', price: 'Any' }

function readUrlState() {
  const params = new URLSearchParams(window.location.search)
  const filters = { ...DEFAULT_FILTERS }
  if (params.has('purpose')) filters.purpose = params.get('purpose')
  if (params.has('region')) filters.region = params.get('region')
  if (params.has('type')) filters.type = params.get('type')
  if (params.has('beds')) filters.beds = params.get('beds')
  if (params.has('price')) filters.price = params.get('price')
  return {
    filters,
    sort: params.get('sort') || 'recommended',
    q: params.get('q') || '',
    propertyId: params.get('property') || null,
  }
}

export default function App() {
  // Lazy-initialize from the URL exactly once, without touching refs during render
  const [initialState] = useState(readUrlState)
  const [filters, setFilters] = useState(initialState.filters)
  const [sort, setSort] = useState(initialState.sort)
  const [q, setQ] = useState(initialState.q)
  const [selected, setSelected] = useState(
    initialState.propertyId ? PROPERTIES.find((p) => p.id === initialState.propertyId) || null : null,
  )
  const [savedOpen, setSavedOpen] = useState(false)
  const [sellOpen, setSellOpen] = useState(false)
  const [savedIds, setSavedIds] = useState(() => readStorage('nara:saved', []))
  const [recentIds, setRecentIds] = useState(() => readStorage('nara:recent', []))
  const [compareIds, setCompareIds] = useState(() => readStorage('nara:compare', []))
  const pushedRef = useRef(false)

  useEffect(() => { writeStorage('nara:saved', savedIds) }, [savedIds])
  useEffect(() => { writeStorage('nara:recent', recentIds) }, [recentIds])
  useEffect(() => { writeStorage('nara:compare', compareIds) }, [compareIds])

  // Persist browsing context + keep URL search params in sync
  useEffect(() => {
    writeStorage('nara:filters', { filters, sort, q })
    const params = new URLSearchParams()
    if (filters.purpose !== 'any') params.set('purpose', filters.purpose)
    if (filters.region !== 'any') params.set('region', filters.region)
    if (filters.type !== 'any') params.set('type', filters.type)
    if (filters.beds !== 'Any') params.set('beds', filters.beds)
    if (filters.price !== 'Any') params.set('price', filters.price)
    if (sort !== 'recommended') params.set('sort', sort)
    if (q) params.set('q', q)
    if (selected) params.set('property', selected.id)
    const search = params.toString()
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname)
  }, [filters, sort, q, selected])

  useEffect(() => {
    const onPop = () => {
      const s = readUrlState()
      setFilters(s.filters)
      setSort(s.sort)
      setQ(s.q)
      setSelected(s.propertyId ? PROPERTIES.find((p) => p.id === s.propertyId) || null : null)
      pushedRef.current = false
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (prefersReduced()) return
    const els = gsap.utils.toArray('[data-reveal]')
    els.forEach((el) => {
      gsap.fromTo(el, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      })
    })
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const selectPurpose = (p) => setFilters((f) => ({ ...f, purpose: p }))
  const filterRegion = (region) => {
    setFilters((f) => ({ ...f, region }))
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
  }

  const openDetail = useCallback((p) => {
    setRecentIds((ids) => [p.id, ...ids.filter((id) => id !== p.id)].slice(0, 5))
    setSelected(p)
    setSavedOpen(false)
    const params = new URLSearchParams(window.location.search)
    params.set('property', p.id)
    window.history.pushState(null, '', `?${params.toString()}`)
    pushedRef.current = true
    window.scrollTo(0, 0)
  }, [])

  const closeDetail = useCallback(() => {
    setSelected(null)
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    }
  }, [])

  const toggleSave = useCallback((id) => {
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }, [])

  const toggleCompare = useCallback((id) => {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id)
      if (ids.length >= 3) return ids
      return [...ids, id]
    })
  }, [])

  const compareFull = (id) => compareIds.length >= 3 && !compareIds.includes(id)
  const savedProperties = useMemo(() => savedIds.map((id) => PROPERTIES.find((p) => p.id === id)).filter(Boolean), [savedIds])
  const recentProperties = useMemo(() => recentIds.map((id) => PROPERTIES.find((p) => p.id === id)).filter(Boolean), [recentIds])
  const compareOnes = useMemo(() => compareIds.map((id) => PROPERTIES.find((p) => p.id === id)).filter(Boolean), [compareIds])

  return (
    <main>
      <Nav onSelectPurpose={selectPurpose} purpose={filters.purpose} savedCount={savedIds.length} onOpenSaved={() => setSavedOpen(true)} onOpenSell={() => setSellOpen(true)} />
      <Hero filters={filters} setFilters={setFilters} />
      <Results
        filters={filters}
        setFilters={setFilters}
        sort={sort}
        setSort={setSort}
        q={q}
        setQ={setQ}
        onOpen={openDetail}
        savedIds={savedIds}
        toggleSave={toggleSave}
        compareIds={compareIds}
        toggleCompare={toggleCompare}
        compareFull={compareFull}
        recentProperties={recentProperties}
      />
      <Featured onOpen={openDetail} savedIds={savedIds} toggleSave={toggleSave} compareIds={compareIds} toggleCompare={toggleCompare} compareFull={compareFull} />
      <Locations onFilterRegion={filterRegion} />
      <Paths onSelectPurpose={selectPurpose} onOpenSell={() => setSellOpen(true)} />
      <Editorial onFilterRegion={filterRegion} />
      <About />
      <Latest onOpen={openDetail} savedIds={savedIds} toggleSave={toggleSave} compareIds={compareIds} toggleCompare={toggleCompare} compareFull={compareFull} />
      <Contact />
      <Footer />

      {selected && (
        <Detail
          key={selected.id}
          p={selected}
          onClose={closeDetail}
          saved={savedIds.includes(selected.id)}
          onToggleSave={() => toggleSave(selected.id)}
          compare={compareIds.includes(selected.id)}
          onToggleCompare={() => toggleCompare(selected.id)}
          compareFull={compareFull(selected.id)}
          onOpen={openDetail}
        />
      )}

      {savedOpen && <SavedView onClose={() => setSavedOpen(false)} saved={savedProperties} onOpen={openDetail} onToggleSave={toggleSave} onBrowse={() => { setSavedOpen(false); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }) }} />}

      {sellOpen && <SellModal onClose={() => setSellOpen(false)} />}

      <CompareTray properties={compareOnes} onRemove={toggleCompare} onClear={() => setCompareIds([])} />
    </main>
  )
}
