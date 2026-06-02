import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import EmptyState from '@/components/ui/EmptyState'
import { getRelease } from '@/services/releaseApi'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import styles from './ReleaseDetailPage.module.css'

function fmtMs(ms) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const RELEASE_TYPE_COLOR = {
  Album: 'var(--color-accent)',
  Single: 'var(--color-badge-single)',
  EP: 'var(--color-badge-ep)',
}

function ReleaseDetailPage() {
  const { id } = useParams()
  const releaseId = Number(id)
  const [coverFailed, setCoverFailed] = useState(false)

  const { data: release, isLoading, isError } = useQuery({
    queryKey: ['release', releaseId],
    queryFn: () => getRelease(releaseId),
    retry: false,
  })

  if (isLoading) return null

  if (isError || !release) {
    return (
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        message="릴리즈 정보가 존재하지 않습니다"
        action={{ to: ROUTES.RELEASES, label: '음악 목록으로' }}
      />
    )
  }

  const { artistName, artistId, title, type, releaseDate, coverUrl, tracks } = release
  const showCoverPlaceholder = !coverUrl || coverFailed
  const [accentFrom, accentTo] = getArtistColor(artistName)
  const badgeColor = RELEASE_TYPE_COLOR[type] ?? 'var(--color-text-muted)'

  return (
    <div className={styles.page}>
      {/* 히어로 섹션 */}
      <section
        className={styles.hero}
        style={{ '--hero-from': accentFrom, '--hero-to': accentTo }}
      >
        <div className={styles.heroBlur} />
        <div className={styles.heroInner}>
          <Link to={ROUTES.ARTISTS} className={styles.backLink}>← 아티스트 목록</Link>
          <div className={styles.heroContent}>
            <div className={styles.coverWrap}>
              {showCoverPlaceholder ? (
                <div
                  className={styles.coverPlaceholder}
                  style={{ '--a-from': accentFrom, '--a-to': accentTo }}
                >
                  <span className={styles.coverTypeLabel}>{type}</span>
                </div>
              ) : (
                <img
                  src={coverUrl}
                  alt={`${title} 커버`}
                  className={styles.coverImg}
                  onError={() => setCoverFailed(true)}
                />
              )}
            </div>
            <div className={styles.heroInfo}>
              <Link to={ROUTES.ARTIST_DETAIL(artistId)} className={styles.heroArtist}>
                {artistName}
              </Link>
              <h1 className={styles.heroTitle}>{title}</h1>
              <div className={styles.heroMeta}>
                <span
                  className={styles.typeBadge}
                  style={{ backgroundColor: badgeColor }}
                >
                  {type}
                </span>
                <span>{formatDate(releaseDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <div className={styles.body}>
        <div className={styles.bodyGrid}>
          {/* 트랙리스트 */}
          <section className={styles.trackSection}>
            <h2 className={styles.sectionHeading}>Tracklist</h2>
            <ol className={styles.trackList}>
              {tracks.map((track) => (
                <li key={track.position} className={styles.trackItem}>
                  <span className={styles.trackNum}>{track.position}</span>
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackDuration}>
                    {track.lengthMs ? fmtMs(track.lengthMs) : '—'}
                  </span>
                </li>
              ))}
            </ol>
          </section>

        </div>
      </div>
    </div>
  )
}

export default ReleaseDetailPage
