import { useState, useMemo } from 'react'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
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
  { id: 8,  posterUrl: null, artistName: 'ZUTOMAYO',          title: 'ZUTOMAYO LIVE TOUR 2025',                       startDate: '2025.11.22', endDate: null,         venue: '예스24 라이브홀, 서울',            status: '공연예정' },
  { id: 9,  posterUrl: null, artistName: 'Creepy Nuts',       title: 'Creepy Nuts LIVE 2025 "2 Baddies"',            startDate: '2025.08.30', endDate: null,         venue: '올림픽공원 체조경기장, 서울',       status: '공연예정' },
  { id: 10, posterUrl: null, artistName: 'ONE OK ROCK',       title: 'ONE OK ROCK 2024 LUXURY DISEASE ASIA TOUR',    startDate: '2024.08.10', endDate: null,         venue: '올림픽공원 88잔디마당, 서울',       status: '공연완료' },
  { id: 11, posterUrl: null, artistName: 'Aimer',             title: 'Aimer Live in Korea "Ref:rain / EYELESS"',     startDate: '2024.11.16', endDate: '2024.11.17', venue: 'KSPO DOME, 서울',                  status: '공연완료' },
  { id: 12, posterUrl: null, artistName: 'Official髭男dism',  title: 'Official髭男dism one-man live tour 2025',       startDate: '2025.12.06', endDate: null,         venue: '인스파이어 아레나, 인천',           status: '공연예정' },
  { id: 13, posterUrl: null, artistName: 'Ado',               title: 'Ado WORLD TOUR 2024 "Wish"',                   startDate: '2024.04.13', endDate: null,         venue: 'KSPO DOME, 서울',                  status: '공연완료' },
  { id: 14, posterUrl: null, artistName: 'YOASOBI',           title: 'YOASOBI THE BOOK CONCERT 2023',                startDate: '2023.05.27', endDate: '2023.05.28', venue: '올림픽공원 체조경기장, 서울',       status: '공연완료' },
  { id: 15, posterUrl: null, artistName: 'Kenshi Yonezu',     title: 'Kenshi Yonezu STADIUM LIVE 2023',              startDate: '2023.11.18', endDate: '2023.11.19', venue: '잠실종합운동장 주경기장, 서울',     status: '공연완료' },
]

const STATUS_FILTERS = ['전체', '공연예정', '공연중', '공연완료', '공연취소']

function ConcertsPage() {
  const [query, setQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('전체')
  // TODO: React Query 연동 후 useQuery의 isLoading으로 교체
  const isLoading = false

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_CONCERTS.filter((c) => {
      const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.artistName.toLowerCase().includes(q)
      const matchesStatus = selectedStatus === '전체' || c.status === selectedStatus
      return matchesQuery && matchesStatus
    })
  }, [query, selectedStatus])

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
            onChange={(e) => setQuery(e.target.value)}
            aria-label="공연 검색"
          />
          {query && (
            <button
              className={styles.searchClear}
              onClick={() => setQuery('')}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 공연 상태 필터 */}
        <div className={styles.filterBar} role="tablist" aria-label="공연 상태 필터">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={selectedStatus === s}
              className={`${styles.filterTab} ${selectedStatus === s ? styles.filterTabActive : ''}`}
              onClick={() => setSelectedStatus(s)}
            >
              {s}
            </button>
          ))}
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
            {filtered.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <p className={styles.emptyText}>해당 조건의 공연이 없습니다.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default ConcertsPage
