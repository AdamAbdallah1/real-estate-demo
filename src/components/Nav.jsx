import { useEffect, useRef, useState } from 'react'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'Buy', id: 'buy-path', action: 'buy' },
  { label: 'Rent', id: 'rent-path', action: 'rent' },
  { label: 'Sell', id: 'sell-path' },
  { label: 'Locations', id: 'locations' },
  { label: 'About', id: 'about' },
]

export default function Nav({ onSelectPurpose, purpose }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState('')
  const openRef = useRef(false)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        setHidden(self.direction === 1 && window.scrollY > 480 && !openRef.current)
      },
    })
    const watchers = ['locations', 'about'].map((id) =>
      ScrollTrigger.create({
        trigger: '#' + id,
        start: 'top 45%',
        end: 'bottom 45%',
        onEnter: () => setActive(id),
        onEnterBack: () => setActive(id),
      }),
    )
    return () => {
      st.kill()
      watchers.forEach((w) => w.kill())
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (link) => {
    setOpen(false)
    if (link.action === 'buy' || link.action === 'rent') onSelectPurpose(link.action)
    setTimeout(() => {
      document.getElementById(link.action ? (link.action === 'sell' ? 'sell-path' : 'properties') : link.id)?.scrollIntoView({ behavior: 'smooth' })
    }, open ? 60 : 0)
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'bg-ivory/90 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8" aria-label="Primary">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="leading-none text-ink" aria-label="NARA Real Estate — home">
          <span className="block font-serif text-xl tracking-[0.22em]">NARA</span>
          <span className="block text-[9px] tracking-[0.5em] text-stone">REAL ESTATE</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l)} className={`text-[13px] tracking-wide transition-colors hover:text-ink ${l.id === active ? 'text-ink' : l.action && l.action === purpose ? 'text-ink' : 'text-ink-soft'}`}>
              {l.label}
            </button>
          ))}
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} className="border border-ink px-4 py-2 text-[12px] tracking-[0.14em] transition-colors hover:bg-ink hover:text-ivory">
            LET'S TALK
          </a>
        </div>

        <button className="md:hidden p-2 text-ink" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 top-16 z-40 flex flex-col bg-ivory px-8 pt-10" role="dialog" aria-modal="true" aria-label="Menu">
          {LINKS.map((l) => (
            <button key={l.label} onClick={() => go(l)} className="border-b border-line py-5 text-left font-serif text-3xl text-ink">
              {l.label}
            </button>
          ))}
          <button onClick={() => { setOpen(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 60) }} className="mt-8 border border-ink py-4 text-center text-[12px] tracking-[0.2em]">
            LET'S TALK
          </button>
          <p className="mt-auto pb-10 text-[11px] tracking-wide text-stone">Beirut, Lebanon</p>
        </div>
      )}
    </header>
  )
}
