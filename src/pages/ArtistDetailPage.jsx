import { useState, useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import ArtistConcertItem from '@/components/artist/ArtistConcertItem'
import AppleMusicIcon from '@/components/ui/AppleMusicIcon'
import BackButton from '@/components/ui/BackButton'
import EmptyState from '@/components/ui/EmptyState'
import InquiryModal from '@/components/ui/InquiryModal'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Pagination from '@/components/ui/Pagination'
import SourceCredit from '@/components/ui/SourceCredit'
import SpotifyIcon from '@/components/ui/SpotifyIcon'
import XIcon from '@/components/ui/XIcon'
import YouTubeIcon from '@/components/ui/YouTubeIcon'
import { getArtist, getArtistConcerts, getArtistReleases, followArtist, unfollowArtist } from '@/services/artistApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import { getSpotifyAlbumUrl, getSpotifyTrackUrl } from '@/utils/spotify'
import styles from './ArtistDetailPage.module.css'

function formatFollowers(n) {
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만명`
  return `${n.toLocaleString()}명`
}

function fmtMs(ms) {
  const s = Math.round(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
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

const LINK_ICON = { Twitter: XIcon, YouTube: YouTubeIcon, Instagram: InstagramIcon, AppleMusic: AppleMusicIcon }

function ArtistDetailPage() {
  const { id } = useParams()
  const artistId = Number(id)
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()

  const VALID_TABS = ['all', 'upcoming', 'past']
  const concertTab = VALID_TABS.includes(searchParams.get('ct')) ? searchParams.get('ct') : 'all'
  const concertPage = Math.max(1, parseInt(searchParams.get('cp') || '1', 10))
  const releasePage = Math.max(1, parseInt(searchParams.get('rp') || '1', 10))

  const [imgFailed, setImgFailed] = useState(false)
  const [openReleaseId, setOpenReleaseId] = useState(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const PARAM_DEFAULTS = { ct: 'all', cp: '1', rp: '1' }

  function updateParams(updates) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || String(v) === (PARAM_DEFAULTS[k] ?? '')) {
          next.delete(k)
        } else {
          next.set(k, String(v))
        }
      })
      return next
    }, { replace: false })
  }

  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  const { data: artist, isLoading: artistLoading, isError: artistError } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => getArtist(artistId),
    retry: false,
  })

  useEffect(() => {
    if (artist?.name) document.title = `${artist.name} — Coming`
    return () => { document.title = 'Coming' }
  }, [artist?.name])

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
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      queryClient.invalidateQueries({ queryKey: ['following-artists'] })
      queryClient.invalidateQueries({ queryKey: ['following-concerts-home'] })
    },
  })

  function handleFollow() {
    if (!user) { openLoginModal(window.location.pathname + window.location.search); return }
    followMutation.mutate({ following: artist.isFollowing })
  }

  function handleArtistInquiry() {
    if (!user) { openLoginModal(window.location.pathname + window.location.search); return }
    setInquiryOpen(true)
  }

  function handleTabChange(tabValue) {
    updateParams({ ct: tabValue, cp: 1 })
  }

  if (artistLoading) return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.skeletonHero}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonHeroInfo}>
            <div className={`${styles.skeletonLine} ${styles.skeletonXs}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonLg}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonSm}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonMd}`} />
          </div>
        </div>
      </div>
    </div>
  )

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

  const { name, koreanName, imageUrl, hasUpcomingConcert, followersCount, links, isFollowing } = artist
  const spotifyLink = links?.find((l) => l.id === 'Spotify')
  const otherLinks = links?.filter((l) => l.id !== 'Spotify')
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
        <BackButton fallback={ROUTES.ARTISTS} />

        {/* 히어로 */}
        <section
          className={styles.hero}
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
            <h1 className={styles.artistName}><ArtistAliasName name={name} koreanName={koreanName} /></h1>

            {followersCount > 0 && <p className={styles.followers}>팔로워 {formatFollowers(followersCount)}</p>}
            <div className={styles.heroActions}>
              <button
                className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                onClick={handleFollow}
                disabled={followMutation.isPending}
                aria-label={isFollowing ? `${name} 언팔로우` : `${name} 팔로우`}
              >
                {isFollowing ? '팔로잉' : '+ 팔로우'}
              </button>
              {user?.role === 'ADMIN' && (
                <Link to={ROUTES.ADMIN_ARTIST_EDIT(artistId)} className={styles.adminEditBtn}>
                  수정
                </Link>
              )}
              {spotifyLink && (
                <a
                  href={spotifyLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotifyBtn}
                >
                  <SpotifyIcon size={22} />
                  LISTEN ON SPOTIFY
                </a>
              )}
            </div>

            {otherLinks && otherLinks.length > 0 && (
              <div className={styles.links}>
                {otherLinks.map((link, i) => {
                  const Icon = LINK_ICON[link.id]
                  return (
                    <a
                      key={`${link.id}-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkBtn}
                    >
                      {Icon && <Icon size={14} />}
                      {link.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* D-day 배너 */}
        {showDday && (
          <Link to={ROUTES.CONCERT_DETAIL(nextConcert.id)} className={styles.ddayBanner}>
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
          </Link>
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
                  const releaseSpotifyUrl = getSpotifyAlbumUrl(rel.spotifyId)
                  return (
                    <div key={rel.id} className={styles.releaseGroup}>
                      <div className={styles.releaseRow}>
                        <button
                          className={`${styles.releaseItem} ${hasTracks ? styles.releaseItemToggle : ''}`}
                          onClick={() => hasTracks && setOpenReleaseId(isOpen ? null : rel.id)}
                          aria-expanded={hasTracks ? isOpen : undefined}
                          disabled={!hasTracks}
                        >
                          <span className={`${styles.releaseBadge} ${styles[`releaseBadge${rel.type.toUpperCase()}`] || ''}`}>
                            {rel.type}
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
                        {releaseSpotifyUrl && (
                          <a
                            href={releaseSpotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.releaseSpotifyLink}
                            aria-label={`${rel.title} Spotify에서 듣기`}
                          >
                            <SpotifyIcon size={18} />
                          </a>
                        )}
                      </div>
                      {hasTracks && isOpen && (
                        <ol className={styles.trackList}>
                          {rel.tracks.map((t) => {
                            const trackSpotifyUrl = getSpotifyTrackUrl(t.spotifyId)
                            return (
                              <li key={t.position} className={styles.trackItem}>
                                <span className={styles.trackPosition}>{t.position}</span>
                                <span className={styles.trackTitle}>
                                  {t.title}
                                  {t.explicit && <span className={styles.explicitBadge}>E</span>}
                                </span>
                                <span className={styles.trackDuration}>{fmtMs(t.lengthMs)}</span>
                                {trackSpotifyUrl && (
                                  <a
                                    href={trackSpotifyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.trackSpotifyLink}
                                    aria-label={`${t.title} Spotify에서 듣기`}
                                  >
                                    <SpotifyIcon size={14} />
                                  </a>
                                )}
                              </li>
                            )
                          })}
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
                  onPageChange={(p) => { updateParams({ rp: p }); setOpenReleaseId(null) }}
                />
              )}
            </>
          ) : (
            <EmptyState message="등록된 음반 정보가 없습니다." compact />
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
                  onPageChange={(p) => updateParams({ cp: p })}
                />
              )}
            </>
          ) : (
            <EmptyState
              compact
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

        {/* 출처 표기 */}
        <SourceCredit
          text="데이터 출처: MusicBrainz, Spotify"
          linkHref="https://creativecommons.org/licenses/by-nc-sa/3.0/"
          linkText="CC BY-NC-SA 3.0"
        />

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
