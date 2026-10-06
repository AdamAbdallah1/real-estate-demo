import { useState } from 'react'
import { Button, EmptyState, ErrorState, LoadingRows } from './ui'
import { cx } from '../lib/cx'

/**
 * One table definition, two presentations:
 *  - a real <table> on md+ (dense, scannable)
 *  - stacked records on small screens (never a squeezed table)
 * Columns marked `primary` appear in the stacked layout.
 */
export default function RecordTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  onRowClick,
  loading,
  error,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyBody,
  emptyAction,
  pageSize = 15,
  label = 'Records',
}) {
  const [page, setPage] = useState(0)

  if (loading) return <LoadingRows />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (!rows.length) return <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />

  const pageCount = Math.ceil(rows.length / pageSize)
  const current = Math.min(page, pageCount - 1)
  const slice = rows.slice(current * pageSize, current * pageSize + pageSize)
  const primary = columns.filter((c) => c.primary)

  return (
    <div>
      {/* Desktop / tablet: table */}
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cx('py-3 pr-4 text-[10px] font-normal tracking-[0.2em] text-stone uppercase', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.map((row) => (
            <tr
              key={rowKey(row)}
              className={cx('border-b border-line align-middle transition-colors', onRowClick && 'cursor-pointer hover:bg-paper')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className={cx('py-3 pr-4 text-[13px] text-ink', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile: stacked records */}
      <ul className="divide-y divide-line border-y border-line md:hidden">
        {slice.map((row) => (
          <li key={rowKey(row)}>
            <button
              type="button"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className="flex w-full flex-col gap-2 py-4 text-left"
            >
              {primary.map((col) => (
                <span key={col.key} className={cx('text-[13px] text-ink', col.mobileClassName)}>
                  {col.render(row)}
                </span>
              ))}
            </button>
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <nav className="flex items-center justify-between py-4" aria-label={`${label} pagination`}>
          <p className="text-[12px] text-stone">
            {rows.length} {rows.length === 1 ? 'record' : 'records'} · page {current + 1} of {pageCount}
          </p>
          <div className="flex gap-2">
            <Button disabled={current === 0} onClick={() => setPage(current - 1)}>PREVIOUS</Button>
            <Button disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>NEXT</Button>
          </div>
        </nav>
      )}
    </div>
  )
}
