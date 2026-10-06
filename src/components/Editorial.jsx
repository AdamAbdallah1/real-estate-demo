import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function Editorial({ onFilterRegion }) {
  const reduced = useState(() => prefersReduced())[0]
  const sectionRef = useRef(null)

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
        <img data-editorial-img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80" alt="Batroun coastline, Lebanon" loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/25" />
        <div data-editorial-copy className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-16">
          <p className="text-[11px] tracking-[0.4em] text-ivory/80">BATROUN · LEBANON</p>
          <h2 className="mt-3 font-serif text-4xl text-ivory md:text-6xl">Life by the coast</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ivory/85">
            Old stone walls, a harbour of wooden boats, and a rhythm set by the sea. Batroun asks for a slower kind of ownership.
          </p>
          <button onClick={() => onFilterRegion('coast')} className="mt-6 border border-ivory/70 px-6 py-3 text-[12px] tracking-[0.25em] text-ivory transition-colors hover:bg-ivory hover:text-ink">
            EXPLORE BATROUN
          </button>
        </div>
      </div>
    </section>
  )
}
