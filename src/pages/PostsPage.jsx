import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import PinnedNotices from '@/components/post/PinnedNotices'
import PostListItem from '@/components/post/PostListItem'
import PostListItemSkeleton from '@/components/post/PostListItemSkeleton'
import PostsSidebar from '@/components/post/sidebar/PostsSidebar'
import usePageMeta from '@/hooks/usePageMeta'
import useHorizontalWheelGuard from '@/hooks/useHorizontalWheelGuard'
import { getPosts, getPopularBoardPosts, getSearch } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import { POST_CATEGORY_LABEL } from '@/constants/post'
import { trackEvent } from '@/utils/analytics'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './PostsPage.module.css'

const CATEGORY_FILTERS = ['ALL', 'POPULAR', 'FREE', 'INFO', 'REVIEW']
const CATEGORY_TAB_LABEL = { ALL: '전체', POPULAR: '인기글' }
const ITEMS_PER_PAGE = 10
const MIN_QUERY_LENGTH = 2

function getEmptyMessage(urlQuery, isQueryTooShort) {
  if (isQueryTooShort) return `검색어는 ${MIN_QUERY_LENGTH}자 이상 입력해주세요.`
  if (urlQuery) return `'${urlQuery}'에 대한 검색 결과가 없습니다.`
  return '첫 게시글을 남겨보세요'
}

function SearchEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PostsEmptyIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  const urlQuery = searchParams.get('q') || ''
  const urlQueryRef = useRef(urlQuery)
  useEffect(() => { urlQueryRef.current = urlQuery })
  const [inputValue, setInputValue] = useState(urlQuery)
  useEffect(() => { setInputValue(urlQuery) }, [urlQuery])

  const selectedCategory = CATEGORY_FILTERS.includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'ALL'
  const pageParam = Number(searchParams.get('page') ?? 1)
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const isQueryTooShort = urlQuery.length > 0 && urlQuery.length < MIN_QUERY_LENGTH
  const isSearching = !!urlQuery && !isQueryTooShort
  const isPopular = selectedCategory === 'POPULAR'
  const showPinnedNotices = selectedCategory === 'ALL' && currentPage === 1 && !urlQuery
  const filterBarRef = useHorizontalWheelGuard()

  usePageMeta({
    title: '커뮤니티 - 커밍',
    description: '자유, 정보, 공연 후기 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: '/community',
  })

  useEffect(() => {
    if (inputValue === urlQueryRef.current) return
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        const trimmed = inputValue.trim()
        if (trimmed) {
          next.set('q', trimmed)
          next.delete('category')
          trackEvent('search', { search_term_length: trimmed.length, page_type: 'posts' })
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
    queryKey: isSearching
      ? ['search', urlQuery, currentPage]
      : isPopular
        ? ['posts', 'popular-board', currentPage]
        : ['posts', selectedCategory, currentPage],
    queryFn: () => (isSearching
      ? getSearch({ q: urlQuery, page: currentPage - 1, size: ITEMS_PER_PAGE })
      : isPopular
        ? getPopularBoardPosts({ page: currentPage - 1, size: ITEMS_PER_PAGE })
        : getPosts({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
        })),
    enabled: !isQueryTooShort,
  })

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  function handleCategoryChange(category) {
    setInputValue('')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (category === 'ALL') next.delete('category')
      else next.set('category', category)
      next.delete('q')
      next.delete('page')
      return next
    })
    window.scrollTo(0, 0)
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

  function handlePageChange(page) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (page === 1) next.delete('page')
      else next.set('page', String(page))
      return next
    })
    window.scrollTo(0, 0)
  }

  function handleWriteClick() {
    if (!user) {
      openLoginModal(ROUTES.COMMUNITY_WRITE)
      return
    }
    navigate(ROUTES.COMMUNITY_WRITE)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>커뮤니티</h1>
        </div>

        {/* 게시글 통합 검색 — 제목/본문/멘션 태그를 함께 찾아 같은 목록에 표시 */}
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
            placeholder="게시글 제목, 본문, 태그로 검색..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="게시글 검색"
          />
          {inputValue && (
            <button
              type="button"
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

        <div className={styles.layout}>
          <div className={styles.toolbar}>
            {!urlQuery && (
              <div ref={filterBarRef} className={styles.filterBar} role="tablist" aria-label="카테고리 필터">
                {CATEGORY_FILTERS.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={selectedCategory === c}
                    className={`${styles.filterTab} ${c === 'POPULAR' ? styles.filterTabPopular : ''} ${selectedCategory === c ? styles.filterTabActive : ''}`}
                    onClick={() => handleCategoryChange(c)}
                  >
                    {c === 'POPULAR' && (
                      <svg className={styles.filterTabIcon} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2c-.3 3-2 4.8-3.5 6.5C7 10 6 11.5 6 13.5 6 17.6 8.7 21 12 21s6-3.4 6-7.5c0-2.5-1.3-4.2-2.5-5.7.2 1.6-.3 2.7-1.2 3.2C14.8 8.5 15 5 12 2z" />
                      </svg>
                    )}
                    {CATEGORY_TAB_LABEL[c] ?? POST_CATEGORY_LABEL[c]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.writeBtnCell}>
            <Button size="sm" className={styles.writeBtn} onClick={handleWriteClick}>
              게시글 작성
            </Button>
          </div>

          <div className={styles.main}>

            {showPinnedNotices && <PinnedNotices />}

            {isQueryTooShort ? (
              <EmptyState icon={<SearchEmptyIcon />} message={getEmptyMessage(urlQuery, isQueryTooShort)} />
            ) : isLoading ? (
              <div className={styles.list}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <PostListItemSkeleton key={i} />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className={styles.list}>
                {posts.map((post) => (
                  <PostListItem key={post.id} post={post} />
                ))}
              </div>
            ) : urlQuery ? (
              <EmptyState icon={<SearchEmptyIcon />} message={getEmptyMessage(urlQuery, isQueryTooShort)} />
            ) : (
              <EmptyState
                icon={<PostsEmptyIcon />}
                message={getEmptyMessage(urlQuery, isQueryTooShort)}
                action={{ label: '첫 게시글 작성하기', onClick: handleWriteClick }}
              />
            )}

            {!isLoading && !isQueryTooShort && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

          </div>

          <div className={styles.sidebarCell}>
            <PostsSidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostsPage
