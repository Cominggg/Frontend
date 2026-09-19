import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { mockGetActiveNotices } from '@/mocks/noticeMocks'
import { formatRelativeDate } from '@/utils/date'
import styles from './PinnedNotices.module.css'

function PinnedNotices() {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    let cancelled = false
    mockGetActiveNotices().then((data) => {
      if (!cancelled) setNotices(data)
    })
    return () => { cancelled = true }
  }, [])

  if (notices.length === 0) return null

  return (
    <div className={styles.wrap}>
      {notices.map((notice) => (
        <Link
          key={notice.id}
          to={ROUTES.NOTICE_DETAIL(notice.id)}
          className={styles.card}
        >
          <span className={styles.badge}>공지</span>
          <span className={styles.title}>{notice.title}</span>
          <span className={styles.date}>{formatRelativeDate(notice.createdAt)}</span>
        </Link>
      ))}
    </div>
  )
}

export default PinnedNotices
