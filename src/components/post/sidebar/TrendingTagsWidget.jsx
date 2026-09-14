import { useQuery } from '@tanstack/react-query'

import { MENTION_TYPE_LABEL } from '@/constants/post'
import { getTrendingTags } from '@/services/postApi'
import styles from './TrendingTagsWidget.module.css'

const TRENDING_DAYS = 7
const TRENDING_LIMIT = 10

function TrendingTagsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['trending-tags-sidebar'],
    queryFn: () => getTrendingTags({ days: TRENDING_DAYS, limit: TRENDING_LIMIT }),
    staleTime: 5 * 60 * 1000,
  })

  const tags = data ?? []

  if (!isLoading && tags.length === 0) return null

  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>지금 많이 언급된 태그</h2>
      {isLoading ? (
        <div className={styles.tagCloud}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.tagSkeleton} />
          ))}
        </div>
      ) : (
        <div className={styles.tagCloud}>
          {tags.map((tag) => (
            <span key={`${tag.entityType}:${tag.entityId}`} className={styles.tagCloudChip}>
              {MENTION_TYPE_LABEL[tag.entityType]} · {tag.title} · {tag.count}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrendingTagsWidget
