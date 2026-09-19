import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import BackButton from '@/components/ui/BackButton'
import EmptyState from '@/components/ui/EmptyState'
import usePageMeta from '@/hooks/usePageMeta'
import { mockGetNotice } from '@/mocks/noticeMocks'
import { ROUTES } from '@/constants/routes'
import styles from './NoticeDetailPage.module.css'

// TODO: API 연동 후 제거 — noticeApi.js의 getNotice(GET /api/notices/{id})로 교체 (BE #123 완료 후, 비활성 공지는 404 처리)
async function fetchNotice(id) {
  const notice = await mockGetNotice(id)
  if (!notice || !notice.active) return null
  return notice
}

function NoticeDetailPage() {
  const { id } = useParams()
  const noticeId = Number(id)

  const { data: notice, isLoading } = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => fetchNotice(noticeId),
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

  if (!notice) {
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
            <span className={styles.metaText}>{notice.createdAt}</span>
          </div>

          <h1 className={styles.title}>{notice.title}</h1>

          <p className={styles.content}>{notice.content}</p>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetailPage
