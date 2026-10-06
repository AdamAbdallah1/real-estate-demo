import LeadWorkbench, { StatusCell, TimeCell } from '../components/LeadWorkbench'
import {
  SELLER_STATUSES, deleteSellerLead, subscribeSellerLeads, updateSellerLeadStatus,
} from '../../lib/firestore/sellerLeads'

function formatDateSafe(value) {
  if (!value) return '—'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function SellerLeadsPage() {
  return (
    <LeadWorkbench
      title="Seller leads"
      subtitle="Properties offered through the “Sell” flow on the website."
      subscribe={subscribeSellerLeads}
      statuses={SELLER_STATUSES}
      updateStatus={updateSellerLeadStatus}
      remove={deleteSellerLead}
      searchFields={['name', 'phone', 'email', 'propertyLocation', 'message']}
      columns={[
        {
          key: 'person',
          header: 'Seller',
          primary: true,
          render: (r) => (
            <span className="block">
              <span className="block text-[13px] text-ink">{r.name}</span>
              <span className="block text-[11px] text-stone">{r.propertyLocation}</span>
            </span>
          ),
        },
        { key: 'type', header: 'Type', render: (r) => <span className="text-stone">{r.propertyType || '—'}</span> },
        { key: 'phone', header: 'Phone', render: (r) => <span className="whitespace-nowrap text-stone">{r.phone || '—'}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusCell status={r.status} /> },
        { key: 'created', header: 'Received', render: (r) => <TimeCell value={r.createdAt} /> },
      ]}
      detailRows={(r) => [
        { label: 'Name', value: r.name },
        { label: 'Phone / WhatsApp', value: r.phone, wa: r.phone },
        { label: 'Email', value: r.email, mail: r.email },
        { label: 'Property location', value: r.propertyLocation },
        { label: 'Property type', value: r.propertyType },
        { label: 'Status', value: r.status },
        { label: 'Received', value: formatDateSafe(r.createdAt) },
        { label: 'Message', value: r.message, wide: true },
      ]}
      emptyTitle="No seller leads yet"
      emptyBody="Every “Sell your property” submission from the website appears here."
    />
  )
}
