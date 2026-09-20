import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import BackButton from '@/components/ui/BackButton'
import EmptyState from '@/components/ui/EmptyState'
import usePageMeta from '@/hooks/usePageMeta'
import { getNotice } from '@/services/noticeApi'
import { ROUTES } from '@/constants/routes'
import { formatDateTime } from '@/utils/date'
import styles from './NoticeDetailPage.module.css'

function NoticeDetailPage() {
  const { id } = useParams()
  const noticeId = Number(id)

  const { data: notice, isLoading, isError } = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => getNotice(noticeId),
    retry: false,
  })

  usePageMeta({
    title: notice ? `${notice.title} - 커밍` : undefined,
    description: '커밍 공지사항입니다.',
    path: `/community/notices/${noticeId}`,
  })

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <BackButton fallback={ROUTES.COMMUNITY} />
          <div className={styles.card}>
            <div className={styles.skeletonMeta} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonBody} />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !notice) {
    return (
      <EmptyState
        message="공지사항이 존재하지 않습니다"
        action={{ to: ROUTES.COMMUNITY, label: '커뮤니티 목록으로' }}
      />
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <BackButton fallback={ROUTES.COMMUNITY} />

        <div className={styles.card}>
          <div className={styles.meta}>
            <span className={styles.badge}>공지</span>
            <span className={styles.metaText}>{formatDateTime(notice.createdAt)}</span>
          </div>

          <h1 className={styles.title}>{notice.title}</h1>

          <p className={styles.content}>{notice.content}</p>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetailPage
