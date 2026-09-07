import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ConcertCard from '@/components/concert/ConcertCard'
import ConcertCardSkeleton from '@/components/concert/ConcertCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import SourceCredit from '@/components/ui/SourceCredit'
import { CONCERT_STATUS_LABEL } from '@/constants/concert'
import { getConcerts } from '@/services/concertApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import usePageMeta from '@/hooks/usePageMeta'
import { trackEvent } from '@/utils/analytics'
import styles from './ConcertsPage.module.css'

const STATUS_FILTERS = ['ALL', 'UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']
const ITEMS_PER_PAGE = 20

function getConcertEmptyMessage(urlQuery, statusParam, effectiveFollowedOnly) {
  if (urlQuery && statusParam) return `'${urlQuery}' · ${CONCERT_STATUS_LABEL[statusParam]} 검색 결과가 없습니다.`
  if (urlQuery) return `'${urlQuery}' 검색 결과가 없습니다.`
  if (effectiveFollowedOnly && statusParam) return `관심 아티스트의 ${CONCERT_STATUS_LABEL[statusParam]} 공연이 없습니다.`
  if (effectiveFollowedOnly) return '관심 아티스트의 공연이 없습니다.'
  if (statusParam) return `${CONCERT_STATUS_LABEL[statusParam]} 공연이 없습니다.`
  return '해당 조건의 공연이 없습니다.'
}

function ConcertsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const selectedStatus = STATUS_FILTERS.includes(searchParams.get('status'))
    ? searchParams.get('status')
    : 'ALL'
  const followedOnly = searchParams.get('followed') === 'true'
  const ticketOpenPending = searchParams.get('ticketOpenPending') === 'true'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const urlQueryRef = useRef(urlQuery)
  useEffect(() => { urlQueryRef.current = urlQuery })
  const [inputValue, setInputValue] = useState(urlQuery)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const effectiveFollowedOnly = followedOnly && !!user

  usePageMeta({
    title: '공연 - 커밍',
    description: '내한이 예정되거나 진행 중인 Jpop 아티스트 공연을 모아봤습니다. 상태·아티스트별로 필터링해 확인하세요.',
    path: '/concerts',
  })

  useEffect(() => {
    if (inputValue === urlQueryRef.current) return
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue) {
          next.set('q', inputValue)
          trackEvent('search', { search_term_length: inputValue.length, page_type: 'concerts' })
        } else {
          next.delete('q')
        }
        next.delete('page')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, setSearchParams])

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
  // 티켓팅 예정만 필터 중엔 티켓 오픈 임박순, 공연예정·공연중은 공연일 임박순(오름차순), 그 외(전체·종료·취소)는 최신순(내림차순)
  const sortParam = ticketOpenPending
    ? 'ticketOpenAt,asc'
    : selectedStatus === 'UPCOMING' || selectedStatus === 'ONGOING'
      ? 'startDate,asc'
      : 'startDate,desc'

  const { data, isLoading } = useQuery({
    queryKey: ['concerts', urlQuery || undefined, statusParam, effectiveFollowedOnly, effectiveFollowedOnly ? user?.id : undefined, ticketOpenPending, sortParam, currentPage],
    queryFn: () => getConcerts({
      q: urlQuery || undefined,
      status: statusParam,
      followedOnly: effectiveFollowedOnly || undefined,
      ticketOpenPending: ticketOpenPending || undefined,
      sort: sortParam,
      page: currentPage - 1,
      size: ITEMS_PER_PAGE,
    }),
    placeholderData: (prev) => prev,
  })

  const concerts = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

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
    window.scrollTo(0, 0)
  }

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    updateParams({ followed: followedOnly ? false : true, page: 1 })
    window.scrollTo(0, 0)
  }

  function handleTicketOpenPendingToggle() {
    updateParams({ ticketOpenPending: ticketOpenPending ? false : true, page: 1 })
    window.scrollTo(0, 0)
  }

  function handlePageChange(page) {
    updateParams({ page })
    window.scrollTo(0, 0)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>공연</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${totalElements.toLocaleString()}건`}
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
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.filterToggle} ${effectiveFollowedOnly ? styles.filterToggleActive : ''}`}
              onClick={handleFollowedToggle}
              aria-pressed={effectiveFollowedOnly}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={effectiveFollowedOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              관심 아티스트만
            </button>
            <button
              className={`${styles.filterToggle} ${ticketOpenPending ? styles.filterToggleActive : ''}`}
              onClick={handleTicketOpenPendingToggle}
              aria-pressed={ticketOpenPending}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 5V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-5V9z" />
              </svg>
              티켓팅 예정만
            </button>
          </div>
        </div>

        {/* 공연 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
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
            message={getConcertEmptyMessage(urlQuery, statusParam, effectiveFollowedOnly)}
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

        {/* 출처 표기 */}
        <SourceCredit text="데이터 제공: 공연예술통합전산망(KOPIS)" />

      </div>
    </div>
  )
}

export default ConcertsPage
