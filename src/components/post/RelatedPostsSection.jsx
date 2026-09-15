import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import { getEntityPosts } from '@/services/postApi'
import PostListItem from './PostListItem'
import PostListItemSkeleton from './PostListItemSkeleton'
import styles from './RelatedPostsSection.module.css'

const SORT_OPTIONS = [
  { value: 'RECOMMEND', label: '추천순' },
  { value: 'LATEST', label: '최신순' },
]

function RelatedPostsSection({ entityType, entityId, limit = 5, showHeading = true }) {
  const entityKey = `${entityType}:${entityId}`
  const [syncedEntityKey, setSyncedEntityKey] = useState(entityKey)
  const [sortBy, setSortBy] = useState('RECOMMEND')
  const [currentPage, setCurrentPage] = useState(1)
  const sectionRef = useRef(null)

  if (entityKey !== syncedEntityKey) {
    setSyncedEntityKey(entityKey)
    setCurrentPage(1)
  }

  const sortParam = sortBy.toLowerCase()

  const { data, isLoading } = useQuery({
    queryKey: ['entityPosts', entityType, entityId, sortParam, currentPage],
    queryFn: () =>
      getEntityPosts(entityType, entityId, { sort: sortParam, page: currentPage - 1, size: limit }),
  })

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function handleSortChange(value) {
    if (value === sortBy) return
    setSortBy(value)
    setCurrentPage(1)
  }

  function handlePageChange(nextPage) {
    setCurrentPage(nextPage)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={`${styles.head} ${!showHeading ? styles.headNoTitle : ''}`}>
        {showHeading && <h2 className={styles.title}>관련 게시글</h2>}
        <div className={styles.sortToggle} role="tablist" aria-label="정렬 기준">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={sortBy === value}
              className={`${styles.sortBtn} ${sortBy === value ? styles.sortBtnActive : ''}`}
              onClick={() => handleSortChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: limit }).map((_, i) => (
            <PostListItemSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className={styles.list}>
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </>
      ) : (
        <EmptyState compact message="아직 이 콘텐츠를 언급한 게시글이 없습니다." />
      )}
    </section>
  )
}

export default RelatedPostsSection
