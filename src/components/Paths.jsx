import { useState } from 'react'

const PATHS = [
  { id: 'buy-path', tag: 'BUY', head: 'Find a home that fits the way you live.', action: 'buy' },
  { id: 'rent-path', tag: 'RENT', head: 'Explore homes across the city, coast and mountains.', action: 'rent' },
  { id: 'sell-path', tag: 'SELL', head: 'Present your property properly and reach the right buyers.', action: 'sell' },
]

export default function Paths({ onSelectPurpose, onOpenSell }) {
  const [hovered, setHovered] = useState(null)

  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8">
      {PATHS.map((p) => (
        <button
          key={p.id}
          id={p.id}
          onClick={() => {
            if (p.action === 'buy' || p.action === 'rent') onSelectPurpose(p.action)
            if (p.action === 'sell') {
              onOpenSell?.()
            } else {
              document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          onMouseEnter={() => setHovered(p.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(p.id)}
          onBlur={() => setHovered(null)}
          data-reveal
          className={`group block w-full border-b border-line py-10 text-left transition-opacity duration-500 first:border-t ${hovered && hovered !== p.id ? 'opacity-45' : 'opacity-100'}`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-16">
            <span className="text-[11px] tracking-[0.4em] text-stone md:w-24">{p.tag}</span>
            <h3 className="font-serif text-2xl md:text-4xl md:flex-1 transition-transform duration-300 ease-out group-hover:translate-x-3 group-focus-visible:translate-x-3">{p.head}</h3>
            <span className="text-[13px] tracking-[0.2em] text-stone transition-all duration-300 ease-out group-hover:text-ink group-hover:translate-x-1.5 group-focus-visible:text-ink group-focus-visible:translate-x-1.5">&rarr;</span>
          </div>
        </button>
      ))}
    </section>
  )
}
