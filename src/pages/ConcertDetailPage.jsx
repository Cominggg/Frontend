import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import useAuthStore from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import styles from './ConcertDetailPage.module.css'

// TODO: API 연동 후 제거
const MOCK_CONCERT_MAP = {
  1: {
    id: 1, thumbnailUrl: null, posterUrls: [], artistName: 'YOASOBI', artistId: 1,
    title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
    startDate: '2025.08.15', endDate: '2025.08.16',
    venue: 'KSPO DOME, 서울', status: '공연예정',
    price: '전석 165,000원',
    ticketLinks: [
      { id: 'interpark', label: '인터파크', url: '#' },
      { id: 'melon', label: '멜론티켓', url: '#' },
    ],
    description: 'YOASOBI의 첫 한국 아레나 투어. Ayase와 ikura가 선보이는 환상적인 무대.',
  },
  2: {
    id: 2, thumbnailUrl: null, posterUrls: [], artistName: 'Kenshi Yonezu', artistId: 2,
    title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',
    startDate: '2025.04.19', endDate: '2025.04.20',
    venue: '고척스카이돔, 서울', status: '공연완료',
    price: '전석 154,000원',
    ticketLinks: [
      { id: 'yes24', label: 'YES24', url: '#' },
    ],
    description: '요네즈 켄시의 "LOST CORNER" 앨범 투어의 한국 공연.',
  },
  3: {
    id: 3, thumbnailUrl: null, posterUrls: [], artistName: 'Ado', artistId: 3,
    title: 'Ado WORLD TOUR "Hibana" in Seoul',
    startDate: '2025.06.21', endDate: null,
    venue: '고척스카이돔, 서울', status: '공연예정',
    price: 'VIP 242,000원 / 전석 165,000원',
    ticketLinks: [
      { id: 'interpark', label: '인터파크', url: '#' },
      { id: 'yes24', label: 'YES24', url: '#' },
    ],
    description: 'Ado의 월드 투어 "Hibana" 한국 공연.',
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
    venue: '고려대학교 화정체육관, 서울', status: '공연완료',
    price: '전석 138,000원',
    ticketLinks: [
      { id: 'melon', label: '멜론티켓', url: '#' },
    ],
    description: 'ZUTOMAYO의 JAPAN & ASIA TOUR "INTENSE II 坐・ZOMBIE CRAB LABO" 서울 공연. 2026년 3월 14~15일 고려대학교 화정체육관에서 2일간 진행.',
  },
}

function getMockConcert(id) {
  if (MOCK_CONCERT_MAP[id]) return MOCK_CONCERT_MAP[id]
  const num = Number(id)
  if (num >= 4 && num <= 15) {
    return {
      id: num, thumbnailUrl: null, posterUrls: [], artistName: `아티스트 ${num}`, artistId: num,
      title: `공연 제목 ${num}`, startDate: '2025.01.01', endDate: null,
      venue: '서울', status: '공연예정',
      price: '미정', ticketLinks: [], description: '',
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
  const user = useAuthStore((s) => s.user)

  // TODO: React Query 연동 후 isLoading으로 교체
  const isLoading = false

  function handleConcertInquiry() {
    if (!user) {
      // TODO: 로그인 모달 표시 (redirectUri: 현재 URL)
      return
    }
    // TODO: 문의 모달 표시 (type: CONCERT, targetId: id)
  }

  function handleSetlistInquiry() {
    if (!user) {
      // TODO: 로그인 모달 표시 (redirectUri: 현재 URL)
      return
    }
    // TODO: 문의 모달 표시 (type: SETLIST, targetId: id)
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
          venue, status, price, ticketLinks, description } = concert
  const showThumbnailPlaceholder = !thumbnailUrl || thumbnailFailed

  const dateRange = endDate && endDate !== startDate
    ? `${startDate} ~ ${endDate}`
    : startDate

  return (
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

            {description && (
              <p className={styles.description}>{description}</p>
            )}

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
              {concert.status === '공연완료' && (
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

        {/* 정보 포스터 (하단) */}
        <div className={styles.posterSection}>
          <p className={styles.posterLabel}>공연 정보</p>
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

      </div>
    </div>
  )
}

export default ConcertDetailPage
