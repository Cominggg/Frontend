import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import ArtistCard from '@/components/artist/ArtistCard'
import ArtistCardSkeleton from '@/components/artist/ArtistCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import SortDropdown from '@/components/ui/SortDropdown'
import { getArtists } from '@/services/artistApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import usePageMeta from '@/hooks/usePageMeta'
import { trackEvent } from '@/utils/analytics'
import styles from './ArtistsPage.module.css'

const PAGE_SIZE = 25
const DEFAULT_SORT = 'sortName,asc'
const SORT_OPTIONS = [
  { value: DEFAULT_SORT, label: '이름순' },
  { value: 'followerCount,desc', label: '팔로워순' },
]

function ArtistsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const urlQuery = searchParams.get('q') || ''
  const followedOnly = searchParams.get('followed') === 'true'
  const isComing = searchParams.get('isComing') === 'true'
  const sort = SORT_OPTIONS.some((o) => o.value === searchParams.get('sort'))
    ? searchParams.get('sort')
    : DEFAULT_SORT
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const urlQueryRef = useRef(urlQuery)
  useEffect(() => { urlQueryRef.current = urlQuery })
  const [inputValue, setInputValue] = useState(urlQuery)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const effectiveFollowedOnly = followedOnly && !!user

  usePageMeta({
    title: '아티스트 - 커밍',
    description: '내한 소식이 있는 Jpop 아티스트를 한눈에 확인하고, 관심 아티스트를 팔로우해 새 소식을 받아보세요.',
    path: '/artists',
  })

  useEffect(() => {
    if (inputValue === urlQueryRef.current) return

    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (inputValue) {
          next.set('q', inputValue)
          trackEvent('search', { search_term: inputValue, page_type: 'artists' })
        } else {
          next.delete('q')
        }
        next.delete('page')
        return next
      }, { replace: true })
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue, setSearchParams])

  const { data, isLoading } = useQuery({
    queryKey: ['artists', urlQuery, currentPage, effectiveFollowedOnly, isComing, sort],
    queryFn: () => getArtists({
      name: urlQuery || undefined,
      following: effectiveFollowedOnly || undefined,
      isComing: isComing || undefined,
      sort: sort === DEFAULT_SORT ? undefined : sort,
      page: currentPage - 1,
      size: PAGE_SIZE,
    }),
    placeholderData: (prev) => prev,
  })

  const artists = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 1

  function handleQueryChange(e) {
    setInputValue(e.target.value)
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

  function handleIsComingChange(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set('isComing', 'true')
      } else {
        next.delete('isComing')
      }
      next.delete('page')
      return next
    }, { replace: false })
    window.scrollTo(0, 0)
  }

  function handleSortChange(value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === DEFAULT_SORT) {
        next.delete('sort')
      } else {
        next.set('sort', value)
      }
      next.delete('page')
      return next
    }, { replace: false })
  }

  function handleFollowedToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (followedOnly) {
        next.delete('followed')
      } else {
        next.set('followed', 'true')
      }
      next.delete('page')
      return next
    }, { replace: false })
    window.scrollTo(0, 0)
  }

  function handlePageChange(page) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page <= 1) {
        next.delete('page')
      } else {
        next.set('page', String(page))
      }
      return next
    }, { replace: false })
    window.scrollTo(0, 0)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* 헤더 */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>아티스트</h1>
          <p className={styles.pageCount}>
            {isLoading ? '' : `${totalElements.toLocaleString()}명`}
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
            placeholder="아티스트 검색..."
            value={inputValue}
            onChange={handleQueryChange}
            aria-label="아티스트 검색"
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

        {/* 필터 행 */}
        <div className={styles.filterRow}>
          <div className={styles.filterBar} role="tablist" aria-label="아티스트 필터">
            <button
              role="tab"
              aria-selected={!isComing}
              className={`${styles.filterTab} ${!isComing ? styles.filterTabActive : ''}`}
              onClick={() => handleIsComingChange(false)}
            >
              전체
            </button>
            <button
              role="tab"
              aria-selected={isComing}
              className={`${styles.filterTab} ${isComing ? styles.filterTabActive : ''}`}
              onClick={() => handleIsComingChange(true)}
            >
              COMING
            </button>
          </div>
          <div className={styles.controls}>
            <SortDropdown options={SORT_OPTIONS} value={sort} onChange={handleSortChange} ariaLabel="아티스트 정렬" />
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
        </div>

        {/* 아티스트 그리드 */}
        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ArtistCardSkeleton key={i} />
            ))}
          </div>
        ) : artists.length > 0 ? (
          <div className={styles.grid}>
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            message="검색 결과가 없습니다. 다른 검색어를 입력해 보세요."
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

export default ArtistsPage
