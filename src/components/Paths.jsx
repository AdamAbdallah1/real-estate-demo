import { useState } from 'react'
import { useI18n } from '../i18n'

/** Ids and actions are content-independent; only the copy is translated. */
const PATHS = [
  { id: 'buy-path', tagKey: 'paths.buyTag', headKey: 'paths.buyHead', action: 'buy' },
  { id: 'rent-path', tagKey: 'paths.rentTag', headKey: 'paths.rentHead', action: 'rent' },
  { id: 'sell-path', tagKey: 'paths.sellTag', headKey: 'paths.sellHead', action: 'sell' },
]

export default function Paths({ onSelectPurpose, onOpenSell }) {
  const [hovered, setHovered] = useState(null)
  const { t } = useI18n()

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
          className={`group block w-full border-b border-line py-10 text-start transition-opacity duration-500 first:border-t ${hovered && hovered !== p.id ? 'opacity-45' : 'opacity-100'}`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-16">
            <span className="text-[11px] tracking-[0.4em] text-stone md:w-24">{t(p.tagKey)}</span>
            <h3 className="nudge font-serif text-2xl md:text-4xl md:flex-1 transition-transform duration-300 ease-out" style={{ '--nudge': '12px' }}>{t(p.headKey)}</h3>
            <span className="arrow-mark text-[13px] tracking-[0.2em] text-stone transition-colors duration-300 ease-out group-hover:text-ink group-focus-visible:text-ink">&rarr;</span>
          </div>
        </button>
      ))}
    </section>
  )
}
