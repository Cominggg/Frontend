import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import InquiryModal from '@/components/ui/InquiryModal'
import { getConcert, getConcertSetlist } from '@/services/concertApi'
import { addToCalendar, removeFromCalendar } from '@/services/calendarApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import { formatDate, formatDateTime } from '@/utils/date'
import styles from './ConcertDetailPage.module.css'

function PosterImage({ url, alt }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={url}
      alt={alt}
      className={styles.posterImg}
      onError={() => setFailed(true)}
    />
  )
}

function ConcertDetailPage() {
  const { id } = useParams()
  const concertId = Number(id)
  const queryClient = useQueryClient()

  const [posterFailed, setPosterFailed] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [inquiryType, setInquiryType] = useState(null)

  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  useEffect(() => { setActiveTab('info') }, [id])

  const { data: concert, isLoading, isError } = useQuery({
    queryKey: ['concert', concertId],
    queryFn: () => getConcert(concertId),
    retry: false,
  })

  const { data: setlistData } = useQuery({
    queryKey: ['concert-setlist', concertId],
    queryFn: () => getConcertSetlist(concertId),
    enabled: concert?.status === 'ENDED',
  })

  const calendarMutation = useMutation({
    mutationFn: ({ inCalendar }) => inCalendar ? removeFromCalendar(concertId) : addToCalendar(concertId),
    onMutate: async ({ inCalendar }) => {
      await queryClient.cancelQueries({ queryKey: ['concert', concertId] })
      const prev = queryClient.getQueryData(['concert', concertId])
      queryClient.setQueryData(['concert', concertId], (old) => ({
        ...old,
        isInCalendar: !inCalendar,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['concert', concertId], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['concert', concertId] })
    },
  })

  function handleCalendar() {
    if (!user) { openLoginModal(window.location.href); return }
    calendarMutation.mutate({ inCalendar: concert.isInCalendar })
  }

  function handleConcertInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryType('CONCERT')
  }

  function handleSetlistInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryType('SETLIST')
  }

  if (isLoading) return null

  if (isError || !concert) {
    return (
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        }
        message="공연 정보가 존재하지 않습니다"
        action={{ to: ROUTES.CONCERTS, label: '공연 목록으로' }}
      />
    )
  }

  const { posterUrl, imageUrls, artistName, artistId,
          title, startDate, endDate, venue, status,
          price, isInCalendar, ticketLinks, ticketOpenAt } = concert

  const setlist = setlistData?.tracks ?? []
  const showPosterPlaceholder = !posterUrl || posterFailed

  const dateRange = endDate && endDate !== startDate
    ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    : formatDate(startDate)

  return (
    <>
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 뒤로 가기 */}
        <Link to={ROUTES.CONCERTS} className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          공연 목록
        </Link>

        {/* 대표 이미지 + 공연 정보 */}
        <div className={styles.layout}>

          {/* 대표 이미지 */}
          <div>
            <div className={styles.thumbnailWrap}>
              {showPosterPlaceholder ? (
                <div className={styles.thumbnailPlaceholder}>
                  <span className={styles.thumbnailArtistName}>{artistName}</span>
                </div>
              ) : (
                <img
                  src={posterUrl}
                  alt={artistName}
                  className={styles.thumbnail}
                  onError={() => setPosterFailed(true)}
                />
              )}
            </div>
          </div>

          {/* 공연 정보 */}
          <div className={styles.infoCol}>

            {/* 상태 배지 + 아티스트명 */}
            <div className={styles.topMeta}>
              <Badge status={status} />
              {artistId ? (
                <Link to={ROUTES.ARTIST_DETAIL(artistId)} className={styles.artistLink}>
                  {artistName}
                </Link>
              ) : (
                <span className={styles.artistLink}>{artistName}</span>
              )}
            </div>

            <h1 className={styles.title}>{title}</h1>

            {/* 공연 정보 테이블 */}
            <dl className={styles.infoList}>
              <div className={styles.infoRow}>
                <dt>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  날짜
                </dt>
                <dd>{dateRange}</dd>
              </div>
              <div className={styles.infoRow}>
                <dt>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  장소
                </dt>
                <dd>{venue}</dd>
              </div>
              {ticketOpenAt && (
                <div className={styles.infoRow}>
                  <dt>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
                    </svg>
                    예매
                  </dt>
                  <dd>{formatDateTime(ticketOpenAt)}</dd>
                </div>
              )}
              {price && (
                <div className={styles.infoRow}>
                  <dt>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    가격
                  </dt>
                  <dd>{price}</dd>
                </div>
              )}
            </dl>

            {/* 관리자 수정 버튼 */}
            {user?.role === 'ADMIN' && (
              <Link to={ROUTES.ADMIN_CONCERT_EDIT(concertId)} className={styles.adminEditBtn}>
                관리자 수정
              </Link>
            )}

            {/* 캘린더 추가·제거 */}
            <button
              className={`${styles.calendarBtn} ${isInCalendar ? styles.calendarBtnActive : ''}`}
              onClick={handleCalendar}
              disabled={calendarMutation.isPending}
              aria-pressed={isInCalendar}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                {isInCalendar && <polyline points="9 14 11 16 15 12" />}
              </svg>
              {isInCalendar ? '캘린더에서 제거' : '내 캘린더에 추가'}
            </button>

            {/* 예매처 링크 */}
            {ticketLinks && ticketLinks.length > 0 && (
              <div className={styles.ticketSection}>
                <p className={styles.ticketLabel}>예매처</p>
                <div className={styles.ticketLinks}>
                  {ticketLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.ticketBtn}
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
              </div>
            )}

            {/* 정보 문의 */}
            <div className={styles.inquiryBtns}>
              <button className={styles.inquiryBtn} onClick={handleConcertInquiry}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                공연 정보 문의
              </button>
              {status === 'ENDED' && (
                <button className={styles.inquiryBtn} onClick={handleSetlistInquiry}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  셋리스트 문의
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 하단 탭 */}
        <div className={styles.tabSection}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'info' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('info')}
            >
              공연 정보
            </button>
            {status === 'ENDED' && (
              <button
                className={`${styles.tabBtn} ${activeTab === 'setlist' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('setlist')}
              >
                셋리스트
              </button>
            )}
          </div>

          {activeTab === 'setlist' && status === 'ENDED' && (
            <div className={styles.tabPanel}>
              {setlist.length > 0 ? (
                <ol className={styles.setlistTrackList}>
                  {setlist.map((track) => (
                    <li key={track.order} className={styles.setlistTrack}>
                      <span className={styles.setlistOrder}>{track.order}</span>
                      <span className={styles.setlistTitle}>{track.title}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.setlistEmpty}>아직 등록된 셋리스트가 없습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className={styles.tabPanel}>
              {imageUrls && imageUrls.length > 0 ? (
                <div className={styles.posterList}>
                  {imageUrls.map((url, i) => (
                    <PosterImage key={i} url={url} alt={`${title} 공연 정보 ${i + 1}`} />
                  ))}
                </div>
              ) : (
                <p className={styles.posterEmpty}>공연 정보가 존재하지 않습니다</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>

    <InquiryModal
      key={inquiryType}
      isOpen={inquiryType !== null}
      onClose={() => setInquiryType(null)}
      type={inquiryType}
      targetId={concertId}
    />
    </>
  )
}

export default ConcertDetailPage
