import { useState } from 'react'

import EmptyState from '@/components/ui/EmptyState'
import PostListItem from './PostListItem'
import PostListItemSkeleton from './PostListItemSkeleton'
import styles from './RelatedPostsSection.module.css'

// TODO: API 연동 후 제거 — GET /api/entities/{type}/{id}/posts 연동 예정 (이슈 #158)
const MOCK_RELATED_POSTS = [
  { id: 9001, category: 'REVIEW', title: '드디어 갔다옴… 셋리스트 그대로였음 인생공연', authorNickname: 'nanaymzk', recommendCount: 89, viewCount: 1204, createdAt: '2026-09-13T21:40:00', entityTags: [{ entityType: 'CONCERT', entityId: 1, title: '내한공연 2026' }] },
  { id: 9002, category: 'INFO', title: '이번 내한 굿즈 라인업 + 가격 정리해봄', authorNickname: 'kenshi_forever', recommendCount: 156, viewCount: 3412, createdAt: '2026-09-12T14:05:00', entityTags: [{ entityType: 'CONCERT', entityId: 1, title: '내한공연 2026' }, { entityType: 'ARTIST', entityId: 1, title: '아티스트' }] },
  { id: 9003, category: 'INFO', title: 'KSPO돔 몇 게이트가 시야 젤 좋아요?', authorNickname: 'seat_master', recommendCount: 34, viewCount: 567, createdAt: '2026-09-10T18:22:00', entityTags: [{ entityType: 'CONCERT', entityId: 1, title: '내한공연 2026' }] },
  { id: 9004, category: 'REVIEW', title: '취켓팅 성공하신 분 계신가요…?', authorNickname: 'ticket_hunter', recommendCount: 12, viewCount: 892, createdAt: '2026-09-11T11:02:00', entityTags: [{ entityType: 'CONCERT', entityId: 1, title: '내한공연 2026' }] },
  { id: 9005, category: 'FREE', title: '공연 전날 잠이 안온다 진짜', authorNickname: 'insomnia_fan', recommendCount: 8, viewCount: 245, createdAt: '2026-09-09T09:12:00', entityTags: [{ entityType: 'CONCERT', entityId: 1, title: '내한공연 2026' }] },
]

const SORT_OPTIONS = [
  { value: 'RECOMMEND', label: '추천순' },
  { value: 'LATEST', label: '최신순' },
]

function sortPosts(posts, sortBy) {
  const sorted = [...posts]
  if (sortBy === 'LATEST') {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    sorted.sort((a, b) => b.recommendCount - a.recommendCount)
  }
  return sorted
}

function RelatedPostsSection({ entityType, entityId, limit = 5, showHeading = true }) {
  const [sortBy, setSortBy] = useState('RECOMMEND')

  // TODO: API 연동 후 useQuery(['entityPosts', entityType, entityId, sortBy], () => getEntityPosts(entityType, entityId, { sort: sortBy, limit }))로 교체
  const isLoading = false
  const posts = sortPosts(MOCK_RELATED_POSTS, sortBy).slice(0, limit)

  return (
    <section className={styles.section} data-entity-type={entityType} data-entity-id={entityId}>
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
              onClick={() => setSortBy(value)}
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
        <div className={styles.list}>
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState compact message="아직 이 콘텐츠를 언급한 게시글이 없습니다." />
      )}
    </section>
  )
}

export default RelatedPostsSection
