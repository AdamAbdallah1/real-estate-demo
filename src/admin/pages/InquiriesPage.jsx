import LeadWorkbench, { StatusCell, TimeCell } from '../components/LeadWorkbench'
import {
  INQUIRY_STATUSES, deleteInquiry, subscribeInquiries, updateInquiryStatus,
} from '../../lib/firestore/inquiries'

export default function InquiriesPage() {
  return (
    <LeadWorkbench
      title="Inquiries"
      subtitle="Messages sent through the contact form on the public website."
      subscribe={subscribeInquiries}
      statuses={INQUIRY_STATUSES}
      updateStatus={updateInquiryStatus}
      remove={deleteInquiry}
      searchFields={['name', 'email', 'phone', 'message', 'source']}
      columns={[
        {
          key: 'person',
          header: 'Person',
          primary: true,
          render: (r) => (
            <span className="block">
              <span className="block text-[13px] text-ink">{r.name}</span>
              <span className="block text-[11px] text-stone">{r.email || r.phone || 'No contact provided'}</span>
            </span>
          ),
        },
        {
          key: 'message',
          header: 'Message',
          render: (r) => <span className="line-clamp-2 block max-w-md text-ink-soft">{r.message}</span>,
        },
        { key: 'source', header: 'Source', render: (r) => <span className="text-stone">{r.source || 'website'}</span> },
        { key: 'status', header: 'Status', render: (r) => <StatusCell status={r.status} /> },
        { key: 'created', header: 'Received', render: (r) => <TimeCell value={r.createdAt} /> },
      ]}
      detailRows={(r) => [
        { label: 'Name', value: r.name },
        { label: 'Status', value: r.status },
        { label: 'Email', value: r.email, mail: r.email },
        { label: 'Phone / WhatsApp', value: r.phone, wa: r.phone },
        { label: 'Source', value: r.source || 'website' },
        { label: 'Received', value: formatDateSafe(r.createdAt) },
        { label: 'Message', value: r.message, wide: true },
      ]}
      emptyTitle="No inquiries yet"
      emptyBody="Messages sent through the website contact form appear here in real time."
    />
  )
}

function formatDateSafe(value) {
  if (!value) return '—'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}
