import { useEffect, useId, useRef, useState } from 'react'

import styles from './PostActionMenu.module.css'

// 게시글 수정·삭제·신고를 작성자 줄의 ⋯ 메뉴 하나로 모은다.
// 작성자에게는 수정·삭제, 그 외에는 신고만 보이고, 삭제는 메뉴 안에서 한 번 더 확인한다.
// 항목이 1~2개뿐이고 삭제 확인 단계가 섞여 있어 ARIA menu(방향키 이동) 대신 펼침 버튼 + 버튼 묶음으로 둔다
function PostActionMenu({
  isAuthor,
  onEdit,
  onDelete,
  onReport,
  onDeleteConfirmStart,
  isDeleting = false,
  deleteError = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const wrapperRef = useRef(null)
  const triggerRef = useRef(null)
  const deleteItemRef = useRef(null)
  const confirmCancelRef = useRef(null)
  // 삭제 확인 단계로 들어가거나 빠져나올 때, 사라진 버튼 대신 포커스를 옮길 자리
  const pendingFocusRef = useRef(null)
  const panelId = useId()

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
      if (e.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // 확인 단계에 들어올 때마다 지난 삭제 실패 문구를 지워, 다시 열었을 때 이전 오류가 보이지 않게 한다
  function startDeleteConfirm() {
    onDeleteConfirmStart?.()
    pendingFocusRef.current = 'confirm'
    setIsConfirmingDelete(true)
  }

  useEffect(() => {
    const target = pendingFocusRef.current
    pendingFocusRef.current = null
    if (target === 'confirm') confirmCancelRef.current?.focus()
    if (target === 'delete') deleteItemRef.current?.focus()
  }, [isConfirmingDelete])

  function cancelDeleteConfirm() {
    pendingFocusRef.current = 'delete'
    setIsConfirmingDelete(false)
  }

  function select(action) {
    close()
    action()
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label="게시글 메뉴"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {isOpen && (
        <div id={panelId} className={styles.menu} role="group" aria-label="게시글 작업">
          {!isAuthor && (
            <button type="button" className={styles.item} onClick={() => select(onReport)}>
              신고
            </button>
          )}
          {isAuthor && !isConfirmingDelete && (
            <>
              {/* 삭제 요청이 진행 중이면 곧 사라질 글이라 수정으로 넘어가지 않게 막는다 */}
              <button type="button" className={styles.item} onClick={() => select(onEdit)} disabled={isDeleting}>
                수정
              </button>
              <button ref={deleteItemRef} type="button" className={styles.dangerItem} onClick={startDeleteConfirm}>
                삭제
              </button>
            </>
          )}
          {isAuthor && isConfirmingDelete && (
            <div className={styles.confirm}>
              <p className={styles.confirmText}>게시글을 삭제할까요?</p>
              {deleteError && (
                <p className={styles.confirmError} role="alert">
                  {deleteError}
                </p>
              )}
              <div className={styles.confirmActions}>
                <button
                  ref={confirmCancelRef}
                  type="button"
                  className={styles.confirmCancel}
                  onClick={cancelDeleteConfirm}
                  disabled={isDeleting}
                >
                  취소
                </button>
                {/* 요청이 끝날 때까지 메뉴를 열어 두어 진행·실패를 이 자리에서 보여준다 (성공하면 페이지가 이동) */}
                <button type="button" className={styles.confirmDelete} onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? '삭제 중...' : '삭제'}
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
