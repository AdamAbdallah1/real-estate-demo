/** Shared UI primitives for the NARA CMS — restrained, typographic, no chrome. */

import { cx } from '../lib/cx'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-[1.75rem] leading-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-stone">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}

const BUTTON_VARIANTS = {
  primary: 'bg-ink text-ivory hover:opacity-90 disabled:opacity-50',
  outline: 'border border-line text-ink hover:border-ink disabled:opacity-50',
  ghost: 'text-stone hover:text-ink disabled:opacity-50',
  danger: 'border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-ivory disabled:opacity-50',
}

export function Button({ variant = 'outline', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] tracking-[0.18em] transition-colors focus-visible:outline-1.5 disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.outline,
        className,
      )}
      {...props}
    />
  )
}

const CONTROL_CLASS =
  'w-full border border-line bg-paper px-3 py-2.5 text-[14px] text-ink placeholder:text-stone/70 transition-colors focus:border-ink focus:outline-none'

export function Input({ className, ...props }) {
  return <input className={cx(CONTROL_CLASS, className)} {...props} />
}

export function Textarea({ className, rows = 4, ...props }) {
  return <textarea rows={rows} className={cx(CONTROL_CLASS, 'leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cx(CONTROL_CLASS, 'appearance-none pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[10px] tracking-[0.25em] text-stone">
        <span>{label.toUpperCase()}{required && <span className="text-ink"> *</span>}</span>
        {hint && <span className="tracking-normal text-stone/70">{hint}</span>}
      </span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-[12px] text-ink">{error}</span>}
    </label>
  )
}

const TONES = {
  new: 'bg-sand text-ink',
  published: 'bg-ink text-ivory',
  draft: 'border border-line text-stone',
  archived: 'border border-line text-stone',
  contacted: 'bg-sand text-ink-soft',
  scheduled: 'bg-ink text-ivory',
  qualified: 'bg-ink text-ivory',
  completed: 'bg-sand text-ink-soft',
  closed: 'border border-line text-stone',
}

export function StatusPill({ status }) {
  if (!status) return null
  return (
    <span className={cx('inline-block px-2 py-1 text-[10px] tracking-[0.16em] uppercase', TONES[status] || TONES.draft)}>
      {status}
    </span>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-xl text-ink">{title}</p>
      {body && <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-stone">{body}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="border border-line bg-paper px-6 py-8">
      <p className="text-[13px] text-ink">{message}</p>
      <div className="mt-4">
        <Button onClick={onRetry}>RETRY</Button>
      </div>
    </div>
  )
}

export function LoadingRows({ rows = 4 }) {
  return (
    <div role="status" aria-live="polite" className="divide-y divide-line border-y border-line">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-1 py-4">
          <div className="h-12 w-16 shrink-0 animate-pulse bg-sand" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse bg-sand" />
            <div className="h-3 w-1/5 animate-pulse bg-sand" />
          </div>
          <div className="h-3 w-16 animate-pulse bg-sand" />
        </div>
      ))}
    </div>
  )
}

export function Toolbar({ children }) {
  return (
    <div className="flex flex-col gap-3 border-y border-line py-4 md:flex-row md:flex-wrap md:items-center md:gap-4">
      {children}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', label = 'Search' }) {
  return (
    <div className="relative w-full md:w-72">
      <label className="sr-only" htmlFor="admin-search">{label}</label>
      <input
        id="admin-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line bg-paper px-3 py-2.5 pl-8 text-[13px] placeholder:text-stone/70 focus:border-ink focus:outline-none"
      />
      <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 stroke-stone" fill="none" strokeWidth="1.5">
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function Feedback({ tone = 'success', children }) {
  if (!children) return null
  return (
    <p role="status" aria-live="polite" className={cx('text-[13px]', tone === 'error' ? 'text-ink' : 'text-stone')}>
      {children}
    </p>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-left disabled:opacity-50"
    >
      <span className={cx('relative block h-4 w-8 border transition-colors', checked ? 'border-ink bg-ink' : 'border-line bg-paper')}>
        <span className={cx('absolute top-0.5 h-2.5 w-2.5 transition-all', checked ? 'left-[18px] bg-ivory' : 'left-0.5 bg-stone')} />
      </span>
      <span className="text-[12px] text-ink">{label}</span>
    </button>
  )
}
