import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import styles from './AdminFormPage.module.css'
import concertStyles from './AdminConcertFormPage.module.css'

// TODO: API 연동 후 제거
const MOCK_CONCERT = {
  artistId: '',
  artistName: 'YOASOBI',
  kopisId: 'PF202401001',
  title: 'YOASOBI ARENA TOUR 2025 "THE MONSTER"',
  startDate: '2025-08-15',
  endDate: '2025-08-16',
  venue: 'KSPO DOME, 서울',
  price: '전석 165,000원',
  status: '공연예정',
  ticketLinks: 'https://ticket.interpark.com/example\nhttps://ticket.melon.com/example',
  description: 'YOASOBI의 첫 한국 아레나 투어.',
}

const MOCK_STATUS_LOG = [
  { changedAt: '2025.04.10 14:32', from: '공연예정', to: '공연중', adminEmail: 'admin@coming.com', note: '공연 시작' },
  { changedAt: '2025.04.11 22:00', from: '공연중', to: '공연완료', adminEmail: 'admin@coming.com', note: '공연 종료' },
]

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED']

function AdminConcertFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)

  const initial = isEdit ? MOCK_CONCERT : {
    artistId: '', artistName: '', kopisId: '', title: '',
    startDate: '', endDate: '', venue: '', price: '',
    status: '공연예정', ticketLinks: '', description: '',
  }

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stateNote, setStateNote] = useState('')
  const [stateChanging, setStateChanging] = useState(false)
  const [statusLog, setStatusLog] = useState(isEdit ? MOCK_STATUS_LOG : [])
  const [pendingStatus, setPendingStatus] = useState(form.status)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    // TODO: POST /api/admin/concerts or PUT /api/admin/concerts/:id (기본 정보)
    setTimeout(() => { setSaving(false); setSaved(true) }, 800)
  }

  function handleStatusChange() {
    if (pendingStatus === form.status) return
    setStateChanging(true)
    // TODO: PUT /api/admin/concerts/:id/state { status: pendingStatus, note: stateNote }
    setTimeout(() => {
      setStatusLog((prev) => [
        {
          changedAt: new Date().toLocaleString('ko-KR', { hour12: false }).replace(',', ''),
          from: form.status,
          to: pendingStatus,
          adminEmail: 'admin@coming.com',
          note: stateNote || '(메모 없음)',
        },
        ...prev,
      ])
      setForm((prev) => ({ ...prev, status: pendingStatus }))
      setStateNote('')
      setStateChanging(false)
    }, 600)
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
        <h1 className={styles.pageTitle}>공연 {isEdit ? '수정' : '등록'}</h1>
        <p className={styles.pageDesc}>KOPIS 데이터와 연동하여 공연을 등록합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* 기본 정보 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>KOPIS ID</span>
              <input
                type="text"
                className={styles.input}
                value={form.kopisId}
                onChange={(e) => setField('kopisId', e.target.value)}
                placeholder="예: PF202401001"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>아티스트명 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.artistName}
                onChange={(e) => setField('artistName', e.target.value)}
                placeholder="등록된 아티스트명 검색"
                required
              />
              <span className={styles.fieldHint}>아티스트 DB에 등록된 이름과 일치해야 합니다.</span>
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
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
              <span className={styles.fieldLabel}>종료일 (1일 공연이면 공백)</span>
              <input
                type="date"
                className={styles.input}
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
              />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.fieldLabel}>장소 <span className={styles.required}>*</span></span>
              <input
                type="text"
                className={styles.input}
                value={form.venue}
                onChange={(e) => setField('venue', e.target.value)}
                placeholder="예: KSPO DOME, 서울"
                required
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
          </div>
        </section>

        {/* 예매처 링크 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>예매처 링크</h2>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>URL 목록 (한 줄에 하나씩)</span>
            <textarea
              className={styles.textarea}
              value={form.ticketLinks}
              onChange={(e) => setField('ticketLinks', e.target.value)}
              placeholder={'https://ticket.interpark.com/...\nhttps://ticket.melon.com/...'}
              rows={3}
            />
          </label>
        </section>

        {/* 설명 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>공연 설명</h2>
          <label className={styles.field}>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="공연 소개 및 특이사항을 입력하세요."
              rows={4}
            />
          </label>
        </section>

        <div className={styles.formFooter}>
          {saved && <span className={styles.savedMsg}>저장되었습니다.</span>}
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={saving || !form.title.trim() || !form.artistName.trim() || !form.startDate}
          >
            {saving ? '저장 중...' : isEdit ? '수정 저장' : '공연 등록'}
          </button>
        </div>
      </form>

      {/* ── ADM-04: 공연 상태 강제 변경 (수정 모드에서만 노출) ── */}
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
              <span className={styles.fieldLabel}>변경 사유 (이력 로그에 기록됩니다)</span>
              <input
                type="text"
                className={styles.input}
                value={stateNote}
                onChange={(e) => setStateNote(e.target.value)}
                placeholder="예: 공연 취소 공지 확인"
              />
            </label>

            <button
              type="button"
              className={concertStyles.btnStateChange}
              disabled={stateChanging || pendingStatus === form.status}
              onClick={handleStatusChange}
            >
              {stateChanging ? '변경 중...' : '상태 변경'}
            </button>
          </div>

          {/* 변경 이력 */}
          {statusLog.length > 0 && (
            <div className={concertStyles.log}>
              <p className={concertStyles.logTitle}>변경 이력</p>
              <div className={concertStyles.logList}>
                {statusLog.map((entry, i) => (
                  <div key={i} className={concertStyles.logRow}>
                    <span className={concertStyles.logDate}>{entry.changedAt}</span>
                    <span className={concertStyles.logChange}>
                      <Badge status={entry.from} />
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                      <Badge status={entry.to} />
                    </span>
                    <span className={concertStyles.logAdmin}>{entry.adminEmail}</span>
                    <span className={concertStyles.logNote}>{entry.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default AdminConcertFormPage
