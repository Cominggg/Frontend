import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { getPinnedNotices } from '@/services/noticeApi'
import { formatPostDate } from '@/utils/date'
import styles from './PinnedNotices.module.css'

const PINNED_NOTICE_LIMIT = 3

// 공지는 목록 위 회색 한 줄로 접어 두고, 나머지는 "외 n건"으로 펼친다
function PinnedNotices() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: notices = [] } = useQuery({
    queryKey: ['notices', 'pinned'],
    queryFn: () => getPinnedNotices({ limit: PINNED_NOTICE_LIMIT }),
  })

  if (notices.length === 0) return null

  const [first, ...rest] = notices
  const visible = isExpanded ? notices : [first]

  return (
    <div className={styles.wrap}>
      {visible.map((notice, i) => (
        <div key={notice.id} className={styles.row}>
          <span className={styles.badge}>공지</span>
          <Link to={ROUTES.NOTICE_DETAIL(notice.id)} className={styles.title}>
            {notice.title}
          </Link>
          {i === 0 && rest.length > 0 ? (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setIsExpanded((v) => !v)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '접기' : `외 ${rest.length}건`}
            </button>
          ) : (
            <span className={styles.date}>{formatPostDate(notice.createdAt)}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default PinnedNotices
