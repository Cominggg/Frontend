import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { getAdminNotices, updateNotice, deleteNotice } from '@/services/adminApi'
import styles from './AdminNoticesPage.module.css'

const PAGE_SIZE = 20

function AdminNoticesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await getAdminNotices({ page, size: PAGE_SIZE })
      setItems(data.content)
      setTotalElements(data.totalElements)
    } catch {
      setItems([])
      setTotalElements(0)
      setLoadError('공지 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  async function handleToggleActive(notice) {
    setTogglingId(notice.id)
    try {
      await updateNotice(notice.id, { active: !notice.active })
      setItems((prev) => prev.map((n) => n.id === notice.id ? { ...n, active: !n.active } : n))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(notice) {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return
    setDeletingId(notice.id)
    try {
      await deleteNotice(notice.id)
      setItems((prev) => prev.filter((n) => n.id !== notice.id))
      setTotalElements((prev) => prev - 1)
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.ceil(totalElements / PAGE_SIZE)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>공지사항 관리</h1>
          <p className={styles.pageDesc}>커뮤니티 홈에 고정 노출할 공지를 작성하고 노출 여부를 관리합니다.</p>
        </div>
        <Link to={ROUTES.ADMIN_NOTICE_NEW} className={styles.btnNew}>+ 새 공지 작성</Link>
      </div>

      {loading ? (
        <div className={styles.empty}><p className={styles.emptyText}>불러오는 중...</p></div>
      ) : loadError ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{loadError}</p>
          <button type="button" className={styles.pageBtn} onClick={fetchNotices}>다시 시도</button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}><p className={styles.emptyText}>등록된 공지가 없습니다.</p></div>
      ) : (
        <div className={styles.list}>
          {items.map((notice) => (
            <div key={notice.id} className={styles.row}>
              <div className={styles.rowLeft}>
                <div className={styles.rowMeta}>
                  <span className={`${styles.activeBadge} ${notice.active ? styles.activeBadgeOn : styles.activeBadgeOff}`}>
                    {notice.active ? '노출 중' : '숨김'}
                  </span>
                  <span className={styles.rowDate}>{notice.createdAt}</span>
                </div>
                <p className={styles.rowTitle}>{notice.title}</p>
              </div>
              <div className={styles.rowActions}>
                <button
                  type="button"
                  className={styles.btnToggle}
                  disabled={togglingId === notice.id}
                  onClick={() => handleToggleActive(notice)}
                >
                  {notice.active ? '숨기기' : '노출하기'}
                </button>
                <Link to={ROUTES.ADMIN_NOTICE_EDIT(notice.id)} className={styles.btnEdit}>수정</Link>
                <button
                  type="button"
                  className={styles.btnDelete}
                  disabled={deletingId === notice.id}
                  onClick={() => handleDelete(notice)}
                >
                  삭제
                </button>
              </div>
            </div>
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
    </div>
  )
}

export default AdminNoticesPage
