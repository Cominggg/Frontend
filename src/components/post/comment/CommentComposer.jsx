import { useState } from 'react'
import styles from './CommentComposer.module.css'

function CommentComposer({
  isLoggedIn,
  onRequireLogin,
  onSubmit,
  placeholder = '댓글을 남겨보세요',
  compact = false,
  onCancel,
}) {
  const [value, setValue] = useState('')

  function handleFocus() {
    if (!isLoggedIn) onRequireLogin()
  }

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <div className={compact ? `${styles.composer} ${styles.compact}` : styles.composer}>
      <div className={styles.field}>
        <textarea
          className={styles.box}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleFocus}
          readOnly={!isLoggedIn}
          rows={compact ? 2 : 3}
        />
        <div className={styles.row}>
          {onCancel && (
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              취소
            </button>
          )}
          <button
            type="button"
            className={styles.submitBtn}
            onClick={isLoggedIn ? handleSubmit : onRequireLogin}
            disabled={isLoggedIn && !value.trim()}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentComposer
