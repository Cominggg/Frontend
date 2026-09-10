import usePageMeta from '@/hooks/usePageMeta'
import styles from './PostsPage.module.css'

function PostsPage() {
  usePageMeta({
    title: '커뮤니티 - 커밍',
    description: '공연 후기, 정보·제보, 자유 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
    path: '/community',
  })

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>커뮤니티</h1>
        </div>
      </div>
    </div>
  )
}

export default PostsPage
