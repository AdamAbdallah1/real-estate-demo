import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROPERTIES, formatPrice, specLine } from '../data'
import { prefersReduced } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function Latest({ onOpen }) {
  const ref = useRef(null)
  const latest = PROPERTIES.filter((p) => p.latest)
  const [big, ...rest] = latest

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('[data-latest-item]')
      items.forEach((item, i) => {
        gsap.fromTo(
          item.querySelector('[data-latest-media]'),
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power2.out', delay: i * 0.12, scrollTrigger: { trigger: item, start: 'top 85%', once: true } },
        )
        gsap.fromTo(
          item.querySelector('img'),
          { scale: 1.03 },
          { scale: 1, duration: 1.3, ease: 'power2.out', delay: i * 0.12, scrollTrigger: { trigger: item, start: 'top 85%', once: true } },
        )
        gsap.fromTo(
          item.querySelector('[data-latest-meta]'),
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, delay: 0.1 + i * 0.12, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } },
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="latest" className="mx-auto max-w-6xl px-5 py-20 md:px-8">
      <p className="text-[11px] tracking-[0.4em] text-stone" data-reveal>NEW</p>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl" data-reveal>Latest properties</h2>
      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12">
        <div className="md:col-span-7" data-latest-item>
          <LatestCard p={big} onOpen={onOpen} large />
        </div>
        <div className="flex flex-col gap-14 md:col-span-5">
          {rest.slice(0, 2).map((p) => (
            <div key={p.id} data-latest-item>
              <LatestCard p={p} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LatestCard({ p, onOpen, large }) {
  return (
    <article>
      <button onClick={() => onOpen(p)} className="group block w-full text-left" aria-label={`View ${p.title}, ${p.city}`}>
        <div data-latest-media className={`overflow-hidden ${large ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
          <img src={p.images[0]} alt={`${p.title} in ${p.city}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        </div>
        <div data-latest-meta>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="text-[10px] tracking-[0.35em] text-stone">{p.city.toUpperCase()} · {p.regionLabel.toUpperCase()}</p>
            <p className="font-serif text-lg">{formatPrice(p)}</p>
          </div>
          <h3 className="mt-1.5 font-serif text-xl transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:underline decoration-line underline-offset-4">{p.title}</h3>
          <p className="mt-1 text-[13px] text-ink-soft">{specLine(p)}</p>
          <p className="mt-3 text-[12px] tracking-[0.2em] text-ink">
            VIEW PROPERTY <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">&rarr;</span>
          </p>
        </div>
      </button>
    </article>
  )
}
