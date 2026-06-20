import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { CONCERT_STATUS_LABEL } from '@/constants/concert'
import { getConcerts, searchConcerts, getFollowingConcerts } from '@/services/concertApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import usePageTitle from '@/hooks/usePageTitle'
import styles from './ConcertsPage.module.css'

const STATUS_FILTERS = ['ALL', 'UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']
const ITEMS_PER_PAGE = 20

function ConcertsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const selectedStatus = STATUS_FILTERS.includes(searchParams.get('status'))
    ? searchParams.get('status')
    : 'ALL'
  const followedOnly = searchParams.get('followed') === 'true'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const [inputValue, setInputValue] = useState(urlQuery)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const effectiveFollowedOnly = followedOnly && !!user

  usePageTitle('공연 — Coming')

  useEffect(() => {
    if (inputValue === (searchParams.get('q') || '')) return
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue) {
          next.set('q', inputValue)
        } else {
          next.delete('q')
        }
        next.delete('page')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, searchParams, setSearchParams])

  function updateParams(updates) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === false || v === 'ALL' || v === '1' || v === 1) {
          next.delete(k)
        } else {
          next.set(k, String(v))
        }
      })
      return next
    }, { replace: false })
  }

  const statusParam = selectedStatus === 'ALL' ? undefined : selectedStatus
  // 검색어가 있으면 팔로우 필터보다 우선 — BE /concerts/search가 following 파라미터 미지원
  const isSearchMode = !!urlQuery

  // 전체 공연 (검색·팔로우 모드 아닐 때)
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['concerts', statusParam, currentPage],
    queryFn: () => getConcerts({ status: statusParam, page: currentPage - 1, size: ITEMS_PER_PAGE }),
    placeholderData: (prev) => prev,
    enabled: !effectiveFollowedOnly && !urlQuery,
  })

  // 검색 모드 — GET /api/concerts/search
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['concerts-search', urlQuery, statusParam, currentPage],
    queryFn: () => searchConcerts({ q: urlQuery, status: statusParam, page: currentPage - 1, size: ITEMS_PER_PAGE }),
    placeholderData: (prev) => prev,
    enabled: isSearchMode,
  })

  // 팔로우 모드 — GET /api/concerts/following (페이지네이션 없음 → 클라이언트 처리)
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['concerts-following', statusParam],
    queryFn: () => getFollowingConcerts({ status: statusParam }),
    enabled: effectiveFollowedOnly,
  })

  const isLoading = isSearchMode ? searchLoading : effectiveFollowedOnly ? followingLoading : allLoading

  let concerts, totalElements, totalPages
  if (isSearchMode) {
    concerts = searchData?.content ?? []
    totalElements = searchData?.totalElements ?? 0
    totalPages = searchData?.totalPages ?? 1
  } else if (effectiveFollowedOnly) {
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

  function handleQueryClear() {
    setInputValue('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('page')
      return next
    }, { replace: true })
  }

  function handleStatusChange(status) {
    updateParams({ status, page: 1 })
  }

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    updateParams({ followed: followedOnly ? false : true, page: 1 })
  }

  function handlePageChange(page) {
    updateParams({ page })
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

        {/* 검색 */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="공연 검색..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="공연 검색"
          />
          {inputValue && (
            <button
              className={styles.searchClear}
              onClick={handleQueryClear}
              aria-label="검색어 지우기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
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
            disabled={isSearchMode}
            title={isSearchMode ? '검색 중에는 팔로우 필터를 사용할 수 없습니다' : undefined}
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
            onPageChange={handlePageChange}
          />
        )}

      </div>
    </div>
  )
}

export default ConcertsPage
