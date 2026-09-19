import { useState } from 'react'
import { formatRelativeDate } from '@/utils/date'
import ReportModal from '@/components/post/ReportModal'
import CommentComposer from './CommentComposer'
import styles from './CommentItem.module.css'

function LikeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  )
}

function CommentItem({ comment, isLoggedIn, onRequireLogin, onReply, onToggleLike, onToggleReplyLike, onDelete, onDeleteReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [reportTargetId, setReportTargetId] = useState(null)
  const isDeleted = comment.authorNickname == null

  function guard(action) {
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }
    action()
  }

  // TODO: API 연동 후 제거 — reportApi.js의 createReport로 교체 (BE #123 완료 후)
  async function handleReportSubmit({ reason, detail }) {
    await Promise.resolve({ commentId: reportTargetId, reason, detail })
  }

  async function handleReplySubmit(content) {
    await onReply(content)
    setShowReplyBox(false)
  }

  function handleDelete() {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return
    onDelete()
  }

  function handleReplyDelete(replyId) {
    if (!window.confirm('답글을 삭제하시겠습니까?')) return
    onDeleteReply(replyId)
  }

  const replyComposer = showReplyBox && (
    <CommentComposer
      isLoggedIn={isLoggedIn}
      onRequireLogin={onRequireLogin}
      onSubmit={handleReplySubmit}
      onCancel={() => setShowReplyBox(false)}
      placeholder={`${comment.authorNickname ?? '탈퇴 회원'}님에게 답글 남기기`}
      compact
    />
  )

  return (
    <div className={styles.comment}>
      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.name}>{comment.authorNickname ?? '탈퇴 회원'}</span>
          <span className={styles.time}>{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <p className={isDeleted ? `${styles.text} ${styles.deletedText}` : styles.text}>{comment.content}</p>

        {!isDeleted && (
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
            {comment.isAuthor ? (
              <button type="button" className={styles.actionBtn} onClick={handleDelete}>
                삭제
              </button>
            ) : (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => guard(() => setReportTargetId(comment.id))}
              >
                신고
              </button>
            )}
          </div>
        )}

        {comment.replies.length === 0 && replyComposer && (
          <div className={styles.replyComposer}>{replyComposer}</div>
        )}

        {comment.replies.length > 0 && (
          <div className={styles.replyList}>
            {comment.replies.map((reply) => {
              const replyDeleted = reply.authorNickname == null
              return (
                <div key={reply.id} className={styles.reply}>
                  <div className={styles.body}>
                    <div className={styles.top}>
                      <span className={styles.replyName}>{reply.authorNickname ?? '탈퇴 회원'}</span>
                      <span className={styles.time}>{formatRelativeDate(reply.createdAt)}</span>
                    </div>
                    <p className={replyDeleted ? `${styles.text} ${styles.deletedText}` : styles.text}>
                      {!replyDeleted && (
                        <span className={styles.mention}>@{comment.authorNickname ?? '탈퇴 회원'}</span>
                      )}{' '}
                      {reply.content}
                    </p>
                    {!replyDeleted && (
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
                        {reply.isAuthor ? (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleReplyDelete(reply.id)}
                          >
                            삭제
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => guard(() => setReportTargetId(reply.id))}
                          >
                            신고
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {replyComposer}
          </div>
        )}
      </div>

      {reportTargetId !== null && (
        <ReportModal
          onClose={() => setReportTargetId(null)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  )
}

export default CommentItem
