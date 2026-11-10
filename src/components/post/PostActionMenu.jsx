import { useEffect, useRef, useState } from 'react'

import styles from './PostActionMenu.module.css'

// 게시글 수정·삭제·신고를 작성자 줄의 ⋯ 메뉴 하나로 모은다.
// 작성자에게는 수정·삭제, 그 외에는 신고만 보이고, 삭제는 메뉴 안에서 한 번 더 확인한다
function PostActionMenu({ isAuthor, onEdit, onDelete, onReport, isDeleting = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const wrapperRef = useRef(null)

  function close() {
    setIsOpen(false)
    setIsConfirmingDelete(false)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    function handleClickOutside(e) {
      if (!wrapperRef.current?.contains(e.target)) close()
    }
    function handleEscape(e) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  function select(action) {
    close()
    action()
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="게시글 메뉴"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          {!isAuthor && (
            <button type="button" role="menuitem" className={styles.item} onClick={() => select(onReport)}>
              신고
            </button>
          )}
          {isAuthor && !isConfirmingDelete && (
            <>
              <button type="button" role="menuitem" className={styles.item} onClick={() => select(onEdit)}>
                수정
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.dangerItem}
                onClick={() => setIsConfirmingDelete(true)}
              >
                삭제
              </button>
            </>
          )}
          {isAuthor && isConfirmingDelete && (
            <div className={styles.confirm}>
              <p className={styles.confirmText}>게시글을 삭제할까요?</p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.confirmCancel} onClick={() => setIsConfirmingDelete(false)}>
                  취소
                </button>
                <button
                  type="button"
                  className={styles.confirmDelete}
                  onClick={() => select(onDelete)}
                  disabled={isDeleting}
                >
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostActionMenu
