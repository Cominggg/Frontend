import { useState } from 'react'
import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import styles from './ConcertCard.module.css'

const PLACEHOLDER_PALETTE = [
  ['#7c3aed', '#c4b5fd'], // violet
  ['#0369a1', '#7dd3fc'], // blue
  ['#be123c', '#fda4af'], // rose
  ['#15803d', '#86efac'], // green
  ['#b45309', '#fcd34d'], // amber
  ['#0f766e', '#5eead4'], // teal
]

function getArtistColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

function ConcertCard({ concert }) {
  const { id, posterUrl, artistName, title, startDate, endDate, venue, status } = concert
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !posterUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(artistName)

  const dateRange = endDate && endDate !== startDate
    ? `${startDate} ~ ${endDate}`
    : startDate

  return (
    <Link to={ROUTES.CONCERT_DETAIL(id)} className={styles.card}>
      <div className={styles.posterWrap}>
        {showPlaceholder ? (
          <div
            className={styles.posterPlaceholder}
            style={{ '--p-from': colorFrom, '--p-to': colorTo }}
          >
            <span className={styles.posterArtistName}>{artistName}</span>
          </div>
        ) : (
          <img
            src={posterUrl}
            alt={title}
            className={styles.poster}
            onError={() => setImgFailed(true)}
          />
        )}
        <div className={styles.badgeWrap}>
          <Badge status={status} />
        </div>
      </div>

      <div className={styles.info}>
        <p className={styles.artist}>{artistName}</p>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.metaIcon}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          {dateRange}
        </div>
        <div className={styles.meta}>
          <span className={styles.metaIcon}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          {venue}
        </div>
      </div>
    </Link>
  )
}

export default ConcertCard
