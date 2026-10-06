import { useEffect, useState } from 'react'
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
import { prefersReduced } from './lib/motion'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_FILTERS = { purpose: 'buy', region: 'any', type: 'any', beds: 'Any', price: 'Any' }

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)

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

  return (
    <main>
      <Nav onSelectPurpose={selectPurpose} purpose={filters.purpose} />
      <Hero filters={filters} setFilters={setFilters} />
      <Results filters={filters} setFilters={setFilters} onOpen={setSelected} />
      <Featured onOpen={setSelected} />
      <Locations onFilterRegion={filterRegion} />
      <Paths onSelectPurpose={selectPurpose} />
      <Editorial onFilterRegion={filterRegion} />
      <About />
      <Latest onOpen={setSelected} />
      <Contact />
      <Footer />
      {selected && <Detail key={selected.id} p={selected} onClose={() => setSelected(null)} />}
    </main>
  )
}
