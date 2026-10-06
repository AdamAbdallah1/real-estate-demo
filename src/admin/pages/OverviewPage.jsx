import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { subscribeAdminProperties } from '../../lib/firestore/properties'
import { subscribeInquiries } from '../../lib/firestore/inquiries'
import { subscribeViewingRequests } from '../../lib/firestore/viewingRequests'
import { subscribeSellerLeads } from '../../lib/firestore/sellerLeads'
import { formatDate, relativeTime } from '../lib/format'
import { geoTxt, txt, typeTxt } from '../lib/i18n'
import { Button, EmptyState, ErrorState, LoadingRows, PageHeader, StatusPill } from '../components/ui'
import { cx } from '../lib/cx'

const asItems = (subscribe) => (cb) => subscribe(({ properties, items, error }) => cb({ items: properties || items || [], error }))

/** Operational overview — every number is read from Firestore, nothing is invented. */
export default function OverviewPage() {
  const properties = useSubscription(asItems(subscribeAdminProperties))
  const inquiries = useSubscription(asItems(subscribeInquiries))
  const viewings = useSubscription(asItems(subscribeViewingRequests))
  const leads = useSubscription(asItems(subscribeSellerLeads))

  const loading = properties.loading || inquiries.loading || viewings.loading || leads.loading
  const error = properties.error || inquiries.error || viewings.error || leads.error

  const list = properties.items || []
  const newInquiries = (inquiries.items || []).filter((i) => i.status === 'new')
  const newViewings = (viewings.items || []).filter((i) => i.status === 'new')
  const newLeads = (leads.items || []).filter((i) => i.status === 'new')
  const drafts = list.filter((p) => p.status === 'draft')
  const published = list.filter((p) => p.status === 'published')

  const recentlyUpdated = [...list]
    .sort((a, b) => (b.updatedAt?.toMillis?.() || b.updatedAt || 0) - (a.updatedAt?.toMillis?.() || a.updatedAt || 0))
    .slice(0, 6)

  const activity = [
    ...newViewings.map((r) => ({ id: r.id, kind: 'Viewing', title: `${r.name} — ${r.propertyTitle || 'property'}`, at: r.createdAt, to: '/admin/viewings' })),
    ...newLeads.map((r) => ({ id: r.id, kind: 'Seller lead', title: `${r.name} — ${r.propertyLocation || ''}`, at: r.createdAt, to: '/admin/seller-leads' })),
    ...newInquiries.map((r) => ({ id: r.id, kind: 'Inquiry', title: `${r.name} — ${String(r.message || '').slice(0, 48)}`, at: r.createdAt, to: '/admin/inquiries' })),
  ]
    .sort((a, b) => (b.at?.toMillis?.() || b.at || 0) - (a.at?.toMillis?.() || a.at || 0))
    .slice(0, 7)

  const attention = [
    { label: 'New viewing requests', value: newViewings.length, to: '/admin/viewings' },
    { label: 'New seller leads', value: newLeads.length, to: '/admin/seller-leads' },
    { label: 'New inquiries', value: newInquiries.length, to: '/admin/inquiries' },
    { label: 'Draft properties', value: drafts.length, to: '/admin/properties?status=draft' },
  ]

  return (
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        subtitle="What needs attention across properties and incoming requests."
        actions={<Link to="/admin/properties/new"><Button variant="primary">NEW PROPERTY</Button></Link>}
      />

      {loading && !properties.items && <LoadingRows rows={5} />}
      {error && !properties.items && (
        <ErrorState
          message={`${error} Public visitors still see local demo content until Firestore is reachable.`}
          onRetry={() => window.location.reload()}
        />
      )}

      {!!properties.items && (
        <>
          <section aria-labelledby="attention-heading">
            <h2 id="attention-heading" className="text-[11px] tracking-[0.3em] text-stone">REQUIRES ATTENTION</h2>
            <ul className="mt-4 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
              {attention.map((item) => (
                <li key={item.label} className="bg-ivory">
                  <Link to={item.to} className="block px-5 py-6 transition-colors hover:bg-paper">
                    <p className="font-serif text-3xl text-ink">{item.value}</p>
                    <p className="mt-2 text-[12px] leading-snug text-stone">{item.label}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <section aria-labelledby="recent-heading">
              <div className="flex items-baseline justify-between">
                <h2 id="recent-heading" className="text-[11px] tracking-[0.3em] text-stone">RECENTLY UPDATED</h2>
                <Link to="/admin/properties" className="text-[11px] tracking-[0.16em] text-stone underline underline-offset-4 hover:text-ink">ALL PROPERTIES</Link>
              </div>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {recentlyUpdated.map((p) => (
                  <li key={p.id}>
                    <Link to={`/admin/properties/${p.id}`} className="flex items-center gap-4 py-3 transition-colors hover:bg-paper">
                      <span className="h-11 w-16 shrink-0 overflow-hidden bg-sand">
                        {p.coverImage && <img src={p.coverImage} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-ink">{txt(p.title)}</span>
                        <span className="block truncate text-[11px] text-stone">{geoTxt(p.city)} · {typeTxt(p.type)} · updated {relativeTime(p.updatedAt)}</span>
                      </span>
                      <StatusPill status={p.status} />
                    </Link>
                  </li>
                ))}
                {!recentlyUpdated.length && (
                  <li className="py-6 text-[13px] text-stone">No properties yet.</li>
                )}
              </ul>
            </section>

            <section aria-labelledby="activity-heading">
              <h2 id="activity-heading" className="text-[11px] tracking-[0.3em] text-stone">NEW ACTIVITY</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {activity.map((item) => (
                  <li key={item.kind + item.id}>
                    <Link to={item.to} className="block py-3 transition-colors hover:bg-paper">
                      <span className="text-[10px] tracking-[0.2em] text-stone uppercase">{item.kind}</span>
                      <span className="mt-1 block text-[13px] text-ink">{item.title}</span>
                      <span className="mt-0.5 block text-[11px] text-stone">{formatDate(item.at)}</span>
                    </Link>
                  </li>
                ))}
                {!activity.length && (
                  <li className="py-6 text-[13px] text-stone">No new requests. Anything submitted on the website appears here.</li>
                )}
              </ul>
            </section>
          </div>

          <section aria-labelledby="stock-heading">
            <h2 id="stock-heading" className="text-[11px] tracking-[0.3em] text-stone">PORTFOLIO</h2>
            <dl className={cx('mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4')}>
              {[
                ['Published', published.length],
                ['Drafts', drafts.length],
                ['Archived', list.filter((p) => p.status === 'archived').length],
                ['Featured', list.filter((p) => p.featured).length],
              ].map(([label, value]) => (
                <div key={label} className="bg-ivory px-5 py-5">
                  <dt className="text-[11px] tracking-[0.16em] text-stone">{label.toUpperCase()}</dt>
                  <dd className="mt-1.5 font-serif text-2xl text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            {!list.length && (
              <div className="mt-4">
                <EmptyState
                  title="No properties in Firestore yet"
                  body="Run the demo migration from Settings to move the existing NARA properties into the database, or create the first property manually."
                  action={<Link to="/admin/settings"><Button>GO TO SETTINGS</Button></Link>}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
