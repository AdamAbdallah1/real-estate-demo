import { FaHeart, FaRegHeart } from 'react-icons/fa'

export default function SaveButton({ saved, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved properties' : 'Save property'}
      title={saved ? 'Saved' : 'Save'}
      className={`flex items-center gap-1.5 rounded-none bg-ivory/90 px-2 py-1.5 text-[11px] tracking-[0.14em] text-ink transition-colors hover:bg-ivory ${className}`}
    >
      {saved ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
      <span className="hidden sm:inline">{saved ? 'SAVED' : 'SAVE'}</span>
    </button>
  )
}
