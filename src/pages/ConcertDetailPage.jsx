import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import InquiryModal from '@/components/ui/InquiryModal'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import styles from './ConcertDetailPage.module.css'

// TODO: API 연동 후 제거
const MOCK_CONCERT_MAP = {
  1: {
    id: 1, thumbnailUrl: null, posterUrls: [], artistName: 'YOASOBI', artistId: 1,
    title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    startDate: '2025.08.15', endDate: '2025.08.16',
    venue: 'KSPO DOME, 서울', status: 'UPCOMING',
    price: '전석 165,000원',
    isInCalendar: false,
    ticketLinks: [
      { id: 'interpark', label: '인터파크', url: '#' },
      { id: 'melon', label: '멜론티켓', url: '#' },
    ],
  },
  2: {
    id: 2, thumbnailUrl: null, posterUrls: [], artistName: 'Kenshi Yonezu', artistId: 2,
    title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',
    startDate: '2025.04.19', endDate: '2025.04.20',
    venue: '고척스카이돔, 서울', status: 'ENDED',
    price: '전석 154,000원',
    isInCalendar: true,
    ticketLinks: [
      { id: 'yes24', label: 'YES24', url: '#' },
    ],
    setlist: [
      { order: 1, title: 'Pale Blue' },
      { order: 2, title: 'KICK BACK' },
      { order: 3, title: 'Lemon' },
      { order: 4, title: 'Moonlight' },
      { order: 5, title: 'M八七' },
      { order: 6, title: 'POP SONG' },
      { order: 7, title: 'メフィスト' },
      { order: 8, title: 'LOST CORNER' },
      { order: 9, title: '死神' },
      { order: 10, title: 'Flamingo' },
      { order: 11, title: '地球儀' },
      { order: 12, title: 'PLACEBO + 世界の終わり' },
    ],
  },
  3: {
    id: 3, thumbnailUrl: null, posterUrls: [], artistName: 'Ado', artistId: 3,
    title: 'Ado WORLD TOUR "Hibana" in Seoul',
    startDate: '2025.06.21', endDate: null,
    venue: '고척스카이돔, 서울', status: 'UPCOMING',
    price: 'VIP 242,000원 / 전석 165,000원',
    isInCalendar: false,
    ticketLinks: [
      { id: 'interpark', label: '인터파크', url: '#' },
      { id: 'yes24', label: 'YES24', url: '#' },
    ],
  },
  8: {
    id: 8,
    thumbnailUrl: 'https://etbr-cms-site.s3.ap-northeast-1.amazonaws.com/zutomayo.net/share/intense2/ZUTOMAYO_SEOUL_2026031415.jpg',
    posterUrls: [
      'https://cdnticket.melon.co.kr/resource/image/upload/product/2025/12/20251218120508ea897dee-3f9e-4cde-978d-e67c0bd57c27.png',
      'https://cdnticket.melon.co.kr/resource/image/upload/product/2025/12/202512181205268a552bab-36d0-4c3e-b06b-93e0875c21ff.png',
      'https://cdnticket.melon.co.kr/resource/image/upload/product/2025/12/20251218120531f167b29f-ccf0-4d3e-949e-9d667a378def.png',
      'https://cdnticket.melon.co.kr/resource/image/upload/product/2025/12/202512181205377adc9baa-7269-4f58-a612-b67e55083f1c.png',
      'https://cdnticket.melon.co.kr/resource/image/upload/product/2025/12/20251218120543d701a3a1-6a1a-48c4-909b-cf5233be71d4.png',
    ],
    artistName: 'ZUTOMAYO', artistId: 8,
    title: 'ZUTOMAYO INTENSE II「坐・ZOMBIE CRAB LABO」in Seoul',
    startDate: '2026.03.14', endDate: '2026.03.15',
    venue: '고려대학교 화정체육관, 서울', status: 'ENDED',
    price: '전석 138,000원',
    isInCalendar: false,
    ticketLinks: [
      { id: 'melon', label: '멜론티켓', url: '#' },
    ],
  },
}

function getMockConcert(id) {
  if (MOCK_CONCERT_MAP[id]) return MOCK_CONCERT_MAP[id]
  const num = Number(id)
  if (num >= 4 && num <= 15) {
    return {
      id: num, thumbnailUrl: null, posterUrls: [], artistName: `아티스트 ${num}`, artistId: num,
      title: `공연 제목 ${num}`, startDate: '2025.01.01', endDate: null,
      venue: '서울', status: 'UPCOMING',
      price: '미정', ticketLinks: [],
    }
  }
  return null
}

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
  const concert = getMockConcert(Number(id))
  const [thumbnailFailed, setThumbnailFailed] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [inquiryType, setInquiryType] = useState(null)
  const [isInCalendar, setIsInCalendar] = useState(concert?.isInCalendar ?? false)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  useEffect(() => { setActiveTab('info') }, [id])
  // id 변경 시 캘린더 상태 리셋 — concert 객체 참조가 아닌 id 기준으로 동기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setIsInCalendar(concert?.isInCalendar ?? false) }, [id])

  // TODO: React Query 연동 후 isLoading으로 교체
  const isLoading = false

  function handleCalendar() {
    if (!user) { openLoginModal(window.location.href); return }
    // TODO: API 연동 — isInCalendar ? DELETE /api/calendar/{id} : POST /api/calendar/{id}
    setIsInCalendar((prev) => !prev)
  }

  function handleConcertInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryType('CONCERT')
  }

  function handleSetlistInquiry() {
    if (!user) { openLoginModal(window.location.href); return }
    setInquiryType('SETLIST')
  }

  if (isLoading) return null // TODO: 스켈레톤으로 교체

  if (!concert) {
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

  const { thumbnailUrl, posterUrls, artistName, artistId, title, startDate, endDate,
          venue, status, price, ticketLinks, setlist } = concert
  const showThumbnailPlaceholder = !thumbnailUrl || thumbnailFailed

  const dateRange = endDate && endDate !== startDate
    ? `${startDate} ~ ${endDate}`
    : startDate

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
              {showThumbnailPlaceholder ? (
                <div className={styles.thumbnailPlaceholder}>
                  <span className={styles.thumbnailArtistName}>{artistName}</span>
                </div>
              ) : (
                <img
                  src={thumbnailUrl}
                  alt={artistName}
                  className={styles.thumbnail}
                  onError={() => setThumbnailFailed(true)}
                />
              )}
            </div>
          </div>

          {/* 공연 정보 */}
          <div className={styles.infoCol}>

            {/* 상태 배지 + 아티스트명 */}
            <div className={styles.topMeta}>
              <Badge status={status} />
              <Link to={ROUTES.ARTIST_DETAIL(artistId)} className={styles.artistLink}>
                {artistName}
              </Link>
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

            {/* 캘린더 추가·제거 */}
            <button
              className={`${styles.calendarBtn} ${isInCalendar ? styles.calendarBtnActive : ''}`}
              onClick={handleCalendar}
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
            {ticketLinks.length > 0 && (
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
              {concert.status === 'ENDED' && (
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
              {setlist && setlist.length > 0 ? (
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
              {posterUrls.length > 0 ? (
                <div className={styles.posterList}>
                  {posterUrls.map((url, i) => (
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
    />
    </>
  )
}

export default ConcertDetailPage
