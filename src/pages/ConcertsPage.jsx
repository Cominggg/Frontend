import { useState, useMemo } from 'react'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { MOCK_FOLLOWED_ARTISTS } from '@/mocks/followedArtistMocks'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './ConcertsPage.module.css'

// TODO: API 연동 후 제거
const MOCK_CONCERTS = [
  { id: 1,  posterUrl: null, artistName: 'YOASOBI',          title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',         startDate: '2025.08.15', endDate: '2025.08.16', venue: 'KSPO DOME, 서울',                  status: '공연예정' },
  { id: 2,  posterUrl: null, artistName: 'Kenshi Yonezu',     title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',         startDate: '2025.04.19', endDate: '2025.04.20', venue: '고척스카이돔, 서울',               status: '공연완료' },
  { id: 3,  posterUrl: null, artistName: 'Ado',               title: 'Ado WORLD TOUR "Hibana" in Seoul',              startDate: '2025.06.21', endDate: null,         venue: '고척스카이돔, 서울',               status: '공연예정' },
  { id: 4,  posterUrl: null, artistName: 'King Gnu',          title: 'King Gnu LIVE TOUR 2025',                       startDate: '2025.09.06', endDate: '2025.09.07', venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 5,  posterUrl: null, artistName: 'RADWIMPS',          title: 'RADWIMPS LIVE TOUR 2025',                       startDate: '2025.07.12', endDate: null,         venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 6,  posterUrl: null, artistName: 'Mrs. GREEN APPLE',  title: 'Mrs. GREEN APPLE TOUR 2025',                   startDate: '2025.10.18', endDate: '2025.10.19', venue: 'KSPO DOME, 서울',                  status: '공연예정' },
  { id: 7,  posterUrl: null, artistName: 'Fujii Kaze',        title: 'Fujii Kaze LOVE ALL SERVE ALL STADIUM LIVE',   startDate: '2025.05.03', endDate: null,         venue: '부산 사직실내체육관, 부산',         status: '공연완료' },
  { id: 8,  posterUrl: 'https://etbr-cms-site.s3.ap-northeast-1.amazonaws.com/zutomayo.net/share/intense2/ZUTOMAYO_SEOUL_2026031415.jpg', artistName: 'ZUTOMAYO', title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」in Seoul', startDate: '2026.03.14', endDate: '2026.03.15', venue: '고려대학교 화정체육관, 서울',       status: '공연완료' },
  { id: 9,  posterUrl: null, artistName: 'Creepy Nuts',       title: 'Creepy Nuts LIVE 2025 "2 Baddies"',            startDate: '2025.08.30', endDate: null,         venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 10, posterUrl: null, artistName: 'ONE OK ROCK',       title: 'ONE OK ROCK 2024 LUXURY DISEASE ASIA TOUR',    startDate: '2024.08.10', endDate: null,         venue: '올림픽공원 88잔디마당, 서울',       status: '공연완료' },
  { id: 11, posterUrl: null, artistName: 'Aimer',             title: 'Aimer Live in Korea "Ref:rain / EYELESS"',     startDate: '2024.11.16', endDate: '2024.11.17', venue: 'KSPO DOME, 서울',                  status: '공연완료' },
  { id: 12, posterUrl: null, artistName: 'Official髭男dism',  title: 'Official髭男dism one-man live tour 2025',       startDate: '2025.12.06', endDate: null,         venue: '인스파이어 아레나, 인천',           status: '공연예정' },
  { id: 13, posterUrl: null, artistName: 'Ado',               title: 'Ado WORLD TOUR 2024 "Wish"',                   startDate: '2024.04.13', endDate: null,         venue: 'KSPO DOME, 서울',                  status: '공연완료' },
  { id: 14, posterUrl: null, artistName: 'YOASOBI',           title: 'YOASOBI THE BOOK CONCERT 2023',                startDate: '2023.05.27', endDate: '2023.05.28', venue: '올림픽공원 체조경기장, 서울',       status: '공연완료' },
  { id: 15, posterUrl: null, artistName: 'Kenshi Yonezu',     title: 'Kenshi Yonezu STADIUM LIVE 2023',              startDate: '2023.11.18', endDate: '2023.11.19', venue: '잠실종합운동장 주경기장, 서울',     status: '공연완료' },
  { id: 16, posterUrl: null, artistName: 'Vaundy',            title: 'Vaundy one man live "replica"',                 startDate: '2025.11.22', endDate: null,         venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 17, posterUrl: null, artistName: 'Eve',               title: 'Eve LIVE TOUR 2025 "Smile"',                   startDate: '2025.09.20', endDate: null,         venue: 'YES24 라이브홀, 서울',              status: '공연예정' },
  { id: 18, posterUrl: null, artistName: 'Yorushika',         title: 'Yorushika LIVE 2024 "Plagiarism"',             startDate: '2024.10.05', endDate: null,         venue: 'KSPO DOME, 서울',                  status: '공연완료' },
  { id: 19, posterUrl: null, artistName: 'milet',             title: 'milet live tour "eyes" in Seoul',               startDate: '2025.03.15', endDate: null,         venue: 'YES24 라이브홀, 서울',              status: '공연완료' },
  { id: 20, posterUrl: null, artistName: 'Saucy Dog',         title: 'Saucy Dog LIVE TOUR 2025',                     startDate: '2025.10.04', endDate: null,         venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 21, posterUrl: null, artistName: 'amazarashi',        title: 'amazarashi LIVE 2025 "Minima Moralia"',        startDate: '2025.08.23', endDate: null,         venue: 'YES24 라이브홀, 서울',              status: '공연예정' },
]

const STATUS_FILTERS = ['전체', '공연예정', '공연중', '공연완료', '공연취소']
const ITEMS_PER_PAGE = 20

function ConcertsPage() {
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [followedOnly, setFollowedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  // 비로그인 상태에서는 토글이 켜져 있더라도 필터를 적용하지 않음
  const effectiveFollowedOnly = followedOnly && !!user
  // TODO: React Query 연동 후 useQuery의 isLoading으로 교체
  const isLoading = false

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    setFollowedOnly((prev) => !prev)
    setCurrentPage(1)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_CONCERTS.filter((c) => {
      const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.artistName.toLowerCase().includes(q)
      const matchesStatus = selectedStatus === '전체' || c.status === selectedStatus
      const matchesFollowed = !effectiveFollowedOnly || MOCK_FOLLOWED_ARTISTS.has(c.artistName)
      return matchesQuery && matchesStatus && matchesFollowed
    })
  }, [query, selectedStatus, effectiveFollowedOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>공연</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${filtered.length}건`}
          </p>
        </div>

        {/* 검색 */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="공연명 또는 아티스트 검색..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1) }}
            aria-label="공연 검색"
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => { setQuery(''); setCurrentPage(1) }}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 공연 상태 필터 + 관심 아티스트 토글 */}
        <div className={styles.filterRow}>
          <div className={styles.filterBar} role="tablist" aria-label="공연 상태 필터">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={selectedStatus === s}
                className={`${styles.filterTab} ${selectedStatus === s ? styles.filterTabActive : ''}`}
                onClick={() => { setSelectedStatus(s); setCurrentPage(1) }}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            className={`${styles.followedToggle} ${effectiveFollowedOnly ? styles.followedToggleActive : ''}`}
            onClick={handleFollowedToggle}
            aria-pressed={effectiveFollowedOnly}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={effectiveFollowedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            관심 아티스트만
          </button>
        </div>

        {/* 공연 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ConcertCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {paginated.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            message="해당 조건의 공연이 없습니다."
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

      </div>
    </div>
  )
}

export default ConcertsPage
