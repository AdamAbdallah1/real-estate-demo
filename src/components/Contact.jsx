import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReduced()) return
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true } })
        .fromTo('[data-contact-heading]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' })
        .fromTo('[data-contact-copy]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15)
        .fromTo('[data-contact-cta]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" ref={ref} className="border-t border-line">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
        <h2 data-contact-heading className="font-serif text-3xl md:text-5xl">Looking for the right place?</h2>
        <p data-contact-copy className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Tell us what you're looking for and we'll help you narrow it down.
        </p>
        <div data-contact-cta className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a href="#properties" onClick={(e) => { e.preventDefault(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }) }} className="border border-ink px-8 py-4 text-[12px] tracking-[0.25em] transition-colors hover:bg-ink hover:text-ivory">
            BROWSE PROPERTIES
          </a>
          <a href="https://wa.me/9611000000" target="_blank" rel="noreferrer" className="px-8 py-4 text-[12px] tracking-[0.25em] text-ink-soft underline underline-offset-[10px] transition-colors hover:text-ink">
            TALK TO US
          </a>
        </div>
      </div>
    </section>
  )
}
