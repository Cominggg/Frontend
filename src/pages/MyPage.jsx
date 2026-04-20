import { useState } from 'react'
import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import styles from './MyPage.module.css'

// TODO: API 연동 후 제거
const MOCK_FOLLOWED_ARTISTS = [
  { id: 2, name: 'Kenshi Yonezu', imageUrl: null, genres: ['J-Pop', 'Rock'], hasUpcomingConcert: false },
  { id: 6, name: 'RADWIMPS',      imageUrl: null, genres: ['J-Rock', 'Anime'], hasUpcomingConcert: true  },
]

// TODO: API 연동 후 제거 (MY-03)
const MOCK_UPCOMING_CONCERTS = [
  { id: 1,  artistName: 'YOASOBI',          title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',    startDate: '2025.08.15', endDate: '2025.08.16', venue: 'KSPO DOME, 서울',                   status: '공연예정' },
  { id: 2,  artistName: 'King Gnu',          title: 'King Gnu Live Tour 2025',                  startDate: '2025.07.05', endDate: '2025.07.06', venue: '올림픽공원 체조경기장, 서울',         status: '공연예정' },
  { id: 3,  artistName: 'Ado',               title: 'Ado WORLD TOUR "Hibana" in Seoul',         startDate: '2025.06.21', endDate: null,         venue: '고척스카이돔, 서울',                 status: '공연예정' },
  { id: 7,  artistName: 'Mrs. GREEN APPLE',  title: 'Mrs. GREEN APPLE ARENA TOUR 2025',         startDate: '2025.10.04', endDate: '2025.10.05', venue: 'KSPO DOME, 서울',                   status: '공연예정' },
  { id: 9,  artistName: 'RADWIMPS',          title: 'RADWIMPS LIVE TOUR 2025',                  startDate: '2025.11.22', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연예정' },
  { id: 10, artistName: 'Fujii Kaze',        title: 'Fujii Kaze LOVE ALL SERVE ALL STADIUM LIVE', startDate: '2025.08.30', endDate: '2025.08.31', venue: '잠실종합운동장 주경기장, 서울',   status: '공연예정' },
]

// TODO: API 연동 후 제거 (MY-01)
const MOCK_PAST_CONCERTS = [
  { id: 1,   artistName: 'YOASOBI',         title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',    startDate: '2025.08.15', endDate: '2025.08.16', venue: 'KSPO DOME, 서울',                   status: '공연완료' },
  { id: 2,   artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',    startDate: '2025.04.19', endDate: '2025.04.20', venue: '고척스카이돔, 서울',                 status: '공연완료' },
  { id: 3,   artistName: 'Ado',             title: 'Ado WORLD TOUR "Hibana" in Seoul',          startDate: '2025.06.21', endDate: null,         venue: '고척스카이돔, 서울',                 status: '공연완료' },
  { id: 201, artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu STADIUM LIVE 2023',           startDate: '2023.11.18', endDate: '2023.11.19', venue: '잠실종합운동장 주경기장, 서울',       status: '공연완료' },
  { id: 101, artistName: 'YOASOBI',         title: 'YOASOBI THE BOOK CONCERT 2023',             startDate: '2023.05.27', endDate: '2023.05.28', venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 301, artistName: 'Ado',             title: 'Ado WORLD TOUR 2024 "Wish"',                startDate: '2024.04.13', endDate: null,         venue: 'KSPO DOME, 서울',                   status: '공연완료' },
  { id: 202, artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu HALL TOUR 2022',              startDate: '2022.06.11', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 102, artistName: 'YOASOBI',         title: 'YOASOBI LIVE 2022 "Into The Night"',        startDate: '2022.10.15', endDate: null,         venue: '예스24 라이브홀, 서울',               status: '공연완료' },
  { id: 302, artistName: 'Ado',             title: 'Ado LIVE 2023',                             startDate: '2023.08.05', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 103, artistName: 'YOASOBI',         title: 'YOASOBI CONCERT 2021',                      startDate: '2021.09.04', endDate: null,         venue: '올림픽공원 K-아트홀, 서울',           status: '공연완료' },
  { id: 401, artistName: 'RADWIMPS',        title: 'RADWIMPS LIVE TOUR 2024',                   startDate: '2024.09.14', endDate: '2024.09.15', venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
]

const TABS = [
  { id: 'artists',  label: '관심 아티스트' },
  { id: 'upcoming', label: '예정 공연' },
  { id: 'history',  label: '다녀온 공연' },
]

const MY_PAGE_SIZE = 10

function ArtistRow({ artist, onUnfollow }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [colorFrom, colorTo] = getArtistColor(artist.name)
  const showPlaceholder = !artist.imageUrl || imgFailed

  return (
    <div className={styles.artistRow}>
      <Link to={ROUTES.ARTIST_DETAIL(artist.id)} className={styles.artistRowLink}>
        <div
          className={styles.artistAvatar}
          style={{ '--a-from': colorFrom, '--a-to': colorTo }}
        >
          {showPlaceholder ? (
            <span className={styles.artistAvatarInitial}>{artist.name.charAt(0)}</span>
          ) : (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className={styles.artistAvatarImg}
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <div className={styles.artistRowInfo}>
          <div className={styles.artistRowNameRow}>
            <span className={styles.artistRowName}>{artist.name}</span>
            {artist.hasUpcomingConcert && (
              <span className={styles.comingBadge}>COMING</span>
            )}
          </div>
          {artist.genres.length > 0 && (
            <div className={styles.artistRowGenres}>
              {artist.genres.map((g) => (
                <span key={g} className={styles.genreChip}>{g}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <button
        className={styles.unfollowBtn}
        onClick={() => onUnfollow(artist.id)}
        aria-label={`${artist.name} 언팔로우`}
      >
        언팔로우
      </button>
    </div>
  )
}

function ConcertRow({ concert }) {
  const { id, artistName, title, startDate, endDate, venue, status } = concert
  const dateRange = endDate && endDate !== startDate
    ? `${startDate} ~ ${endDate}`
    : startDate

  return (
    <Link to={ROUTES.CONCERT_DETAIL(id)} className={styles.concertRow}>
      <div className={styles.concertRowLeft}>
        <div className={styles.concertRowMeta}>
          <span className={styles.concertRowArtist}>{artistName}</span>
          <Badge status={status} />
        </div>
        <p className={styles.concertRowTitle}>{title}</p>
        <div className={styles.concertRowDetails}>
          <span className={styles.concertRowDetail}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dateRange}
          </span>
          <span className={styles.concertRowDetail}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {venue}
          </span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.concertRowChevron} aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  )
}

function MyPage() {
  const [activeTab, setActiveTab] = useState('artists')
  const [followedArtists, setFollowedArtists] = useState(MOCK_FOLLOWED_ARTISTS)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)

  function handleUnfollow(artistId) {
    setFollowedArtists((prev) => prev.filter((a) => a.id !== artistId))
  }

  const totalUpcomingPages = Math.max(1, Math.ceil(MOCK_UPCOMING_CONCERTS.length / MY_PAGE_SIZE))
  const paginatedUpcoming = MOCK_UPCOMING_CONCERTS.slice(
    (upcomingPage - 1) * MY_PAGE_SIZE,
    upcomingPage * MY_PAGE_SIZE
  )

  const totalHistoryPages = Math.max(1, Math.ceil(MOCK_PAST_CONCERTS.length / MY_PAGE_SIZE))
  const paginatedHistory = MOCK_PAST_CONCERTS.slice(
    (historyPage - 1) * MY_PAGE_SIZE,
    historyPage * MY_PAGE_SIZE
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 페이지 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>마이페이지</h1>
        </div>

        {/* 탭 */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 관심 아티스트 탭 (MY-02) */}
        {activeTab === 'artists' && (
          <div role="tabpanel" id="tabpanel-artists" aria-labelledby="tab-artists">
            {followedArtists.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                }
                message="팔로우한 아티스트가 없습니다."
                action={{ label: '아티스트 둘러보기', to: ROUTES.ARTISTS }}
              />
            ) : (
              <div className={styles.artistList}>
                {followedArtists.map((artist) => (
                  <ArtistRow key={artist.id} artist={artist} onUnfollow={handleUnfollow} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 예정 공연 탭 (MY-03) */}
        {activeTab === 'upcoming' && (
          <div role="tabpanel" id="tabpanel-upcoming" aria-labelledby="tab-upcoming">
            {paginatedUpcoming.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                message="예정된 공연이 없습니다."
              />
            ) : (
              <>
                <div className={styles.concertList}>
                  {paginatedUpcoming.map((concert) => (
                    <ConcertRow key={concert.id} concert={concert} />
                  ))}
                </div>

                {totalUpcomingPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                      disabled={upcomingPage === 1}
                      aria-label="이전 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalUpcomingPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === upcomingPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setUpcomingPage(p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === upcomingPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setUpcomingPage((p) => Math.min(totalUpcomingPages, p + 1))}
                      disabled={upcomingPage === totalUpcomingPages}
                      aria-label="다음 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 다녀온 공연 탭 (MY-01) */}
        {activeTab === 'history' && (
          <div role="tabpanel" id="tabpanel-history" aria-labelledby="tab-history">
            {paginatedHistory.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
                message="다녀온 공연 내역이 없습니다."
              />
            ) : (
              <>
                <div className={styles.concertList}>
                  {paginatedHistory.map((concert) => (
                    <ConcertRow key={concert.id} concert={concert} />
                  ))}
                </div>

                {totalHistoryPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      aria-label="이전 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === historyPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setHistoryPage(p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === historyPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                      aria-label="다음 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyPage
