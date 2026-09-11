import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { createComment, deleteComment, getComments, likeComment, unlikeComment } from '@/services/postApi'
import CommentItem from './CommentItem'
import CommentComposer from './CommentComposer'
import styles from './CommentSection.module.css'

const PAGE_SIZE = 50

function CommentSection({ postId, commentCount }) {
  const [page, setPage] = useState(0)
  const [items, setItems] = useState([])
  const [syncedPostId, setSyncedPostId] = useState(postId)
  const [syncedData, setSyncedData] = useState(null)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const queryClient = useQueryClient()

  if (postId !== syncedPostId) {
    setSyncedPostId(postId)
    setPage(0)
    setItems([])
  }

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId, page],
    queryFn: () => getComments(postId, { page, size: PAGE_SIZE }),
  })

  if (data && data !== syncedData) {
    setSyncedData(data)
    setItems((prev) => (data.page === 0 ? data.content : [...prev, ...data.content]))
  }

  function requireLogin() {
    openLoginModal(window.location.pathname + window.location.search)
  }

  function refreshCommentCount() {
    queryClient.invalidateQueries({ queryKey: ['post', postId] })
  }

  const createMutation = useMutation({
    mutationFn: ({ content, parentCommentId }) => createComment(postId, { content, parentCommentId }),
    onSuccess: (res, { content, parentCommentId }) => {
      const comment = {
        id: res.id,
        authorNickname: user?.nickname ?? null,
        isAuthor: true,
        content,
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        replies: [],
      }
      setItems((prev) => {
        if (!parentCommentId) return [...prev, comment]
        return prev.map((c) =>
          c.id === parentCommentId ? { ...c, replies: [...c.replies, comment] } : c
        )
      })
      refreshCommentCount()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteComment(id),
    onSuccess: (_res, { id, parentId }) => {
      function softDelete(c) {
        return c.id === id ? { ...c, authorNickname: null, isAuthor: false, content: '삭제된 댓글입니다', likeCount: 0, isLiked: false } : c
      }
      setItems((prev) =>
        prev.map((c) => (!parentId ? softDelete(c) : c.id === parentId ? { ...c, replies: c.replies.map(softDelete) } : c))
      )
      refreshCommentCount()
    },
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, isLiked }) => (isLiked ? unlikeComment(id) : likeComment(id)),
    onSuccess: (res, { id, parentId }) => {
      function flip(c) {
        return c.id === id ? { ...c, isLiked: !c.isLiked, likeCount: res.likeCount } : c
      }
      setItems((prev) =>
        prev.map((c) => (!parentId ? flip(c) : c.id === parentId ? { ...c, replies: c.replies.map(flip) } : c))
      )
    },
  })

  const hasMore = !!data && page + 1 < data.totalPages
  const topPending = createMutation.isPending && !createMutation.variables?.parentCommentId

  return (
    <div className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.heading}>댓글</h2>
        <span className={styles.count}>{commentCount ?? 0}</span>
      </div>

      <CommentComposer
        isLoggedIn={!!user}
        onRequireLogin={requireLogin}
        onSubmit={(content) => createMutation.mutate({ content })}
        pending={topPending}
      />

      <div className={styles.list}>
        {items.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isLoggedIn={!!user}
            onRequireLogin={requireLogin}
            onReply={(content) => createMutation.mutate({ content, parentCommentId: comment.id })}
            onToggleLike={() => likeMutation.mutate({ id: comment.id, isLiked: comment.isLiked })}
            onToggleReplyLike={(replyId) => {
              const reply = comment.replies.find((r) => r.id === replyId)
              likeMutation.mutate({ id: replyId, parentId: comment.id, isLiked: reply?.isLiked })
            }}
            onDelete={() => deleteMutation.mutate({ id: comment.id })}
            onDeleteReply={(replyId) => deleteMutation.mutate({ id: replyId, parentId: comment.id })}
          />
        ))}
        {isLoading && page === 0 && <p className={styles.status}>댓글을 불러오는 중...</p>}
        {!isLoading && items.length === 0 && <p className={styles.status}>아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>}
      </div>

      {hasMore && (
        <button type="button" className={styles.moreBtn} onClick={() => setPage((p) => p + 1)}>
          댓글 더 보기
        </button>
      )}
    </div>
  )
}

export default CommentSection
