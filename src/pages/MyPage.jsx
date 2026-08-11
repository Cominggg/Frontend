import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { getMe, updateMe, withdraw, updateMarketing } from '@/services/authApi'
import { getFollowingArtists, unfollowArtist } from '@/services/artistApi'
import { getUpcomingConcerts } from '@/services/calendarApi'
import { getConcertHistory, getMyInquiries } from '@/services/myApi'
import useAuthStore from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { formatDate } from '@/utils/date'
import styles from './MyPage.module.css'

const INQ_TYPE_LABELS = { CONCERT: '공연 정보', ARTIST: '아티스트 정보', SETLIST: '셋리스트' }
const INQ_STATUS_LABELS = { PENDING: '접수', IN_PROGRESS: '처리중', RESOLVED: '완료', REJECTED: '반려' }

const TABS = [
  { id: 'artists',   label: '관심 아티스트', path: ROUTES.ME },
  { id: 'upcoming',  label: '예정 공연',     path: ROUTES.ME_UPCOMING },
  { id: 'history',   label: '다녀온 공연',   path: ROUTES.ME_HISTORY },
  { id: 'inquiries', label: '내 문의',       path: ROUTES.ME_INQUIRIES },
  { id: 'settings',  label: '설정',          path: ROUTES.ME_SETTINGS },
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
            <span className={styles.artistRowName}><ArtistAliasName name={artist.name} koreanName={artist.koreanName} /></span>
            {artist.hasUpcomingConcert && (
              <span className={styles.comingBadge}>COMING</span>
            )}
          </div>
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
  const { id, artists, title, startDate, endDate, venue, status } = concert
  const dateRange = endDate && endDate !== startDate
    ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    : formatDate(startDate)

  return (
    <Link to={ROUTES.CONCERT_DETAIL(id)} className={styles.concertRow}>
      <div className={styles.concertRowLeft}>
        <div className={styles.concertRowMeta}>
          <span className={styles.concertRowArtist}>
            {(artists ?? []).map((a, i) => (
              <span key={a.id ?? i}>
                {i > 0 && ' · '}
                <ArtistAliasName name={a.name} koreanName={a.koreanName} />
              </span>
            ))}
          </span>
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

  const statusMessage = {
    PENDING: '접수된 문의입니다. 검토를 기다리고 있습니다.',
    IN_PROGRESS: '현재 검토가 진행 중입니다.',
  }

  return (
    <div className={styles.inquiryItem}>
      <button
        className={styles.inquiryRowBtn}
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className={styles.inquiryRowMain}>
          <div className={styles.inquiryRowMeta}>
            <span className={styles.inquiryType}>{INQ_TYPE_LABELS[type] ?? type}</span>
            <span className={`${styles.inquiryStatus} ${styles[`inquiryStatus${status}`]}`}>
              {INQ_STATUS_LABELS[status] ?? status}
            </span>
          </div>
          <p className={styles.inquiryTitle}>{title}</p>
          <span className={styles.inquiryDate}>{formatDate(createdAt)}</span>
        </div>
        <svg
          className={`${styles.inquiryChevron} ${expanded ? styles.inquiryChevronOpen : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
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
          {(status === 'PENDING' || status === 'IN_PROGRESS') && (
            <p className={styles.inquiryDetailText}>{statusMessage[status]}</p>
          )}
        </div>
      )}
    </div>
  )
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
const MAX_NICKNAME = 20

function useModalFocusTrap(isOpen, onClose, modalRef) {
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
  }, [isOpen, onClose, modalRef])
}

function ProfileEditModal({ isOpen, onClose, user, onSave }) {
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const modalRef = useRef(null)

  useModalFocusTrap(isOpen, onClose, modalRef)

  if (!isOpen) return null

  function handleSave(e) {
    e.preventDefault()
    if (!nickname.trim()) return
    onSave({ nickname: nickname.trim() })
    onClose()
  }

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

function WithdrawalModal({ isOpen, onClose, onWithdraw }) {
  const modalRef = useRef(null)

  useModalFocusTrap(isOpen, onClose, modalRef)

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="withdrawal-title">
      <div className={styles.modalBox} ref={modalRef} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.withdrawalIcon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 id="withdrawal-title" className={styles.modalTitle}>정말 탈퇴하시겠습니까?</h2>
        <p className={styles.withdrawalDesc}>
          탈퇴하면 관심 아티스트, 캘린더, 문의 내역 등 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose}>취소</button>
          <button type="button" className={styles.withdrawalConfirmBtn} onClick={onWithdraw}>탈퇴하기</button>
        </div>
      </div>
    </div>
  )
}

function MarketingToggle({ enabled, onToggle, loading }) {
  return (
    <div className={styles.settingsSection}>
      <h2 className={styles.settingsSectionTitle}>알림 설정</h2>
      <div className={styles.settingRow}>
        <div className={styles.settingInfo}>
          <span className={styles.settingLabel}>마케팅 수신 동의</span>
          <span className={styles.settingDesc}>관심 아티스트 내한 공연 알림 및 서비스 업데이트 소식을 이메일로 받습니다.</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`${styles.toggle} ${enabled ? styles.toggleOn : ''}`}
          onClick={onToggle}
          disabled={loading}
          aria-label="마케팅 수신 동의"
        >
          <span className={styles.toggleThumb} />
        </button>
      </div>
    </div>
  )
}

function ProfileCard({ user, onEditClick }) {
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileAvatar}>
        <span className={styles.profileAvatarInitial}>
          {user?.nickname?.charAt(0) ?? '?'}
        </span>
      </div>
      <div className={styles.profileInfo}>
        <p className={styles.profileNickname}>{user?.nickname ?? ''}</p>
      </div>
      <button className={styles.profileEditBtn} onClick={onEditClick}>
        프로필 수정
      </button>
    </div>
  )
}

function MyPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const queryClient = useQueryClient()
  const clearUser = useAuthStore((s) => s.clearUser)

  const activeTab = useMemo(() => {
    const tab = TABS.find((t) => t.path === pathname)
    return tab ? tab.id : 'artists'
  }, [pathname])

  const [profileEditOpen, setProfileEditOpen] = useState(false)
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [inquiryPage, setInquiryPage] = useState(1)

  useEffect(() => {
    document.title = '마이페이지 — 커밍'
    return () => { document.title = '커밍' }
  }, [])

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  })

  const { data: followingArtists = [] } = useQuery({
    queryKey: ['following-artists'],
    queryFn: getFollowingArtists,
  })

  const { data: upcomingData, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['upcoming-concerts', upcomingPage],
    queryFn: () => getUpcomingConcerts({ page: upcomingPage - 1, size: MY_PAGE_SIZE }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'upcoming',
  })

  const { data: historyData } = useQuery({
    queryKey: ['concert-history', historyPage],
    queryFn: () => getConcertHistory({ page: historyPage - 1, size: MY_PAGE_SIZE }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'history',
  })

  const { data: inquiryData } = useQuery({
    queryKey: ['my-inquiries', inquiryPage],
    queryFn: () => getMyInquiries({ page: inquiryPage - 1, size: MY_PAGE_SIZE }),
    placeholderData: (prev) => prev,
    enabled: activeTab === 'inquiries',
  })

  const unfollowMutation = useMutation({
    mutationFn: unfollowArtist,
    onMutate: async (artistId) => {
      await queryClient.cancelQueries({ queryKey: ['following-artists'] })
      const prev = queryClient.getQueryData(['following-artists'])
      queryClient.setQueryData(['following-artists'], (old) =>
        (old ?? []).filter((a) => a.id !== artistId)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['following-artists'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['following-artists'] })
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      queryClient.invalidateQueries({ queryKey: ['following-concerts-home'] })
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(['me'], updated)
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      clearUser()
      navigate('/')
    },
  })

  const marketingMutation = useMutation({
    mutationFn: updateMarketing,
    onMutate: async (agreedMarketing) => {
      await queryClient.cancelQueries({ queryKey: ['me'] })
      const prev = queryClient.getQueryData(['me'])
      queryClient.setQueryData(['me'], (old) => old ? { ...old, agreedMarketing } : old)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['me'], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const upcomingList = upcomingData?.content ?? []
  const totalUpcomingPages = upcomingData?.totalPages ?? 1

  const historyList = historyData?.content ?? []
  const totalHistoryPages = historyData?.totalPages ?? 1

  const inquiryList = inquiryData?.content ?? []
  const totalInquiryPages = inquiryData?.totalPages ?? 1

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 프로필 카드 (AUTH-02) */}
        <ProfileCard user={user} onEditClick={() => setProfileEditOpen(true)} />
        {profileEditOpen && (
          <ProfileEditModal
            isOpen={profileEditOpen}
            onClose={() => setProfileEditOpen(false)}
            user={user}
            onSave={(body) => updateProfileMutation.mutate(body)}
          />
        )}

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
              onClick={() => {
                setUpcomingPage(1)
                setHistoryPage(1)
                setInquiryPage(1)
                navigate(tab.path)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 관심 아티스트 탭 (MY-02) */}
        {activeTab === 'artists' && (
          <div role="tabpanel" id="tabpanel-artists" aria-labelledby="tab-artists">
            {followingArtists.length === 0 ? (
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
                {followingArtists.map((artist) => (
                  <ArtistRow
                    key={artist.id}
                    artist={artist}
                    onUnfollow={(id) => unfollowMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 예정 공연 탭 (MY-03) */}
        {activeTab === 'upcoming' && (
          <div role="tabpanel" id="tabpanel-upcoming" aria-labelledby="tab-upcoming">
            {isUpcomingLoading ? (
              <div className={styles.concertList}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.concertRowSkeleton}>
                    <div className={styles.skeletonLeft}>
                      <div className={styles.skeletonMeta} />
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonDetails}>
                        <div className={styles.skeletonDetail} />
                        <div className={styles.skeletonDetail} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingList.length === 0 ? (
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
                  {upcomingList.map((concert) => (
                    <ConcertRow key={concert.concertId} concert={{ ...concert, id: concert.concertId }} />
                  ))}
                </div>

                <Pagination
                  currentPage={upcomingPage}
                  totalPages={totalUpcomingPages}
                  onPageChange={setUpcomingPage}
                />
              </>
            )}
          </div>
        )}

        {/* 다녀온 공연 탭 (MY-01) */}
        {activeTab === 'history' && (
          <div role="tabpanel" id="tabpanel-history" aria-labelledby="tab-history">
            {historyList.length === 0 ? (
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
                  {historyList.map((concert) => (
                    <ConcertRow key={concert.id} concert={concert} />
                  ))}
                </div>

                <Pagination
                  currentPage={historyPage}
                  totalPages={totalHistoryPages}
                  onPageChange={setHistoryPage}
                />
              </>
            )}
          </div>
        )}

        {/* 내 문의 탭 (INQ-04) */}
        {activeTab === 'inquiries' && (
          <div role="tabpanel" id="tabpanel-inquiries" aria-labelledby="tab-inquiries">
            {inquiryList.length === 0 ? (
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
                  {inquiryList.map((inquiry) => (
                    <InquiryRow key={inquiry.id} inquiry={inquiry} />
                  ))}
                </div>

                <Pagination
                  currentPage={inquiryPage}
                  totalPages={totalInquiryPages}
                  onPageChange={setInquiryPage}
                />
              </>
            )}
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div role="tabpanel" id="tabpanel-settings" aria-labelledby="tab-settings">
            <MarketingToggle
              enabled={user?.agreedMarketing ?? false}
              onToggle={() => marketingMutation.mutate(!(user?.agreedMarketing ?? false))}
              loading={marketingMutation.isPending}
            />
            <div className={styles.withdrawalSection}>
              <button
                className={styles.withdrawalBtn}
                onClick={() => setWithdrawalOpen(true)}
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        )}

        <WithdrawalModal
          isOpen={withdrawalOpen}
          onClose={() => setWithdrawalOpen(false)}
          onWithdraw={() => withdrawMutation.mutate()}
        />

      </div>
    </div>
  )
}

export default MyPage
