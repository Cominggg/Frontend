import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'

// TODO: API 연동 후 제거
const MOCK_ARTIST = {
  name: 'YOASOBI',
  mbid: 'a1234567-89ab-cdef-0123-456789abcdef',
  genres: ['J-Pop', 'Anime'],
  debutDate: '2019.09.12',
  members: 'Ayase, ikura',
  imageUrl: '',
  spotifyUrl: '',
  youtubeUrl: '',
  twitterUrl: '',
  instagramUrl: '',
}

const GENRE_OPTIONS = ['J-Pop', 'J-Rock', 'Anime', 'Indie', 'Electronic', 'Hip-Hop', 'R&B', 'Soul', 'Alternative']

function AdminArtistFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)

  const initial = isEdit ? MOCK_ARTIST : {
    name: '', mbid: '', genres: [], debutDate: '', members: '',
    imageUrl: '', spotifyUrl: '', youtubeUrl: '', twitterUrl: '', instagramUrl: '',
  }

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function toggleGenre(genre) {
    setForm((prev) => {
      const next = prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre]
      return { ...prev, genres: next }
    })
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    // TODO: POST /api/admin/artists or PUT /api/admin/artists/:id
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
    }, 800)
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

        {/* 기본 정보 */}
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
              <span className={styles.fieldLabel}>MusicBrainz ID (MBID)</span>
              <input
                type="text"
                className={styles.input}
                value={form.mbid}
                onChange={(e) => setField('mbid', e.target.value)}
                placeholder="예: a1234567-89ab-cdef-0123-456789abcdef"
              />
              <span className={styles.fieldHint}>MusicBrainz에서 조회한 UUID를 입력하세요.</span>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>데뷔일</span>
              <input
                type="text"
                className={styles.input}
                value={form.debutDate}
                onChange={(e) => setField('debutDate', e.target.value)}
                placeholder="예: 2019.09.12"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>멤버 (솔로이면 공백)</span>
              <input
                type="text"
                className={styles.input}
                value={form.members}
                onChange={(e) => setField('members', e.target.value)}
                placeholder="예: Ayase, ikura"
              />
              <span className={styles.fieldHint}>쉼표로 구분하여 입력하세요.</span>
            </label>
          </div>
        </section>

        {/* 장르 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>장르</h2>
          <div className={styles.genreGrid}>
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type="button"
                className={`${styles.genreChip} ${form.genres.includes(genre) ? styles.genreChipActive : ''}`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* 이미지 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>이미지</h2>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>이미지 URL</span>
            <input
              type="url"
              className={styles.input}
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              placeholder="https://..."
            />
          </label>
        </section>

        {/* 외부 링크 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>외부 링크 (MusicBrainz url-rels)</h2>
          <div className={styles.fieldGrid}>
            {[
              { key: 'spotifyUrl', label: 'Spotify' },
              { key: 'youtubeUrl', label: 'YouTube' },
              { key: 'twitterUrl', label: 'X (Twitter)' },
              { key: 'instagramUrl', label: 'Instagram' },
            ].map(({ key, label }) => (
              <label key={key} className={styles.field}>
                <span className={styles.fieldLabel}>{label}</span>
                <input
                  type="url"
                  className={styles.input}
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder="https://..."
                />
              </label>
            ))}
          </div>
        </section>

        {/* 저장 */}
        <div className={styles.formFooter}>
          {saved && <span className={styles.savedMsg}>저장되었습니다.</span>}
          <button type="submit" className={styles.btnSubmit} disabled={saving || !form.name.trim()}>
            {saving ? '저장 중...' : isEdit ? '수정 저장' : '아티스트 등록'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default AdminArtistFormPage
