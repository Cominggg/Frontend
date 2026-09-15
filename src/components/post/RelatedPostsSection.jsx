import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import EmptyState from '@/components/ui/EmptyState'
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
  const [page, setPage] = useState(0)
  const [posts, setPosts] = useState([])
  const [syncedData, setSyncedData] = useState(null)

  if (entityKey !== syncedEntityKey) {
    setSyncedEntityKey(entityKey)
    setPage(0)
    setPosts([])
    setSyncedData(null)
  }

  const sortParam = sortBy.toLowerCase()

  const { data, isLoading } = useQuery({
    queryKey: ['entityPosts', entityType, entityId, sortParam, page],
    queryFn: () => getEntityPosts(entityType, entityId, { sort: sortParam, page, size: limit }),
  })

  if (data && data !== syncedData) {
    setSyncedData(data)
    setPosts((prev) => {
      if (page === 0) return data.content
      const merged = new Map(prev.map((p) => [p.id, p]))
      data.content.forEach((p) => merged.set(p.id, p))
      return Array.from(merged.values())
    })
  }

  function handleSortChange(value) {
    if (value === sortBy) return
    setSortBy(value)
    setPage(0)
    setPosts([])
    setSyncedData(null)
  }

  const hasMore = !!data && page + 1 < data.totalPages

  return (
    <section className={styles.section}>
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

      {isLoading && page === 0 ? (
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
          {hasMore && (
            <button type="button" className={styles.moreBtn} onClick={() => setPage((p) => p + 1)}>
              더보기
            </button>
          )}
        </>
      ) : (
        <EmptyState compact message="아직 이 콘텐츠를 언급한 게시글이 없습니다." />
      )}
    </section>
  )
}

export default RelatedPostsSection
