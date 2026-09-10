import { useState } from 'react'
import { useParams } from 'react-router-dom'

import BackButton from '@/components/ui/BackButton'
import PostContentView from '@/components/post/PostContentView'
import usePageMeta from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants/routes'
import { POST_CATEGORY_COLOR, POST_CATEGORY_LABEL } from '@/constants/post'
import { formatDateTime } from '@/utils/date'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './PostDetailPage.module.css'

// TODO: API 연동 후 제거 — GET /api/posts/{id} 배포 완료 시 실 데이터로 교체
const MOCK_POST_DETAIL_MAP = {
  10: {
    category: 'REVIEW',
    title: '요네즈 켄시 내한 첫 공연, 앙코르만 3번',
    authorNickname: 'moonlit_haze',
    isAuthor: true,
    recommendCount: 128,
    viewCount: 3204,
    createdAt: '2026-09-10T09:14:00',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '드디어 요네즈 켄시 첫 내한을 다녀왔습니다. 오프닝부터 KICK BACK으로 시작해서 세트리스트 내내 텐션이 떨어지질 않았어요.' }] },
        { type: 'entityMentionCard', attrs: { entityType: 'CONCERT', entityId: 1, title: '요네즈 켄시 KOREA LIVE 2026', subtitle: '2026.11.14 · KSPO DOME', thumbnailUrl: null } },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '특히 ' },
            { type: 'entityMentionChip', attrs: { entityType: 'ARTIST', entityId: 2, title: '요네즈 켄시', thumbnailUrl: null } },
            { type: 'text', text: '가 최근 발매한 정규 음반 수록곡 구간에서 분위기가 확 바뀌는데, 라이브 편곡이 원곡보다 더 좋았다는 의견이 많더라고요.' },
          ],
        },
        { type: 'entityMentionCard', attrs: { entityType: 'RELEASE', entityId: 3, title: 'LOST CORNER', subtitle: '요네즈 켄시', thumbnailUrl: null } },
        { type: 'paragraph', content: [{ type: 'text', text: '앙코르만 세 번 나온 건 이번 투어 통틀어 처음이라고 하네요.' }] },
      ],
    },
  },
  9: {
    category: 'INFO',
    title: 'KSPO DOME 좌석 시야 후기 모아봤어요 (2·3층 위주)',
    authorNickname: 'tteok_and_roll',
    isAuthor: false,
    recommendCount: 41,
    viewCount: 1850,
    createdAt: '2026-09-10T02:40:00',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '2층 사이드는 스탠딩 뒤통수 없이 편하게 볼 수 있었고, 3층은 무대 전체가 한눈에 들어와서 연출 보기엔 오히려 좋았어요.' }] },
        { type: 'entityMentionCard', attrs: { entityType: 'CONCERT', entityId: 1, title: '요네즈 켄시 KOREA LIVE 2026', subtitle: '2026.11.14 · KSPO DOME', thumbnailUrl: null } },
      ],
    },
  },
}

function getMockPostDetail(postId) {
  const detail = MOCK_POST_DETAIL_MAP[postId]
  if (detail) return detail

  return {
    category: 'FREE',
    title: `게시글 #${postId}`,
    authorNickname: `user_${postId}`,
    isAuthor: false,
    recommendCount: 0,
    viewCount: 0,
    createdAt: '2026-01-01T00:00:00',
    content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '내용이 없습니다.' }] }] },
  }
}

function PostDetailPage() {
  const { id } = useParams()
  const postId = Number(id)
  const post = getMockPostDetail(postId)
  const [isRecommended, setIsRecommended] = useState(false)
  const [recommendCount, setRecommendCount] = useState(post.recommendCount)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const isAuthor = user && post.isAuthor

  usePageMeta({
    title: `${post.title} - 커밍`,
    description: '공연 후기, 정보·제보, 자유 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: `/community/${postId}`,
  })

  function handleRecommendToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    // TODO: API 연동 후 제거 — POST/DELETE /api/posts/{id}/recommend 배포 완료 시 실 연동
    setIsRecommended((prev) => !prev)
    setRecommendCount((prev) => prev + (isRecommended ? -1 : 1))
  }

  function handleEdit() {
    // TODO: 수정 시 기존 내용 프리필 — 작성 폼에 편집 모드 추가 후 연결
  }

  function handleDelete() {
    // TODO: API 연동 후 제거 — DELETE /api/posts/{id} 배포 완료 시 실 연동
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <BackButton fallback={ROUTES.COMMUNITY} />

        <div className={styles.meta}>
          <span className={styles.badge} style={{ backgroundColor: POST_CATEGORY_COLOR[post.category] }}>
            {POST_CATEGORY_LABEL[post.category]}
          </span>
          <span className={styles.metaText}>{formatDateTime(post.createdAt)}</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <span className={styles.metaText}>조회 {post.viewCount.toLocaleString()}</span>
        </div>

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.authorRow}>
          <span className={styles.author}>{post.authorNickname ?? '탈퇴 회원'}</span>
          {isAuthor && (
            <div className={styles.authorActions}>
              <button type="button" className={styles.authorActionBtn} onClick={handleEdit}>수정</button>
              <button type="button" className={styles.authorActionBtn} onClick={handleDelete}>삭제</button>
            </div>
          )}
        </div>

        <PostContentView content={post.content} />

        <div className={styles.footer}>
          <button
            type="button"
            className={isRecommended ? styles.recommendBtnActive : styles.recommendBtn}
            onClick={handleRecommendToggle}
            aria-pressed={isRecommended}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isRecommended ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            추천 {recommendCount.toLocaleString()}
          </button>
        </div>

      </div>
    </div>
  )
}

export default PostDetailPage
