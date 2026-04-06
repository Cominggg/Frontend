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
    accentColor: '#7c3aed',
  },
  {
    id: 2,
    type: 'album',
    artistName: 'Kenshi Yonezu',
    title: '새 앨범 "LOST CORNER" 발매',
    date: '2025.04.05',
    venue: null,
    accentColor: '#0369a1',
  },
  {
    id: 3,
    type: 'concert',
    artistName: 'Ado',
    title: 'WORLD TOUR "Hibana" in Seoul',
    date: '2025.06.21',
    venue: '고척스카이돔, 서울',
    accentColor: '#be123c',
  },
  {
    id: 4,
    type: 'concert',
    artistName: 'ZUTOMAYO',
    title: 'HALL TOUR 2025 "Lose" in Seoul',
    date: '2025.09.27',
    venue: '예스24 라이브홀, 서울',
    accentColor: '#5b21b6',
  },
  {
    id: 5,
    type: 'concert',
    artistName: 'King Gnu',
    title: 'Live Tour 2025',
    date: '2025.07.05 – 07.06',
    venue: '올림픽공원 체조경기장, 서울',
    accentColor: '#b45309',
  },
]

// TODO: API 연동 후 제거
const MOCK_TICKETING_SOON = [
  {
    id: 1,
    artistName: 'RADWIMPS',
    title: 'RADWIMPS LIVE TOUR 2025',
    concertDate: '2025.11.22',
    venue: '올림픽공원 체조경기장, 서울',
    ticketDate: '2025.04.08',
    accentColor: '#0e7490',
  },
  {
    id: 2,
    artistName: 'Mrs. GREEN APPLE',
    title: 'Mrs. GREEN APPLE ARENA TOUR 2025',
    concertDate: '2025.10.04',
    venue: 'KSPO DOME, 서울',
    ticketDate: '2025.04.11',
    accentColor: '#15803d',
  },
  {
    id: 3,
    artistName: 'Creepy Nuts',
    title: 'Creepy Nuts LIVE TOUR 2025',
    concertDate: '2025.09.12',
    venue: '예스24 라이브홀, 서울',
    ticketDate: '2025.04.14',
    accentColor: '#9f1239',
  },
  {
    id: 4,
    artistName: 'Fujii Kaze',
    title: 'Fujii Kaze LOVE ALL SERVE ALL STADIUM LIVE',
    concertDate: '2025.08.30',
    venue: '잠실종합운동장 주경기장, 서울',
    ticketDate: '2025.04.19',
    accentColor: '#b45309',
  },
  {
    id: 5,
    artistName: 'YOASOBI',
    title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    concertDate: '2025.08.15',
    venue: 'KSPO DOME, 서울',
    ticketDate: '2025.04.23',
    accentColor: '#7c3aed',
  },
  {
    id: 6,
    artistName: 'Ado',
    title: 'Ado WORLD TOUR "Hibana" in Seoul',
    concertDate: '2025.06.21',
    venue: '고척스카이돔, 서울',
    ticketDate: '2025.04.27',
    accentColor: '#be123c',
  },
]

// TODO: API 연동 후 제거
const MOCK_NEW_RELEASES = [
  { id: 1, artistName: 'Kenshi Yonezu', title: 'LOST CORNER', type: 'ALBUM', releaseDate: '2025.04.05', accentFrom: '#0369a1', accentTo: '#7dd3fc' },
  { id: 2, artistName: 'Mrs. GREEN APPLE', title: 'Soranji', type: 'SINGLE', releaseDate: '2025.03.20', accentFrom: '#15803d', accentTo: '#86efac' },
  { id: 3, artistName: 'YOASOBI', title: 'THE BOOK 4', type: 'ALBUM', releaseDate: '2025.02.15', accentFrom: '#7c3aed', accentTo: '#c4b5fd' },
  { id: 4, artistName: 'ZUTOMAYO', title: 'Lose', type: 'SINGLE', releaseDate: '2025.01.30', accentFrom: '#5b21b6', accentTo: '#a78bfa' },
  { id: 5, artistName: 'Ado', title: 'Hibana', type: 'SINGLE', releaseDate: '2025.03.05', accentFrom: '#be123c', accentTo: '#fda4af' },
  { id: 6, artistName: 'Official髭男dism', title: 'Subtitle II', type: 'ALBUM', releaseDate: '2025.02.28', accentFrom: '#0f766e', accentTo: '#5eead4' },
  { id: 7, artistName: 'King Gnu', title: 'MIRROR', type: 'ALBUM', releaseDate: '2025.01.15', accentFrom: '#b45309', accentTo: '#fcd34d' },
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
    artistName: 'ZUTOMAYO',
    title: 'ZUTOMAYO HALL TOUR 2025 "Lose" in Seoul',
    startDate: '2025.09.27',
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

function calcDday(dateStr) {
  const [y, m, d] = dateStr.split('.').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-DAY'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}

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
                <article
                  key={item.id}
                  className={styles.carouselSlide}
                  style={{ '--slide-accent': item.accentColor }}
                >
                  <div className={styles.slideContent}>
                    <span className={styles.slideBadge}>
                      {item.type === 'concert' ? 'CONCERT' : 'NEW RELEASE'}
                    </span>
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
                    <div className={styles.slideActions}>
                      <button className={styles.slideBtnPrimary}>자세히 보기</button>
                      {item.type === 'concert' && (
                        <button className={styles.slideBtnSecondary}>티켓 구매</button>
                      )}
                    </div>
                  </div>
                  <div className={styles.slideVisual} aria-hidden="true">
                    <div className={styles.slideOrb} />
                    <span className={styles.slideInitial}>{item.artistName.charAt(0)}</span>
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

      {/* 티켓팅 임박 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>티켓팅 임박</h2>
            <a href={ROUTES.CONCERTS} className={styles.sectionMore}>
              전체 보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          </div>
          <div className={styles.scrollStrip}>
            {MOCK_TICKETING_SOON.map((item) => (
              <article
                key={item.id}
                className={styles.ticketCard}
                style={{ '--t-color': item.accentColor }}
              >
                <div className={styles.ticketAccentBar} />
                <div className={styles.ticketBody}>
                  <span className={styles.ddayBadge}>{calcDday(item.ticketDate)}</span>
                  <p className={styles.ticketArtist}>{item.artistName}</p>
                  <p className={styles.ticketTitle}>{item.title}</p>
                  <div className={styles.ticketMeta}>
                    <span className={styles.ticketMetaItem}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      티켓 오픈 {item.ticketDate}
                    </span>
                    <span className={styles.ticketMetaItem}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {item.venue}
                    </span>
                  </div>
                </div>
              </article>
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

      {/* 관심 아티스트 공연 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>관심 아티스트 공연</h2>
          </div>
          <div className={styles.loginTeaser}>
            <div className={styles.loginTeaserIcon} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className={styles.loginTeaserTitle}>팔로우한 아티스트의 내한 공연을 한눈에</p>
            <p className={styles.loginTeaserSub}>로그인하면 관심 아티스트의 새 공연 소식을 바로 확인할 수 있어요.</p>
            <button className={styles.loginTeaserBtn}>로그인 / 회원가입</button>
          </div>
        </div>
      </section>

      {/* 새 앨범·싱글 */}
      <section className={`${styles.section} ${styles.sectionLast}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>새 앨범·싱글</h2>
          </div>
          <div className={styles.scrollStrip}>
            {MOCK_NEW_RELEASES.map((item) => (
              <article key={item.id} className={styles.albumCard}>
                <div
                  className={styles.albumArt}
                  style={{ '--a-from': item.accentFrom, '--a-to': item.accentTo }}
                >
                  <span className={styles.albumTypeBadge}>{item.type}</span>
                </div>
                <div className={styles.albumInfo}>
                  <p className={styles.albumArtist}>{item.artistName}</p>
                  <p className={styles.albumTitle}>{item.title}</p>
                  <p className={styles.albumDate}>{item.releaseDate}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
