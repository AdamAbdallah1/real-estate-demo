import { useEffect, useRef } from 'react'
import { Button } from './ui'

/** Accessible confirmation dialog for destructive actions. */
export default function ConfirmDialog({
  title = 'Are you sure?',
  body,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCancel?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={body ? 'confirm-body' : undefined}
        className="w-full max-w-md border border-line bg-ivory p-6"
      >
        <h2 id="confirm-title" className="font-serif text-xl text-ink">{title}</h2>
        {body && <p id="confirm-body" className="mt-3 text-[13px] leading-relaxed text-ink-soft">{body}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} onClick={onCancel} className="text-stone">{cancelLabel}</Button>
          <Button variant={danger ? 'primary' : 'outline'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
