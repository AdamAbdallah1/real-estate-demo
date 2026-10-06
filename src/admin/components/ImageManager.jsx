import { useState } from 'react'
import { isSecureImageUrl, moveImage, normalizeImages } from '../../lib/images'
import { syncCover } from '../lib/propertyDraft'
import { Button, Field, Input } from './ui'
import { cx } from '../lib/cx'

/**
 * External image URLs (Firebase Storage is unavailable).
 * Records are { url, alt, order } — no binaries, no base64, no blobs.
 */
export default function ImageManager({ images = [], coverImage, onChange }) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [error, setError] = useState('')
  const [broken, setBroken] = useState(() => new Set())

  const emit = (nextImages, nextCover) => {
    onChange(syncCover(nextImages, nextCover))
  }

  const add = () => {
    const value = url.trim()
    if (!value) {
      setError('Paste an image URL first.')
      return
    }
    if (!isSecureImageUrl(value)) {
      setError('Use an external https:// image URL.')
      return
    }
    if (images.some((img) => img.url === value)) {
      setError('That image is already in this property.')
      return
    }
    setError('')
    const next = normalizeImages([...images, { url: value, alt: alt.trim(), order: images.length }])
    emit(next, coverImage)
    setUrl('')
    setAlt('')
  }

  const patchAt = (index, patch) => {
    const next = images.map((img, i) => (i === index ? { ...img, ...patch } : img))
    emit(next, coverImage)
  }

  const removeAt = (index) => {
    const next = images.filter((_, i) => i !== index)
    emit(next, coverImage)
  }

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    emit(moveImage(images, index, target), coverImage)
  }

  const markCover = (index) => {
    emit(images, { url: images[index].url, alt: images[index].alt })
  }

  const markBroken = (value) => {
    setBroken((prev) => {
      const next = new Set(prev)
      next.add(value)
      return next
    })
  }

  return (
    <section aria-labelledby="images-heading" className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 id="images-heading" className="text-[11px] tracking-[0.3em] text-stone">IMAGES</h2>
        <p className="text-[11px] text-stone">{images.length} {images.length === 1 ? 'image' : 'images'}</p>
      </div>

      <div className="border border-line bg-paper p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_240px]">
          <Field label="Image URL" error={error} hint="external https:// URL">
            <Input
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError('') }}
              placeholder="https://images.unsplash.com/…"
              inputMode="url"
            />
          </Field>
          <Field label="Alt text">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Living room" />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={add} variant="primary">ADD IMAGE</Button>
        </div>
      </div>

      {!images.length ? (
        <p className="border border-dashed border-line px-4 py-8 text-center text-[13px] text-stone">
          No images yet. Add at least one external image URL before publishing.
        </p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {images.map((image, index) => {
            const isCover = coverImage?.url === image.url
            const failed = broken.has(image.url)
            return (
              <li key={image.url + index} className="grid grid-cols-[64px_1fr] gap-4 py-4 md:grid-cols-[96px_1fr_auto]">
                <span className="block h-16 w-16 overflow-hidden border border-line bg-sand md:h-[72px] md:w-24">
                  {failed ? (
                    <span className="flex h-full w-full items-center justify-center text-[9px] tracking-[0.1em] text-stone">BROKEN</span>
                  ) : (
                    <img src={image.url} alt={image.alt || ''} loading="lazy" onError={() => markBroken(image.url)} className="h-full w-full object-cover" />
                  )}
                </span>

                <div className="min-w-0 space-y-2">
                  <Input
                    aria-label={`URL for image ${index + 1}`}
                    value={image.url}
                    onChange={(e) => patchAt(index, { url: e.target.value.trim() })}
                    className="text-[12px]"
                  />
                  <Input
                    aria-label={`Alt text for image ${index + 1}`}
                    value={image.alt || ''}
                    onChange={(e) => patchAt(index, { alt: e.target.value })}
                    placeholder="Alt text"
                    className="text-[12px]"
                  />
                  <p className={cx('text-[11px]', failed ? 'text-ink' : 'text-stone')}>
                    {failed ? 'This image URL did not load. Check the address.' : (isCover ? 'Cover image' : `Position ${index + 1}`)}
                  </p>
                </div>

                <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-1 md:flex-col md:items-end">
                  <Button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${image.url} up`} className="px-2.5 py-1.5">↑</Button>
                  <Button onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label={`Move ${image.url} down`} className="px-2.5 py-1.5">↓</Button>
                  <Button onClick={() => markCover(index)} disabled={isCover} aria-label={`Use ${image.url} as cover image`} className={cx('px-2.5 py-1.5', isCover && 'border-ink text-ink')}>
                    {isCover ? 'COVER' : 'SET COVER'}
                  </Button>
                  <Button onClick={() => removeAt(index)} aria-label={`Remove ${image.url}`} className="px-2.5 py-1.5 text-stone hover:text-ink">✕</Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
