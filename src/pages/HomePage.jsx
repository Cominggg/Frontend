import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import ReleaseCardSkeleton from '@/components/release/ReleaseCardSkeleton'
import Icon from '@/components/ui/Icon'
import { ROUTES } from '@/constants/routes'
import { getPopularConcerts, getConcerts, getFollowingConcerts, getTicketingConcerts } from '@/services/concertApi'
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

function getTicketUrgency(dday) {
  if (!dday || dday === '-') return 'normal'
  if (dday === 'D-DAY') return 'critical'
  const n = parseInt(dday.replace('D-', ''))
  if (n <= 3) return 'critical'
  if (n <= 7) return 'soon'
  return 'normal'
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
    queryFn: () => getConcerts({ status: 'UPCOMING', size: 4, sort: 'startDate,asc' }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: releasesData, isLoading: releasesLoading } = useQuery({
    queryKey: ['new-releases-home'],
    queryFn: () => getReleases({ size: 8 }),
    staleTime: 5 * 60 * 1000,
  })

  const { data: followingConcerts = [], isLoading: followingLoading } = useQuery({
    queryKey: ['following-concerts-home', user?.id],
    queryFn: getFollowingConcerts,
    enabled: isLoggedIn,
    staleTime: 0,
  })

  const { data: ticketingConcerts = [], isLoading: ticketingLoading } = useQuery({
    queryKey: ['ticketing-concerts-home'],
    queryFn: getTicketingConcerts,
    staleTime: 5 * 60 * 1000,
  })

  const upcomingConcerts = upcomingData?.content ?? []
  const newReleases = releasesData?.content ?? []

  return (
    <div className={styles.page}>

      {/* mainZone: 인기 공연 (왼쪽 3건) + 예매 일정 패널 (오른쪽) */}
      <div className={styles.mainZone}>
        <div className={styles.mainZoneInner}>

          {/* 왼쪽: 인기 공연 3건 */}
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
                ? Array.from({ length: 3 }).map((_, i) => <ConcertCardSkeleton key={i} />)
                : popularConcerts.slice(0, 3).map((concert) => (
                    <ConcertCard key={concert.id} concert={concert} />
                  ))}
            </div>
          </section>

          {/* 오른쪽: 예매 일정 패널 (항상 표시) */}
          <section className={styles.mainZoneRight}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>예매 일정</h2>
              {!ticketingLoading && ticketingConcerts.length > 0 && (
                <Link to={ROUTES.CALENDAR} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              )}
            </div>
            <div className={styles.ticketingPanel}>
              {ticketingLoading ? (
                <div className={styles.ticketingPanelList}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={styles.ticketCardSkeleton}>
                      <div className={styles.ticketSkeletonDday} />
                      <div className={styles.ticketSkeletonInfo}>
                        <div className={styles.ticketSkeletonLine} />
                        <div className={`${styles.ticketSkeletonLine} ${styles.ticketSkeletonLineLg}`} />
                        <div className={`${styles.ticketSkeletonLine} ${styles.ticketSkeletonLineSm}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : ticketingConcerts.length === 0 ? (
                <div className={styles.ticketingEmpty}>
                  <div className={styles.ticketingEmptyIcon} aria-hidden="true">
                    <Icon name="calendar" size={20} />
                  </div>
                  <p className={styles.ticketingEmptyText}>현재 예매 일정이 없어요</p>
                </div>
              ) : (
                <div className={styles.ticketingPanelList}>
                  {ticketingConcerts.slice(0, 5).map((concert) => {
                    const dday = getDday(concert.ticketOpenAt.split('T')[0], today)
                    const urgency = getTicketUrgency(dday)
                    const timeStr = concert.ticketOpenAt.includes('T')
                      ? concert.ticketOpenAt.split('T')[1].slice(0, 5)
                      : null
                    return (
                      <Link
                        key={concert.id}
                        to={ROUTES.CONCERT_DETAIL(concert.id)}
                        className={`${styles.ticketCard}${urgency === 'critical' ? ` ${styles.ticketCardCritical}` : urgency === 'soon' ? ` ${styles.ticketCardSoon}` : ''}`}
                      >
                        <div className={styles.ticketDday}>{dday ?? '-'}</div>
                        <div className={styles.ticketInfo}>
                          <p className={styles.ticketArtist}>{concert.artistName}</p>
                          <p className={styles.ticketTitle}>{concert.title}</p>
                          <p className={styles.ticketOpenDate}>
                            <Icon name="calendar" size={12} />
                            티켓 오픈 {formatDate(concert.ticketOpenAt.split('T')[0])}{timeStr ? ` ${timeStr}` : ''}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* discoveryZone: 다가오는 공연 (left) + 새 앨범·싱글 (right) 병렬 */}
      <div className={styles.discoveryZone}>
        <div className={styles.discoveryZoneInner}>
          <div className={styles.discoveryGrid}>

            {/* 왼쪽: 다가오는 공연 */}
            <section className={styles.discoveryLeft}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>다가오는 공연</h2>
                <Link to={`${ROUTES.CONCERTS}?status=UPCOMING`} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              </div>
              {upcomingLoading ? (
                <div className={styles.upcomingList}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.upcomingSkeletonItem}>
                      <div className={styles.upcomingSkeletonDateBlock}>
                        <div className={styles.upcomingSkeletonDateMonth} />
                        <div className={styles.upcomingSkeletonDateDay} />
                      </div>
                      <div className={styles.upcomingSkeletonInfo}>
                        <div className={styles.upcomingSkeletonLine} />
                        <div className={`${styles.upcomingSkeletonLine} ${styles.upcomingSkeletonLineLg}`} />
                        <div className={`${styles.upcomingSkeletonLine} ${styles.upcomingSkeletonLineSm}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingConcerts.length === 0 ? (
                <div className={styles.upcomingEmpty}>
                  <div className={styles.upcomingEmptyIcon} aria-hidden="true">
                    <Icon name="calendar" size={24} />
                  </div>
                  <p className={styles.upcomingEmptyTitle}>예정된 공연이 없어요</p>
                  <p className={styles.upcomingEmptySub}>가까운 시일 내 내한 공연 정보가 없습니다</p>
                </div>
              ) : (
                <div className={styles.upcomingList}>
                  {upcomingConcerts.map((concert) => {
                    const dday = getDday(concert.startDate, today)
                    const isUrgent = dday && dday !== 'D-DAY' && parseInt(dday.replace('D-', '')) <= 7
                    const [, month, day] = concert.startDate.split('-').map(Number)
                    return (
                      <Link
                        key={concert.id}
                        to={ROUTES.CONCERT_DETAIL(concert.id)}
                        className={`${styles.upcomingListItem}${isUrgent ? ` ${styles.upcomingListItemUrgent}` : ''}`}
                      >
                        <div className={styles.upcomingDateBlock}>
                          <span className={styles.upcomingDateMonth}>{month}월</span>
                          <span className={styles.upcomingDateDay}>{day}</span>
                        </div>
                        <div className={styles.upcomingListInfo}>
                          <p className={styles.upcomingListArtist}>{concert.artistName}</p>
                          <p className={styles.upcomingListTitle}>{concert.title}</p>
                          <p className={styles.upcomingListMeta}>{concert.venue}</p>
                        </div>
                        {dday && (
                          <span className={`${styles.upcomingListDday}${isUrgent ? ` ${styles.upcomingListDdayUrgent}` : ''}`}>
                            {dday}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 오른쪽: 새 앨범·싱글 */}
            <section>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>새 앨범·싱글</h2>
                <Link to={ROUTES.RELEASES} className={styles.sectionMore}>
                  전체 보기
                  <Icon name="chevronRight" size={16} />
                </Link>
              </div>
              {releasesLoading ? (
                <div className={styles.albumStrip}>
                  {Array.from({ length: 4 }).map((_, i) => <ReleaseCardSkeleton key={i} />)}
                </div>
              ) : newReleases.length === 0 ? (
                <div className={styles.albumEmpty}>
                  <div className={styles.albumEmptyIcon} aria-hidden="true">
                    <Icon name="music" size={24} />
                  </div>
                  <p className={styles.albumEmptyTitle}>아직 등록된 앨범·싱글이 없어요</p>
                  <p className={styles.albumEmptySub}>새로운 릴리즈 정보가 추가되면 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className={styles.albumStrip}>
                  {newReleases.map((item) => <AlbumCard key={item.id} item={item} />)}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* followZone: 관심 아티스트 공연 */}
      <div className={styles.followZone}>
        <div className={styles.followZoneInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>관심 아티스트 공연</h2>
            {isLoggedIn && !followingLoading && followingConcerts.length > 0 && (
              <Link to={`${ROUTES.CONCERTS}?followed=true`} className={styles.sectionMore}>
                전체 보기
                <Icon name="chevronRight" size={16} />
              </Link>
            )}
          </div>
          {isLoggedIn ? (
            followingLoading ? (
              <div className={styles.gridFive}>
                {Array.from({ length: 5 }).map((_, i) => <ConcertCardSkeleton key={i} />)}
              </div>
            ) : followingConcerts.length === 0 ? (
              <div className={styles.followEmpty}>
                <div className={styles.followEmptyIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <p className={styles.followEmptyTitle}>아직 팔로우한 아티스트가 없어요</p>
                <p className={styles.followEmptySub}>관심 아티스트를 팔로우하면 새 공연 소식을 한눈에 볼 수 있어요</p>
                <Link to={ROUTES.ARTISTS} className={styles.followEmptyLink}>아티스트 둘러보기</Link>
              </div>
            ) : (
              <div className={styles.gridFive}>
                {followingConcerts.slice(0, 5).map((concert) => (
                  <ConcertCard key={concert.id} concert={concert} />
                ))}
              </div>
            )
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
      </div>
    </div>
  )
}

export default HomePage
