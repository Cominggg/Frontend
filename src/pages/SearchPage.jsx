import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import EmptyState from '@/components/ui/EmptyState'
import PostListItem from '@/components/post/PostListItem'
import PostListItemSkeleton from '@/components/post/PostListItemSkeleton'
import usePageMeta from '@/hooks/usePageMeta'
import styles from './SearchPage.module.css'

// TODO: API 연동 후 제거 — GET /api/search?query= 연동 예정 (이슈 #158)
const MOCK_SEARCH_POSTS = [
  { id: 9101, category: 'INFO', title: '세카이노 오와리 단독내한 좌석 배치도 떴어요', authorNickname: 'domesnow', recommendCount: 64, viewCount: 2051, createdAt: '2026-09-14T10:20:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }] },
  { id: 9102, category: 'REVIEW', title: '세카이노 오와리 내한 3번째 후기 — 이번에도 감동', authorNickname: 'endroll_kim', recommendCount: 121, viewCount: 1880, createdAt: '2026-09-13T22:10:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }, { entityType: 'CONCERT', entityId: 55, title: '세카이노 오와리 내한공연 2026' }] },
  { id: 9103, category: 'FREE', title: '오와리 팬이면 다 아는 그 떡밥 정리', authorNickname: 'fanfic_lover', recommendCount: 22, viewCount: 733, createdAt: '2026-09-13T09:05:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }] },
  { id: 9104, category: 'INFO', title: '세카이노 오와리 내한 앵콜곡 순서 아시는분', authorNickname: 'setlist_hunter', recommendCount: 9, viewCount: 410, createdAt: '2026-09-12T19:40:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }] },
  { id: 9105, category: 'INFO', title: '이번 주 내한 라인업 총정리 (feat. 오와리, 아이묭)', authorNickname: 'jpop_curator', recommendCount: 288, viewCount: 5120, createdAt: '2026-09-11T08:15:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }, { entityType: 'ARTIST', entityId: 13, title: '아이묭' }] },
  { id: 9106, category: 'REVIEW', title: '작년 오와리 내한이랑 이번이랑 셋리스트 비교', authorNickname: 'archive_ear', recommendCount: 41, viewCount: 990, createdAt: '2026-09-08T13:00:00', entityTags: [{ entityType: 'ARTIST', entityId: 12, title: '세카이노 오와리' }] },
]

function searchMockPosts(query) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  return MOCK_SEARCH_POSTS
    .filter((post) =>
      post.title.toLowerCase().includes(normalized) ||
      post.entityTags?.some((tag) => tag.title.toLowerCase().includes(normalized))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)

  usePageMeta({
    title: query ? `'${query}' 검색 결과 - 커밍` : '통합 검색 - 커밍',
    description: '게시글 제목·본문과 멘션 태그를 함께 찾아드려요.',
    path: '/search',
  })

  // TODO: API 연동 후 useQuery(['search', query], () => getSearch({ query }))로 교체
  const isLoading = false
  const results = searchMockPosts(query)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = inputValue.trim()
    setSearchParams(trimmed ? { q: trimmed } : {})
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.kicker}>통합 검색</p>

        <form className={styles.searchWrap} onSubmit={handleSubmit} role="search">
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="게시글 제목, 본문, 태그로 검색해보세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="게시글 검색"
            autoFocus
          />
        </form>

        {query && (
          <p className={styles.meta}>검색결과 {results.length}건 · 최신순 고정</p>
        )}

        {!query ? (
          <EmptyState message="궁금한 이야기를 검색해보세요. 게시글 제목·본문과 멘션 태그를 함께 찾아드려요." />
        ) : isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 5 }).map((_, i) => (
              <PostListItemSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className={styles.list}>
            {results.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message={`'${query}'에 대한 검색 결과가 없어요. 다른 검색어로 다시 시도해보세요.`} />
        )}
      </div>
    </div>
  )
}

export default SearchPage
