import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import styles from './MyPage.module.css'

// TODO: API 연동 후 제거 (AUTH-02)
const MOCK_USER = { nickname: '라이브덕후', avatarUrl: null }

// TODO: API 연동 후 제거
const MOCK_FOLLOWED_ARTISTS = [
  { id: 2, name: 'Kenshi Yonezu', imageUrl: null, genres: ['J-Pop', 'Rock'], hasUpcomingConcert: false },
  { id: 6, name: 'RADWIMPS',      imageUrl: null, genres: ['J-Rock', 'Anime'], hasUpcomingConcert: true  },
]

// TODO: API 연동 후 제거 (MY-03)
const MOCK_UPCOMING_CONCERTS = [
  { id: 1,  artistName: 'YOASOBI',          title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',    startDate: '2025.08.15', endDate: '2025.08.16', venue: 'KSPO DOME, 서울',                   status: '공연예정' },
  { id: 2,  artistName: 'King Gnu',          title: 'King Gnu Live Tour 2025',                  startDate: '2025.07.05', endDate: '2025.07.06', venue: '올림픽공원 체조경기장, 서울',         status: '공연예정' },
  { id: 3,  artistName: 'Ado',               title: 'Ado WORLD TOUR "Hibana" in Seoul',         startDate: '2025.06.21', endDate: null,         venue: '고척스카이돔, 서울',                 status: '공연예정' },
  { id: 7,  artistName: 'Mrs. GREEN APPLE',  title: 'Mrs. GREEN APPLE ARENA TOUR 2025',         startDate: '2025.10.04', endDate: '2025.10.05', venue: 'KSPO DOME, 서울',                   status: '공연예정' },
  { id: 9,  artistName: 'RADWIMPS',          title: 'RADWIMPS LIVE TOUR 2025',                  startDate: '2025.11.22', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연예정' },
  { id: 10, artistName: 'Fujii Kaze',        title: 'Fujii Kaze LOVE ALL SERVE ALL STADIUM LIVE', startDate: '2025.08.30', endDate: '2025.08.31', venue: '잠실종합운동장 주경기장, 서울',   status: '공연예정' },
]

// TODO: API 연동 후 제거 (MY-01)
const MOCK_PAST_CONCERTS = [
  { id: 1,   artistName: 'YOASOBI',         title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',    startDate: '2025.08.15', endDate: '2025.08.16', venue: 'KSPO DOME, 서울',                   status: '공연완료' },
  { id: 2,   artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu TOUR 2025 "LOST CORNER"',    startDate: '2025.04.19', endDate: '2025.04.20', venue: '고척스카이돔, 서울',                 status: '공연완료' },
  { id: 3,   artistName: 'Ado',             title: 'Ado WORLD TOUR "Hibana" in Seoul',          startDate: '2025.06.21', endDate: null,         venue: '고척스카이돔, 서울',                 status: '공연완료' },
  { id: 201, artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu STADIUM LIVE 2023',           startDate: '2023.11.18', endDate: '2023.11.19', venue: '잠실종합운동장 주경기장, 서울',       status: '공연완료' },
  { id: 101, artistName: 'YOASOBI',         title: 'YOASOBI THE BOOK CONCERT 2023',             startDate: '2023.05.27', endDate: '2023.05.28', venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 301, artistName: 'Ado',             title: 'Ado WORLD TOUR 2024 "Wish"',                startDate: '2024.04.13', endDate: null,         venue: 'KSPO DOME, 서울',                   status: '공연완료' },
  { id: 202, artistName: 'Kenshi Yonezu',   title: 'Kenshi Yonezu HALL TOUR 2022',              startDate: '2022.06.11', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 102, artistName: 'YOASOBI',         title: 'YOASOBI LIVE 2022 "Into The Night"',        startDate: '2022.10.15', endDate: null,         venue: '예스24 라이브홀, 서울',               status: '공연완료' },
  { id: 302, artistName: 'Ado',             title: 'Ado LIVE 2023',                             startDate: '2023.08.05', endDate: null,         venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
  { id: 103, artistName: 'YOASOBI',         title: 'YOASOBI CONCERT 2021',                      startDate: '2021.09.04', endDate: null,         venue: '올림픽공원 K-아트홀, 서울',           status: '공연완료' },
  { id: 401, artistName: 'RADWIMPS',        title: 'RADWIMPS LIVE TOUR 2024',                   startDate: '2024.09.14', endDate: '2024.09.15', venue: '올림픽공원 체조경기장, 서울',         status: '공연완료' },
]

// TODO: API 연동 후 제거 (INQ-04)
const MOCK_INQUIRIES = [
  { id: 1, type: 'CONCERT', title: 'YOASOBI 2025 공연 예매처 링크가 잘못되어 있습니다',   status: 'RESOLVED',    createdAt: '2025.08.20', resultMessage: '안내해 주신 내용을 확인하여 예매처 링크를 수정하였습니다. 감사합니다.' },
  { id: 2, type: 'ARTIST',  title: 'Kenshi Yonezu 멤버 정보가 틀립니다',                  status: 'REJECTED',    createdAt: '2025.07.15', rejectReason: '현재 등록된 정보는 공식 프로필 기준으로 정확합니다.' },
  { id: 3, type: 'SETLIST', title: 'Ado Hibana 공연 셋리스트 일부 누락',                  status: 'IN_PROGRESS', createdAt: '2025.06.30' },
  { id: 4, type: 'CONCERT', title: 'King Gnu 2025 공연 장소 정보 수정 요청',               status: 'PENDING',     createdAt: '2025.06.10' },
  { id: 5, type: 'ARTIST',  title: 'RADWIMPS 공식 홈페이지 링크 오류',                    status: 'RESOLVED',    createdAt: '2025.05.22', resultMessage: '공식 홈페이지 링크를 최신 주소로 업데이트하였습니다.' },
]

const INQ_TYPE_LABELS = { CONCERT: '공연 정보', ARTIST: '아티스트 정보', SETLIST: '셋리스트' }
const INQ_STATUS_LABELS = { PENDING: '접수', IN_PROGRESS: '처리중', RESOLVED: '완료', REJECTED: '반려' }

const TABS = [
  { id: 'artists',   label: '관심 아티스트' },
  { id: 'upcoming',  label: '예정 공연' },
  { id: 'history',   label: '다녀온 공연' },
  { id: 'inquiries', label: '내 문의' },
]

const MY_PAGE_SIZE = 10

function ArtistRow({ artist, onUnfollow }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [colorFrom, colorTo] = getArtistColor(artist.name)
  const showPlaceholder = !artist.imageUrl || imgFailed

  return (
    <div className={styles.artistRow}>
      <Link to={ROUTES.ARTIST_DETAIL(artist.id)} className={styles.artistRowLink}>
        <div
          className={styles.artistAvatar}
          style={{ '--a-from': colorFrom, '--a-to': colorTo }}
        >
          {showPlaceholder ? (
            <span className={styles.artistAvatarInitial}>{artist.name.charAt(0)}</span>
          ) : (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className={styles.artistAvatarImg}
              onError={() => setImgFailed(true)}
            />
          )}
        </div>
        <div className={styles.artistRowInfo}>
          <div className={styles.artistRowNameRow}>
            <span className={styles.artistRowName}>{artist.name}</span>
            {artist.hasUpcomingConcert && (
              <span className={styles.comingBadge}>COMING</span>
            )}
          </div>
          {artist.genres.length > 0 && (
            <div className={styles.artistRowGenres}>
              {artist.genres.map((g) => (
                <span key={g} className={styles.genreChip}>{g}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <button
        className={styles.unfollowBtn}
        onClick={() => onUnfollow(artist.id)}
        aria-label={`${artist.name} 언팔로우`}
      >
        언팔로우
      </button>
    </div>
  )
}

function ConcertRow({ concert }) {
  const { id, artistName, title, startDate, endDate, venue, status } = concert
  const dateRange = endDate && endDate !== startDate
    ? `${startDate} ~ ${endDate}`
    : startDate

  return (
    <Link to={ROUTES.CONCERT_DETAIL(id)} className={styles.concertRow}>
      <div className={styles.concertRowLeft}>
        <div className={styles.concertRowMeta}>
          <span className={styles.concertRowArtist}>{artistName}</span>
          <Badge status={status} />
        </div>
        <p className={styles.concertRowTitle}>{title}</p>
        <div className={styles.concertRowDetails}>
          <span className={styles.concertRowDetail}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {dateRange}
          </span>
          <span className={styles.concertRowDetail}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {venue}
          </span>
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.concertRowChevron} aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  )
}

function InquiryRow({ inquiry }) {
  const [expanded, setExpanded] = useState(false)
  const { type, title, status, createdAt, resultMessage, rejectReason } = inquiry
  const hasDetail = status === 'RESOLVED' || status === 'REJECTED'

  return (
    <div className={styles.inquiryItem}>
      <button
        className={`${styles.inquiryRowBtn} ${!hasDetail ? styles.inquiryRowBtnStatic : ''}`}
        onClick={() => hasDetail && setExpanded((p) => !p)}
        aria-expanded={hasDetail ? expanded : undefined}
      >
        <div className={styles.inquiryRowMain}>
          <div className={styles.inquiryRowMeta}>
            <span className={styles.inquiryType}>{INQ_TYPE_LABELS[type] ?? type}</span>
            <span className={`${styles.inquiryStatus} ${styles[`inquiryStatus${status}`]}`}>
              {INQ_STATUS_LABELS[status] ?? status}
            </span>
          </div>
          <p className={styles.inquiryTitle}>{title}</p>
          <span className={styles.inquiryDate}>{createdAt}</span>
        </div>
        {hasDetail && (
          <svg
            className={`${styles.inquiryChevron} ${expanded ? styles.inquiryChevronOpen : ''}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </button>

      {hasDetail && expanded && (
        <div className={styles.inquiryDetail}>
          {status === 'RESOLVED' && (
            <>
              <p className={styles.inquiryDetailLabel}>처리 결과</p>
              <p className={styles.inquiryDetailText}>{resultMessage}</p>
            </>
          )}
          {status === 'REJECTED' && (
            <>
              <p className={styles.inquiryDetailLabel}>반려 사유</p>
              <p className={styles.inquiryDetailText}>{rejectReason}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_NICKNAME = 20

function ProfileEditModal({ isOpen, onClose }) {
  const [nickname, setNickname] = useState(MOCK_USER.nickname)
  const [previewUrl, setPreviewUrl] = useState(MOCK_USER.avatarUrl)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const modal = modalRef.current
    const focusable = modal ? [...modal.querySelectorAll(FOCUSABLE)] : []
    focusable[0]?.focus()

    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    return () => { if (previewUrl && previewUrl !== MOCK_USER.avatarUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  if (!isOpen) return null

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('jpg, png, webp 파일만 업로드할 수 있습니다.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('파일 크기는 5MB 이하여야 합니다.')
      e.target.value = ''
      return
    }
    setFileError(null)
    if (previewUrl && previewUrl !== MOCK_USER.avatarUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleSave(e) {
    e.preventDefault()
    if (!nickname.trim()) return
    // TODO: API 연동 — PATCH /api/users/me (AUTH-02)
    onClose()
  }

  const showInitial = !previewUrl

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
      <div className={styles.modalBox} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 id="profile-edit-title" className={styles.modalTitle}>프로필 수정</h2>

        <form onSubmit={handleSave}>
          {/* 아바타 업로드 */}
          <div className={styles.modalAvatarWrap}>
            <button
              type="button"
              className={styles.modalAvatarBtn}
              onClick={() => fileInputRef.current?.click()}
              aria-label="프로필 사진 변경"
            >
              <div className={styles.modalAvatar}>
                {showInitial ? (
                  <span className={styles.modalAvatarInitial}>{nickname.trim().charAt(0) || '?'}</span>
                ) : (
                  <img src={previewUrl} alt="프로필 미리보기" className={styles.modalAvatarImg} />
                )}
              </div>
              <div className={styles.modalAvatarCameraOverlay} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.modalFileInput}
              onChange={handleFileChange}
              aria-label="프로필 이미지 파일 선택"
            />
            {fileError && <p className={styles.modalFileError}>{fileError}</p>}
            <p className={styles.modalFileHint}>jpg · png · webp, 최대 5MB</p>
          </div>

          {/* 닉네임 입력 */}
          <div className={styles.modalField}>
            <label htmlFor="edit-nickname" className={styles.modalLabel}>닉네임</label>
            <div className={styles.modalInputWrap}>
              <input
                id="edit-nickname"
                type="text"
                className={styles.modalInput}
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, MAX_NICKNAME))}
                maxLength={MAX_NICKNAME}
                placeholder="닉네임을 입력하세요"
              />
              <span className={`${styles.modalCharCount} ${nickname.length >= MAX_NICKNAME ? styles.modalCharCountMax : ''}`}>
                {nickname.length}/{MAX_NICKNAME}
              </span>
            </div>
          </div>

          {/* 버튼 */}
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.modalSaveBtn} disabled={!nickname.trim()}>저장</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProfileCard({ onEditClick }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showPlaceholder = !MOCK_USER.avatarUrl || imgFailed

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileAvatar}>
        {showPlaceholder ? (
          <span className={styles.profileAvatarInitial}>
            {MOCK_USER.nickname.charAt(0)}
          </span>
        ) : (
          <img
            src={MOCK_USER.avatarUrl}
            alt={MOCK_USER.nickname}
            className={styles.profileAvatarImg}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className={styles.profileInfo}>
        <p className={styles.profileNickname}>{MOCK_USER.nickname}</p>
      </div>
      <button className={styles.profileEditBtn} onClick={onEditClick}>
        프로필 수정
      </button>
    </div>
  )
}

function MyPage() {
  const [activeTab, setActiveTab] = useState('artists')
  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [followedArtists, setFollowedArtists] = useState(MOCK_FOLLOWED_ARTISTS)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [inquiryPage, setInquiryPage] = useState(1)

  function handleUnfollow(artistId) {
    setFollowedArtists((prev) => prev.filter((a) => a.id !== artistId))
  }

  const totalUpcomingPages = Math.max(1, Math.ceil(MOCK_UPCOMING_CONCERTS.length / MY_PAGE_SIZE))
  const paginatedUpcoming = MOCK_UPCOMING_CONCERTS.slice(
    (upcomingPage - 1) * MY_PAGE_SIZE,
    upcomingPage * MY_PAGE_SIZE
  )

  const totalHistoryPages = Math.max(1, Math.ceil(MOCK_PAST_CONCERTS.length / MY_PAGE_SIZE))
  const paginatedHistory = MOCK_PAST_CONCERTS.slice(
    (historyPage - 1) * MY_PAGE_SIZE,
    historyPage * MY_PAGE_SIZE
  )

  const totalInquiryPages = Math.max(1, Math.ceil(MOCK_INQUIRIES.length / MY_PAGE_SIZE))
  const paginatedInquiries = MOCK_INQUIRIES.slice(
    (inquiryPage - 1) * MY_PAGE_SIZE,
    inquiryPage * MY_PAGE_SIZE
  )

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 프로필 카드 (AUTH-02) */}
        <ProfileCard onEditClick={() => setProfileEditOpen(true)} />
        <ProfileEditModal isOpen={profileEditOpen} onClose={() => setProfileEditOpen(false)} />

        {/* 탭 */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 관심 아티스트 탭 (MY-02) */}
        {activeTab === 'artists' && (
          <div role="tabpanel" id="tabpanel-artists" aria-labelledby="tab-artists">
            {followedArtists.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                }
                message="팔로우한 아티스트가 없습니다."
                action={{ label: '아티스트 둘러보기', to: ROUTES.ARTISTS }}
              />
            ) : (
              <div className={styles.artistList}>
                {followedArtists.map((artist) => (
                  <ArtistRow key={artist.id} artist={artist} onUnfollow={handleUnfollow} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 예정 공연 탭 (MY-03) */}
        {activeTab === 'upcoming' && (
          <div role="tabpanel" id="tabpanel-upcoming" aria-labelledby="tab-upcoming">
            {paginatedUpcoming.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                message="예정된 공연이 없습니다."
              />
            ) : (
              <>
                <div className={styles.concertList}>
                  {paginatedUpcoming.map((concert) => (
                    <ConcertRow key={concert.id} concert={concert} />
                  ))}
                </div>

                {totalUpcomingPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                      disabled={upcomingPage === 1}
                      aria-label="이전 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalUpcomingPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === upcomingPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setUpcomingPage(p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === upcomingPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setUpcomingPage((p) => Math.min(totalUpcomingPages, p + 1))}
                      disabled={upcomingPage === totalUpcomingPages}
                      aria-label="다음 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 다녀온 공연 탭 (MY-01) */}
        {activeTab === 'history' && (
          <div role="tabpanel" id="tabpanel-history" aria-labelledby="tab-history">
            {paginatedHistory.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
                message="다녀온 공연 내역이 없습니다."
              />
            ) : (
              <>
                <div className={styles.concertList}>
                  {paginatedHistory.map((concert) => (
                    <ConcertRow key={concert.id} concert={concert} />
                  ))}
                </div>

                {totalHistoryPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      aria-label="이전 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === historyPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setHistoryPage(p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === historyPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                      aria-label="다음 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 내 문의 탭 (INQ-04) */}
        {activeTab === 'inquiries' && (
          <div role="tabpanel" id="tabpanel-inquiries" aria-labelledby="tab-inquiries">
            {paginatedInquiries.length === 0 ? (
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
                message="등록한 문의 내역이 없습니다."
              />
            ) : (
              <>
                <div className={styles.inquiryList}>
                  {paginatedInquiries.map((inquiry) => (
                    <InquiryRow key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>

                {totalInquiryPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                      disabled={inquiryPage === 1}
                      aria-label="이전 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    {Array.from({ length: totalInquiryPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === inquiryPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setInquiryPage(p)}
                        aria-label={`${p}페이지`}
                        aria-current={p === inquiryPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => setInquiryPage((p) => Math.min(totalInquiryPages, p + 1))}
                      disabled={inquiryPage === totalInquiryPages}
                      aria-label="다음 페이지"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyPage
