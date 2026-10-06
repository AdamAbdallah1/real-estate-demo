/** Loading state while the CMS chunk is fetched (or a route resolves). */
import { useT } from '../i18n'

export default function RouteFallback() {
  const t = useT()
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-6" role="status" aria-live="polite">
      <div className="text-center">
        <p lang="en" className="font-serif text-2xl tracking-[0.22em] text-ink">NARA</p>
        <p className="mt-3 text-[11px] tracking-[0.35em] text-stone">{t('state.loading').toUpperCase()}</p>
      </div>
    </div>
  )
}
