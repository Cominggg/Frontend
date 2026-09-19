import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { mockGetNotices, mockToggleNoticeActive, mockDeleteNotice } from './adminNoticeMockData'
import styles from './AdminNoticesPage.module.css'

function AdminNoticesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    try {
      const data = await mockGetNotices()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  async function handleToggleActive(notice) {
    setTogglingId(notice.id)
    try {
      await mockToggleNoticeActive(notice.id, !notice.active)
      setItems((prev) => prev.map((n) => n.id === notice.id ? { ...n, active: !n.active } : n))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(notice) {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return
    setDeletingId(notice.id)
    try {
      await mockDeleteNotice(notice.id)
      setItems((prev) => prev.filter((n) => n.id !== notice.id))
    } finally {
      setDeletingId(null)
    }
  }

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
    </div>
  )
}

export default AdminNoticesPage
