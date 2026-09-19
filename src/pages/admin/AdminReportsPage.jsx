import { useState, useEffect, useCallback } from 'react'

import { REPORT_REASON_LABEL, REPORT_STATUS_LABEL } from '@/constants/post'
import styles from './AdminReportsPage.module.css'

const TARGET_TYPE_LABEL = { POST: '게시글', COMMENT: '댓글' }
const STATUS_FILTERS = ['전체', 'PENDING', 'RESOLVED', 'REJECTED']
const TARGET_TYPE_FILTERS = ['전체', 'POST', 'COMMENT']

// TODO: API 연동 후 제거 — adminApi.js의 getReports/getReport/updateReportStatus(GET/PATCH /api/admin/reports/**)로 교체 (BE #123 완료 후)
const MOCK_REPORTS = [
  {
    id: 1,
    targetType: 'POST',
    targetId: 501,
    reason: 'SPAM',
    detail: null,
    status: 'PENDING',
    reporterNickname: 'user_a',
    createdAt: '2026-09-18 10:12',
  },
  {
    id: 2,
    targetType: 'COMMENT',
    targetId: 3021,
    reason: 'ABUSE',
    detail: null,
    status: 'PENDING',
    reporterNickname: 'user_b',
    createdAt: '2026-09-18 14:40',
  },
  {
    id: 3,
    targetType: 'POST',
    targetId: 488,
    reason: 'ETC',
    detail: '거래 유도 게시글로 보입니다.',
    status: 'RESOLVED',
    reporterNickname: 'user_c',
    createdAt: '2026-09-17 09:03',
  },
]

async function mockGetReports({ status, targetType }) {
  let items = MOCK_REPORTS
  if (status) items = items.filter((r) => r.status === status)
  if (targetType) items = items.filter((r) => r.targetType === targetType)
  return { content: items, totalElements: items.length }
}

async function mockGetReport(id) {
  return MOCK_REPORTS.find((r) => r.id === id)
}

async function mockUpdateReportStatus(id, status) {
  const item = MOCK_REPORTS.find((r) => r.id === id)
  if (item) item.status = status
  return item
}

function DetailModal({ id, onClose, onStatusChange }) {
  const [item, setItem] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    mockGetReport(id).then((data) => setItem(data)).catch(() => setError('신고를 불러오지 못했습니다.'))
  }, [id])

  async function handleAction(status) {
    setProcessing(true)
    setError('')
    try {
      await mockUpdateReportStatus(id, status)
      onStatusChange(id, status)
      onClose()
    } catch {
      setError('처리에 실패했습니다.')
      setProcessing(false)
    }
  }

  const isPending = item?.status === 'PENDING'

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {item ? (
            <div className={styles.modalTitleRow}>
              <span className={`${styles.typeBadge} ${styles[`type${item.targetType}`]}`}>
                {TARGET_TYPE_LABEL[item.targetType]}
              </span>
              <h2 className={styles.modalTitle}>{REPORT_REASON_LABEL[item.reason]}</h2>
            </div>
          ) : (
            <div className={styles.modalTitle}>{error || '불러오는 중...'}</div>
          )}
          <button className={styles.modalClose} onClick={onClose} aria-label="닫기">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {item && (
          <>
            <dl className={styles.modalMeta}>
              <div><dt>대상 ID</dt><dd>{item.targetId}</dd></div>
              <div><dt>신고자</dt><dd>{item.reporterNickname}</dd></div>
              <div><dt>접수일</dt><dd>{item.createdAt}</dd></div>
            </dl>

            {item.detail && (
              <div className={styles.contentBox}>
                <p className={styles.contentText}>{item.detail}</p>
              </div>
            )}

            {error && <p className={styles.modalError}>{error}</p>}

            {isPending && (
              <div className={styles.modalActions}>
                <button
                  className={styles.btnReject}
                  disabled={processing}
                  onClick={() => handleAction('REJECTED')}
                >
                  반려
                </button>
                <button
                  className={styles.btnResolve}
                  disabled={processing}
                  onClick={() => handleAction('RESOLVED')}
                >
                  처리완료
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AdminReportsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [targetTypeFilter, setTargetTypeFilter] = useState('전체')
  const [selectedId, setSelectedId] = useState(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter !== '전체') params.status = statusFilter
      if (targetTypeFilter !== '전체') params.targetType = targetTypeFilter
      const data = await mockGetReports(params)
      setItems(data.content)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [statusFilter, targetTypeFilter])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  function handleStatusChange(id, newStatus) {
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, status: newStatus } : it)
    )
  }

  const pendingCount = items.filter((it) => it.status === 'PENDING').length

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>신고 관리</h1>
          <p className={styles.pageDesc}>사용자가 접수한 게시글·댓글 신고를 검토하고 처리합니다.</p>
        </div>
        {pendingCount > 0 && (
          <span className={styles.pendingBadge}>{pendingCount}건 미처리</span>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.filterBar} role="tablist" aria-label="상태 필터">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={statusFilter === f}
              className={`${styles.filterTab} ${statusFilter === f ? styles.filterTabActive : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === '전체' ? '전체' : REPORT_STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <div className={styles.typeBar}>
          {TARGET_TYPE_FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.typeChip} ${targetTypeFilter === f ? styles.typeChipActive : ''}`}
              onClick={() => setTargetTypeFilter(f)}
            >
              {f === '전체' ? '전체' : TARGET_TYPE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : items.length === 0 ? (
        <div className={styles.empty}><p className={styles.emptyText}>해당 조건의 신고가 없습니다.</p></div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <button
              key={item.id}
              className={styles.row}
              onClick={() => setSelectedId(item.id)}
            >
              <div className={styles.rowLeft}>
                <div className={styles.rowMeta}>
                  <span className={`${styles.typeBadge} ${styles[`type${item.targetType}`]}`}>
                    {TARGET_TYPE_LABEL[item.targetType]}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                    {REPORT_STATUS_LABEL[item.status]}
                  </span>
                  <span className={styles.rowDate}>{item.createdAt}</span>
                </div>
                <p className={styles.rowTitle}>{REPORT_REASON_LABEL[item.reason]}</p>
                <p className={styles.rowTarget}>대상 ID {item.targetId} · 신고자 {item.reporterNickname}</p>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.rowChevron} aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {selectedId !== null && (
        <DetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

export default AdminReportsPage
