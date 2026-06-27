import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createInquiry } from '@/services/myApi'
import { ROUTES } from '@/constants/routes'
import styles from './InquiryModal.module.css'

const TYPE_LABELS = {
  CONCERT: '공연 정보 문의',
  ARTIST: '아티스트 정보 문의',
  SETLIST: '셋리스트 문의',
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function InquiryModal({ isOpen, onClose, type, targetId }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    const focusable = modal ? [...modal.querySelectorAll(FOCUSABLE)] : []
    focusable[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, submitted])

  if (!isOpen) return null

  const typeLabel = TYPE_LABELS[type] ?? '문의'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      await createInquiry({ type, targetId, title: title.trim(), content: content.trim() })
      setSubmitted(true)
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) {
        setError('이미 해당 공연에 대한 문의 내역이 있습니다. 마이페이지에서 확인해 주세요.')
      } else if (status === 400) {
        setError('입력 내용을 다시 확인해 주세요.')
      } else {
        setError('문의 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={typeLabel} onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {submitted ? (
          <div className={styles.successState}>
            <div className={styles.successIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className={styles.successTitle}>문의가 접수되었습니다</p>
            <p className={styles.successDesc}>검토 후 마이페이지 &gt; 내 문의 내역에서 처리 결과를 확인하실 수 있습니다.</p>
            <div className={styles.successActions}>
              <button className={styles.confirmBtn} onClick={onClose}>닫기</button>
              <button className={styles.myInquiryLink} onClick={() => { onClose(); navigate(ROUTES.ME_INQUIRIES) }}>내 문의 보기</button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.modalTitle}>{typeLabel}</h2>
              <p className={styles.subtitle}>잘못된 정보를 발견하셨나요? 문의 내용을 남겨주시면 검토 후 반영하겠습니다.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="inquiry-title">제목</label>
                <input
                  id="inquiry-title"
                  className={styles.input}
                  type="text"
                  placeholder="문의 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="inquiry-content">내용</label>
                <textarea
                  id="inquiry-content"
                  className={styles.textarea}
                  placeholder="문의 내용을 자세히 입력해 주세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={1000}
                  required
                  rows={5}
                />
                <span className={`${styles.charCount} ${content.length >= 900 ? styles.charCountWarn : ''}`}>
                  {content.length} / 1000
                </span>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!title.trim() || !content.trim() || isSubmitting}
              >
                {isSubmitting ? '제출 중…' : '문의 제출'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default InquiryModal
