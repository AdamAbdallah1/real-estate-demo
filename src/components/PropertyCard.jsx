import { formatPrice, specLine } from '../data'

export default function PropertyCard({ p, onOpen, large = false }) {
  return (
    <article>
      <button onClick={() => onOpen(p)} className="group block w-full text-left" aria-label={`View ${p.title}, ${p.city}`}>
        <div className={`overflow-hidden ${large ? 'aspect-[16/11]' : 'aspect-[4/3]'}`}>
          <img src={p.images[0]} alt={`${p.title} in ${p.city}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="text-[10px] tracking-[0.35em] text-stone">{p.city.toUpperCase()} · {p.regionLabel.toUpperCase()}</p>
          <p className="font-serif text-lg">{formatPrice(p)}</p>
        </div>
        <h3 className="mt-1.5 font-serif text-xl transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:underline decoration-line underline-offset-4">{p.title}</h3>
        <p className="mt-1 text-[13px] text-ink-soft">{specLine(p)}</p>
        <p className="mt-3 text-[12px] tracking-[0.2em] text-ink">
          VIEW PROPERTY <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">&rarr;</span>
        </p>
      </button>
    </article>
  )
}
