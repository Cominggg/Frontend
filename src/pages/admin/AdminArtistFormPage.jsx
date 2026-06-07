import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { getArtist } from '@/services/artistApi'
import { createArtist, updateArtist, triggerArtistReleasesCollect } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'

function AdminArtistFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ name: '', mbid: '', sortName: '', debutDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getArtist(id).then((artist) => {
      setForm({
        name: artist.name ?? '',
        mbid: artist.mbid ?? '',
        sortName: artist.sortName ?? '',
        debutDate: artist.debutDate ?? '',
      })
    }).catch(() => setError('아티스트 정보를 불러오지 못했습니다.'))
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
      const body = {
        name: form.name.trim(),
        mbid: form.mbid.trim() || undefined,
        sortName: form.sortName.trim() || undefined,
        debutDate: form.debutDate.trim() || undefined,
      }
      if (isEdit) {
        await updateArtist(id, body)
      } else {
        await createArtist(body)
      }
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
        <h1 className={styles.pageTitle}>아티스트 {isEdit ? '수정' : '등록'}</h1>
        <p className={styles.pageDesc}>MusicBrainz 정보와 연동하여 아티스트를 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>아티스트명 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="예: YOASOBI"
                required
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
              <span className={styles.fieldLabel}>MusicBrainz ID (MBID) {!isEdit && <span className={styles.required}>*</span>}</span>
              <input
                type="text"
                className={styles.input}
                value={form.mbid}
                onChange={(e) => setField('mbid', e.target.value)}
                placeholder="예: a1234567-89ab-cdef-0123-456789abcdef"
                required={!isEdit}
                disabled={isEdit}
              />
              <span className={styles.fieldHint}>MusicBrainz에서 조회한 UUID를 입력하세요.</span>
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
          <button type="submit" className={styles.btnSubmit} disabled={saving || !form.name.trim()}>
            {saving ? '저장 중...' : isEdit ? '수정 저장' : '아티스트 등록'}
          </button>
        </div>
      </form>

      {isEdit && (
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
      )}
    </div>
  )
}

export default AdminArtistFormPage
