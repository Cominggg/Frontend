import { useRef, useState } from 'react'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import CommentItem from './CommentItem'
import CommentComposer from './CommentComposer'
import styles from './CommentSection.module.css'

// TODO: API 연동 후 제거 — GET/POST /api/posts/{id}/comments (POST-07) 확정 시 React Query로 교체
const MOCK_COMMENTS = [
  {
    id: 1,
    authorNickname: '민트초코최고',
    isAuthor: false,
    content: '오프닝으로 KICK BACK 나왔을 때 심장 떨어지는 줄... 후기 잘 봤습니다 ㅠㅠ',
    likeCount: 8,
    isLiked: false,
    createdAt: '2026-09-08T13:20:00',
    replies: [
      {
        id: 101,
        authorNickname: '요네즈러버',
        isAuthor: false,
        content: '저도 그 순간 진짜 소름이었어요! 다음에도 같이 가요 ㅎㅎ',
        likeCount: 2,
        isLiked: false,
        createdAt: '2026-09-08T14:05:00',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    authorNickname: 'jpop_deepdive',
    isAuthor: false,
    content: '세트리스트 정리 감사해요. 혹시 앙코르 때 KICK BACK 말고 다른 곡도 있었나요?',
    likeCount: 3,
    isLiked: false,
    createdAt: '2026-09-08T12:10:00',
    replies: [],
  },
  {
    id: 3,
    authorNickname: '도쿄행티켓팅중',
    isAuthor: false,
    content: '잠실 실내체육관 음향 어땠나요? 다음 공연 예매 고민 중이라 여쭤봐요.',
    likeCount: 1,
    isLiked: false,
    createdAt: '2026-09-08T10:40:00',
    replies: [],
  },
  {
    id: 4,
    authorNickname: '새벽감성곡선',
    isAuthor: false,
    content: '글 진짜 잘 쓰시네요, 마치 저도 그 자리에 있는 것 같았어요.',
    likeCount: 5,
    isLiked: false,
    createdAt: '2026-09-07T22:00:00',
    replies: [],
  },
]

function CommentSection() {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const nextIdRef = useRef(1000)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  function requireLogin() {
    openLoginModal(window.location.pathname + window.location.search)
  }

  function addComment(content, parentCommentId) {
    const comment = {
      id: nextIdRef.current++,
      authorNickname: user?.nickname ?? '나',
      isAuthor: true,
      content,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      replies: [],
    }

    setComments((prev) => {
      if (!parentCommentId) return [...prev, comment]
      return prev.map((c) =>
        c.id === parentCommentId ? { ...c, replies: [...c.replies, comment] } : c
      )
    })
  }

  function toggleLike(targetId, parentId) {
    function flip(c) {
      return c.id === targetId
        ? { ...c, isLiked: !c.isLiked, likeCount: c.likeCount + (c.isLiked ? -1 : 1) }
        : c
    }

    setComments((prev) =>
      prev.map((c) => {
        if (!parentId) return flip(c)
        return c.id === parentId ? { ...c, replies: c.replies.map(flip) } : c
      })
    )
  }

  const totalCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)

  return (
    <div className={styles.section}>
      <div className={styles.head}>
        <h2 className={styles.heading}>댓글</h2>
        <span className={styles.count}>{totalCount}</span>
      </div>

      <div className={styles.list}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isLoggedIn={!!user}
            onRequireLogin={requireLogin}
            onReply={(content) => addComment(content, comment.id)}
            onToggleLike={() => toggleLike(comment.id)}
            onToggleReplyLike={(replyId) => toggleLike(replyId, comment.id)}
          />
        ))}
      </div>

      <CommentComposer
        isLoggedIn={!!user}
        onRequireLogin={requireLogin}
        onSubmit={(content) => addComment(content)}
      />
    </div>
  )
}

export default CommentSection
