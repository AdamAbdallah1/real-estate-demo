import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useConfirm } from '../hooks/useConfirm'
import {
  ARTICLE_STATUSES, createArticle, deleteArticle, subscribeEditorial, updateArticle,
  validateArticle,
} from '../../lib/firestore/editorial'
import { slugify } from '../../lib/schema'
import { errorMessage } from '../../lib/firestore/shared'
import { isSecureImageUrl } from '../../lib/images'
import { relativeTime } from '../lib/format'
import RecordTable from '../components/RecordTable'
import BilingualField from '../components/BilingualField'
import { sideOf, txt } from '../lib/i18n'
import { Button, Field, Input, PageHeader, Select, StatusPill } from '../components/ui'
import { cx } from '../lib/cx'

const pair = (value) => ({ en: sideOf(value, 'en'), ar: sideOf(value, 'ar') })

function emptyArticle() {
  return {
    title: { en: '', ar: '' },
    slug: '',
    excerpt: { en: '', ar: '' },
    content: { en: '', ar: '' },
    seoTitle: { en: '', ar: '' },
    seoDescription: { en: '', ar: '' },
    coverImage: { url: '', alt: '' },
    status: 'draft',
  }
}

/** Editorial — a simple, deliberate writer: list ⇄ one article at a time. */
export default function EditorialPage() {
  const { user } = useAuth()
  const { items, loading, error } = useSubscription((cb) => subscribeEditorial(cb))
  const [confirmNode, askConfirm] = useConfirm()
  const [editing, setEditing] = useState(null) // null | { id?, ...article }
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const rows = items || []

  const startNew = () => {
    setErrors({})
    setFeedback(null)
    setEditing(emptyArticle())
  }

  const startEdit = (article) => {
    setErrors({})
    setFeedback(null)
    setEditing({
      id: article.id,
      title: pair(article.title),
      slug: article.slug || '',
      excerpt: pair(article.excerpt),
      content: pair(article.content),
      seoTitle: pair(article.seoTitle),
      seoDescription: pair(article.seoDescription),
      coverImage: { url: article.coverImage?.url || '', alt: article.coverImage?.alt || '' },
      status: article.status || 'draft',
    })
  }

  const setField = (key, value) => setEditing((prev) => ({ ...prev, [key]: value }))

  const persist = async (statusOverride) => {
    const candidate = { ...editing, status: statusOverride || editing.status }
    const found = validateArticle(candidate)
    if (candidate.coverImage?.url && !isSecureImageUrl(candidate.coverImage.url)) {
      found.coverImage = 'Use an external https:// image URL.'
    }
    setErrors(found)
    if (Object.keys(found).length) {
      setFeedback({ tone: 'error', text: 'Fix the highlighted fields before saving.' })
      return
    }

    setSaving(true)
    try {
      const payload = { ...candidate, slug: candidate.slug || slugify(sideOf(candidate.title, 'en') || sideOf(candidate.title, 'ar')) }
      if (editing.id) await updateArticle(editing.id, payload, user?.uid)
      else await createArticle(payload, user?.uid)
      setFeedback({ tone: 'ok', text: editing.id ? 'Article saved.' : 'Article created.' })
      setEditing(null)
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  const remove = async () => {
    if (!editing?.id) return
    const confirmed = await askConfirm({
      title: 'Delete this article?',
      body: `“${txt(editing.title)}” will be permanently removed.`,
      confirmLabel: 'DELETE',
      danger: true,
    })
    if (!confirmed) return
    setSaving(true)
    try {
      await deleteArticle(editing.id)
      setEditing(null)
      setFeedback({ tone: 'ok', text: 'Article deleted.' })
    } catch (err) {
      setFeedback({ tone: 'error', text: errorMessage(err) })
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(null), 3500)
    }
  }

  if (editing) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={editing.id ? txt(editing.title) || 'Edit article' : 'New article'}
          subtitle={editing.id ? `Slug · ${editing.slug}` : 'Draft — not visible on the website until published.'}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill status={editing.status} />
              <Button variant="primary" onClick={() => persist(editing.status)} disabled={saving}>
                {saving ? 'SAVING…' : 'SAVE'}
              </Button>
              {editing.status !== 'published' && (
                <Button onClick={() => persist('published')} disabled={saving}>PUBLISH</Button>
              )}
              {editing.status === 'published' && (
                <Button onClick={() => persist('draft')} disabled={saving}>UNPUBLISH</Button>
              )}
              <Button onClick={() => setEditing(null)}>CANCEL</Button>
            </div>
          }
        />

        {feedback && (
          <p role="status" aria-live="polite" className={cx('text-[13px]', feedback.tone === 'error' ? 'text-ink' : 'text-stone')}>
            {feedback.text}
          </p>
        )}

        <div className="space-y-6">
          <BilingualField
            label="Title"
            required
            error={errors.title || errors['title.en']}
            arError={errors['title.ar']}
            value={editing.title}
            onChange={(v) => setField('title', v)}
            enPlaceholder="Notes on living in Batroun"
            arPlaceholder="ملاحظات حول العيش في البترون"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Slug" hint="URL id">
              <Input
                value={editing.slug}
                onChange={(e) => setField('slug', e.target.value.toLowerCase())}
                onBlur={() => { if (!editing.slug) { const s = slugify(sideOf(editing.title, 'en')); if (s) setField('slug', s) } }}
                placeholder={slugify(sideOf(editing.title, 'en')) || 'notes-on-living-in-batroun'}
              />
            </Field>
            <Field label="Status" required error={errors.status}>
              <Select value={editing.status} onChange={(e) => setField('status', e.target.value)}>
                {ARTICLE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>

          <BilingualField
            label="Excerpt"
            required
            error={errors.excerpt}
            hint="shown in the editorial grid"
            rows={2}
            value={editing.excerpt}
            onChange={(v) => setField('excerpt', v)}
            enPlaceholder="A short standfirst for the index page."
            arPlaceholder="مقدمة قصيرة لصفحة الفهرس."
          />

          <BilingualField
            label="Content"
            required
            error={errors.content}
            rows={16}
            value={editing.content}
            onChange={(v) => setField('content', v)}
            enPlaceholder="Write the piece. Plain text with paragraph breaks."
            arPlaceholder="اكتب المقال. نص عادي بفواصل بين الفقرات."
          />

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-6 lg:grid-cols-2">
            <BilingualField
              label="SEO title"
              hint="used for the browser tab and search results"
              value={editing.seoTitle}
              onChange={(v) => setField('seoTitle', v)}
              enPlaceholder="Notes on living in Batroun — NARA"
              arPlaceholder="ملاحظات حول الععيش في البترون — نارا"
            />
            <BilingualField
              label="SEO description"
              rows={3}
              value={editing.seoDescription}
              onChange={(v) => setField('seoDescription', v)}
              enPlaceholder="One or two sentences for search results."
              arPlaceholder="جملة أو جملتين لنتائج البحث."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1fr]">
            <Field label="Cover image URL" hint="external https:// URL" error={errors.coverImage}>
              <Input value={editing.coverImage.url} onChange={(e) => setField('coverImage', { ...editing.coverImage, url: e.target.value })} placeholder="https://…" />
            </Field>
            <Field label="Cover image alt text">
              <Input value={editing.coverImage.alt} onChange={(e) => setField('coverImage', { ...editing.coverImage, alt: e.target.value })} placeholder="Coastline at Batroun" />
            </Field>
          </div>

          {!!editing.coverImage.url && isSecureImageUrl(editing.coverImage.url) && (
            <div className="h-48 w-full overflow-hidden border border-line bg-sand">
              <img src={editing.coverImage.url} alt={editing.coverImage.alt || ''} className="h-full w-full object-cover" />
            </div>
          )}

          {editing.id && (
            <div className="border-t border-line pt-6">
              <Button variant="danger" onClick={remove} disabled={saving}>DELETE ARTICLE</Button>
            </div>
          )}
        </div>

        {confirmNode}
      </div>
    )
  }

  const columns = [
    {
      key: 'title',
      header: 'Article',
      primary: true,
      render: (a) => (
        <span className="block">
          <span className="block text-[13px] text-ink">{txt(a.title)}</span>
          <span className="block text-[11px] text-stone">/{a.slug}</span>
        </span>
      ),
    },
    { key: 'excerpt', header: 'Excerpt', render: (a) => <span className="line-clamp-2 block max-w-lg text-ink-soft">{txt(a.excerpt)}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusPill status={a.status} /> },
    { key: 'updated', header: 'Updated', render: (a) => <span className="whitespace-nowrap text-stone">{relativeTime(a.updatedAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (a) => (
        <span className="flex justify-end gap-3 text-[11px] tracking-[0.1em]" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => startEdit(a)} className="text-ink underline-offset-4 hover:underline">EDIT</button>
          {a.status === 'published' && (
            <a href={`/?editorial=${a.slug}`} target="_blank" rel="noreferrer" className="text-stone underline-offset-4 hover:text-ink hover:underline">VIEW</a>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editorial"
        subtitle="Long-form pieces published alongside the collection."
        actions={<Button variant="primary" onClick={startNew}>NEW ARTICLE</Button>}
      />

      {feedback && <p role="status" aria-live="polite" className="text-[13px] text-stone">{feedback.text}</p>}

      <RecordTable
        columns={columns}
        rows={rows}
        onRowClick={startEdit}
        loading={loading && !rows.length}
        error={error && !rows.length ? error : null}
        onRetry={() => window.location.reload()}
        label="Editorial articles"
        emptyTitle="No editorial articles yet"
        emptyBody="Write the first piece — title, excerpt, body and cover image are enough."
        emptyAction={<Button variant="primary" onClick={startNew}>NEW ARTICLE</Button>}
      />

      {confirmNode}
    </div>
  )
}
