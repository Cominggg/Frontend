import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import ArtistConcertItem from '@/components/artist/ArtistConcertItem'
import EmptyState from '@/components/ui/EmptyState'
import InquiryModal from '@/components/ui/InquiryModal'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import styles from './ArtistDetailPage.module.css'

function formatFollowers(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만명`
  return `${n.toLocaleString()}명`
}

function fmtMs(ms) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function calcDday(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  const target = new Date(y, m - 1, d)
  if (isNaN(target.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

// ── TODO: API 연동 후 제거 ───────────────────────────────────────────
const MOCK_ARTIST_MAP = {
  1: {
    id: 1, name: 'YOASOBI', imageUrl: null,
    hasUpcomingConcert: true,
    isFollowing: false, followerCount: 24800,
    debutDate: '2019-09-12',
    links: [
      { id: 'spotify',   label: 'Spotify',     url: '#' },
      { id: 'youtube',   label: 'YouTube',     url: '#' },
      { id: 'twitter',   label: 'X (Twitter)', url: '#' },
      { id: 'instagram', label: 'Instagram',   url: '#' },
    ],
    concerts: [
      { id: 104, title: 'YOASOBI WORLD TOUR 2026 in Seoul',         startDate: '2026-07-20', endDate: '2026-07-21', venue: 'KSPO DOME, 서울',               status: 'UPCOMING' },
      { id: 1,   title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',   startDate: '2025-08-15', endDate: '2025-08-16', venue: 'KSPO DOME, 서울',               status: 'ENDED'    },
      { id: 101, title: 'YOASOBI THE BOOK CONCERT 2023',            startDate: '2023-05-27', endDate: '2023-05-28', venue: '올림픽공원 체조경기장, 서울',     status: 'ENDED'    },
      { id: 102, title: 'YOASOBI LIVE 2022 "Into The Night"',       startDate: '2022-10-15', endDate: null,         venue: '예스24 라이브홀, 서울',          status: 'ENDED'    },
      { id: 103, title: 'YOASOBI CONCERT 2021',                     startDate: '2021-09-04', endDate: null,         venue: '올림픽공원 K-아트홀, 서울',       status: 'ENDED'    },
    ],
    releases: [
      { id: 1, title: 'THE BOOK 4', type: 'ALBUM', releaseDate: '2025-02-15', tracks: [
        { position: 1, title: 'アイドル', length_ms: 208000 },
        { position: 2, title: '勇者', length_ms: 241000 },
        { position: 3, title: '祝福', length_ms: 250000 },
        { position: 4, title: 'セブンティーン', length_ms: 236000 },
      ]},
      { id: 2, title: 'Idol', type: 'SINGLE', releaseDate: '2023-05-19', tracks: [
        { position: 1, title: 'アイドル', length_ms: 208000 },
      ]},
      { id: 3, title: 'THE BOOK 3', type: 'ALBUM', releaseDate: '2023-03-29', tracks: [] },
      { id: 4, title: 'THE BOOK 2', type: 'ALBUM', releaseDate: '2022-06-29', tracks: [] },
      { id: 5, title: 'THE BOOK',   type: 'ALBUM', releaseDate: '2021-01-06', tracks: [] },
    ],
  },
  2: {
    id: 2, name: 'Kenshi Yonezu', imageUrl: null,
    hasUpcomingConcert: false,
    isFollowing: true, followerCount: 31200,
    debutDate: '2012-02-29',
    links: [
      { id: 'spotify',   label: 'Spotify',     url: '#' },
      { id: 'youtube',   label: 'YouTube',     url: '#' },
      { id: 'twitter',   label: 'X (Twitter)', url: '#' },
    ],
    concerts: [
      { id: 2,   title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',   startDate: '2025-04-19', endDate: '2025-04-20', venue: '고척스카이돔, 서울',             status: 'ENDED' },
      { id: 201, title: 'Kenshi Yonezu STADIUM LIVE 2023',          startDate: '2023-11-18', endDate: '2023-11-19', venue: '잠실종합운동장 주경기장, 서울',   status: 'ENDED' },
      { id: 202, title: 'Kenshi Yonezu HALL TOUR 2022',             startDate: '2022-06-11', endDate: null,         venue: '올림픽공원 체조경기장, 서울',     status: 'ENDED' },
    ],
    releases: [
      { id: 1, title: 'LOST CORNER', type: 'ALBUM', releaseDate: '2025-04-05', tracks: [
        { position: 1, title: 'LOST CORNER', length_ms: 262000 },
        { position: 2, title: 'LADY', length_ms: 238000 },
        { position: 3, title: 'メガヒットソング', length_ms: 227000 },
        { position: 4, title: 'Azalea', length_ms: 251000 },
      ]},
      { id: 2, title: 'Spinning Globe', type: 'SINGLE', releaseDate: '2022-12-08', tracks: [
        { position: 1, title: 'Spinning Globe', length_ms: 315000 },
      ]},
      { id: 3, title: 'STRAY SHEEP', type: 'ALBUM', releaseDate: '2020-08-05', tracks: [] },
      { id: 4, title: 'Pale Blue',   type: 'SINGLE', releaseDate: '2021-06-16', tracks: [
        { position: 1, title: 'Pale Blue', length_ms: 290000 },
      ]},
    ],
  },
  3: {
    id: 3, name: 'Ado', imageUrl: null,
    hasUpcomingConcert: true,
    isFollowing: false, followerCount: 19500,
    debutDate: '2020-10-02',
    links: [
      { id: 'spotify',   label: 'Spotify',     url: '#' },
      { id: 'youtube',   label: 'YouTube',     url: '#' },
      { id: 'twitter',   label: 'X (Twitter)', url: '#' },
      { id: 'instagram', label: 'Instagram',   url: '#' },
    ],
    concerts: [
      { id: 303, title: 'Ado WORLD TOUR 2026 "INAZUMA" in Seoul',   startDate: '2026-08-10', endDate: null,         venue: '고척스카이돔, 서울',             status: 'UPCOMING' },
      { id: 3,   title: 'Ado WORLD TOUR "Hibana" in Seoul',         startDate: '2025-06-21', endDate: null,         venue: '고척스카이돔, 서울',             status: 'ENDED'    },
      { id: 301, title: 'Ado WORLD TOUR 2024 "Wish"',               startDate: '2024-04-13', endDate: null,         venue: 'KSPO DOME, 서울',               status: 'ENDED'    },
      { id: 302, title: 'Ado LIVE 2023',                             startDate: '2023-08-05', endDate: null,         venue: '올림픽공원 체조경기장, 서울',     status: 'ENDED'    },
    ],
    releases: [
      { id: 1, title: 'Hibana', type: 'SINGLE', releaseDate: '2025-03-05', tracks: [
        { position: 1, title: 'Hibana', length_ms: 224000 },
        { position: 2, title: 'Hibana (Instrumental)', length_ms: 224000 },
      ]},
      { id: 2, title: 'Uta no Uta', type: 'ALBUM', releaseDate: '2023-04-26', tracks: [] },
      { id: 3, title: 'Usseewa',    type: 'SINGLE', releaseDate: '2020-10-02', tracks: [
        { position: 1, title: 'うっせぇわ', length_ms: 207000 },
      ]},
    ],
  },
}

function getMockArtist(id) {
  const FALLBACK_NAMES = {
    4: 'King Gnu', 5: 'Official髭男dism', 6: 'RADWIMPS',
    7: 'Mrs. GREEN APPLE', 8: 'Fujii Kaze', 9: 'ZUTOMAYO',
    10: 'Creepy Nuts', 11: 'ONE OK ROCK', 12: 'Eve',
    13: 'Yorushika', 14: 'Aimer', 15: 'Aimyon',
    16: 'mol-74', 17: 'syudou', 18: 'back number',
  }

  if (MOCK_ARTIST_MAP[id]) return MOCK_ARTIST_MAP[id]

  const name = FALLBACK_NAMES[id]
  if (!name) return null

  return {
    id, name, imageUrl: null, hasUpcomingConcert: false,
    isFollowing: false, followerCount: 5000,
    debutDate: null,
    links: [], concerts: [], releases: [],
  }
}
// ────────────────────────────────────────────────────────────────────

const CONCERT_TABS = ['전체', '예정', '과거']

function ArtistDetailPage() {
  const { id } = useParams()
  const artist = getMockArtist(Number(id))

  const [isFollowing, setIsFollowing] = useState(artist?.isFollowing ?? false)
  const [imgFailed, setImgFailed] = useState(false)
  const [concertTab, setConcertTab] = useState('전체')
  const [openReleaseId, setOpenReleaseId] = useState(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  // TODO: React Query 연동 후 isLoading으로 교체
  const isLoading = false

  function handleFollow() {
    if (!user) { openLoginModal(window.location.href); return }
    setIsFollowing((prev) => !prev)
  }

  function handleArtistInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryOpen(true)
  }

  if (isLoading) return null // TODO: 스켈레톤으로 교체

  if (!artist) {
    return (
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        message="찾을 수 없는 아티스트입니다"
        action={{ to: ROUTES.ARTISTS, label: '아티스트 목록으로' }}
      />
    )
  }

  const { name, imageUrl, hasUpcomingConcert, followerCount,
          debutDate, links, concerts, releases } = artist
  const showPlaceholder = !imageUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(name)

  const upcomingConcerts = concerts.filter(
    (c) => c.status === 'UPCOMING' || c.status === 'ONGOING'
  )
  const pastConcerts = concerts.filter(
    (c) => c.status === 'ENDED' || c.status === 'CANCELLED'
  )
  const displayedConcerts =
    concertTab === '전체' ? concerts :
    concertTab === '예정' ? upcomingConcerts :
    pastConcerts

  // D-day: 가장 빠른 예정 공연 기준
  const nextConcert = upcomingConcerts
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  const dday = nextConcert ? calcDday(nextConcert.startDate) : null
  const showDday = dday !== null && dday >= 0

  return (
    <>
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 뒤로 가기 */}
        <Link to={ROUTES.ARTISTS} className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          아티스트 목록
        </Link>

        {/* 히어로 */}
        <section
          className={styles.hero}
          style={{ '--hero-from': colorFrom + '18', '--hero-to': colorTo + '08' }}
        >
          {/* 아바타 */}
          <div className={styles.avatarWrap}>
            {showPlaceholder ? (
              <div
                className={styles.avatarPlaceholder}
                style={{ '--a-from': colorFrom, '--a-to': colorTo }}
              >
                <span className={styles.avatarInitial}>{name.charAt(0)}</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={name}
                className={styles.avatar}
                onError={() => setImgFailed(true)}
              />
            )}
          </div>

          {/* 정보 */}
          <div className={styles.heroInfo}>
            {hasUpcomingConcert && <span className={styles.comingBadge}>COMING</span>}
            <h1 className={styles.artistName}>{name}</h1>

            {/* 프로필 정보 */}
            <dl className={styles.profileList}>
              {debutDate && (
                <div className={styles.profileItem}>
                  <dt>데뷔</dt>
                  <dd>{formatDate(debutDate)}</dd>
                </div>
              )}
            </dl>

            <p className={styles.followers}>팔로워 {formatFollowers(followerCount)}</p>
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
              onClick={handleFollow}
              aria-label={isFollowing ? `${name} 언팔로우` : `${name} 팔로우`}
            >
              {isFollowing ? '팔로잉' : '+ 팔로우'}
            </button>
          </div>
        </section>

        {/* D-day 배너 */}
        {showDday && (
          <div className={styles.ddayBanner}>
            <div className={styles.ddayContent}>
              <span className={styles.ddayLabel}>다음 내한 공연</span>
              <div className={styles.ddayInfo}>
                <span className={styles.ddayTitle}>{nextConcert.title}</span>
                <span className={styles.ddayDate}>{formatDate(nextConcert.startDate)}{nextConcert.venue ? ` · ${nextConcert.venue}` : ''}</span>
              </div>
            </div>
            <div className={styles.ddayCount}>
              {dday === 0 ? 'D-DAY' : `D-${dday}`}
            </div>
          </div>
        )}

        {/* 외부 링크 (MusicBrainz url-rels) */}
        {links.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>스트리밍 / 소셜</h2>
            <div className={styles.links}>
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                >
                  {link.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 디스코그래피 */}
        {releases && releases.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              디스코그래피
              <span className={styles.sectionCount}>{releases.length}</span>
            </h2>
            <div className={styles.releaseList}>
              {releases.map((rel) => {
                const hasTracks = rel.tracks && rel.tracks.length > 0
                const isOpen = openReleaseId === rel.id
                return (
                  <div key={rel.id} className={styles.releaseGroup}>
                    <button
                      className={`${styles.releaseItem} ${hasTracks ? styles.releaseItemToggle : ''}`}
                      onClick={() => hasTracks && setOpenReleaseId(isOpen ? null : rel.id)}
                      aria-expanded={hasTracks ? isOpen : undefined}
                      disabled={!hasTracks}
                    >
                      <span className={`${styles.releaseBadge} ${styles[`releaseBadge${rel.type}`] || ''}`}>
                        {rel.type}
                      </span>
                      <span className={styles.releaseTitle}>{rel.title}</span>
                      <span className={styles.releaseDate}>{rel.releaseDate}</span>
                      {hasTracks && (
                        <svg
                          className={`${styles.releaseChevron} ${isOpen ? styles.releaseChevronOpen : ''}`}
                          width="14" height="14" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      )}
                    </button>
                    {hasTracks && isOpen && (
                      <ol className={styles.trackList}>
                        {rel.tracks.map((t) => (
                          <li key={t.position} className={styles.trackItem}>
                            <span className={styles.trackPosition}>{t.position}</span>
                            <span className={styles.trackTitle}>{t.title}</span>
                            <span className={styles.trackDuration}>{fmtMs(t.length_ms)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 내한 공연 내역 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>내한 공연 내역</h2>

          {/* 예정 / 과거 탭 */}
          <div className={styles.concertTabs} role="tablist" aria-label="공연 구분">
            {CONCERT_TABS.map((tab) => {
              const count =
                tab === '전체' ? concerts.length :
                tab === '예정' ? upcomingConcerts.length :
                pastConcerts.length
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={concertTab === tab}
                  className={`${styles.concertTab} ${concertTab === tab ? styles.concertTabActive : ''}`}
                  onClick={() => setConcertTab(tab)}
                >
                  {tab}
                  <span className={styles.concertTabCount}>{count}</span>
                </button>
              )
            })}
          </div>

          {displayedConcerts.length > 0 ? (
            <div className={styles.concertList}>
              {displayedConcerts.map((concert) => (
                <ArtistConcertItem key={concert.id} concert={concert} />
              ))}
            </div>
          ) : (
            <EmptyState
              message={
                concertTab === '전체' ? '등록된 내한 공연 내역이 없습니다.' :
                concertTab === '예정' ? '예정된 내한 공연이 없습니다.' :
                '과거 내한 공연 내역이 없습니다.'
              }
            />
          )}
        </section>

        {/* 아티스트 정보 문의 */}
        <div className={styles.inquiryRow}>
          <button className={styles.inquiryBtn} onClick={handleArtistInquiry}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            아티스트 정보 문의
          </button>
        </div>

      </div>
    </div>
    <InquiryModal
      key={inquiryOpen ? 'open' : 'closed'}
      isOpen={inquiryOpen}
      onClose={() => setInquiryOpen(false)}
      type="ARTIST"
    />
    </>
  )
}

export default ArtistDetailPage
