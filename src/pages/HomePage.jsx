import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import Icon from '@/components/ui/Icon'
import { ROUTES } from '@/constants/routes'
import { getPopularConcerts, getConcerts, getFollowingConcerts } from '@/services/concertApi'
import { getReleases } from '@/services/releaseApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import styles from './HomePage.module.css'

function getDday(dateStr, today) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-DAY'
  if (diff > 0) return `D-${diff}`
  return null
}


function AlbumCard({ item }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [accentFrom, accentTo] = getArtistColor(item.artistName)
  const showImg = item.coverUrl && !imgFailed

  return (
    <Link to={ROUTES.RELEASE_DETAIL(item.id)} className={styles.albumCard}>
      <div
        className={styles.albumArt}
        style={{ '--a-from': accentFrom, '--a-to': accentTo }}
      >
        {showImg && (
          <img
            src={item.coverUrl}
            alt={item.title}
            className={styles.albumCoverImg}
            onError={() => setImgFailed(true)}
          />
        )}
        <span className={styles.albumTypeBadge}>{item.type}</span>
      </div>
      <div className={styles.albumInfo}>
        <p className={styles.albumArtist}>{item.artistName}</p>
        <p className={styles.albumTitle}>{item.title}</p>
        <p className={styles.albumDate}>{formatDate(item.releaseDate)}</p>
      </div>
    </Link>
  )
}

function HomePage() {
  const [subZoneTab, setSubZoneTab] = useState('albums')
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1101)
  const user = useAuthStore((s) => s.user)
  const isLoggedIn = !!user
  const openLoginModal = useLoginModalStore((s) => s.open)
  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })()

  const { data: popularConcerts = [], isLoading: popularLoading } = useQuery({
    queryKey: ['popular-concerts'],
    queryFn: getPopularConcerts,
    staleTime: 5 * 60 * 1000,
  })

  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcoming-concerts-home'],
    queryFn: () => getConcerts({ status: 'UPCOMING', size: 6, sort: 'startDate,asc' }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: releasesData, isLoading: releasesLoading } = useQuery({
    queryKey: ['new-releases-home'],
    queryFn: () => getReleases({ size: 8 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: followingConcerts = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following-concerts-home'],
    queryFn: getFollowingConcerts,
    enabled: isLoggedIn,
  })

  const upcomingConcerts = upcomingData?.content ?? []
  const newReleases = releasesData?.content ?? []

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className={styles.page}>
      {/* mainZone: 인기 공연 + 다가오는 공연 */}
      <div className={styles.mainZone}>
        <div className={styles.mainZoneInner}>
          {/* 인기 공연 (좌) */}
          <section className={styles.mainZoneLeft}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>인기 공연</h2>
              <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
                전체 보기
                <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            <div className={styles.gridThree}>
              {popularLoading
                ? Array.from({ length: isDesktop ? 3 : 6 }).map((_, i) => <ConcertCardSkeleton key={i} />)
                : popularConcerts.slice(0, isDesktop ? 3 : 6).map((concert) => (
                    <ConcertCard key={concert.id} concert={concert} />
                  ))}
            </div>
          </section>

          {/* 다가오는 공연 (우) */}
          <aside className={styles.mainZoneRight}>
            <div className={styles.upcomingPanel}>
              <div className={styles.upcomingPanelHeader}>
                <h2 className={styles.sectionTitle}>다가오는 공연</h2>
                <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              </div>
              <ul className={styles.upcomingList}>
                {upcomingLoading
                  ? null
                  : upcomingConcerts.length === 0
                    ? (
                      <li className={styles.upcomingEmpty}>
                        <div className={styles.upcomingEmptyIcon} aria-hidden="true">
                          <Icon name="calendar" size={24} />
                        </div>
                        <p className={styles.upcomingEmptyTitle}>예정된 공연이 없어요</p>
                        <p className={styles.upcomingEmptySub}>가까운 시일 내 내한 공연 정보가 없습니다</p>
                      </li>
                    )
                    : upcomingConcerts.map((concert) => {
                        const dday = getDday(concert.startDate, today)
                        const isUrgent = dday && dday !== 'D-DAY' && parseInt(dday.replace('D-', '')) <= 7
                        return (
                          <li key={concert.id}>
                            <Link to={ROUTES.CONCERT_DETAIL(concert.id)} className={styles.upcomingItem}>
                              <div className={`${styles.upcomingDday} ${isUrgent ? styles.upcomingDdayUrgent : ''}`}>
                                {dday ?? '-'}
                              </div>
                              <div className={styles.upcomingInfo}>
                                <p className={styles.upcomingArtist}>{concert.artistName}</p>
                                <p className={styles.upcomingTitle}>{concert.title}</p>
                                <p className={styles.upcomingMeta}>
                                  <Icon name="calendar" size={12} />
                                  {formatDate(concert.startDate)} · {concert.venue}
                                </p>
                              </div>
                            </Link>
                          </li>
                        )
                      })}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* subZone: 새 앨범·싱글 / 관심 아티스트 공연 탭 */}
      <div className={styles.subZone}>
        <div className={styles.subZoneInner}>
          <div className={styles.subZoneTabs}>
            <button
              className={`${styles.tab} ${subZoneTab === 'albums' ? styles.tabActive : ''}`}
              onClick={() => setSubZoneTab('albums')}
            >
              새 앨범·싱글
            </button>
            <button
              className={`${styles.tab} ${subZoneTab === 'followed' ? styles.tabActive : ''}`}
              onClick={() => setSubZoneTab('followed')}
            >
              관심 아티스트 공연
            </button>
            <div className={styles.tabMore}>
              {subZoneTab === 'albums' && (
                <Link to={ROUTES.RELEASES} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              )}
              {subZoneTab === 'followed' && isLoggedIn && (
                <Link to={ROUTES.CONCERTS} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              )}
            </div>
          </div>

          {subZoneTab === 'albums' && (
            <div className={styles.albumStrip}>
              {releasesLoading
                ? null
                : newReleases.map((item) => <AlbumCard key={item.id} item={item} />)}
            </div>
          )}

          {subZoneTab === 'followed' && (
            isLoggedIn ? (
              <div className={styles.gridFour}>
                {followingLoading
                  ? Array.from({ length: 4 }).map((_, i) => <ConcertCardSkeleton key={i} />)
                  : followingConcerts.map((concert) => (
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
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
