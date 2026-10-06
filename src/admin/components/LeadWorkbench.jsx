import { useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useConfirm } from '../hooks/useConfirm'
import { errorMessage } from '../../lib/firestore/shared'
import { formatDate, relativeTime } from '../lib/format'
import RecordTable from './RecordTable'
import { Button, PageHeader, SearchInput, Select, StatusPill, Toolbar } from './ui'
import { cx } from '../lib/cx'

/**
 * Shared workbench for request-type collections (inquiries, viewings, seller leads):
 * list → search/filter → detail → status change → contact → delete.
 */
const EMPTY_LIST = []

export default function LeadWorkbench({
  title,
  subtitle,
  subscribe,
  statuses,
  updateStatus,
  remove,
  columns,
  searchFields,
  detailRows,
  emptyTitle,
  emptyBody,
}) {
  const { user } = useAuth()
  const { items, loading, error } = useSubscription(subscribe)
  const [confirmNode, askConfirm] = useConfirm()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('any')
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const rows = items || EMPTY_LIST
  const selected = rows.find((r) => r.id === selectedId) || null

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((item) => {
      if (status !== 'any' && item.status !== status) return false
      if (!needle) return true
      return searchFields.some((field) => String(item[field] || '').toLowerCase().includes(needle))
    })
  }, [rows, q, status, searchFields])

  const changeStatus = async (next) => {
    if (!selected || selected.status === next) return
    setBusy(true)
    try {
      await updateStatus(selected.id, next, user?.uid)
      setFeedback({ tone: 'ok', text: `Marked as ${next}.` })
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
    } finally {
      setBusy(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const removeRecord = async () => {
    if (!selected) return
    const confirmed = await askConfirm({
      title: 'Delete this record?',
      body: 'The record is permanently removed. This cannot be undone.',
      confirmLabel: 'DELETE',
      danger: true,
    })
    if (!confirmed) return
    setBusy(true)
    try {
      await remove(selected.id)
      setSelectedId(null)
      setFeedback({ tone: 'ok', text: 'Record deleted.' })
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
    } finally {
      setBusy(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  if (selected) {
    const rowsForDetail = detailRows(selected)
    return (
      <div className="space-y-6">
        <PageHeader
          title={selected.name || title}
          subtitle={formatDate(selected.createdAt)}
          actions={<Button onClick={() => setSelectedId(null)}>← BACK TO LIST</Button>}
        />

        <dl className="grid grid-cols-1 gap-x-10 gap-y-5 border-y border-line py-6 sm:grid-cols-2">
          {rowsForDetail.map((row) => (
            <div key={row.label} className={cx('min-w-0', row.wide && 'sm:col-span-2')}>
              <dt className="text-[10px] tracking-[0.25em] text-stone">{row.label.toUpperCase()}</dt>
              <dd className="mt-1.5 break-words text-[14px] text-ink">{row.value || '—'}</dd>
              {(row.wa || row.mail || row.href) && (
                <dd className="mt-2 flex flex-wrap gap-4">
                  {row.wa && (
                    <a href={`https://wa.me/${String(row.wa).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                      className="text-[11px] tracking-[0.16em] text-stone underline underline-offset-4 hover:text-ink">
                      OPEN WHATSAPP
                    </a>
                  )}
                  {row.mail && (
                    <a href={`mailto:${row.mail}`} className="text-[11px] tracking-[0.16em] text-stone underline underline-offset-4 hover:text-ink">
                      EMAIL
                    </a>
                  )}
                  {row.href && (
                    <a href={row.href} target="_blank" rel="noreferrer" className="text-[11px] tracking-[0.16em] text-stone underline underline-offset-4 hover:text-ink">
                      {row.hrefLabel || 'OPEN'}
                    </a>
                  )}
                </dd>
              )}
            </div>
          ))}
        </dl>

        <section className="space-y-4" aria-labelledby="status-heading">
          <h2 id="status-heading" className="text-[11px] tracking-[0.3em] text-stone">STATUS</h2>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => changeStatus(s)}
                aria-pressed={selected.status === s}
                className={cx(
                  'border px-3 py-2 text-[12px] transition-colors disabled:opacity-50',
                  selected.status === s ? 'border-ink bg-ink text-ivory' : 'border-line text-ink-soft hover:border-ink hover:text-ink',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-stone">Current: {selected.status}</p>
        </section>

        <div className="border-t border-line pt-6">
          <Button variant="danger" onClick={removeRecord} disabled={busy}>DELETE RECORD</Button>
        </div>

        {feedback && <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>{feedback.text}</p>}
        {confirmNode}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search name, message…" label={`Search ${title.toLowerCase()}`} />
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          STATUS
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto py-2 text-[13px]">
            <option value="any">All</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </label>
        <p className="text-[12px] text-stone md:ml-auto">{filtered.length} shown</p>
      </Toolbar>

      {feedback && <p role="status" aria-live="polite" className="text-[13px] text-stone">{feedback.text}</p>}

      <RecordTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => setSelectedId(row.id)}
        loading={loading && !rows.length}
        error={error && !rows.length ? error : null}
        onRetry={() => window.location.reload()}
        label={title}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
      {confirmNode}
    </div>
  )
}

export function StatusCell({ status }) {
  return <StatusPill status={status} />
}

export function TimeCell({ value }) {
  return <span className="whitespace-nowrap text-stone" title={formatDate(value)}>{relativeTime(value)}</span>
}
