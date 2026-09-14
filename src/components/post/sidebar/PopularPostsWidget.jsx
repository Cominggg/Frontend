import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { ROUTES } from '@/constants/routes'
import { getPopularPosts } from '@/services/postApi'
import styles from './PopularPostsWidget.module.css'

const POPULAR_DAYS = 7
const POPULAR_LIMIT = 5

function PopularPostsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['popular-posts-sidebar'],
    queryFn: () => getPopularPosts({ days: POPULAR_DAYS, limit: POPULAR_LIMIT }),
    staleTime: 5 * 60 * 1000,
  })

  const posts = data ?? []

  if (!isLoading && posts.length === 0) return null

  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>이번 주 인기글</h2>
      {isLoading ? (
        <div className={styles.widgetList}>
          {Array.from({ length: POPULAR_LIMIT }).map((_, i) => (
            <div key={i} className={styles.rankSkeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.widgetList}>
          {posts.map((post, i) => (
            <Link key={post.id} to={ROUTES.COMMUNITY_DETAIL(post.id)} className={styles.rankRow}>
              <span className={styles.rankNum}>{i + 1}</span>
              <span className={styles.rankTitle}>{post.title}</span>
              <span className={styles.rankStat}>추천 {post.recommendCount.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default PopularPostsWidget
