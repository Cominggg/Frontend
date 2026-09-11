import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import BackButton from '@/components/ui/BackButton'
import EmptyState from '@/components/ui/EmptyState'
import PostContentView from '@/components/post/PostContentView'
import usePageMeta from '@/hooks/usePageMeta'
import { deletePost, getPost, recommendPost, unrecommendPost } from '@/services/postApi'
import { ROUTES } from '@/constants/routes'
import { POST_CATEGORY_LABEL } from '@/constants/post'
import { formatDateTime } from '@/utils/date'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import styles from './PostDetailPage.module.css'

function PostDetailPage() {
  const { id } = useParams()
  const postId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRecommended, setIsRecommended] = useState(false)
  const [recommendCount, setRecommendCount] = useState(0)
  const [syncedPost, setSyncedPost] = useState(null)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    retry: false,
  })

  if (post && post !== syncedPost) {
    setSyncedPost(post)
    setIsRecommended(!!post.isRecommended)
    setRecommendCount(post.recommendCount)
  }

  const recommendMutation = useMutation({
    mutationFn: (next) => (next ? recommendPost(postId) : unrecommendPost(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (_err, next) => {
      setIsRecommended(!next)
      setRecommendCount((prev) => prev + (next ? -1 : 1))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(ROUTES.COMMUNITY)
    },
  })

  usePageMeta({
    title: post ? `${post.title} - 커밍` : undefined,
    description: '자유, 정보, 공연 후기 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: `/community/${postId}`,
  })

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <BackButton fallback={ROUTES.COMMUNITY} />
          <div className={styles.card}>
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonBody} />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <EmptyState
        message="게시글이 존재하지 않습니다"
        action={{ to: ROUTES.COMMUNITY, label: '커뮤니티 목록으로' }}
      />
    )
  }

  function handleRecommendToggle() {
    if (!user) {
      openLoginModal(window.location.pathname + window.location.search)
      return
    }
    const next = !isRecommended
    setIsRecommended(next)
    setRecommendCount((prev) => prev + (next ? 1 : -1))
    recommendMutation.mutate(next)
  }

  function handleEdit() {
    navigate(ROUTES.COMMUNITY_EDIT(postId))
  }

  function handleDelete() {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    deleteMutation.mutate()
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <BackButton fallback={ROUTES.COMMUNITY} />

        <div className={styles.card}>
          <div className={styles.meta}>
            <span className={styles.badge}>
              {POST_CATEGORY_LABEL[post.category]}
            </span>
            <span className={styles.metaText}>{formatDateTime(post.createdAt)}</span>
            <span className={styles.dot} aria-hidden="true">·</span>
            <span className={styles.metaText}>조회 {post.viewCount.toLocaleString()}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.authorRow}>
            <span className={styles.author}>{post.authorNickname ?? '탈퇴 회원'}</span>
            {post.isAuthor && (
              <div className={styles.authorActions}>
                <button type="button" className={styles.authorActionBtn} onClick={handleEdit}>수정</button>
                <button
                  type="button"
                  className={styles.authorActionBtn}
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                </button>
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
    </div>
  )
}

export default PostDetailPage
