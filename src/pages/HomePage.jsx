import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import { ROUTES } from '@/constants/routes'
import styles from './HomePage.module.css'

// TODO: API 연동 후 제거 (CON-03)
const MOCK_POPULAR_CONCERTS = [
  {
    id: 1,
    posterUrl: null,
    artistName: 'YOASOBI',
    title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    startDate: '2025.08.15',
    endDate: '2025.08.16',
    venue: 'KSPO DOME, 서울',
    status: '공연예정',
  },
  {
    id: 2,
    posterUrl: null,
    artistName: 'King Gnu',
    title: 'King Gnu Live Tour 2025',
    startDate: '2025.07.05',
    endDate: '2025.07.06',
    venue: '올림픽공원 체조경기장, 서울',
    status: '공연예정',
  },
  {
    id: 3,
    posterUrl: null,
    artistName: 'Ado',
    title: 'Ado WORLD TOUR "Hibana" in Seoul',
    startDate: '2025.06.21',
    endDate: null,
    venue: '고척스카이돔, 서울',
    status: '공연예정',
  },
  {
    id: 4,
    posterUrl: null,
    artistName: 'Official髭男dism',
    title: 'Official髭男dism ARENA TOUR 2025',
    startDate: '2025.05.24',
    endDate: '2025.05.25',
    venue: '잠실실내체육관, 서울',
    status: '공연중',
  },
  {
    id: 5,
    posterUrl: null,
    artistName: 'Kenshi Yonezu',
    title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',
    startDate: '2025.04.19',
    endDate: '2025.04.20',
    venue: '고척스카이돔, 서울',
    status: '공연완료',
  },
  {
    id: 6,
    posterUrl: null,
    artistName: 'Creepy Nuts',
    title: 'Creepy Nuts LIVE TOUR 2025',
    startDate: '2025.09.12',
    endDate: null,
    venue: '예스24 라이브홀, 서울',
    status: '공연예정',
  },
  {
    id: 7,
    posterUrl: null,
    artistName: 'Mrs. GREEN APPLE',
    title: 'Mrs. GREEN APPLE ARENA TOUR 2025',
    startDate: '2025.10.04',
    endDate: '2025.10.05',
    venue: 'KSPO DOME, 서울',
    status: '공연예정',
  },
  {
    id: 8,
    posterUrl: null,
    artistName: 'ONE OK ROCK',
    title: 'ONE OK ROCK 2025 LUXURY DISEASE ASIA TOUR',
    startDate: '2025.03.08',
    endDate: '2025.03.09',
    venue: '올림픽공원 체조경기장, 서울',
    status: '공연완료',
  },
  {
    id: 9,
    posterUrl: null,
    artistName: 'RADWIMPS',
    title: 'RADWIMPS LIVE TOUR 2025',
    startDate: '2025.11.22',
    endDate: null,
    venue: '올림픽공원 체조경기장, 서울',
    status: '공연예정',
  },
  {
    id: 10,
    posterUrl: null,
    artistName: 'Fujii Kaze',
    title: 'Fujii Kaze LOVE ALL SERVE ALL STADIUM LIVE',
    startDate: '2025.08.30',
    endDate: '2025.08.31',
    venue: '잠실종합운동장 주경기장, 서울',
    status: '공연예정',
  },
]

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const isLoading = false // TODO: React Query 연동 후 교체

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className={styles.page}>
      {/* 히어로 */}
      <section className={styles.hero}>
        <div className={styles.heroGlow1} />
        <div className={styles.heroGlow2} />

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Japan × Korea</p>
          <h1 className={styles.heroTitle}>
            일본 아티스트 내한 공연,<br />
            <span className={styles.heroAccent}>한눈에 확인하세요</span>
          </h1>
          <p className={styles.heroSub}>
            KOPIS · MusicBrainz · setlist.fm 데이터를 통합한 공연 정보 플랫폼
          </p>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="아티스트, 공연명으로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className={styles.searchBtn} type="submit">
                검색
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 인기 공연 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>인기 공연</h2>
            <a href={ROUTES.CONCERTS} className={styles.sectionMore}>
              전체 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          </div>

          <div className={styles.grid}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ConcertCardSkeleton key={i} />
                ))
              : MOCK_POPULAR_CONCERTS.map((concert) => (
                  <ConcertCard key={concert.id} concert={concert} />
                ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
