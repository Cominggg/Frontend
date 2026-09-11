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

  const selectedCategory = CATEGORY_FILTERS.includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'ALL'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

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

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>커뮤니티</h1>
          <p className={styles.pageDesc}>자유 · 정보 · 후기를 나누는 Jpop 팬 공간이에요</p>
        </div>

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
