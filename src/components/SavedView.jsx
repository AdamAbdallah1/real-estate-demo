import { useEffect } from 'react'
import { HiX } from 'react-icons/hi'
import PropertyCard from './PropertyCard'
import { useI18n } from '../i18n'

export default function SavedView({ onClose, saved, onOpen, onToggleSave, onBrowse }) {
  const { t, count } = useI18n()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const label = count(saved.length, { one: t('count.property'), many: t('count.properties') })

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ivory" role="dialog" aria-modal="true" aria-label={t('saved.aria')}>
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8">
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.4em] text-stone">{t('saved.eyebrow')}</p>
          <button onClick={onClose} aria-label={t('saved.close')} className="p-2 -me-2 text-ink"><HiX size={22} /></button>
        </div>

        {saved.length === 0 ? (
          <div className="py-28 text-center">
            <h2 className="font-serif text-3xl">{t('saved.emptyTitle')}</h2>
            <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-ink-soft">
              {t('saved.emptyBody')}
            </p>
            <button onClick={onBrowse} className="mt-8 border border-ink px-8 py-3.5 text-[12px] tracking-[0.25em] transition-colors hover:bg-ink hover:text-ivory">
              {t('saved.browse')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              {t('saved.countTitle', { n: saved.length, label, count: label })}
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((p) => (
                <PropertyCard key={p.id} p={p} onOpen={onOpen} saved onToggleSave={onToggleSave} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
