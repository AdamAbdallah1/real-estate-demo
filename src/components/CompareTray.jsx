import { useEffect, useState } from 'react'
import { HiX } from 'react-icons/hi'
import { priceLabel, typeLabel } from '../i18n/translations'
import { useI18n } from '../i18n'

export default function CompareTray({ properties, onRemove, onClear }) {
  const [open, setOpen] = useState(false)
  const { t, lang } = useI18n()
  const visible = properties.length > 0
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Derive: if the tray empties, close the comparison dialog without setState-in-effect
  const dialogOpen = open && visible

  // Same scroll lock as the other full-screen overlays (nav, detail, sell,
  // saved) so the page behind the comparison table cannot scroll away.
  useEffect(() => {
    if (!dialogOpen) return undefined
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [dialogOpen])

  if (!visible) return null

  /**
   * Row identity is a stable key so labels can be translated without losing
   * the row structure (and the table keeps working in both languages).
   */
  const rows = [
    { key: 'price', value: (p) => priceLabel(p, lang) },
    { key: 'location', value: (p) => `${p.city}, ${p.regionLabel}` },
    { key: 'purpose', value: (p) => (p.purpose === 'buy' ? t('compare.forSale') : t('compare.forRent')) },
    { key: 'type', value: (p) => typeLabel(p.type, lang) },
    { key: 'area', value: (p) => `${p.surface} ${lang === 'ar' ? 'م²' : 'm²'}` },
    { key: 'bedrooms', value: (p) => (p.beds > 0 ? p.beds : '—') },
    { key: 'bathrooms', value: (p) => (p.baths > 0 ? p.baths : '—') },
    { key: 'parking', value: (p) => (p.parking > 0 ? p.parking : '—') },
  ]

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 backdrop-blur-md" role="complementary" aria-label={t('compare.aria')}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto px-5 py-3 md:px-8">
          <p className="shrink-0 text-[10px] tracking-[0.3em] text-stone">{t('compare.trayCount', { n: properties.length })}</p>
          <div className="flex shrink-0 items-center gap-3">
            {properties.map((p) => (
              <div key={p.id} className="flex items-center gap-2 border border-line bg-paper px-3 py-1.5">
                <span className="max-w-[9rem] truncate text-[12px] text-ink">{p.title} · {p.city}</span>
                <button onClick={() => onRemove(p.id)} aria-label={t('compare.remove', { title: p.title })} className="tray-x text-stone hover:text-ink"><HiX size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="ms-auto shrink-0 border border-ink px-5 py-2 text-[11px] tracking-[0.2em] transition-colors hover:bg-ink hover:text-ivory">
            {t('compare.open')}
          </button>
          <button onClick={onClear} className="shrink-0 text-[11px] tracking-[0.2em] text-stone underline underline-offset-4">
            {t('compare.clear')}
          </button>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label={t('compare.dialogAria')}>
          <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
            <div className="flex items-start justify-between">
              <p className="text-[11px] tracking-[0.4em] text-stone">{t('compare.eyebrow')}</p>
              <button onClick={() => setOpen(false)} aria-label={t('compare.close')} className="p-2 -me-2 text-ink"><HiX size={22} /></button>
            </div>
            <h2 className="mt-6 font-serif text-3xl">{t('compare.title')}</h2>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-start">
                <thead>
                  <tr>
                    <th className="w-36 border-b border-line py-3 text-[10px] tracking-[0.3em] text-stone"></th>
                    {properties.map((p) => (
                      <th key={p.id} className="border-b border-line px-4 py-3 align-top">
                        <span className="block h-24 w-full overflow-hidden">
                          <img src={p.images[0]} alt={t('card.imageAlt', { title: p.title, city: p.city })} className="h-full w-full object-cover" />
                        </span>
                        <span className="mt-3 block font-serif text-lg text-ink">{p.title}</span>
                        <span className="mt-1 block text-[11px] tracking-[0.2em] text-stone">{p.city.toUpperCase()}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {rows.map(({ key, value }) => (
                    <tr key={key} className="border-b border-line">
                      <td className="py-3 text-[10px] tracking-[0.3em] text-stone">{t(`compare.${key}`).toUpperCase()}</td>
                      {properties.map((p) => (
                        <td key={p.id} className="px-4 py-3 text-ink">{value(p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-stone">{t('compare.concept')}</p>
          </div>
        </div>
      )}
    </>
  )
}
