import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import Badge from '@/components/ui/Badge'
import AppDatePicker from '@/components/ui/AppDatePicker'
import AddArtistModal from '@/components/concert/AddArtistModal'
import { getAdminConcert, updateConcert, updateConcertState, triggerConcertSetlistCollect, removeConcertArtist } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'
import concertStyles from './AdminConcertFormPage.module.css'

const SETLIST_SKIP_REASONS = {
  no_setlist_found: 'setlist.fm에 셋리스트 없음',
}

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED', 'EXCLUDED']

const EMPTY_FORM = {
  title: '', cast: '',
  startDate: '', endDate: '',
  venueName: '',
  posterUrl: '', price: '',
  ticketOpenAt: '',
  bookingLinks: [],
}

function BookingLinksEditor({ links, onChange }) {
  function add() {
    onChange([...links, { name: '', url: '' }])
  }
  function remove(i) {
    onChange(links.filter((_, idx) => idx !== i))
  }
  function update(i, key, value) {
    onChange(links.map((l, idx) => idx === i ? { ...l, [key]: value } : l))
  }

  return (
    <div className={concertStyles.bookingLinks}>
      {links.map((link, i) => (
        <div key={i} className={concertStyles.bookingLinkRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="예매처 이름 (예: 인터파크)"
            value={link.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <input
            type="url"
            className={styles.input}
            placeholder="https://..."
            value={link.url}
            onChange={(e) => update(i, 'url', e.target.value)}
          />
          <button type="button" className={concertStyles.bookingRemoveBtn} onClick={() => remove(i)} aria-label="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button type="button" className={concertStyles.bookingAddBtn} onClick={add}>
        + 예매처 추가
      </button>
    </div>
  )
}

function AdminConcertFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [currentStatus, setCurrentStatus] = useState('UPCOMING')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const [pendingStatus, setPendingStatus] = useState('UPCOMING')
  const [stateChanging, setStateChanging] = useState(false)
  const [stateMsg, setStateMsg] = useState('')

  const [artists, setArtists] = useState([])
  const [showAddArtist, setShowAddArtist] = useState(false)
  const [removingArtistId, setRemovingArtistId] = useState(null)

  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')
  const [setlistResult, setSetlistResult] = useState(null)

  useEffect(() => {
    if (!id) { navigate(ROUTES.ADMIN, { replace: true }); return }
    getAdminConcert(id).then((concert) => {
      setForm({
        title: concert.title ?? '',
        cast: concert.cast ?? '',
        startDate: concert.startDate ?? '',
        endDate: concert.endDate ?? '',
        venueName: concert.venueName ?? '',
        posterUrl: concert.posterUrl ?? '',
        price: concert.price ?? '',
        ticketOpenAt: concert.ticketOpenAt ? concert.ticketOpenAt.slice(0, 16) : '',
        bookingLinks: (concert.bookingLinks ?? []).map((l) => ({
          name: l.name ?? '',
          url: l.url ?? '',
        })),
      })
      setCurrentStatus(concert.status ?? 'UPCOMING')
      setPendingStatus(concert.status ?? 'UPCOMING')
      setArtists(concert.artists ?? [])
    }).catch(() => setError('공연 정보를 불러오지 못했습니다.'))
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
      await updateConcert(id, {
        title: form.title.trim() || undefined,
        cast: form.cast.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        venueName: form.venueName.trim() || undefined,
        posterUrl: form.posterUrl.trim() || undefined,
        price: form.price.trim() || undefined,
        ticketOpenAt: form.ticketOpenAt ? `${form.ticketOpenAt}:00` : null,
        bookingLinks: form.bookingLinks.length > 0 ? form.bookingLinks : undefined,
      })
      setSavedMsg('저장되었습니다.')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange() {
    if (pendingStatus === currentStatus) return
    setStateChanging(true)
    setStateMsg('')
    try {
      await updateConcertState(id, { status: pendingStatus })
      setCurrentStatus(pendingStatus)
      setStateMsg('상태가 변경되었습니다.')
    } catch {
      setStateMsg('상태 변경에 실패했습니다.')
    } finally {
      setStateChanging(false)
    }
  }

  async function handleRemoveArtist(artistId) {
    setRemovingArtistId(artistId)
    try {
      await removeConcertArtist(id, artistId)
      setArtists((prev) => prev.filter((a) => a.artistId !== artistId))
    } catch {
      setError('아티스트 제거에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setRemovingArtistId(null)
    }
  }

  function handleArtistAdded(artist) {
    setArtists((prev) => [...prev, artist])
  }

  async function handleTriggerSetlist() {
    setTriggering(true)
    setTriggerMsg('')
    setSetlistResult(null)
    try {
      const result = await triggerConcertSetlistCollect(id)
      setSetlistResult(result)
    } catch (err) {
      const code = err?.response?.data?.code
      if (code === 'PIPELINE_NOT_FOUND') setTriggerMsg('setlist.fm에서 셋리스트를 찾을 수 없습니다.')
      else if (code === 'PIPELINE_CONFLICT') setTriggerMsg('이미 처리 중인 수집 요청입니다.')
      else setTriggerMsg('수집에 실패했습니다.')
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
        <h1 className={styles.pageTitle}>공연 수정</h1>
        <p className={styles.pageDesc}>공연 정보를 수정합니다. 상태 변경은 하단 섹션에서 처리합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>공연명</span>
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
              <span className={styles.fieldLabel}>시작일</span>
              <AppDatePicker
                value={form.startDate}
                onChange={(v) => setField('startDate', v)}
              />
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>종료일</span>
              <AppDatePicker
                value={form.endDate}
                onChange={(v) => setField('endDate', v)}
              />
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>공연장명</span>
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
          <h2 className={styles.sectionTitle}>연결 아티스트</h2>
          <div className={concertStyles.artistList}>
            {artists.length === 0 ? (
              <p className={concertStyles.noArtists}>연결된 아티스트가 없습니다.</p>
            ) : (
              artists.map((a) => (
                <span key={a.artistId} className={concertStyles.artistChip}>
                  <ArtistAliasName name={a.name} koreanName={a.koreanName} />
                  <button
                    type="button"
                    className={concertStyles.artistRemoveBtn}
                    disabled={removingArtistId === a.artistId}
                    onClick={() => handleRemoveArtist(a.artistId)}
                    aria-label={`${a.koreanName ?? a.name} 제거`}
                  >
                    {removingArtistId === a.artistId ? '...' : '×'}
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
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
          <button type="submit" className={styles.btnSubmit} disabled={saving || !form.title.trim()}>
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </form>

      {/* 공연 상태 강제 변경 */}
      <section className={concertStyles.stateSection}>
        <h2 className={concertStyles.stateTitle}>공연 상태 강제 변경</h2>
        <div className={concertStyles.currentStatus}>
          <span className={concertStyles.currentLabel}>현재 상태</span>
          <Badge status={currentStatus} />
        </div>
        <div className={concertStyles.stateForm}>
          <div className={concertStyles.statusOptions}>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`${concertStyles.statusOption} ${pendingStatus === s ? concertStyles.statusOptionActive : ''}`}
                onClick={() => setPendingStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className={styles.triggerRow}>
            <button
              type="button"
              className={concertStyles.btnStateChange}
              disabled={stateChanging || pendingStatus === currentStatus}
              onClick={handleStatusChange}
            >
              {stateChanging ? '변경 중...' : '상태 변경'}
            </button>
            {stateMsg && <span className={styles.triggerMsg}>{stateMsg}</span>}
          </div>
        </div>
      </section>

      {showAddArtist && (
        <AddArtistModal
          concertId={id}
          onClose={() => setShowAddArtist(false)}
          onAdded={handleArtistAdded}
        />
      )}

      {/* 데이터 수집 */}
      <section className={styles.section} style={{ marginTop: '2rem' }}>
        <h2 className={styles.sectionTitle}>데이터 수집</h2>
        <div className={styles.triggerRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleTriggerSetlist}
            disabled={triggering}
          >
            {triggering ? '수집 중...' : '셋리스트 수집'}
          </button>
          {triggerMsg && <span className={styles.triggerMsg}>{triggerMsg}</span>}
        </div>
        {setlistResult && (
          setlistResult.success ? (
            <div className={styles.collectResult}>
              <p className={styles.collectResultTitle}>
                {setlistResult.tracks?.length ?? 0}곡 수집 완료
              </p>
              {setlistResult.attributionUrl && (
                <a
                  href={setlistResult.attributionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.collectResultLink}
                >
                  setlist.fm 보기 →
                </a>
              )}
              {setlistResult.tracks && setlistResult.tracks.length > 0 && (
                <ol className={styles.trackList}>
                  {setlistResult.tracks.map((t) => (
                    <li key={t.position} className={styles.trackItem}>
                      <span className={styles.trackPos}>{t.position}</span>
                      <span className={styles.trackName}>{t.songName}</span>
                      {t.info && <span className={styles.trackInfo}>{t.info}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <p className={styles.triggerMsg}>
              수집 건너뜀 — {SETLIST_SKIP_REASONS[setlistResult.reason] ?? setlistResult.reason}
            </p>
          )
        )}
      </section>
    </div>
  )
}

export default AdminConcertFormPage
