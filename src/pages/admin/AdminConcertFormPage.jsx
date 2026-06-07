import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import { getConcert } from '@/services/concertApi'
import {
  createConcert,
  updateConcert,
  deleteConcert,
  updateConcertState,
  triggerConcertSetlistCollect,
} from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'
import concertStyles from './AdminConcertFormPage.module.css'

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']

const EMPTY_FORM = {
  kopisId: '', title: '', cast: '',
  startDate: '', endDate: '',
  venueName: '', venueAddress: '',
  posterUrl: '', price: '', status: 'UPCOMING',
  artistIds: '',
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

function DeleteConfirmModal({ title, onConfirm, onCancel, deleting }) {
  return (
    <div className={concertStyles.deleteOverlay} onClick={onCancel}>
      <div className={concertStyles.deleteModal} onClick={(e) => e.stopPropagation()}>
        <h3 className={concertStyles.deleteTitle}>공연 삭제</h3>
        <p className={concertStyles.deleteDesc}>
          <strong>{title}</strong> 공연을 삭제합니다.<br />
          연관 데이터(예매처 링크, 아티스트 매핑, 캘린더, 셋리스트)도 함께 삭제되며 <strong>복구할 수 없습니다.</strong>
        </p>
        <div className={concertStyles.deleteActions}>
          <button type="button" className={concertStyles.btnCancelDelete} onClick={onCancel} disabled={deleting}>취소</button>
          <button type="button" className={concertStyles.btnConfirmDelete} onClick={onConfirm} disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminConcertFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [pendingStatus, setPendingStatus] = useState('UPCOMING')
  const [stateNote, setStateNote] = useState('')
  const [stateChanging, setStateChanging] = useState(false)
  const [stateMsg, setStateMsg] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getConcert(id).then((concert) => {
      setForm({
        kopisId: concert.kopisId ?? '',
        title: concert.title ?? '',
        cast: concert.cast ?? '',
        startDate: concert.startDate ?? '',
        endDate: concert.endDate ?? '',
        venueName: concert.venueName ?? '',
        venueAddress: concert.venueAddress ?? '',
        posterUrl: concert.posterUrl ?? '',
        price: concert.price ?? '',
        status: concert.status ?? 'UPCOMING',
        artistIds: '',
        bookingLinks: concert.bookingLinks ?? [],
      })
      setPendingStatus(concert.status ?? 'UPCOMING')
    }).catch(() => setError('공연 정보를 불러오지 못했습니다.'))
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
        await updateConcert(id, {
          title: form.title.trim() || undefined,
          cast: form.cast.trim() || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          venueName: form.venueName.trim() || undefined,
          venueAddress: form.venueAddress.trim() || undefined,
          posterUrl: form.posterUrl.trim() || undefined,
          price: form.price.trim() || undefined,
          bookingLinks: form.bookingLinks.length > 0 ? form.bookingLinks : undefined,
        })
      } else {
        const artistIds = form.artistIds
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n) && n > 0)
        await createConcert({
          kopisId: form.kopisId.trim(),
          title: form.title.trim(),
          cast: form.cast.trim() || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          venueName: form.venueName.trim(),
          venueAddress: form.venueAddress.trim() || undefined,
          posterUrl: form.posterUrl.trim() || undefined,
          price: form.price.trim() || undefined,
          status: form.status,
          artistIds: artistIds.length > 0 ? artistIds : undefined,
        })
      }
      navigate(ROUTES.ADMIN)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange() {
    if (pendingStatus === form.status) return
    setStateChanging(true)
    setStateMsg('')
    try {
      await updateConcertState(id, { status: pendingStatus, reason: stateNote.trim() || undefined })
      setForm((prev) => ({ ...prev, status: pendingStatus }))
      setStateNote('')
      setStateMsg('상태가 변경되었습니다.')
    } catch {
      setStateMsg('상태 변경에 실패했습니다.')
    } finally {
      setStateChanging(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteConcert(id)
      navigate(ROUTES.ADMIN)
    } catch {
      setDeleting(false)
      setShowDeleteModal(false)
      setError('삭제에 실패했습니다.')
    }
  }

  async function handleTriggerSetlist() {
    setTriggering(true)
    setTriggerMsg('')
    try {
      await triggerConcertSetlistCollect(id)
      setTriggerMsg('셋리스트 수집 트리거가 전송되었습니다.')
    } catch {
      setTriggerMsg('트리거 전송에 실패했습니다.')
    } finally {
      setTriggering(false)
    }
  }

  const isSubmitDisabled = saving || !form.title.trim() || !form.startDate ||
    (!isEdit && (!form.kopisId.trim() || !form.venueName.trim()))

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Link to={ROUTES.ADMIN} className={styles.backLink}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          대시보드
        </Link>
        <h1 className={styles.pageTitle}>공연 {isEdit ? '수정' : '등록'}</h1>
        <p className={styles.pageDesc}>KOPIS 데이터와 연동하여 공연을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            {!isEdit && (
              <label className={styles.field}>
                <span className={styles.fieldLabel}>KOPIS ID <span className={styles.required}>*</span></span>
                <input
                  type="text"
                  className={styles.input}
                  value={form.kopisId}
                  onChange={(e) => setField('kopisId', e.target.value)}
                  placeholder="예: PF202401001"
                  required
                />
              </label>
            )}
            <label className={`${styles.field} ${isEdit ? styles.fieldFull : ''}`}>
              <span className={styles.fieldLabel}>공연명 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="예: YOASOBI ARENA TOUR 2025"
                required
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
            <label className={styles.field}>
              <span className={styles.fieldLabel}>시작일 <span className={styles.required}>*</span></span>
              <input
                type="date"
                className={styles.input}
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>종료일</span>
              <input
                type="date"
                className={styles.input}
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>공연장명 {!isEdit && <span className={styles.required}>*</span>}</span>
              <input
                type="text"
                className={styles.input}
                value={form.venueName}
                onChange={(e) => setField('venueName', e.target.value)}
                placeholder="예: KSPO DOME"
                required={!isEdit}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>공연장 주소</span>
              <input
                type="text"
                className={styles.input}
                value={form.venueAddress}
                onChange={(e) => setField('venueAddress', e.target.value)}
                placeholder="예: 서울특별시 송파구"
              />
            </label>
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
            {!isEdit && (
              <>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>상태 <span className={styles.required}>*</span></span>
                  <select
                    className={styles.input}
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>아티스트 ID (쉼표 구분)</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={form.artistIds}
                    onChange={(e) => setField('artistIds', e.target.value)}
                    placeholder="예: 1, 2, 3"
                  />
                  <span className={styles.fieldHint}>DB에 등록된 아티스트 ID를 입력하세요.</span>
                </label>
              </>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>예매처 링크</h2>
          <BookingLinksEditor
            links={form.bookingLinks}
            onChange={(links) => setField('bookingLinks', links)}
          />
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.formFooter}>
          {isEdit && (
            <button
              type="button"
              className={concertStyles.btnDelete}
              onClick={() => setShowDeleteModal(true)}
            >
              공연 삭제
            </button>
          )}
          <button type="submit" className={styles.btnSubmit} disabled={isSubmitDisabled}>
            {saving ? '저장 중...' : isEdit ? '수정 저장' : '공연 등록'}
          </button>
        </div>
      </form>

      {/* 공연 상태 강제 변경 (수정 모드) */}
      {isEdit && (
        <section className={concertStyles.stateSection}>
          <h2 className={concertStyles.stateTitle}>공연 상태 강제 변경</h2>
          <div className={concertStyles.currentStatus}>
            <span className={concertStyles.currentLabel}>현재 상태</span>
            <Badge status={form.status} />
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
            <label className={styles.field}>
              <span className={styles.fieldLabel}>변경 사유</span>
              <input
                type="text"
                className={styles.input}
                value={stateNote}
                onChange={(e) => setStateNote(e.target.value)}
                placeholder="예: 공연 취소 공지 확인"
              />
            </label>
            <div className={styles.triggerRow}>
              <button
                type="button"
                className={concertStyles.btnStateChange}
                disabled={stateChanging || pendingStatus === form.status}
                onClick={handleStatusChange}
              >
                {stateChanging ? '변경 중...' : '상태 변경'}
              </button>
              {stateMsg && <span className={styles.triggerMsg}>{stateMsg}</span>}
            </div>
          </div>
        </section>
      )}

      {/* 데이터 수집 (수정 모드) */}
      {isEdit && (
        <section className={styles.section} style={{ marginTop: '2rem' }}>
          <h2 className={styles.sectionTitle}>데이터 수집</h2>
          <div className={styles.triggerRow}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleTriggerSetlist}
              disabled={triggering}
            >
              {triggering ? '전송 중...' : '셋리스트 수집 트리거'}
            </button>
            {triggerMsg && <span className={styles.triggerMsg}>{triggerMsg}</span>}
          </div>
        </section>
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title={form.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          deleting={deleting}
        />
      )}
    </div>
  )
}

export default AdminConcertFormPage
