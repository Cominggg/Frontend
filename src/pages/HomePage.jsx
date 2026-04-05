import { useState, useEffect } from 'react'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import { ROUTES } from '@/constants/routes'
import styles from './HomePage.module.css'

// TODO: API 연동 후 제거
const MOCK_CAROUSEL_ITEMS = [
  {
    id: 1,
    type: 'concert',
    artistName: 'YOASOBI',
    title: 'ARENA TOUR 2025 "THE MONSTER"',
    date: '2025.08.15 – 08.16',
    venue: 'KSPO DOME, 서울',
  },
  {
    id: 2,
    type: 'album',
    artistName: 'Kenshi Yonezu',
    title: '새 앨범 "LOST CORNER" 발매',
    date: '2025.04.05',
    venue: null,
  },
  {
    id: 3,
    type: 'concert',
    artistName: 'Ado',
    title: 'WORLD TOUR "Hibana" in Seoul',
    date: '2025.06.21',
    venue: '고척스카이돔, 서울',
  },
  {
    id: 4,
    type: 'album',
    artistName: 'Mrs. GREEN APPLE',
    title: '새 싱글 "Soranji" 발매',
    date: '2025.03.20',
    venue: null,
  },
  {
    id: 5,
    type: 'concert',
    artistName: 'King Gnu',
    title: 'Live Tour 2025',
    date: '2025.07.05 – 07.06',
    venue: '올림픽공원 체조경기장, 서울',
  },
]

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const isLoading = false // TODO: React Query 연동 후 교체
  const total = MOCK_CAROUSEL_ITEMS.length

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setCurrentSlide((i) => (i + 1) % total)
    }, 5000)
    return () => clearInterval(id)
  }, [isPaused, total])

  function goPrev() {
    setCurrentSlide((i) => (i - 1 + total) % total)
  }

  function goNext() {
    setCurrentSlide((i) => (i + 1) % total)
  }

  return (
    <div className={styles.page}>
      {/* 캐러셀 */}
      <section className={styles.carouselSection}>
        <div className={styles.carouselInner}>
          <div
            className={styles.carouselViewport}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={styles.carouselTrack}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {MOCK_CAROUSEL_ITEMS.map((item) => (
                <article key={item.id} className={styles.carouselSlide} data-type={item.type}>
                  <div className={styles.slideContent}>
                    <p className={styles.slideArtist}>{item.artistName}</p>
                    <h2 className={styles.slideTitle}>{item.title}</h2>
                    <div className={styles.slideMeta}>
                      <span className={styles.slideMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {item.date}
                      </span>
                      {item.venue && (
                        <span className={styles.slideMetaItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                          </svg>
                          {item.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.slideDecor} aria-hidden="true">
                    {item.artistName.charAt(0)}
                  </div>
                </article>
              ))}
            </div>

            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev} aria-label="이전 슬라이드">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext} aria-label="다음 슬라이드">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className={styles.carouselDots}>
            {MOCK_CAROUSEL_ITEMS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === currentSlide ? styles.dotActive : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`${i + 1}번째 슬라이드로 이동`}
              />
            ))}
          </div>
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
