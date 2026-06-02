import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import ArtistConcertItem from '@/components/artist/ArtistConcertItem'
import EmptyState from '@/components/ui/EmptyState'
import InquiryModal from '@/components/ui/InquiryModal'
import Pagination from '@/components/ui/Pagination'
import { getArtist, getArtistConcerts, getArtistReleases, followArtist, unfollowArtist } from '@/services/artistApi'
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

const CONCERT_TABS = [
  { label: '전체', value: 'all' },
  { label: '예정', value: 'upcoming' },
  { label: '과거', value: 'past' },
]

const CONCERT_PAGE_SIZE = 10
const RELEASE_PAGE_SIZE = 10

function ArtistDetailPage() {
  const { id } = useParams()
  const artistId = Number(id)
  const queryClient = useQueryClient()

  const [imgFailed, setImgFailed] = useState(false)
  const [concertTab, setConcertTab] = useState('all')
  const [concertPage, setConcertPage] = useState(1)
  const [releasePage, setReleasePage] = useState(1)
  const [openReleaseId, setOpenReleaseId] = useState(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  const { data: artist, isLoading: artistLoading, isError: artistError } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => getArtist(artistId),
    retry: false,
  })

  const { data: concertsData, isLoading: concertsLoading } = useQuery({
    queryKey: ['artist-concerts', artistId, concertTab, concertPage],
    queryFn: () => getArtistConcerts(artistId, { tab: concertTab, page: concertPage - 1, size: CONCERT_PAGE_SIZE }),
    enabled: !!artist,
    placeholderData: (prev) => prev,
  })

  // D-day 전용 — 탭·페이지와 무관하게 항상 가장 빠른 예정 공연 1건만 조회
  const { data: ddayConcertsData } = useQuery({
    queryKey: ['artist-concerts-dday', artistId],
    queryFn: () => getArtistConcerts(artistId, { tab: 'upcoming', page: 0, size: 1 }),
    enabled: !!artist?.hasUpcomingConcert,
  })

  const { data: releasesData, isLoading: releasesLoading } = useQuery({
    queryKey: ['artist-releases', artistId, releasePage],
    queryFn: () => getArtistReleases(artistId, { page: releasePage - 1, size: RELEASE_PAGE_SIZE }),
    enabled: !!artist,
    placeholderData: (prev) => prev,
  })

  const followMutation = useMutation({
    mutationFn: ({ following }) => following ? unfollowArtist(artistId) : followArtist(artistId),
    onMutate: async ({ following }) => {
      await queryClient.cancelQueries({ queryKey: ['artist', artistId] })
      const prev = queryClient.getQueryData(['artist', artistId])
      queryClient.setQueryData(['artist', artistId], (old) => ({
        ...old,
        isFollowing: !following,
        followersCount: old.followersCount + (following ? -1 : 1),
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['artist', artistId], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', artistId] })
    },
  })

  function handleFollow() {
    if (!user) { openLoginModal(window.location.href); return }
    followMutation.mutate({ following: artist.isFollowing })
  }

  function handleArtistInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryOpen(true)
  }

  function handleTabChange(tabValue) {
    setConcertTab(tabValue)
    setConcertPage(1)
  }

  if (artistLoading) return null

  if (artistError || !artist) {
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

  const { name, imageUrl, hasUpcomingConcert, followersCount, links, isFollowing } = artist
  const showPlaceholder = !imageUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(name)

  const concerts = concertsData?.content ?? []
  const concertTotalPages = concertsData?.totalPages ?? 1

  const releases = releasesData?.content ?? []
  const releasesTotalElements = releasesData?.totalElements ?? 0
  const releasesTotalPages = releasesData?.totalPages ?? 1

  // D-day: 탭과 무관하게 가장 빠른 예정 공연 기준
  const nextConcert = ddayConcertsData?.content?.[0] ?? null
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

            <p className={styles.followers}>팔로워 {formatFollowers(followersCount)}</p>
            <button
              className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
              onClick={handleFollow}
              disabled={followMutation.isPending}
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

        {/* 외부 링크 */}
        {links && links.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>스트리밍 / 소셜</h2>
            <div className={styles.links}>
              {links.map((link, i) => (
                <a
                  key={`${link.id}-${i}`}
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            디스코그래피
            {releasesTotalElements > 0 && <span className={styles.sectionCount}>{releasesTotalElements}</span>}
          </h2>
          {releasesLoading ? (
            <div className={styles.releaseList} aria-busy="true" />
          ) : releases.length > 0 ? (
            <>
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
                        <span className={`${styles.releaseBadge} ${styles[`releaseBadge${rel.type.toUpperCase()}`] || ''}`}>
                          {rel.type.toUpperCase()}
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
                              <span className={styles.trackDuration}>{fmtMs(t.lengthMs)}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )
                })}
              </div>
              {releasesTotalPages > 1 && (
                <Pagination
                  currentPage={releasePage}
                  totalPages={releasesTotalPages}
                  onPageChange={(p) => { setReleasePage(p); setOpenReleaseId(null) }}
                />
              )}
            </>
          ) : (
            <EmptyState message="등록된 음반 정보가 없습니다." />
          )}
        </section>

        {/* 내한 공연 내역 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>내한 공연 내역</h2>

          <div className={styles.concertTabs} role="tablist" aria-label="공연 구분">
            {CONCERT_TABS.map(({ label, value }) => (
              <button
                key={value}
                role="tab"
                aria-selected={concertTab === value}
                className={`${styles.concertTab} ${concertTab === value ? styles.concertTabActive : ''}`}
                onClick={() => handleTabChange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {concertsLoading ? (
            <div aria-busy="true" />
          ) : concerts.length > 0 ? (
            <>
              <div className={styles.concertList}>
                {concerts.map((concert) => (
                  <ArtistConcertItem key={concert.id} concert={concert} />
                ))}
              </div>
              {concertTotalPages > 1 && (
                <Pagination
                  currentPage={concertPage}
                  totalPages={concertTotalPages}
                  onPageChange={setConcertPage}
                />
              )}
            </>
          ) : (
            <EmptyState
              message={
                concertTab === 'all' ? '등록된 내한 공연 내역이 없습니다.' :
                concertTab === 'upcoming' ? '예정된 내한 공연이 없습니다.' :
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
      targetId={artistId}
    />
    </>
  )
}

export default ArtistDetailPage
