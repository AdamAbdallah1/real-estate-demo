import { useEffect, useState } from 'react'
import { HiX } from 'react-icons/hi'
import { formatPrice } from '../data'

export default function CompareTray({ properties, onRemove, onClear }) {
  const [open, setOpen] = useState(false)
  const visible = properties.length > 0
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Derive: if the tray empties, close the comparison dialog without setState-in-effect
  const dialogOpen = open && visible
  if (!visible) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 backdrop-blur-md" role="complementary" aria-label="Compare properties">
        <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-5 py-3 md:px-8">
          <p className="shrink-0 text-[10px] tracking-[0.3em] text-stone">COMPARE ({properties.length}/3)</p>
          <div className="flex shrink-0 items-center gap-3">
            {properties.map((p) => (
              <div key={p.id} className="flex items-center gap-2 border border-line bg-paper px-3 py-1.5">
                <span className="max-w-[9rem] truncate text-[12px] text-ink">{p.title} · {p.city}</span>
                <button onClick={() => onRemove(p.id)} aria-label={`Remove ${p.title} from comparison`} className="text-stone hover:text-ink"><HiX size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="ml-auto shrink-0 border border-ink px-5 py-2 text-[11px] tracking-[0.2em] transition-colors hover:bg-ink hover:text-ivory">
            COMPARE
          </button>
          <button onClick={onClear} className="shrink-0 text-[11px] tracking-[0.2em] text-stone underline underline-offset-4">
            CLEAR
          </button>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label="Property comparison">
          <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
            <div className="flex items-start justify-between">
              <p className="text-[11px] tracking-[0.4em] text-stone">COMPARISON</p>
              <button onClick={() => setOpen(false)} aria-label="Close comparison" className="p-2 -mr-2 text-ink"><HiX size={22} /></button>
            </div>
            <h2 className="mt-6 font-serif text-3xl">Compare properties</h2>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="w-36 border-b border-line py-3 text-[10px] tracking-[0.3em] text-stone"></th>
                    {properties.map((p) => (
                      <th key={p.id} className="border-b border-line px-4 py-3 align-top">
                        <span className="block h-24 w-full overflow-hidden">
                          <img src={p.images[0]} alt={`${p.title} in ${p.city}`} className="h-full w-full object-cover" />
                        </span>
                        <span className="mt-3 block font-serif text-lg text-ink">{p.title}</span>
                        <span className="mt-1 block text-[11px] tracking-[0.2em] text-stone">{p.city.toUpperCase()}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {[
                    ['Price', (p) => formatPrice(p)],
                    ['Location', (p) => `${p.city}, ${p.regionLabel}`],
                    ['Purpose', (p) => (p.purpose === 'buy' ? 'For sale' : 'For rent')],
                    ['Type', (p) => p.type],
                    ['Area', (p) => `${p.surface} m²`],
                    ['Bedrooms', (p) => (p.beds > 0 ? p.beds : '—')],
                    ['Bathrooms', (p) => (p.baths > 0 ? p.baths : '—')],
                    ['Parking', (p) => (p.parking > 0 ? p.parking : '—')],
                  ].map(([label, fn]) => (
                    <tr key={label} className="border-b border-line">
                      <td className="py-3 text-[10px] tracking-[0.3em] text-stone">{label.toUpperCase()}</td>
                      {properties.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-ink">{fn(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-stone">Concept website · Property details shown for demonstration.</p>
          </div>
        </div>
      )}
    </>
  )
}
