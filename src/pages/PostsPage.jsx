import { useNavigate, useSearchParams } from 'react-router-dom'

import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import PostListItem from '@/components/post/PostListItem'
import usePageMeta from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants/routes'
import { POST_CATEGORY_LABEL } from '@/constants/post'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './PostsPage.module.css'

const CATEGORY_FILTERS = ['ALL', 'REVIEW', 'INFO', 'FREE']
const ITEMS_PER_PAGE = 10

// TODO: API 연동 후 제거 — GET /api/posts 배포 완료 시 실 데이터로 교체
const MOCK_POST_LIST = [
  { id: 10, category: 'REVIEW', title: '요네즈 켄시 내한 첫 공연, 앙코르만 3번', authorNickname: 'moonlit_haze', recommendCount: 128, viewCount: 3204, createdAt: '2026-09-10T09:14:00' },
  { id: 9, category: 'INFO', title: 'KSPO DOME 좌석 시야 후기 모아봤어요 (2·3층 위주)', authorNickname: 'tteok_and_roll', recommendCount: 41, viewCount: 1850, createdAt: '2026-09-10T02:40:00' },
  { id: 8, category: 'FREE', title: '이번 투어 응모 결과 다들 어떠셨나요', authorNickname: 'nagoya_express', recommendCount: 9, viewCount: 640, createdAt: '2026-09-09T21:05:00' },
  { id: 7, category: 'REVIEW', title: 'LOST CORNER 발매 기념 감상평 남깁니다', authorNickname: 'hanare_bito', recommendCount: 63, viewCount: 2410, createdAt: '2026-09-06T18:30:00' },
  { id: 6, category: 'INFO', title: '공연장 근처 굿즈 부스 운영시간 정리', authorNickname: 'yoruno_neko', recommendCount: 22, viewCount: 1120, createdAt: '2026-09-04T11:00:00' },
  { id: 5, category: 'FREE', title: '내한 소식 듣고 바로 연차 냈습니다', authorNickname: 'string_hoshi', recommendCount: 17, viewCount: 980, createdAt: '2026-08-22T08:12:00' },
  { id: 4, category: 'REVIEW', title: '2025년 마지막 공연 회고', authorNickname: 'moonlit_haze', recommendCount: 54, viewCount: 1760, createdAt: '2025-12-30T20:15:00' },
  { id: 3, category: 'INFO', title: '작년 굿즈 라인업 아카이브 (사진 有)', authorNickname: 'tteok_and_roll', recommendCount: 30, viewCount: 2050, createdAt: '2025-11-02T13:45:00' },
  { id: 2, category: 'FREE', title: '입덕 계기가 뭐였나요', authorNickname: 'hanare_bito', recommendCount: 12, viewCount: 730, createdAt: '2025-09-18T09:00:00' },
  { id: 1, category: 'REVIEW', title: 'KICK BACK 오프닝 직캠 후기', authorNickname: null, recommendCount: 5, viewCount: 410, createdAt: '2025-08-15T19:20:00' },
  ...Array.from({ length: 14 }, (_, i) => ({
    id: -1 - i,
    category: CATEGORY_FILTERS[1 + (i % 3)],
    title: `아카이브 게시글 ${i + 1}`,
    authorNickname: `user_${i + 1}`,
    recommendCount: (i * 7) % 40,
    viewCount: 100 + i * 63,
    createdAt: `2025-0${1 + (i % 6)}-1${i % 9}T10:00:00`,
  })),
]

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
    description: '공연 후기, 정보·제보, 자유 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: '/community',
  })

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

  const filtered = selectedCategory === 'ALL'
    ? MOCK_POST_LIST
    : MOCK_POST_LIST.filter((p) => p.category === selectedCategory)
  const totalElements = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalElements / ITEMS_PER_PAGE))
  const posts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>커뮤니티</h1>
          <button className={styles.writeBtn} onClick={handleWriteClick}>
            글쓰기
          </button>
        </div>

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

        {posts.length > 0 ? (
          <div className={styles.list}>
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message="아직 등록된 게시글이 없습니다." />
        )}

        {totalPages > 1 && (
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

export default PostsPage
