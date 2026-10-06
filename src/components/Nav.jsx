import { useEffect, useRef, useState } from 'react'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '../i18n'

gsap.registerPlugin(ScrollTrigger)

/** Labels are translation keys — the action/id stay language-independent. */
const LINKS = [
  { key: 'nav.buy', id: 'buy-path', action: 'buy' },
  { key: 'nav.rent', id: 'rent-path', action: 'rent' },
  { key: 'nav.sell', id: 'sell-path', action: 'sell' },
  { key: 'nav.locations', id: 'locations' },
  { key: 'nav.about', id: 'about' },
]

/**
 * EN / العربية — the current language is the filled one, so the state reads
 * at a glance. It is a pair of buttons rather than a dropdown: no chrome,
 * no hover state, and it works identically on touch.
 */
function LangToggle({ t, lang, setLang }) {
  return (
    <div className="flex items-center" role="group" aria-label={t('nav.toggle')}>
      <button
        type="button"
        lang="en"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`min-h-[44px] px-2 text-[12px] tracking-[0.16em] transition-colors ${lang === 'en' ? 'text-ink underline decoration-line underline-offset-[6px]' : 'text-stone hover:text-ink'}`}
      >
        EN
      </button>
      <span aria-hidden="true" className="text-line">/</span>
      <button
        type="button"
        lang="ar"
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        className={`min-h-[44px] px-2 font-medium transition-colors ${lang === 'ar' ? 'text-ink underline decoration-line underline-offset-[6px]' : 'text-stone hover:text-ink'}`}
      >
        {t('nav.langAr')}
      </button>
    </div>
  )
}

export default function Nav({ onSelectPurpose, purpose, savedCount = 0, onOpenSaved, onOpenSell }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState('')
  const openRef = useRef(false)
  const { t, lang, setLang } = useI18n()

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
      if (link.action === 'sell') {
        onOpenSell?.()
      } else {
        document.getElementById(link.action ? 'properties' : link.id)?.scrollIntoView({ behavior: 'smooth' })
      }
    }, open ? 60 : 0)
  }

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'bg-ivory/90 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'}`}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8" aria-label={t('nav.primary')}>
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="leading-none text-ink" aria-label={t('nav.home')}>
          <span lang="en" className="block font-serif text-xl tracking-[0.22em]">{t('brand.name')}</span>
          <span className="block text-[9px] tracking-[0.5em] text-stone">{t('brand.sub')}</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button key={l.key} onClick={() => go(l)} className={`text-[13px] tracking-wide transition-colors hover:text-ink ${l.id === active ? 'text-ink' : l.action && l.action === purpose ? 'text-ink' : 'text-ink-soft'}`}>
              {t(l.key)}
            </button>
          ))}
          <button onClick={onOpenSaved} className="text-[13px] tracking-wide text-ink-soft transition-colors hover:text-ink">
            {savedCount > 0 ? t('nav.savedCount', { n: savedCount }) : t('nav.saved')}
          </button>
          <LangToggle t={t} lang={lang} setLang={setLang} />
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} className="border border-ink px-4 py-2 text-[12px] tracking-[0.14em] transition-colors hover:bg-ink hover:text-ivory">
            {t('nav.letsTalk')}
          </a>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LangToggle t={t} lang={lang} setLang={setLang} />
          <button className="p-2 text-ink" aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')} onClick={() => setOpen(!open)}>
            {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
          </button>
        </div>
      </nav>
    </header>
    {open && (
      <div className="fixed inset-x-0 bottom-0 top-16 z-[55] flex flex-col bg-ivory px-8 pb-12 pt-10 overflow-y-auto" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
        {LINKS.map((l) => (
          <button key={l.key} onClick={() => go(l)} className="border-b border-line py-5 text-left font-serif text-3xl text-ink">
            {t(l.key)}
          </button>
        ))}
        <button onClick={() => { setOpen(false); onOpenSaved?.() }} className="border-b border-line py-5 text-left font-serif text-3xl text-ink">
          {savedCount > 0 ? t('nav.savedCount', { n: savedCount }) : t('nav.saved')}
        </button>
        <button onClick={() => { setOpen(false); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 60) }} className="mt-8 border border-ink py-4 text-center text-[12px] tracking-[0.2em]">
          {t('nav.letsTalk')}
        </button>
        <p className="mt-auto pb-0 text-[11px] tracking-wide text-stone">{t('nav.beirut')}</p>
      </div>
    )}
    </>
  )
}
