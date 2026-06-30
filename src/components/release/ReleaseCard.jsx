import { useState } from 'react'
import { Link } from 'react-router-dom'

import SpotifyIcon from '@/components/ui/SpotifyIcon'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/colorPalette'
import { getSpotifyAlbumUrl } from '@/utils/spotify'
import styles from './ReleaseCard.module.css'

const RELEASE_TYPE_COLOR = {
  Album: 'var(--color-accent)',
  Single: 'var(--color-badge-single)',
}

function isNewRelease(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  return (Date.now() - d.getTime()) / 86400000 <= 30
}

function ReleaseCard({ release }) {
  const { id, coverUrl, artistName, title, releaseDate, type, spotifyId } = release
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !coverUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(artistName)
  const badgeColor = RELEASE_TYPE_COLOR[type] ?? 'var(--color-text-muted)'
  const isNew = isNewRelease(releaseDate)
  const spotifyUrl = getSpotifyAlbumUrl(spotifyId)

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
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        <span
          className={styles.typeBadge}
          style={{ backgroundColor: badgeColor }}
        >
          {type}
        </span>
        {isNew && <span className={styles.newBadge}>NEW</span>}
        {spotifyUrl && (
          <button
            type="button"
            className={styles.spotifyBadge}
            aria-label={`${title} Spotify에서 듣기`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(spotifyUrl, '_blank', 'noopener,noreferrer')
            }}
          >
            <SpotifyIcon size={18} />
          </button>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.artist}>{artistName}</p>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta} style={!releaseDate ? { visibility: 'hidden' } : undefined}>
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
