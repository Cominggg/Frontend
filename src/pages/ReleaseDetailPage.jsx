import { Link, useParams } from 'react-router-dom'

import EmptyState from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import styles from './ReleaseDetailPage.module.css'

function fmtMs(ms) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const RELEASE_TYPE_COLOR = {
  ALBUM: 'var(--color-accent)',
  SINGLE: 'var(--color-badge-single)',
  EP: 'var(--color-badge-ep)',
}

// TODO: API 연동 후 제거
const MOCK_RELEASE_MAP = {
  1: {
    id: 1, artistName: 'Kenshi Yonezu', artistId: 2,
    title: 'LOST CORNER', type: 'ALBUM', releaseDate: '2024-08-28',
    tracks: [
      { position: 1,  title: 'LOST CORNER',        length_ms: 262000 },
      { position: 2,  title: 'LADY',               length_ms: 238000 },
      { position: 3,  title: 'メガヒットソング',    length_ms: 227000 },
      { position: 4,  title: 'Azalea',             length_ms: 251000 },
      { position: 5,  title: '地球儀',             length_ms: 245000 },
      { position: 6,  title: '月を見ていた',        length_ms: 233000 },
      { position: 7,  title: 'Underworld',          length_ms: 214000 },
      { position: 8,  title: '毎日',               length_ms: 209000 },
      { position: 9,  title: 'さよーならまたいつか！', length_ms: 257000 },
      { position: 10, title: 'ハッピーエンド',      length_ms: 236000 },
      { position: 11, title: 'Kick Back',           length_ms: 204000 },
      { position: 12, title: 'PLACEBO + 野田洋次郎', length_ms: 278000 },
    ],
  },
  2: {
    id: 2, artistName: 'Mrs. GREEN APPLE', artistId: 3,
    title: 'Soranji', type: 'SINGLE', releaseDate: '2025-03-20',
    tracks: [
      { position: 1, title: 'Soranji',              length_ms: 232000 },
      { position: 2, title: 'Soranji (Instrumental)', length_ms: 232000 },
    ],
  },
  3: {
    id: 3, artistName: 'YOASOBI', artistId: 1,
    title: 'THE BOOK 4', type: 'ALBUM', releaseDate: '2025-02-15',
    tracks: [
      { position: 1, title: 'アイドル',      length_ms: 208000 },
      { position: 2, title: '勇者',          length_ms: 241000 },
      { position: 3, title: '祝福',          length_ms: 250000 },
      { position: 4, title: 'セブンティーン', length_ms: 236000 },
    ],
  },
  4: {
    id: 4, artistName: 'ZUTOMAYO', artistId: 4,
    title: 'Lose', type: 'SINGLE', releaseDate: '2025-01-30',
    tracks: [
      { position: 1, title: 'Lose',              length_ms: 245000 },
      { position: 2, title: 'Lose (Instrumental)', length_ms: 245000 },
    ],
  },
  5: {
    id: 5, artistName: 'Ado', artistId: 5,
    title: 'Hibana', type: 'SINGLE', releaseDate: '2025-03-05',
    tracks: [
      { position: 1, title: 'Hibana',              length_ms: 224000 },
      { position: 2, title: 'Hibana (Instrumental)', length_ms: 224000 },
    ],
  },
  6: {
    id: 6, artistName: 'Official髭男dism', artistId: 6,
    title: 'Subtitle II', type: 'ALBUM', releaseDate: '2025-02-28',
    tracks: [
      { position: 1, title: 'Subtitle',  length_ms: 305000 },
      { position: 2, title: 'Cry Baby', length_ms: 241000 },
      { position: 3, title: 'Anarchy',  length_ms: 235000 },
      { position: 4, title: 'Sorosoro', length_ms: 252000 },
    ],
  },
  7: {
    id: 7, artistName: 'King Gnu', artistId: 7,
    title: 'MIRROR', type: 'ALBUM', releaseDate: '2025-01-15',
    tracks: [
      { position: 1, title: 'SPECIALZ',          length_ms: 238000 },
      { position: 2, title: '白日',              length_ms: 326000 },
      { position: 3, title: 'BOY',               length_ms: 249000 },
      { position: 4, title: 'Teenager Forever',  length_ms: 217000 },
    ],
  },
  8: {
    id: 8, artistName: 'Eve', artistId: 8,
    title: 'Heart', type: 'EP', releaseDate: '2025-03-12',
    tracks: [
      { position: 1, title: 'Heart',    length_ms: 258000 },
      { position: 2, title: 'そのままで', length_ms: 235000 },
      { position: 3, title: 'あの娘',   length_ms: 242000 },
    ],
  },
}

function ReleaseDetailPage() {
  const { id } = useParams()
  const release = MOCK_RELEASE_MAP[Number(id)]

  if (!release) {
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

  const { artistName, artistId, title, type, releaseDate, tracks } = release
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
              <div
                className={styles.coverPlaceholder}
                style={{ '--a-from': accentFrom, '--a-to': accentTo }}
              >
                <span className={styles.coverTypeLabel}>{type}</span>
              </div>
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
                  <span className={styles.trackDuration}>{fmtMs(track.length_ms)}</span>
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
