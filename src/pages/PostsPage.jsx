import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import PostListItem from '@/components/post/PostListItem'
import PostListItemSkeleton from '@/components/post/PostListItemSkeleton'
import PostsSidebar from '@/components/post/sidebar/PostsSidebar'
import usePageMeta from '@/hooks/usePageMeta'
import { getPosts } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import { POST_CATEGORY_LABEL } from '@/constants/post'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './PostsPage.module.css'

const CATEGORY_FILTERS = ['ALL', 'FREE', 'INFO', 'REVIEW']
const ITEMS_PER_PAGE = 20

function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [searchValue, setSearchValue] = useState('')

  const selectedCategory = CATEGORY_FILTERS.includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'ALL'
  const pageParam = Number(searchParams.get('page') ?? 1)
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  usePageMeta({
    title: '커뮤니티 - 커밍',
    description: '자유, 정보, 공연 후기 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: '/community',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['posts', selectedCategory, currentPage],
    queryFn: () => getPosts({
      category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      page: currentPage - 1,
      size: ITEMS_PER_PAGE,
    }),
    placeholderData: (prev) => prev,
  })

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 1

  function handleCategoryChange(category) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (category === 'ALL') next.delete('category')
      else next.set('category', category)
      next.delete('page')
      return next
    })
    window.scrollTo(0, 0)
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

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = searchValue.trim()
    if (!trimmed) return
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>커뮤니티</h1>
          <p className={styles.pageDesc}>자유 · 정보 · 후기를 나누는 Jpop 팬 공간이에요</p>
        </div>

        {/* 게시글 통합 검색 진입점 — 제목/본문/멘션 매치를 합친 결과는 /search 페이지에서 확인 */}
        <form className={styles.searchWrap} onSubmit={handleSearchSubmit} role="search">
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
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="게시글 검색"
          />
        </form>

        <div className={styles.layout}>
          <div className={styles.toolbar}>
            <div className={styles.filterBar} role="tablist" aria-label="카테고리 필터">
              {CATEGORY_FILTERS.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={selectedCategory === c}
                  className={`${styles.filterTab} ${selectedCategory === c ? styles.filterTabActive : ''}`}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c === 'ALL' ? '전체' : POST_CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
            <Button size="sm" className={styles.writeBtn} onClick={handleWriteClick}>
              게시글 작성
            </Button>
          </div>

          <div className={styles.main}>

            {isLoading ? (
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
            ) : (
              <EmptyState message="아직 등록된 게시글이 없습니다." />
            )}

            {!isLoading && totalPages > 1 && (
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
