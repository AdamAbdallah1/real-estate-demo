import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useT } from '../i18n'

export default function SaveButton({ saved, onToggle, className = '' }) {
  const t = useT()
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      aria-pressed={saved}
      aria-label={saved ? t('card.savedAria') : t('card.saveAria')}
      title={saved ? t('card.saved') : t('card.save')}
      className={`flex items-center gap-1.5 rounded-none bg-ivory/90 px-2 py-1.5 text-[11px] tracking-[0.14em] text-ink transition-colors hover:bg-ivory ${className}`}
    >
      {saved ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
      <span className="hidden sm:inline">{saved ? t('card.saved') : t('card.save')}</span>
    </button>
  )
}
