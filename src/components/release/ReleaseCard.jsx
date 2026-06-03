import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './ReleaseCard.module.css'

const RELEASE_TYPE_COLOR = {
  Album: 'var(--color-accent)',
  Single: 'var(--color-badge-single)',
}

const PLACEHOLDER_PALETTE = [
  ['#7c3aed', '#c4b5fd'],
  ['#0369a1', '#7dd3fc'],
  ['#be123c', '#fda4af'],
  ['#15803d', '#86efac'],
  ['#b45309', '#fcd34d'],
  ['#0f766e', '#5eead4'],
]

function getArtistColor(name) {
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

function ReleaseCard({ release }) {
  const { id, coverUrl, artistName, title, releaseDate, type } = release
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !coverUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(artistName)
  const badgeColor = RELEASE_TYPE_COLOR[type] ?? 'var(--color-text-muted)'

  return (
    <Link to={ROUTES.RELEASE_DETAIL(id)} className={styles.card}>
      <div className={styles.coverWrap}>
        {showPlaceholder ? (
          <div
            className={styles.coverPlaceholder}
            style={{ '--p-from': colorFrom, '--p-to': colorTo }}
          >
            <span className={styles.placeholderArtist}>{artistName}</span>
            <span className={styles.placeholderType}>{type}</span>
          </div>
        ) : (
          <img
            src={coverUrl}
            alt={title}
            className={styles.cover}
            onError={() => setImgFailed(true)}
          />
        )}
        <span
          className={styles.typeBadge}
          style={{ backgroundColor: badgeColor }}
        >
          {type}
        </span>
      </div>

      <div className={styles.info}>
        <p className={styles.artist}>{artistName}</p>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.metaIcon} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          {releaseDate}
        </div>
      </div>
    </Link>
  )
}

export default ReleaseCard
