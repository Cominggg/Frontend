import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import { getAdminArtist, updateArtist, triggerArtistReleasesCollect } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'

const ALIAS_LOCALES = [
  { key: 'ja', label: 'JA (일본어)' },
  { key: 'en', label: 'EN (영어)' },
  { key: 'ko', label: 'KO (한국어)' },
]

const EMPTY_ALIASES = { ja: [], en: [], ko: [] }

function AliasTagEditor({ label, values, onChange }) {
  const [input, setInput] = useState('')
  const composingRef = useRef(false)

  function commit() {
    const trimmed = input.trim()
    if (!trimmed || values.includes(trimmed)) { setInput(''); return }
    onChange([...values, trimmed])
    setInput('')
  }

  function handleKeyDown(e) {
    if (composingRef.current) return
    if (e.key === 'Enter') { e.preventDefault(); commit() }
  }

  return (
    <div className={styles.aliasGroup}>
      <span className={styles.aliasLocaleLabel}>{label}</span>
      <div className={styles.aliasTags}>
        {values.map((tag) => (
          <span key={tag} className={styles.aliasTag}>
            {tag}
            <button
              type="button"
              className={styles.aliasTagRemove}
              onClick={() => onChange(values.filter((v) => v !== tag))}
              aria-label={`${tag} 삭제`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          className={styles.aliasInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={() => { composingRef.current = false }}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!composingRef.current) commit() }}
          placeholder="입력 후 Enter"
        />
      </div>
    </div>
  )
}

function AdminArtistFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', aliases: EMPTY_ALIASES })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!id) { navigate(ROUTES.ADMIN, { replace: true }); return }
    getAdminArtist(id).then((artist) => {
      setForm({
        name: artist.name ?? '',
        aliases: {
          ja: artist.aliases?.ja ?? [],
          en: artist.aliases?.en ?? [],
          ko: artist.aliases?.ko ?? [],
        },
      })
    }).catch(() => setError('아티스트 정보를 불러오지 못했습니다.'))
  }, [id, navigate])

  function setAliasLocale(locale, next) {
    setForm((prev) => ({ ...prev, aliases: { ...prev.aliases, [locale]: next } }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await updateArtist(id, {
        name: form.name.trim() || undefined,
        aliases: form.aliases,
      })
      setSavedMsg('수정되었습니다.')
      setTimeout(() => setSavedMsg(''), 3000)
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
                onChange={(e) => { setForm((prev) => ({ ...prev, name: e.target.value })); setError('') }}
                placeholder="예: YOASOBI"
              />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alias</h2>
          <div className={styles.aliasLocaleGrid}>
            {ALIAS_LOCALES.map(({ key, label }) => (
              <AliasTagEditor
                key={key}
                label={label}
                values={form.aliases[key]}
                onChange={(next) => setAliasLocale(key, next)}
              />
            ))}
          </div>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnSubmit} disabled={saving}>
            {saving ? '저장 중...' : '수정 저장'}
          </button>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
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
