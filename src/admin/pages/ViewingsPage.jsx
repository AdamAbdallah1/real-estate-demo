import LeadWorkbench, { StatusCell, TimeCell } from '../components/LeadWorkbench'
import {
  VIEWING_STATUSES, deleteViewingRequest, subscribeViewingRequests, updateViewingRequestStatus,
} from '../../lib/firestore/viewingRequests'

function formatDateSafe(value) {
  if (!value) return '—'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function ViewingsPage() {
  return (
    <LeadWorkbench
      title="Viewing requests"
      subtitle="Requests submitted from a property detail page."
      subscribe={subscribeViewingRequests}
      statuses={VIEWING_STATUSES}
      updateStatus={updateViewingRequestStatus}
      remove={deleteViewingRequest}
      searchFields={['name', 'phone', 'propertyTitle', 'message']}
      columns={[
        {
          key: 'person',
          header: 'Request',
          primary: true,
          render: (r) => (
            <span className="block">
              <span className="block text-[13px] text-ink">{r.name}</span>
              <span className="block text-[11px] text-stone">{r.propertyTitle || 'Property'}</span>
            </span>
          ),
        },
        {
          key: 'when',
          header: 'Preferred',
          render: (r) => <span className="whitespace-nowrap text-ink-soft">{[r.preferredDay, r.preferredTime].filter(Boolean).join(' · ') || '—'}</span>,
        },
        { key: 'phone', header: 'Phone', render: (r) => <span className="whitespace-nowrap text-stone">{r.phone || '—'}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusCell status={r.status} /> },
        { key: 'created', header: 'Received', render: (r) => <TimeCell value={r.createdAt} /> },
      ]}
      detailRows={(r) => [
        { label: 'Name', value: r.name },
        { label: 'Phone / WhatsApp', value: r.phone, wa: r.phone },
        {
          label: 'Property',
          value: r.propertyTitle,
          href: r.propertyId ? `/?property=${r.propertyId}` : '',
          hrefLabel: 'OPEN LISTING',
        },
        { label: 'Preferred day', value: r.preferredDay },
        { label: 'Preferred time', value: r.preferredTime },
        { label: 'Status', value: r.status },
        { label: 'Received', value: formatDateSafe(r.createdAt) },
        { label: 'Message', value: r.message, wide: true },
      ]}
      emptyTitle="No viewing requests"
      emptyBody="Every “Request a viewing” submission from a property page appears here with the property it relates to."
    />
  )
}
