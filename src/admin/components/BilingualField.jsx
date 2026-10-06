import { Field, Input, Textarea } from './ui'
import { sideOf } from '../lib/i18n'

/**
 * A translatable settings field: one clearly labelled English block and one
 * clearly labelled Arabic block, edited independently.
 *
 * The value stays a plain string while only English is filled (that is also the
 * storage shape) and becomes `{en, ar}` as soon as Arabic exists — so an empty
 * Arabic side never bloats or overwrites an existing document.
 */
export default function BilingualField({
  label, required, hint, error, arError, rows, value, onChange,
  enPlaceholder, arPlaceholder,
}) {
  const set = (side, next) => {
    const other = sideOf(value, side === 'en' ? 'ar' : 'en')
    const current = sideOf(value, side)
    if (side === 'en') onChange(other ? { en: next, ar: other } : next)
    else onChange(next ? { en: current, ar: next } : current)
  }

  const control = (side) => {
    const shared = {
      value: sideOf(value, side),
      onChange: (e) => set(side, e.target.value),
    }
    if (rows) {
      return (
        <Textarea
          rows={rows}
          placeholder={side === 'en' ? enPlaceholder : arPlaceholder}
          aria-label={side === 'en' ? `${label} (English)` : `${label} (Arabic)`}
          {...(side === 'ar' ? { dir: 'rtl', lang: 'ar', className: 'text-end' } : {})}
          {...shared}
        />
      )
    }
    return (
      <Input
        placeholder={side === 'en' ? enPlaceholder : arPlaceholder}
        aria-label={side === 'en' ? `${label} (English)` : `${label} (Arabic)`}
        {...(side === 'ar' ? { dir: 'rtl', lang: 'ar', className: 'text-end' } : {})}
        {...shared}
      />
    )
  }

  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <div className="space-y-3">
        <div>
          <span className="mb-1 block text-[10px] tracking-[0.25em] text-stone">ENGLISH</span>
          {control('en')}
        </div>
        <div dir="rtl" lang="ar">
          <span className="mb-1 block text-[10px] tracking-normal text-stone">العربية</span>
          {control('ar')}
        </div>
      </div>
      {arError && <p role="alert" className="mt-1 text-[12px] text-stone">{arError}</p>}
    </Field>
  )
}
