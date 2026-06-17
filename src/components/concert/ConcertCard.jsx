import { useState } from 'react'
import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import { formatDate } from '@/utils/date'
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
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

function getTicketDday(ticketOpenAt) {
  if (!ticketOpenAt) return null
  const [datePart] = ticketOpenAt.split('T')
  const [y, m, d] = datePart.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return null
  if (diff === 0) return 'D-DAY'
  return `D-${diff}`
}

function ConcertCard({ concert }) {
  const { id, posterUrl, artistName, title, startDate, endDate, venue, status, ticketOpenAt } = concert
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !posterUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(artistName)

  const ticketDday = getTicketDday(ticketOpenAt)

  const dateRange = endDate && endDate !== startDate
    ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    : formatDate(startDate)

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
        {ticketDday && (
          <div className={styles.ticketBadge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
            </svg>
            예매 {ticketDday}
          </div>
        )}
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
