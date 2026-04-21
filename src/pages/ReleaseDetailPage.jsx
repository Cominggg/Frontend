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
    accentFrom: '#0369a1',
    accentTo: '#7dd3fc',
    description:
      '요네즈 켄시의 여섯 번째 정규 앨범. 영화 "Sand Land" 주제가 "LOST CORNER"를 비롯해 다양한 타이업 곡들이 수록된 앨범으로, 만화 원작 팬들과 새로운 청중 모두를 아우르는 폭넓은 스펙트럼을 보여준다.',
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
    credits: [
      { role: 'Lyrics', names: '米津玄師' },
      { role: 'Music', names: '米津玄師' },
      { role: 'Arrangement', names: '米津玄師' },
      { role: 'Produced by', names: '米津玄師' },
      { role: 'Label', names: 'SME Records' },
    ],
  },
  2: {
    id: 2,
    artistName: 'YOASOBI',
    artistId: 1,
    title: 'THE BOOK 3',
    type: 'EP',
    releaseDate: '2023.12.06',
    accentFrom: '#7c3aed',
    accentTo: '#c4b5fd',
    description:
      'YOASOBI의 세 번째 EP. "アイドル", "勇者", "祝福" 등 히트곡들과 더불어 소설을 음악으로 변환하는 YOASOBI만의 독특한 콘셉트를 담아냈다.',
    tracks: [
      { id: 1, title: 'アイドル', duration: '3:28' },
      { id: 2, title: '勇者', duration: '4:01' },
      { id: 3, title: '祝福', duration: '4:10' },
      { id: 4, title: 'セブンティーン', duration: '3:56' },
      { id: 5, title: 'ツバメ', duration: '4:13' },
      { id: 6, title: '好きだ', duration: '3:44' },
    ],
    credits: [
      { role: 'Vocals', names: 'ikura (幾田りら)' },
      { role: 'Composition', names: 'Ayase' },
      { role: 'Lyrics', names: 'Ayase' },
      { role: 'Label', names: 'Sony Music Labels' },
    ],
  },
}

function ReleaseDetailPage() {
  const { id } = useParams()
  const release = MOCK_RELEASE_MAP[Number(id)]

  if (!release) {
    return (
      <div className={styles.page}>
        <EmptyState message="릴리즈 정보가 존재하지 않습니다" />
      </div>
    )
  }

  const { artistName, artistId, title, type, releaseDate, accentFrom, accentTo, description, tracks, credits } = release
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

          {/* 사이드바: 소개 + 크레딧 */}
          <aside className={styles.sidebar}>
            {/* 소개 텍스트 */}
            <section className={styles.descSection}>
              <h2 className={styles.sectionHeading}>About</h2>
              <p className={styles.descText}>{description}</p>
            </section>

            {/* 크레딧 */}
            <section className={styles.creditsSection}>
              <h2 className={styles.sectionHeading}>Credits</h2>
              <div className={styles.creditBox}>
                {credits.map((credit) => (
                  <div key={credit.role} className={styles.creditGroup}>
                    <span className={styles.creditRole}>{credit.role}</span>
                    <span className={styles.creditNames}>{credit.names}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ReleaseDetailPage
