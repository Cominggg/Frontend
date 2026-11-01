import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { searchUsers, suspendUser, liftSuspension, withdrawUser } from '@/services/adminApi'
import { REPORT_REASON_LABEL } from '@/constants/post'
import { SUSPENSION_PERIODS, formatSuspensionPeriod, toSuspendBody } from '@/constants/suspension'
import useModalA11y from '@/hooks/useModalA11y'
import styles from './AdminUsersPage.module.css'

const PAGE_SIZE = 20
const PROVIDER_LABEL = { google: 'Google', kakao: 'Kakao', apple: 'Apple' }

function SuspendModal({ user, onClose, onDone }) {
  const [period, setPeriod] = useState(SUSPENSION_PERIODS[0].value)
  const [reason, setReason] = useState(Object.keys(REPORT_REASON_LABEL)[0])
  const [detail, setDetail] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const modalRef = useModalA11y(onClose)

  async function handleSubmit(e) {
    e.preventDefault()
    setProcessing(true)
    setError('')
    try {
      await suspendUser(user.id, toSuspendBody(period, reason, detail))
      onDone()
    } catch {
      setError('정지 처리에 실패했습니다.')
      setProcessing(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <form
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        ref={modalRef}
      >
        <h2 id="suspend-title" className={styles.modalTitle}>{user.nickname ?? user.email} 정지</h2>
        {user.status === 'SUSPENDED' && (
          <p className={styles.modalHint}>이미 정지 중인 회원입니다. 새 기간·사유로 덮어씁니다.</p>
        )}
        <label className={styles.field}>
          정지 기간
          <select className={styles.input} value={period} onChange={(e) => setPeriod(e.target.value)}>
            {SUSPENSION_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          사유
          <select className={styles.input} value={reason} onChange={(e) => setReason(e.target.value)}>
            {Object.entries(REPORT_REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          상세 사유 (선택)
          <textarea
            className={styles.input}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="정지 안내 메일에 포함됩니다."
            rows={3}
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onClose}>취소</button>
          <button type="submit" className={`${styles.btn} ${styles.btnDanger}`} disabled={processing}>정지</button>
        </div>
      </form>
    </div>
  )
}

function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [suspendTarget, setSuspendTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users', { keyword, page }],
    queryFn: () => searchUsers({ keyword: keyword || undefined, page, size: PAGE_SIZE }),
    staleTime: 0,
  })
  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
  }

  function handleSearch(e) {
    e.preventDefault()
    setKeyword(input.trim())
    setPage(0)
  }

  async function runAction(action, failMessage, onSuccess) {
    setActionError('')
    try {
      await action()
      onSuccess?.()
      refresh()
    } catch {
      setActionError(failMessage)
    }
  }

  function handleLift(user) {
    if (!window.confirm(`${user.nickname ?? user.email}의 정지를 해제하시겠습니까?`)) return
    runAction(() => liftSuspension(user.id), '정지 해제에 실패했습니다.')
  }

  function handleWithdraw(user) {
    const message = `${user.nickname ?? user.email}(${user.email ?? '이메일 없음'})을 탈퇴 처리하시겠습니까?\n개인정보와 평점이 삭제되며 되돌릴 수 없습니다.`
    if (!window.confirm(message)) return
    // 탈퇴 회원은 검색에서 빠지므로, 페이지의 마지막 회원을 탈퇴시키면 이전 페이지로 이동한다
    runAction(() => withdrawUser(user.id), '탈퇴 처리에 실패했습니다.', () => {
      if (users.length === 1 && page > 0) setPage((p) => p - 1)
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>회원 관리</h1>
        <p className={styles.pageDesc}>이메일·닉네임으로 회원을 찾아 정지·정지 해제·대리 탈퇴를 처리합니다. 탈퇴 회원은 검색되지 않습니다.</p>
      </div>

      <form className={styles.searchRow} onSubmit={handleSearch} role="search">
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="이메일 또는 닉네임"
          aria-label="회원 검색어"
        />
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>검색</button>
      </form>

      {actionError && <p className={styles.error}>{actionError}</p>}

      {isLoading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : isError ? (
        <div className={styles.empty}>
          <p>회원 목록을 불러오지 못했습니다.</p>
          <button type="button" className={styles.btn} onClick={() => refetch()}>다시 시도</button>
        </div>
      ) : users.length === 0 ? (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {users.map((user) => {
            const suspended = user.status === 'SUSPENDED'
            return (
              <li key={user.id} className={styles.row}>
                <div className={styles.rowInfo}>
                  <div className={styles.rowTitle}>
                    <span className={styles.nickname}>{user.nickname ?? '가입 미완료'}</span>
                    {user.role === 'ADMIN' && <span className={styles.badge}>관리자</span>}
                    {suspended && (
                      <span className={`${styles.badge} ${styles.badgeSuspended}`}>
                        정지 · {formatSuspensionPeriod(user.suspendedUntil)}
                      </span>
                    )}
                  </div>
                  <p className={styles.rowSub}>
                    {user.email ?? '이메일 없음'} · {PROVIDER_LABEL[user.provider] ?? user.provider} · 가입 {user.createdAt}
                    {suspended && user.suspensionReason && ` · 사유 ${REPORT_REASON_LABEL[user.suspensionReason]}`}
                  </p>
                </div>
                {user.role !== 'ADMIN' && (
                  <div className={styles.rowActions}>
                    {suspended ? (
                      <>
                        <button type="button" className={styles.btn} onClick={() => handleLift(user)}>정지 해제</button>
                        <button type="button" className={styles.btn} onClick={() => setSuspendTarget(user)}>기간 변경</button>
                      </>
                    ) : (
                      <button type="button" className={styles.btn} onClick={() => setSuspendTarget(user)}>정지</button>
                    )}
                    <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleWithdraw(user)}>
                      대리 탈퇴
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button type="button" className={styles.btn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>이전</button>
          <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
          <button type="button" className={styles.btn} disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>다음</button>
        </div>
      )}

      {suspendTarget && (
        <SuspendModal
          user={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onDone={() => {
            setSuspendTarget(null)
            refresh()
          }}
        />
      )}
    </div>
  )
}

export default AdminUsersPage
