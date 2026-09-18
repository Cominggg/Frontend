import { useState } from 'react'
import { Link } from 'react-router-dom'

import { registerPolicy } from '@/services/adminApi'
import AppDatePicker from '@/components/ui/AppDatePicker'
import { ROUTES } from '@/constants/routes'
import { SITE_URL } from '@/constants/site'
import styles from './AdminFormPage.module.css'

const POLICY_TYPES = [
  { value: 'TERMS', label: '이용약관', detailUrl: `${SITE_URL}${ROUTES.TERMS}` },
  { value: 'PRIVACY', label: '개인정보처리방침', detailUrl: `${SITE_URL}${ROUTES.PRIVACY}` },
]

const INITIAL_FORM = { type: 'TERMS', version: '', effectiveDate: '', changeSummary: '' }

function AdminPolicyPage() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const detailUrl = POLICY_TYPES.find((t) => t.value === form.type).detailUrl

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.version.trim() || !form.effectiveDate || !form.changeSummary.trim()) {
      setError('버전, 시행일, 변경 사항 요약을 모두 입력해주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await registerPolicy({
        type: form.type,
        version: form.version.trim(),
        effectiveDate: form.effectiveDate,
        changeSummary: form.changeSummary.trim(),
        detailUrl,
      })
      setSavedMsg('등록되었습니다. 전체 회원에게 변경 안내 메일이 자동 발송됩니다.')
      setForm((prev) => ({ ...INITIAL_FORM, type: prev.type }))
      setTimeout(() => setSavedMsg(''), 4000)
    } catch (err) {
      setError(
        err?.response?.data?.code === 'POLICY_VERSION_DUPLICATE'
          ? '이미 등록된 버전입니다. 버전 값을 확인해주세요.'
          : '등록에 실패했습니다. 다시 시도해주세요.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          대시보드
        </Link>
        <h1 className={styles.pageTitle}>정책 버전 등록</h1>
        <p className={styles.pageDesc}>
          이용약관·개인정보처리방침의 새 버전을 등록합니다. 등록 즉시 전체 회원에게 변경 안내 메일이 자동 발송되므로,
          약관 원문(정책 페이지)이 먼저 반영·배포된 상태인지 확인 후 등록하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>정책 종류</h2>
          <div className={styles.genreGrid}>
            {POLICY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.genreChip} ${form.type === t.value ? styles.genreChipActive : ''}`}
                onClick={() => setField('type', t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>버전 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>버전 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.version}
                onChange={(e) => setField('version', e.target.value)}
                placeholder="예: 1.1"
                maxLength={50}
              />
            </label>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>시행일 <span className={styles.required}>*</span></span>
              <AppDatePicker
                value={form.effectiveDate}
                onChange={(v) => setField('effectiveDate', v)}
              />
            </div>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>변경 사항 요약 <span className={styles.required}>*</span></span>
              <span className={styles.fieldHint}>변경 안내 메일 본문에 그대로 노출됩니다.</span>
              <textarea
                className={styles.textarea}
                rows={4}
                value={form.changeSummary}
                onChange={(e) => setField('changeSummary', e.target.value)}
                placeholder="예: 제3자 제공 항목에 Firebase 위탁 업체를 추가했습니다."
              />
            </label>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>원문 페이지</span>
              <span className={styles.fieldHint}>정책 종류에 따라 자동으로 지정됩니다.</span>
              <input type="text" className={styles.input} value={detailUrl} disabled readOnly />
            </div>
          </div>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
          <button type="submit" className={styles.btnSubmit} disabled={saving}>
            {saving ? '등록 중...' : '버전 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminPolicyPage
