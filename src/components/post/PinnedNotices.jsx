import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { getPinnedNotices } from '@/services/noticeApi'
import { formatPostDate } from '@/utils/date'
import styles from './PinnedNotices.module.css'

const PINNED_NOTICE_LIMIT = 3

function PinnedNotices() {
  const { data: notices = [] } = useQuery({
    queryKey: ['notices', 'pinned'],
    queryFn: () => getPinnedNotices({ limit: PINNED_NOTICE_LIMIT }),
  })

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
          <span className={styles.date}>{formatPostDate(notice.createdAt)}</span>
        </Link>
      ))}
    </div>
  )
}

export default PinnedNotices
