import { useState } from 'react'
import { Link } from 'react-router-dom'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import SpotifyIcon from '@/components/ui/SpotifyIcon'
import StarRating from '@/components/ui/StarRating'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { getSpotifyAlbumUrl, getSpotifyCoverThumbnail } from '@/utils/spotify'
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

// priority: 첫 화면에 바로 보이는 카드(LCP 후보)는 지연 로드하지 않고 먼저 받는다
function ReleaseCard({ release, priority = false }) {
  const { id, coverUrl, artistName, artistKoreanName, title, releaseDate, type, spotifyId, averageRating } = release
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
            src={getSpotifyCoverThumbnail(coverUrl)}
            alt={title}
            className={styles.cover}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      {/* Spotify 커버 위에는 아무것도 얹지 않는다 (디자인 가이드) — 배지·Spotify 링크는 정보 영역에 둔다 */}
      <div className={styles.info}>
        <div className={styles.badges}>
          <span
            className={styles.typeBadge}
            style={{ backgroundColor: badgeColor }}
          >
            {type}
          </span>
          {isNew && <span className={styles.newBadge}>NEW</span>}
        </div>
        <p className={styles.artist}><ArtistAliasName name={artistName} koreanName={artistKoreanName} /></p>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          {spotifyUrl && (
            <button
              type="button"
              className={styles.spotifyBtn}
              aria-label={`${title} Spotify에서 듣기`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(spotifyUrl, '_blank', 'noopener,noreferrer')
              }}
            >
              <SpotifyIcon size={22} />
            </button>
          )}
        </div>
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
        <div className={styles.meta}>
          {averageRating != null ? (
            <>
              <StarRating value={averageRating} size={12} ariaLabel={`평균 별점 ${averageRating}점`} />
              <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            </>
          ) : (
            <span className={styles.ratingEmpty}>평점 없음</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ReleaseCard
