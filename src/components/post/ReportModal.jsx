import { useState } from 'react'
import { REPORT_REASON_LABEL } from '@/constants/post'
import useModalA11y from '@/hooks/useModalA11y'
import styles from './ReportModal.module.css'

const REPORT_REASONS = Object.keys(REPORT_REASON_LABEL)

function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState(null)
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const modalRef = useModalA11y(onClose, { contentKey: done })

  const detailRequired = reason === 'ETC'
  const canSubmit = !!reason && (!detailRequired || detail.trim().length > 0)

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({ reason, detail: detail.trim() || undefined })
      setDone(true)
    } catch {
      setError('신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="신고하기" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        {done ? (
          <>
            <p className={styles.doneText}>신고가 접수되었습니다.</p>
            <div className={styles.actions}>
              <button type="button" className={styles.btnPrimary} onClick={onClose}>닫기</button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>신고하기</h2>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.reasonList} role="radiogroup" aria-label="신고 사유">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={reason === r}
                  className={`${styles.reasonBtn} ${reason === r ? styles.reasonBtnActive : ''}`}
                  onClick={() => setReason(r)}
                >
                  {REPORT_REASON_LABEL[r]}
                </button>
              ))}
            </div>

            {detailRequired && (
              <label className={styles.detailLabel}>
                <span>상세 사유 <span className={styles.required}>*</span></span>
                <textarea
                  className={styles.detailInput}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="신고 사유를 구체적으로 입력해주세요."
                  rows={3}
                />
              </label>
            )}

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.btnSecondary} onClick={onClose}>취소</button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
              >
                {submitting ? '접수 중...' : '신고하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ReportModal
