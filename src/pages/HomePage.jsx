import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import Icon from '@/components/ui/Icon'
import { ROUTES } from '@/constants/routes'
import { MOCK_FOLLOWED_CONCERTS } from '@/mocks/followedArtistMocks'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
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
    title: 'INTENSE II「坐・ZOMBIE CRAB LABO」in Seoul',
    date: '2026.03.14 – 03.15',
    venue: '고려대학교 화정체육관, 서울',
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
const MOCK_NEW_RELEASES = [
  { id: 1, artistName: 'Kenshi Yonezu', title: 'LOST CORNER', type: 'ALBUM', releaseDate: '2025.04.05', accentFrom: '#0369a1', accentTo: '#7dd3fc' },
  { id: 2, artistName: 'Mrs. GREEN APPLE', title: 'Soranji', type: 'SINGLE', releaseDate: '2025.03.20', accentFrom: '#15803d', accentTo: '#86efac' },
  { id: 3, artistName: 'YOASOBI', title: 'THE BOOK 4', type: 'ALBUM', releaseDate: '2025.02.15', accentFrom: '#7c3aed', accentTo: '#c4b5fd' },
  { id: 4, artistName: 'ZUTOMAYO', title: 'Lose', type: 'SINGLE', releaseDate: '2025.01.30', accentFrom: '#5b21b6', accentTo: '#a78bfa' },
  { id: 5, artistName: 'Ado', title: 'Hibana', type: 'SINGLE', releaseDate: '2025.03.05', accentFrom: '#be123c', accentTo: '#fda4af' },
  { id: 6, artistName: 'Official髭男dism', title: 'Subtitle II', type: 'ALBUM', releaseDate: '2025.02.28', accentFrom: '#0f766e', accentTo: '#5eead4' },
  { id: 7, artistName: 'King Gnu', title: 'MIRROR', type: 'ALBUM', releaseDate: '2025.01.15', accentFrom: '#b45309', accentTo: '#fcd34d' },
  { id: 8, artistName: 'Eve', title: 'Heart', type: 'EP', releaseDate: '2025.03.12', accentFrom: '#9333ea', accentTo: '#d8b4fe' },
]

// TODO: API 연동 후 제거
const MOCK_STATS = { concertCount: 12 }

// TODO: API 연동 후 제거 — 날짜 오름차순 5건
const MOCK_UPCOMING_CONCERTS = [
  { id: 5, startDate: '2025.04.19', artistName: 'Kenshi Yonezu', title: 'TOUR 2025 "LOST CORNER"', venue: '고척스카이돔, 서울', accentColor: '#0369a1' },
  { id: 4, startDate: '2025.05.24', artistName: 'Official髭男dism', title: 'ARENA TOUR 2025', venue: '잠실실내체육관, 서울', accentColor: '#0f766e' },
  { id: 3, startDate: '2025.06.21', artistName: 'Ado', title: 'WORLD TOUR "Hibana" in Seoul', venue: '고척스카이돔, 서울', accentColor: '#be123c' },
  { id: 2, startDate: '2025.07.05', artistName: 'King Gnu', title: 'Live Tour 2025', venue: '올림픽공원 체조경기장, 서울', accentColor: '#b45309' },
  { id: 1, startDate: '2025.08.15', artistName: 'YOASOBI', title: 'ARENA TOUR 2025 "THE MONSTER"', venue: 'KSPO DOME, 서울', accentColor: '#7c3aed' },
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
    posterUrl: 'https://etbr-cms-site.s3.ap-northeast-1.amazonaws.com/zutomayo.net/share/intense2/ZUTOMAYO_SEOUL_2026031415.jpg',
    artistName: 'ZUTOMAYO',
    title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」in Seoul',
    startDate: '2026.03.14',
    endDate: '2026.03.15',
    venue: '고려대학교 화정체육관, 서울',
    status: '공연완료',
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
  const total = MOCK_CAROUSEL_ITEMS.length
  const [displayIndex, setDisplayIndex] = useState(1)
  const [noTransition, setNoTransition] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(null)
  const isAnimating = useRef(false)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  // TODO: React Query 연동 후 useQuery의 isLoading으로 교체
  const isLoading = false

  const activeIndex = (displayIndex - 1 + total) % total

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      if (!isAnimating.current) {
        isAnimating.current = true
        setDisplayIndex((i) => i + 1)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [isPaused])

  // 클론 슬라이드 도착 후 실제 슬라이드로 순간이동
  function handleTransitionEnd() {
    if (displayIndex === total + 1) {
      setNoTransition(true)
      setDisplayIndex(1)
      // noTransition 상태에서 클릭하면 transition 없어 transitionend 미발생 → isAnimating 고착
      // double-rAF 이후 해제 (useEffect에서 처리)
    } else if (displayIndex === 0) {
      setNoTransition(true)
      setDisplayIndex(total)
    } else {
      isAnimating.current = false
    }
  }

  // 순간이동 후 다음 프레임에 트랜지션 복원, 클론 스냅인 경우 여기서 isAnimating 해제
  useEffect(() => {
    if (!noTransition) return
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setNoTransition(false)
        isAnimating.current = false
      })
    )
    return () => cancelAnimationFrame(raf)
  }, [noTransition])

  function goPrev() {
    if (isAnimating.current) return
    isAnimating.current = true
    setDisplayIndex((i) => i - 1)
  }

  function goNext() {
    if (isAnimating.current) return
    isAnimating.current = true
    setDisplayIndex((i) => i + 1)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40 && !isAnimating.current) diff > 0 ? goNext() : goPrev()
    touchStartX.current = null
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={styles.carouselTrack}
              style={{
                transform: `translateX(-${displayIndex * 100}%)`,
                transition: noTransition ? 'none' : undefined,
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {[MOCK_CAROUSEL_ITEMS[total - 1], ...MOCK_CAROUSEL_ITEMS, MOCK_CAROUSEL_ITEMS[0]].map((item, idx) => {
                const keyPrefix = idx === 0 ? 'clone-prev' : idx === total + 1 ? 'clone-next' : 'slide'
                return (
                <article
                  key={`${keyPrefix}-${item.id}`}
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
                        <Icon name="calendar" size={14} />
                        {item.date}
                      </span>
                      {item.venue && (
                        <span className={styles.slideMetaItem}>
                          <Icon name="pin" size={14} />
                          {item.venue}
                        </span>
                      )}
                    </div>
                    <div className={styles.slideActions}>
                      <Link
                        to={item.type !== 'concert' ? ROUTES.RELEASE_DETAIL(item.id) : ROUTES.CONCERT_DETAIL(item.id)}
                        className={styles.slideBtnPrimary}
                      >
                        자세히 보기
                      </Link>
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
              )})}
            </div>

            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev} aria-label="이전 슬라이드">
              <Icon name="chevronLeft" size={20} />
            </button>
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext} aria-label="다음 슬라이드">
              <Icon name="chevronRight" size={20} />
            </button>
          </div>

          <div className={`${styles.carouselDots} ${isPaused ? styles.dotsPaused : ''}`}>
            {MOCK_CAROUSEL_ITEMS.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                onClick={() => setDisplayIndex(i + 1)}
                aria-label={`${i + 1}번째 슬라이드로 이동`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 이달 공연 통계 배너 */}
      <div className={styles.statsBanner}>
        <div className={styles.sectionInner}>
          <Link to={ROUTES.CONCERTS} className={styles.statsBannerCard}>
            <div className={styles.statsBody}>
              <span className={styles.statsNumber}>{MOCK_STATS.concertCount}</span>
              <div className={styles.statsLabelGroup}>
                <span className={styles.statsEyebrow}>이번 달</span>
                <span className={styles.statsLabel}>예정 내한 공연</span>
              </div>
            </div>
            <div className={styles.statsArrow} aria-hidden="true">
              <Icon name="chevronRight" size={24} />
            </div>
          </Link>
        </div>
      </div>

      {/* 다가오는 공연 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>다가오는 공연</h2>
            <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
              전체 보기
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>
          <ol className={styles.upcomingList}>
            {MOCK_UPCOMING_CONCERTS.map((item) => (
              <li key={item.id}>
                <Link
                  to={ROUTES.CONCERT_DETAIL(item.id)}
                  className={styles.upcomingItem}
                  style={{ '--item-accent': item.accentColor }}
                >
                  <span className={styles.upcomingDate}>{item.startDate}</span>
                  <span className={styles.upcomingArtist}>{item.artistName}</span>
                  <span className={styles.upcomingTitle}>{item.title}</span>
                  <span className={styles.upcomingVenue}>
                    <Icon name="pin" size={12} />
                    {item.venue}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 인기 공연 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>인기 공연</h2>
            <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
              전체 보기
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>

          <div className={styles.grid}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ConcertCardSkeleton key={i} />
                ))
              : MOCK_POPULAR_CONCERTS.slice(0, 4).map((concert) => (
                  <ConcertCard key={concert.id} concert={concert} />
                ))}
          </div>
        </div>
      </section>

      {/* 새 앨범·싱글 */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>새 앨범·싱글</h2>
            <Link to={ROUTES.RELEASES} className={styles.sectionMore}>
              전체 보기
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>
          <div className={`${styles.scrollStrip} ${styles.albumStrip}`}>
            {MOCK_NEW_RELEASES.map((item) => (
              <Link key={item.id} to={ROUTES.RELEASE_DETAIL(item.id)} className={styles.albumCard}>
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 관심 아티스트 공연 */}
      <section className={`${styles.section} ${styles.sectionLast}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>관심 아티스트 공연</h2>
            {user && (
              <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
                전체 보기
                <Icon name="chevronRight" size={16} />
              </Link>
            )}
          </div>
          {user ? (
            <div className={styles.grid}>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ConcertCardSkeleton key={i} />)
                : MOCK_FOLLOWED_CONCERTS.map((concert) => (
                    <ConcertCard key={concert.id} concert={concert} />
                  ))}
            </div>
          ) : (
            <div className={styles.loginTeaser}>
              <div className={styles.loginTeaserIcon} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className={styles.loginTeaserTitle}>팔로우한 아티스트의 내한 공연을 한눈에</p>
              <p className={styles.loginTeaserSub}>로그인하면 관심 아티스트의 새 공연 소식을 바로 확인할 수 있어요.</p>
              <button className={styles.loginTeaserBtn} onClick={() => openLoginModal(window.location.pathname)}>
                로그인 / 회원가입
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
