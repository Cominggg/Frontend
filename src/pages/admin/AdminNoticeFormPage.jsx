import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { mockGetNotice, mockCreateNotice, mockUpdateNotice } from '@/mocks/noticeMocks'
import styles from './AdminFormPage.module.css'
import noticeStyles from './AdminNoticeFormPage.module.css'

const EMPTY_FORM = { title: '', content: '', active: true }

function AdminNoticeFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    if (!isEdit) return
    mockGetNotice(id).then((notice) => {
      if (!notice) { setError('공지를 찾을 수 없습니다.'); return }
      setForm({ title: notice.title, content: notice.content, active: notice.active })
    })
  }, [id, isEdit])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await mockUpdateNotice(id, form)
      } else {
        await mockCreateNotice(form)
      }
      setSavedMsg('저장되었습니다.')
      setTimeout(() => navigate(ROUTES.ADMIN_NOTICES), 600)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN_NOTICES} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          공지사항 관리
        </Link>
        <h1 className={styles.pageTitle}>{isEdit ? '공지 수정' : '새 공지 작성'}</h1>
        <p className={styles.pageDesc}>공지 내용은 일반 텍스트로 저장됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>제목 <span className={styles.required}>*</span></span>
            <input
              type="text"
              className={styles.input}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="공지 제목을 입력하세요"
            />
          </label>

          <label className={styles.field} style={{ marginTop: '1rem' }}>
            <span className={styles.fieldLabel}>내용 <span className={styles.required}>*</span></span>
            <textarea
              className={styles.textarea}
              rows={10}
              value={form.content}
              onChange={(e) => setField('content', e.target.value)}
              placeholder="공지 내용을 입력하세요"
            />
          </label>

          <label className={noticeStyles.activeToggle}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setField('active', e.target.checked)}
            />
            커뮤니티 홈에 노출
          </label>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={saving || !form.title.trim() || !form.content.trim()}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminNoticeFormPage
