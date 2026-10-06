import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useConfirm } from '../hooks/useConfirm'
import {
  deleteProperty, setPropertyFeatured, setPropertyStatus, subscribeAdminProperties,
} from '../../lib/firestore/properties'
import { REGIONS, PROPERTY_TYPES } from '../../lib/schema'
import { errorMessage } from '../../lib/firestore/shared'
import { formatDate, formatMoney } from '../lib/format'
import { both, geoTxt, txt } from '../lib/i18n'
import RecordTable from '../components/RecordTable'
import { Button, PageHeader, SearchInput, Select, StatusPill, Toggle, Toolbar } from '../components/ui'
import { cx } from '../lib/cx'

const STATUSES = ['any', 'draft', 'published', 'archived']
const SORTS = [
  { id: 'updated-desc', label: 'Recently updated' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'title-asc', label: 'Title A–Z' },
]

const asItems = (cb) => subscribeAdminProperties(({ properties, error }) => cb({ items: properties || [], error }))

const EMPTY_LIST = []

export default function PropertiesPage() {
  const { user } = useAuth()
  const { items, loading, error } = useSubscription(asItems)
  const [confirmNode, askConfirm] = useConfirm()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({
    status: params.get('status') || 'any',
    purpose: params.get('purpose') || 'any',
    type: 'any',
    region: 'any',
    featured: 'any',
  })
  const [sort, setSort] = useState('updated-desc')
  const [busyId, setBusyId] = useState('')
  const [feedback, setFeedback] = useState(null)

  const rows = items || EMPTY_LIST

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = rows.filter((p) => {
      if (filters.status !== 'any' && p.status !== filters.status) return false
      if (filters.purpose !== 'any' && p.purpose !== filters.purpose) return false
      if (filters.type !== 'any' && p.type !== filters.type) return false
      if (filters.region !== 'any' && p.region !== filters.region) return false
      if (filters.featured !== 'any' && String(Boolean(p.featured)) !== filters.featured) return false
      if (!needle) return true
      return [both(p.title), geoTxt(p.city), p.type, p.slug, geoTxt(p.regionLabel)].join(' ').toLowerCase().includes(needle)
    })
    const time = (p) => p.updatedAt?.toMillis?.() || p.updatedAt || 0
    const sorted = [...list]
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'title-asc') sorted.sort((a, b) => txt(a.title).localeCompare(txt(b.title)))
    else sorted.sort((a, b) => time(b) - time(a))
    return sorted
  }, [rows, q, filters, sort])

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (key === 'status') {
      const next = new URLSearchParams(params)
      if (value === 'any') next.delete('status')
      else next.set('status', value)
      setParams(next, { replace: true })
    }
  }

  const run = async (id, action, successText) => {
    setBusyId(id)
    try {
      await action()
      setFeedback({ tone: 'ok', text: successText })
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
    } finally {
      setBusyId('')
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const changeStatus = (p, status, label) => run(
    p.id,
    () => setPropertyStatus(p.id, status, user?.uid, p.status),
    `“${txt(p.title)}” — ${label}.`,
  )

  const remove = async (p) => {
    const confirmed = await askConfirm({
      title: 'Delete this property?',
      body: `“${txt(p.title)}” will be permanently removed from Firestore. This cannot be undone.`,
      confirmLabel: 'DELETE',
      danger: true,
    })
    if (confirmed) run(p.id, () => deleteProperty(p.id), `“${txt(p.title)}” deleted.`)
  }

  const columns = [
    {
      key: 'cover',
      header: '',
      primary: false,
      className: 'w-16 pr-3',
      render: (p) => (
        <span className="block h-11 w-16 overflow-hidden bg-sand">
          {p.coverImage && <img src={p.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Property',
      primary: true,
      render: (p) => (
        <span className="block">
          <Link to={`/admin/properties/${p.id}`} className="block text-[13px] text-ink underline-offset-4 hover:underline" onClick={(e) => e.stopPropagation()}>
            {txt(p.title)}
          </Link>
          <span className="mt-0.5 block text-[11px] text-stone">{geoTxt(p.city)}{p.regionLabel ? ` · ${geoTxt(p.regionLabel)}` : ''}</span>
          <span className="mt-1 flex gap-3 text-[11px] text-stone md:hidden">
            <span>{p.purpose === 'rent' ? 'Rent' : 'Sale'}</span>
            <span>{formatMoney(p.price, p.currency, p.purpose === 'rent')}</span>
            <StatusPill status={p.status} />
          </span>
        </span>
      ),
    },
    { key: 'purpose', header: 'Purpose', render: (p) => <span className="text-stone">{p.purpose === 'rent' ? 'Rent' : 'Sale'}</span> },
    { key: 'price', header: 'Price', render: (p) => <span className="whitespace-nowrap">{formatMoney(p.price, p.currency, p.purpose === 'rent')}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status} /> },
    {
      key: 'featured',
      header: 'Feature',
      render: (p) => (
        <button
          type="button"
          aria-pressed={Boolean(p.featured)}
          aria-label={p.featured ? `Remove ${txt(p.title)} from featured` : `Feature ${txt(p.title)}`}
          disabled={busyId === p.id}
          onClick={(e) => { e.stopPropagation(); run(p.id, () => setPropertyFeatured(p.id, !p.featured, user?.uid), p.featured ? 'Removed from featured.' : 'Marked as featured.') }}
          className={cx('text-[16px] leading-none transition-colors disabled:opacity-40', p.featured ? 'text-ink' : 'text-line hover:text-stone')}
        >
          {p.featured ? '★' : '☆'}
        </button>
      ),
    },
    { key: 'updated', header: 'Updated', render: (p) => <span className="whitespace-nowrap text-stone">{formatDate(p.updatedAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      primary: false,
      className: 'text-right',
      render: (p) => (
        <span className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] tracking-[0.1em]" onClick={(e) => e.stopPropagation()}>
          <Link to={`/admin/properties/${p.id}`} className="text-ink underline-offset-4 hover:underline">EDIT</Link>
          {p.status === 'published' && (
            <a href={`/?property=${p.id}`} target="_blank" rel="noreferrer" className="text-stone underline-offset-4 hover:text-ink hover:underline">VIEW</a>
          )}
          {p.status !== 'published' && (
            <button type="button" disabled={busyId === p.id} onClick={() => changeStatus(p, 'published', 'published')} className="text-stone underline-offset-4 hover:text-ink hover:underline disabled:opacity-40">PUBLISH</button>
          )}
          {p.status === 'published' && (
            <button type="button" disabled={busyId === p.id} onClick={() => changeStatus(p, 'draft', 'returned to draft')} className="text-stone underline-offset-4 hover:text-ink hover:underline disabled:opacity-40">UNPUBLISH</button>
          )}
          {p.status !== 'archived' && (
            <button type="button" disabled={busyId === p.id} onClick={() => changeStatus(p, 'archived', 'archived')} className="text-stone underline-offset-4 hover:text-ink hover:underline disabled:opacity-40">ARCHIVE</button>
          )}
          <button type="button" disabled={busyId === p.id} onClick={() => remove(p)} className="text-stone underline-offset-4 hover:text-ink hover:underline disabled:opacity-40">DELETE</button>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        subtitle={`${rows.length} ${rows.length === 1 ? 'property' : 'properties'} in the database · ${filtered.length} shown`}
        actions={<Link to="/admin/properties/new"><Button variant="primary">NEW PROPERTY</Button></Link>}
      />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search title, city, type…" label="Search properties" />
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          STATUS
          <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="w-auto py-2 text-[13px]">
            {STATUSES.map((s) => <option key={s} value={s}>{s === 'any' ? 'All' : s}</option>)}
          </Select>
        </label>
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          PURPOSE
          <Select value={filters.purpose} onChange={(e) => setFilter('purpose', e.target.value)} className="w-auto py-2 text-[13px]">
            <option value="any">All</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </Select>
        </label>
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          TYPE
          <Select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="w-auto py-2 text-[13px]">
            <option value="any">All</option>
            {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </label>
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          REGION
          <Select value={filters.region} onChange={(e) => setFilter('region', e.target.value)} className="w-auto py-2 text-[13px]">
            <option value="any">All</option>
            {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </label>
        <div className="md:ml-auto">
          <Toggle checked={filters.featured === 'true'} onChange={(v) => setFilter('featured', v ? 'true' : 'any')} label="Featured only" />
        </div>
        <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-stone">
          SORT
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto py-2 text-[13px]">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </label>
      </Toolbar>

      {feedback && (
        <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>
          {feedback.text}
        </p>
      )}

      <RecordTable
        columns={columns}
        rows={filtered}
        loading={loading && !rows.length}
        error={error && !rows.length ? error : null}
        onRetry={() => window.location.reload()}
        label="Properties"
        emptyTitle={q || filters.status !== 'any' ? 'No properties match those filters' : 'No properties yet'}
        emptyBody={q || filters.status !== 'any'
          ? 'Clear the filters, or create a new property.'
          : 'Create the first property, or run the demo migration from Settings.'}
        emptyAction={<Link to="/admin/properties/new"><Button variant="primary">NEW PROPERTY</Button></Link>}
      />

      {confirmNode}
    </div>
  )
}
