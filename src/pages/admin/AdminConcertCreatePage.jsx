import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import AppDatePicker from '@/components/ui/AppDatePicker'
import AddArtistModal from '@/components/concert/AddArtistModal'
import { ImageUrlsEditor, BookingLinksEditor } from './AdminConcertEditors'
import { createConcert, addConcertArtist } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'
import concertStyles from './AdminConcertFormPage.module.css'

const EMPTY_FORM = {
  title: '', cast: '',
  startDate: '', endDate: '',
  venueName: '',
  posterUrl: '', price: '',
  ticketOpenAt: '',
  bookingLinks: [],
  imageUrls: [],
}

function AdminConcertCreatePage() {
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [pendingArtists, setPendingArtists] = useState([])
  const [showAddArtist, setShowAddArtist] = useState(false)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const isValid = form.title.trim() && form.startDate && form.endDate && form.venueName.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError('')
    try {
      const validImageUrls = form.imageUrls.filter((u) => u.trim())
      const validBookingLinks = form.bookingLinks.filter((l) => l.url.trim())

      const { concertId } = await createConcert({
        title: form.title.trim(),
        cast: form.cast.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        venueName: form.venueName.trim(),
        posterUrl: form.posterUrl.trim() || undefined,
        price: form.price.trim() || undefined,
        ticketOpenAt: form.ticketOpenAt ? `${form.ticketOpenAt}:00` : undefined,
        bookingLinks: validBookingLinks.length > 0 ? validBookingLinks : undefined,
        imageUrls: validImageUrls.length > 0 ? validImageUrls : undefined,
      })

      await Promise.allSettled(
        pendingArtists.map((artist) => addConcertArtist(concertId, artist.artistId))
      )

      navigate(ROUTES.ADMIN_CONCERT_EDIT(concertId))
    } catch {
      setError('공연 등록에 실패했습니다. 다시 시도해주세요.')
      setSaving(false)
    }
  }

  function handleArtistAdded(artist) {
    setPendingArtists((prev) =>
      prev.some((a) => a.artistId === artist.artistId) ? prev : [...prev, artist]
    )
  }

  function removePendingArtist(artistId) {
    setPendingArtists((prev) => prev.filter((a) => a.artistId !== artistId))
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
        <h1 className={styles.pageTitle}>공연 직접 등록</h1>
        <p className={styles.pageDesc}>공연 정보를 직접 입력합니다. <span className={styles.required}>*</span> 항목은 필수입니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>공연명 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="예: YOASOBI ARENA TOUR 2025"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>출연진 (cast)</span>
              <input
                type="text"
                className={styles.input}
                value={form.cast}
                onChange={(e) => setField('cast', e.target.value)}
                placeholder="예: YOASOBI"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>가격 정보</span>
              <input
                type="text"
                className={styles.input}
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                placeholder="예: 전석 165,000원"
              />
            </label>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>시작일 <span className={styles.required}>*</span></span>
              <AppDatePicker
                value={form.startDate}
                onChange={(v) => setField('startDate', v)}
              />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>종료일 <span className={styles.required}>*</span></span>
              <AppDatePicker
                value={form.endDate}
                onChange={(v) => setField('endDate', v)}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>공연장명 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.venueName}
                onChange={(e) => setField('venueName', e.target.value)}
                placeholder="예: KSPO DOME"
              />
            </label>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>예매 오픈 일시</span>
              <AppDatePicker
                value={form.ticketOpenAt}
                onChange={(v) => setField('ticketOpenAt', v)}
                showTime
              />
            </div>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>포스터 URL</span>
              <input
                type="url"
                className={styles.input}
                value={form.posterUrl}
                onChange={(e) => setField('posterUrl', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>예매처 링크</h2>
          <BookingLinksEditor
            links={form.bookingLinks}
            onChange={(links) => setField('bookingLinks', links)}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>공연 정보 이미지</h2>
          <ImageUrlsEditor
            urls={form.imageUrls}
            onChange={(urls) => setField('imageUrls', urls)}
          />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>아티스트 연결</h2>
          <p className={styles.fieldHint} style={{ marginBottom: '0.75rem' }}>
            등록 후 자동으로 연결됩니다. 수정 페이지에서도 추가·제거할 수 있습니다.
          </p>
          <div className={concertStyles.artistList}>
            {pendingArtists.length === 0 ? (
              <p className={concertStyles.noArtists}>선택된 아티스트가 없습니다.</p>
            ) : (
              pendingArtists.map((a) => (
                <span key={a.artistId} className={concertStyles.artistChip}>
                  <ArtistAliasName name={a.name} koreanName={a.koreanName} />
                  <button
                    type="button"
                    className={concertStyles.artistRemoveBtn}
                    onClick={() => removePendingArtist(a.artistId)}
                    aria-label={`${a.koreanName ?? a.name} 제거`}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <button
            type="button"
            className={concertStyles.bookingAddBtn}
            style={{ marginTop: '0.625rem' }}
            onClick={() => setShowAddArtist(true)}
          >
            + 아티스트 추가
          </button>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnSubmit} disabled={saving || !isValid}>
            {saving ? '등록 중...' : '공연 등록'}
          </button>
        </div>
      </form>

      {showAddArtist && (
        <AddArtistModal
          concertId={null}
          addFn={async () => {}}
          onClose={() => setShowAddArtist(false)}
          onAdded={handleArtistAdded}
        />
      )}
    </div>
  )
}

export default AdminConcertCreatePage
