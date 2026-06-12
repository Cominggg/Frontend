import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { getArtist } from '@/services/artistApi'
import { updateArtist, triggerArtistReleasesCollect } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'

function AdminArtistFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', sortName: '', debutDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!id) { navigate(ROUTES.ADMIN, { replace: true }); return }
    getArtist(id).then((artist) => {
      setForm({
        name: artist.name ?? '',
        sortName: artist.sortName ?? '',
        debutDate: artist.debutDate ?? '',
      })
    }).catch(() => setError('아티스트 정보를 불러오지 못했습니다.'))
  }, [id, navigate])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateArtist(id, {
        name: form.name.trim() || undefined,
        sortName: form.sortName.trim() || undefined,
        debutDate: form.debutDate || undefined,
      })
      navigate(ROUTES.ADMIN)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTriggerReleases() {
    setTriggering(true)
    setTriggerMsg('')
    try {
      await triggerArtistReleasesCollect(id)
      setTriggerMsg('릴리즈 수집 트리거가 전송되었습니다.')
    } catch {
      setTriggerMsg('트리거 전송에 실패했습니다.')
    } finally {
      setTriggering(false)
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
        <h1 className={styles.pageTitle}>아티스트 수정</h1>
        <p className={styles.pageDesc}>아티스트 기본 정보를 수정합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>아티스트명</span>
              <input
                type="text"
                className={styles.input}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="예: YOASOBI"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>정렬명 (sortName)</span>
              <input
                type="text"
                className={styles.input}
                value={form.sortName}
                onChange={(e) => setField('sortName', e.target.value)}
                placeholder="예: YOASOBI"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>데뷔일</span>
              <input
                type="date"
                className={styles.input}
                value={form.debutDate}
                onChange={(e) => setField('debutDate', e.target.value)}
              />
            </label>
          </div>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnSubmit} disabled={saving}>
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </form>

      <section className={styles.section} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>데이터 수집</h2>
        <div className={styles.triggerRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleTriggerReleases}
            disabled={triggering}
          >
            {triggering ? '전송 중...' : '릴리즈 수집 트리거'}
          </button>
          {triggerMsg && <span className={styles.triggerMsg}>{triggerMsg}</span>}
        </div>
      </section>
    </div>
  )
}

export default AdminArtistFormPage
