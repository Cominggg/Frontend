import { useParams } from 'react-router-dom'

import BackButton from '@/components/ui/BackButton'
import usePageMeta from '@/hooks/usePageMeta'
import { ROUTES } from '@/constants/routes'
import styles from './PostDetailPage.module.css'

function PostDetailPage() {
  const { id } = useParams()
  const postId = Number(id)

  usePageMeta({
    title: '커뮤니티 - 커밍',
    description: '공연 후기, 정보·제보, 자유 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: `/community/${postId}`,
  })

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <BackButton fallback={ROUTES.COMMUNITY} />
      </div>
    </div>
  )
}

export default PostDetailPage
