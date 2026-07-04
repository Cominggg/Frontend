import { useState, useEffect, useCallback } from 'react'

import { getInquiries, getInquiry, updateInquiryStatus } from '@/services/adminApi'
import styles from './AdminInquiriesPage.module.css'

const TYPE_LABEL = { CONCERT: '공연', ARTIST: '아티스트', SETLIST: '셋리스트', REQUEST_DATA: '데이터 요청', FEEDBACK: '피드백' }
const STATUS_LABEL = { PENDING: '대기 중', IN_PROGRESS: '처리 중', RESOLVED: '처리완료', REJECTED: '반려' }
const STATUS_FILTERS = ['전체', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
const TYPE_FILTERS = ['전체', 'CONCERT', 'ARTIST', 'SETLIST', 'REQUEST_DATA', 'FEEDBACK']

function DetailModal({ id, onClose, onStatusChange }) {
  const [item, setItem] = useState(null)
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getInquiry(id).then((data) => {
      setItem(data)
      setNote(data.adminNote ?? '')
    }).catch(() => setError('문의를 불러오지 못했습니다.'))
  }, [id])

  async function handleAction(status) {
    setProcessing(true)
    setError('')
    try {
      await updateInquiryStatus(id, { status, adminNote: note.trim() || undefined })
      onStatusChange(id, status)
      onClose()
    } catch {
      setError('처리에 실패했습니다.')
      setProcessing(false)
    }
  }

  const isPending = item?.status === 'PENDING' || item?.status === 'IN_PROGRESS'

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          {item ? (
            <div className={styles.modalTitleRow}>
              <span className={`${styles.typeBadge} ${styles[`type${item.type}`]}`}>
                {TYPE_LABEL[item.type]}
              </span>
              <h2 className={styles.modalTitle}>{item.title}</h2>
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
              <div><dt>대상 ID</dt><dd>{item.targetId ?? '-'}</dd></div>
              <div><dt>제출자</dt><dd>{item.userNickname}</dd></div>
              <div><dt>제출일</dt><dd>{item.createdAt}</dd></div>
            </dl>

            <div className={styles.contentBox}>
              <p className={styles.contentText}>{item.content}</p>
            </div>

            <label className={styles.noteLabel}>
              처리 메모
              <textarea
                className={styles.noteInput}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="처리 내용 또는 반려 사유를 입력하세요."
                rows={3}
                disabled={!isPending}
              />
            </label>

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
                  className={styles.btnInProgress}
                  disabled={processing}
                  onClick={() => handleAction('IN_PROGRESS')}
                >
                  처리 중
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

function AdminInquiriesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [selectedId, setSelectedId] = useState(null)

  const PAGE_SIZE = 20

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: PAGE_SIZE }
      if (statusFilter !== '전체') params.status = statusFilter
      if (typeFilter !== '전체') params.type = typeFilter
      const data = await getInquiries(params)
      setItems(data.content)
      setTotalElements(data.totalElements)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  function handleFilterChange(setter) {
    return (value) => {
      setter(value)
      setPage(0)
    }
  }

  function handleStatusChange(id, newStatus) {
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, status: newStatus } : it)
    )
  }

  const pendingCount = totalElements > 0
    ? items.filter((it) => it.status === 'PENDING').length
    : 0
  const totalPages = Math.ceil(totalElements / PAGE_SIZE)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>문의 관리</h1>
          <p className={styles.pageDesc}>사용자가 제출한 데이터 문의를 검토하고 처리합니다.</p>
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
              onClick={() => handleFilterChange(setStatusFilter)(f)}
            >
              {f === '전체' ? '전체' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <div className={styles.typeBar}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.typeChip} ${typeFilter === f ? styles.typeChipActive : ''}`}
              onClick={() => handleFilterChange(setTypeFilter)(f)}
            >
              {f === '전체' ? '전체' : TYPE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : items.length === 0 ? (
        <div className={styles.empty}><p className={styles.emptyText}>해당 조건의 문의가 없습니다.</p></div>
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
                  <span className={`${styles.typeBadge} ${styles[`type${item.type}`]}`}>
                    {TYPE_LABEL[item.type]}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[`status${item.status}`]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  <span className={styles.rowDate}>{item.createdAt}</span>
                </div>
                <p className={styles.rowTitle}>{item.title}</p>
                <p className={styles.rowTarget}>{item.userNickname}</p>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.rowChevron} aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </button>
          <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
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

export default AdminInquiriesPage
