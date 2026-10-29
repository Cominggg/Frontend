import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getReports, getReport, updateReportStatus } from '@/services/adminApi'
import { REPORT_REASON_LABEL, REPORT_STATUS_LABEL } from '@/constants/post'
import { ROUTES } from '@/constants/routes'
import { SUSPENSION_PERIODS, formatSuspensionPeriod } from '@/constants/suspension'
import styles from './AdminReportsPage.module.css'

const TARGET_TYPE_LABEL = { POST: '게시글', COMMENT: '댓글' }
const STATUS_FILTERS = ['전체', 'PENDING', 'RESOLVED', 'REJECTED']
const TARGET_TYPE_FILTERS = ['전체', 'POST', 'COMMENT']
const PAGE_SIZE = 20

const ACTION_ERRORS = {
  REPORT_TARGET_NOT_FOUND: '신고 대상이 삭제되어 작성자를 정지할 수 없습니다.',
  USER_NOT_FOUND: '작성자가 탈퇴한 회원이라 정지할 수 없습니다.',
}

function authorLabel(item) {
  if (item.targetAuthorId == null) return '알 수 없음 (대상 삭제)'
  if (item.targetAuthorNickname == null) return '탈퇴 회원'
  return item.targetAuthorNickname
}

function DetailModal({ id, onClose, onStatusChange }) {
  const [item, setItem] = useState(null)
  const [note, setNote] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(false)
  const [suspendPeriod, setSuspendPeriod] = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendDetail, setSuspendDetail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getReport(id).then((data) => {
      setItem(data)
      setNote(data.adminNote ?? '')
      setSuspendReason(data.reason)
    }).catch(() => setError('신고를 불러오지 못했습니다.'))
  }, [id])

  async function handleAction(status) {
    setProcessing(true)
    setError('')
    const period = SUSPENSION_PERIODS.find((p) => p.value === suspendPeriod)
    try {
      await updateReportStatus(id, {
        status,
        adminNote: note.trim() || undefined,
        deleteTarget: status === 'RESOLVED' && deleteTarget,
        suspend: status === 'RESOLVED' && period
          ? { days: period.days, reason: suspendReason, detail: suspendDetail.trim() || undefined }
          : undefined,
      })
      onStatusChange(id, status)
      onClose()
    } catch (err) {
      setError(ACTION_ERRORS[err.response?.data?.code] ?? '처리에 실패했습니다.')
      setProcessing(false)
    }
  }

  const isPending = item?.status === 'PENDING'
  const canSuspend = item?.targetAuthorId != null && item?.targetAuthorNickname != null

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
              <div>
                <dt>대상 ID</dt>
                <dd>
                  {item.targetId}
                  {item.targetType === 'POST' && (
                    <Link
                      to={ROUTES.COMMUNITY_DETAIL(item.targetId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.targetLink}
                    >
                      게시글 보기
                    </Link>
                  )}
                </dd>
              </div>
              <div>
                <dt>작성자</dt>
                <dd>
                  {authorLabel(item)}
                  {item.targetAuthorSuspended && (
                    <span className={styles.suspendedBadge}>
                      {formatSuspensionPeriod(item.targetAuthorSuspendedUntil)}
                    </span>
                  )}
                </dd>
              </div>
              <div><dt>신고자</dt><dd>{item.reporterNickname || '탈퇴 회원'}</dd></div>
              <div><dt>접수일</dt><dd>{item.createdAt}</dd></div>
            </dl>

            {item.detail && (
              <div className={styles.contentBox}>
                <p className={styles.contentText}>{item.detail}</p>
              </div>
            )}

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

            {isPending && (
              <label className={styles.deleteTargetLabel}>
                <input
                  type="checkbox"
                  checked={deleteTarget}
                  onChange={(e) => setDeleteTarget(e.target.checked)}
                />
                처리완료 시 신고 대상 {TARGET_TYPE_LABEL[item.targetType]} 함께 삭제
              </label>
            )}

            {isPending && canSuspend && (
              <fieldset className={styles.suspendBox}>
                <legend className={styles.suspendLegend}>처리완료 시 작성자 정지</legend>
                <div className={styles.suspendRow}>
                  <select
                    className={styles.suspendSelect}
                    value={suspendPeriod}
                    onChange={(e) => setSuspendPeriod(e.target.value)}
                    aria-label="정지 기간"
                  >
                    <option value="">정지 안 함</option>
                    {SUSPENSION_PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <select
                    className={styles.suspendSelect}
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    disabled={!suspendPeriod}
                    aria-label="정지 사유"
                  >
                    {Object.entries(REPORT_REASON_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <input
                  className={styles.noteInput}
                  value={suspendDetail}
                  onChange={(e) => setSuspendDetail(e.target.value)}
                  placeholder="상세 사유 (정지 안내 메일에 포함, 선택)"
                  disabled={!suspendPeriod}
                  aria-label="정지 상세 사유"
                />
                {suspendPeriod && item.targetAuthorSuspended && (
                  <p className={styles.suspendHint}>이미 정지 중인 회원입니다. 새 기간·사유로 덮어씁니다.</p>
                )}
              </fieldset>
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
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [targetTypeFilter, setTargetTypeFilter] = useState('전체')
  const [selectedId, setSelectedId] = useState(null)

  const queryKey = ['admin', 'reports', { page, statusFilter, targetTypeFilter }]
  const { data, isLoading: loading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const params = { page, size: PAGE_SIZE }
      if (statusFilter !== '전체') params.status = statusFilter
      if (targetTypeFilter !== '전체') params.targetType = targetTypeFilter
      return getReports(params)
    },
    staleTime: 0,
  })
  const items = data?.content ?? []
  const totalElements = data?.totalElements ?? 0
  const loadError = isError ? '신고 목록을 불러오지 못했습니다.' : ''

  // 배지 표시용 보조 값이므로 실패 시 이전 값을 유지한다 (React Query가 에러 시 이전 data 유지)
  const { data: pendingTotal = 0 } = useQuery({
    queryKey: ['admin', 'reports', 'pending-total'],
    queryFn: () => getReports({ status: 'PENDING', page: 0, size: 1 }).then((d) => d.totalElements),
    staleTime: 0,
  })

  function handleFilterChange(setter) {
    return (value) => {
      setter(value)
      setPage(0)
    }
  }

  function handleStatusChange(id, newStatus) {
    const shouldRemove = statusFilter === 'PENDING' && newStatus !== 'PENDING'
    queryClient.setQueryData(queryKey, (old) => old && {
      ...old,
      content: shouldRemove
        ? old.content.filter((it) => it.id !== id)
        : old.content.map((it) => it.id === id ? { ...it, status: newStatus } : it),
      totalElements: shouldRemove ? Math.max(old.totalElements - 1, 0) : old.totalElements,
    })
    queryClient.invalidateQueries({ queryKey: ['admin', 'reports', 'pending-total'] })
  }

  const totalPages = Math.ceil(totalElements / PAGE_SIZE)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>신고 관리</h1>
          <p className={styles.pageDesc}>사용자가 접수한 게시글·댓글 신고를 검토하고 처리합니다.</p>
        </div>
        {pendingTotal > 0 && (
          <span className={styles.pendingBadge}>{pendingTotal}건 미처리</span>
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
              {f === '전체' ? '전체' : REPORT_STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <div className={styles.typeBar}>
          {TARGET_TYPE_FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.typeChip} ${targetTypeFilter === f ? styles.typeChipActive : ''}`}
              onClick={() => handleFilterChange(setTargetTypeFilter)(f)}
            >
              {f === '전체' ? '전체' : TARGET_TYPE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : loadError ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{loadError}</p>
          <button type="button" className={styles.pageBtn} onClick={() => refetch()}>다시 시도</button>
        </div>
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
                <p className={styles.rowTarget}>대상 ID {item.targetId} · 신고자 {item.reporterNickname || '탈퇴 회원'}</p>
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

export default AdminReportsPage
