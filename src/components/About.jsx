import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReduced } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger)

const PARAGRAPH =
  "NARA focuses on considered presentation, clear information and direct communication. Every home we represent is seen, described honestly and priced with intent — so the right buyer recognises it, and the wrong one doesn't waste a viewing."

export default function About() {
  const reduced = useState(() => prefersReduced())[0]
  const sectionRef = useRef(null)
  const wordsRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const words = wordsRef.current.querySelectorAll('[data-word]')
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 20%',
          end: () => '+=' + words.length * 42,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      }).fromTo(
        words,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, ease: 'none', duration: 1, stagger: 1 },
        0,
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section ref={sectionRef} id="about" className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
      <p className="text-[11px] tracking-[0.4em] text-stone">APPROACH</p>
      <h2 className="mt-4 font-serif text-3xl leading-snug md:text-[2.6rem]">
        Property should be presented with clarity.
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
        <span className="sr-only">{PARAGRAPH}</span>
        <span ref={wordsRef} aria-hidden="true">
          {reduced
            ? PARAGRAPH
            : PARAGRAPH.split(' ').flatMap((word, i) =>
                i === 0
                  ? [<span key={i} data-word className="inline-block">{word}</span>]
                  : [' ', <span key={i} data-word className="inline-block">{word}</span>],
              )}
        </span>
      </p>
      <p className="mt-10 text-[12px] tracking-[0.3em] text-stone">BEIRUT · LEBANON</p>
    </section>
  )
}
