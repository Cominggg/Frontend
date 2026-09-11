import { useState } from 'react'
import { formatRelativeDate } from '@/utils/date'
import CommentComposer from './CommentComposer'
import styles from './CommentItem.module.css'

function LikeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function CommentItem({ comment, isLoggedIn, onRequireLogin, onReply, onToggleLike, onToggleReplyLike }) {
  const [showReplyBox, setShowReplyBox] = useState(false)

  function guard(action) {
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }
    action()
  }

  function handleReplySubmit(content) {
    onReply(content)
    setShowReplyBox(false)
  }

  return (
    <div className={styles.comment}>
      <div className={styles.avatar} aria-hidden="true">
        {(comment.authorNickname ?? '?').charAt(0)}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.name}>{comment.authorNickname ?? '탈퇴 회원'}</span>
          <span className={styles.time}>{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <p className={styles.text}>{comment.content}</p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => guard(onToggleLike)}
            aria-pressed={comment.isLiked}
          >
            <LikeIcon />
            {comment.likeCount}
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => guard(() => setShowReplyBox((v) => !v))}
          >
            답글 달기
          </button>
        </div>

        {showReplyBox && (
          <div className={styles.replyComposer}>
            <CommentComposer
              isLoggedIn={isLoggedIn}
              onRequireLogin={onRequireLogin}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyBox(false)}
              placeholder={`${comment.authorNickname ?? '탈퇴 회원'}님에게 답글 남기기`}
              compact
            />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className={styles.replyList}>
            {comment.replies.map((reply) => (
              <div key={reply.id} className={styles.reply}>
                <div className={styles.replyAvatar} aria-hidden="true">
                  {(reply.authorNickname ?? '?').charAt(0)}
                </div>
                <div className={styles.body}>
                  <div className={styles.top}>
                    <span className={styles.name}>{reply.authorNickname ?? '탈퇴 회원'}</span>
                    <span className={styles.time}>{formatRelativeDate(reply.createdAt)}</span>
                  </div>
                  <p className={styles.text}>{reply.content}</p>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => guard(() => onToggleReplyLike(reply.id))}
                      aria-pressed={reply.isLiked}
                    >
                      <LikeIcon />
                      {reply.likeCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
