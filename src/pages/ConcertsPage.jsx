import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { CONCERT_STATUS_LABEL } from '@/constants/concert'
import { getConcerts, getFollowingConcerts } from '@/services/concertApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './ConcertsPage.module.css'

const STATUS_FILTERS = ['ALL', 'UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']
const ITEMS_PER_PAGE = 20

function ConcertsPage() {
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [followedOnly, setFollowedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const effectiveFollowedOnly = followedOnly && !!user

  const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['concerts', statusParam, currentPage],
    queryFn: () => getConcerts({ status: statusParam, page: currentPage - 1, size: ITEMS_PER_PAGE }),
    placeholderData: (prev) => prev,
    enabled: !effectiveFollowedOnly,
  })

  // following API는 페이지네이션 없이 전체 반환 → 클라이언트 페이지네이션
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['concerts-following', statusParam],
    queryFn: () => getFollowingConcerts({ status: statusParam }),
    enabled: effectiveFollowedOnly,
  })

  const isLoading = effectiveFollowedOnly ? followingLoading : allLoading

  let concerts, totalElements, totalPages
  if (effectiveFollowedOnly) {
    const all = followingData ?? []
    const filtered = statusParam ? all.filter((c) => c.status === statusParam) : all
    totalElements = filtered.length
    totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
    concerts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  } else {
    concerts = allData?.content ?? []
    totalElements = allData?.totalElements ?? 0
    totalPages = allData?.totalPages ?? 1
  }

  function handleStatusChange(status) {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    setFollowedOnly((prev) => !prev)
    setCurrentPage(1)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>공연</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${totalElements}건`}
          </p>
        </div>

        {/* 공연 상태 필터 + 관심 아티스트 토글 */}
        <div className={styles.filterRow}>
          <div className={styles.filterBar} role="tablist" aria-label="공연 상태 필터">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                role="tab"
                aria-selected={selectedStatus === s}
                className={`${styles.filterTab} ${selectedStatus === s ? styles.filterTabActive : ''}`}
                onClick={() => handleStatusChange(s)}
              >
                {s === 'ALL' ? '전체' : CONCERT_STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          <button
            className={`${styles.followedToggle} ${effectiveFollowedOnly ? styles.followedToggleActive : ''}`}
            onClick={handleFollowedToggle}
            aria-pressed={effectiveFollowedOnly}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={effectiveFollowedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            관심 아티스트만
          </button>
        </div>

        {/* 공연 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ConcertCardSkeleton key={i} />
            ))}
          </div>
        ) : concerts.length > 0 ? (
          <div className={styles.grid}>
            {concerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            message="해당 조건의 공연이 없습니다."
          />
        )}

        {/* 페이지네이션 */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

      </div>
    </div>
  )
}

export default ConcertsPage
