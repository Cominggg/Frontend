import { useState } from 'react'
import styles from './AdminFormPage.module.css'
import concertStyles from './AdminConcertFormPage.module.css'

function resizeIds(ids, length) {
  if (ids.length > length) return ids.slice(0, length)
  return [...ids, ...Array.from({ length: length - ids.length }, () => crypto.randomUUID())]
}

function ImagePreview({ url }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={url}
      alt=""
      className={concertStyles.imagePreview}
      onError={() => setFailed(true)}
    />
  )
}

export function ImageUrlsEditor({ urls, onChange }) {
  const [ids, setIds] = useState(() => urls.map(() => crypto.randomUUID()))

  if (ids.length !== urls.length) {
    setIds(resizeIds(ids, urls.length))
  }

  function add() {
    setIds([...ids, crypto.randomUUID()])
    onChange([...urls, ''])
  }
  function remove(i) {
    setIds(ids.filter((_, idx) => idx !== i))
    onChange(urls.filter((_, idx) => idx !== i))
  }
  function update(i, value) {
    onChange(urls.map((u, idx) => idx === i ? value : u))
  }

  return (
    <div className={concertStyles.imageUrls}>
      {urls.map((url, i) => (
        <div key={ids[i]} className={concertStyles.imageUrlRow}>
          {url && <ImagePreview url={url} />}
          <input
            type="url"
            className={styles.input}
            placeholder="https://..."
            value={url}
            onChange={(e) => update(i, e.target.value)}
          />
          <button type="button" className={concertStyles.bookingRemoveBtn} onClick={() => remove(i)} aria-label="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" className={concertStyles.bookingAddBtn} onClick={add}>
        + 이미지 URL 추가
      </button>
    </div>
  )
}

export function BookingLinksEditor({ links, onChange }) {
  const [ids, setIds] = useState(() => links.map(() => crypto.randomUUID()))

  if (ids.length !== links.length) {
    setIds(resizeIds(ids, links.length))
  }

  function add() {
    setIds([...ids, crypto.randomUUID()])
    onChange([...links, { name: '', url: '' }])
  }
  function remove(i) {
    setIds(ids.filter((_, idx) => idx !== i))
    onChange(links.filter((_, idx) => idx !== i))
  }
  function update(i, key, value) {
    onChange(links.map((l, idx) => idx === i ? { ...l, [key]: value } : l))
  }

  return (
    <div className={concertStyles.bookingLinks}>
      {links.map((link, i) => (
        <div key={ids[i]} className={concertStyles.bookingLinkRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="예매처 이름 (예: 인터파크)"
            value={link.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <input
            type="url"
            className={styles.input}
            placeholder="https://..."
            value={link.url}
            onChange={(e) => update(i, 'url', e.target.value)}
          />
          <button type="button" className={concertStyles.bookingRemoveBtn} onClick={() => remove(i)} aria-label="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" className={concertStyles.bookingAddBtn} onClick={add}>
        + 예매처 추가
      </button>
    </div>
  )
}
