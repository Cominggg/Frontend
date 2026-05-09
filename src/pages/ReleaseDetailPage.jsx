import { Link, useParams } from 'react-router-dom'

import EmptyState from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import styles from './ReleaseDetailPage.module.css'

const RELEASE_TYPE_COLOR = {
  ALBUM: 'var(--color-accent)',
  SINGLE: 'var(--color-badge-single)',
  EP: 'var(--color-badge-ep)',
}

// TODO: API 연동 후 제거
const MOCK_RELEASE_MAP = {
  1: {
    id: 1,
    artistName: 'Kenshi Yonezu',
    artistId: 2,
    title: 'LOST CORNER',
    type: 'ALBUM',
    releaseDate: '2024.08.28',
    label: 'SME Records',
    accentFrom: '#0369a1',
    accentTo: '#7dd3fc',
    tracks: [
      { id: 1, title: 'LOST CORNER', duration: '4:22' },
      { id: 2, title: 'LADY', duration: '3:58' },
      { id: 3, title: 'メガヒットソング', duration: '3:47' },
      { id: 4, title: 'Azalea', duration: '4:11' },
      { id: 5, title: '地球儀', duration: '4:05' },
      { id: 6, title: '月を見ていた', duration: '3:53' },
      { id: 7, title: 'Underworld', duration: '3:34' },
      { id: 8, title: '毎日', duration: '3:29' },
      { id: 9, title: 'さよーならまたいつか！', duration: '4:17' },
      { id: 10, title: 'ハッピーエンド', duration: '3:56' },
      { id: 11, title: 'Kick Back', duration: '3:24' },
      { id: 12, title: 'PLACEBO + 野田洋次郎', duration: '4:38' },
    ],
  },
  2: {
    id: 2,
    artistName: 'Mrs. GREEN APPLE',
    artistId: 3,
    title: 'Soranji',
    type: 'SINGLE',
    releaseDate: '2025.03.20',
    label: 'Epic Records Japan',
    accentFrom: '#15803d',
    accentTo: '#86efac',
    tracks: [
      { id: 1, title: 'Soranji', duration: '3:52' },
      { id: 2, title: 'Soranji (Instrumental)', duration: '3:52' },
    ],
  },
  3: {
    id: 3,
    artistName: 'YOASOBI',
    artistId: 1,
    title: 'THE BOOK 4',
    type: 'ALBUM',
    releaseDate: '2025.02.15',
    label: 'Sony Music Labels',
    accentFrom: '#7c3aed',
    accentTo: '#c4b5fd',
    tracks: [
      { id: 1, title: 'アイドル', duration: '3:28' },
      { id: 2, title: '勇者', duration: '4:01' },
      { id: 3, title: '祝福', duration: '4:10' },
      { id: 4, title: 'セブンティーン', duration: '3:56' },
    ],
  },
  4: {
    id: 4,
    artistName: 'ZUTOMAYO',
    artistId: 4,
    title: 'Lose',
    type: 'SINGLE',
    releaseDate: '2025.01.30',
    label: 'IRORI Records',
    accentFrom: '#5b21b6',
    accentTo: '#a78bfa',
    tracks: [
      { id: 1, title: 'Lose', duration: '4:05' },
      { id: 2, title: 'Lose (Instrumental)', duration: '4:05' },
    ],
  },
  5: {
    id: 5,
    artistName: 'Ado',
    artistId: 5,
    title: 'Hibana',
    type: 'SINGLE',
    releaseDate: '2025.03.05',
    label: 'Universal Music Japan',
    accentFrom: '#be123c',
    accentTo: '#fda4af',
    tracks: [
      { id: 1, title: 'Hibana', duration: '3:44' },
      { id: 2, title: 'Hibana (Instrumental)', duration: '3:44' },
    ],
  },
  6: {
    id: 6,
    artistName: 'Official髭男dism',
    artistId: 6,
    title: 'Subtitle II',
    type: 'ALBUM',
    releaseDate: '2025.02.28',
    label: 'Pony Canyon',
    accentFrom: '#0f766e',
    accentTo: '#5eead4',
    tracks: [
      { id: 1, title: 'Subtitle', duration: '5:05' },
      { id: 2, title: 'Cry Baby', duration: '4:01' },
      { id: 3, title: 'Anarchy', duration: '3:55' },
      { id: 4, title: 'Sorosoro', duration: '4:12' },
    ],
  },
  7: {
    id: 7,
    artistName: 'King Gnu',
    artistId: 7,
    title: 'MIRROR',
    type: 'ALBUM',
    releaseDate: '2025.01.15',
    label: 'Ariola Japan',
    accentFrom: '#b45309',
    accentTo: '#fcd34d',
    tracks: [
      { id: 1, title: 'SPECIALZ', duration: '3:58' },
      { id: 2, title: '白日', duration: '5:26' },
      { id: 3, title: 'BOY', duration: '4:09' },
      { id: 4, title: 'Teenager Forever', duration: '3:37' },
    ],
  },
  8: {
    id: 8,
    artistName: 'Eve',
    artistId: 8,
    title: 'Heart',
    type: 'EP',
    releaseDate: '2025.03.12',
    label: 'ariola japan',
    accentFrom: '#9333ea',
    accentTo: '#d8b4fe',
    tracks: [
      { id: 1, title: 'Heart', duration: '4:18' },
      { id: 2, title: 'そのままで', duration: '3:55' },
      { id: 3, title: 'あの娘', duration: '4:02' },
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

  const { artistName, artistId, title, type, releaseDate, label, accentFrom, accentTo, tracks } = release
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
                <span>{releaseDate}</span>
                {label && <span className={styles.labelText}>{label}</span>}
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
                <li key={track.id} className={styles.trackItem}>
                  <span className={styles.trackNum}>{track.id}</span>
                  <span className={styles.trackTitle}>{track.title}</span>
                  <span className={styles.trackDuration}>{track.duration}</span>
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
