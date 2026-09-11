import { MENTION_TYPE_LABEL } from '@/constants/post'
import styles from './TrendingTagsWidget.module.css'

// TODO: API 연동 후 제거 — BE GET /api/posts/trending-tags?days=7&limit=10 완료되면 useQuery로 교체
const MOCK_TRENDING_TAGS = [
  { entityType: 'CONCERT', entityId: 482, title: '요네즈 켄시 KOREA LIVE 2026', count: 12 },
  { entityType: 'ARTIST', entityId: 101, title: '요네즈 켄시', count: 9 },
  { entityType: 'RELEASE', entityId: 55, title: 'LOST CORNER', count: 7 },
  { entityType: 'CONCERT', entityId: 490, title: '오피셜히게단디즘 단독공연', count: 4 },
  { entityType: 'ARTIST', entityId: 118, title: '아이묭', count: 3 },
]

function TrendingTagsWidget() {
  return (
    <div className={styles.widget}>
      <h2 className={styles.widgetTitle}>지금 많이 언급된 태그</h2>
      <div className={styles.tagCloud}>
        {MOCK_TRENDING_TAGS.map((tag) => (
          <span key={`${tag.entityType}:${tag.entityId}`} className={styles.tagCloudChip}>
            {MENTION_TYPE_LABEL[tag.entityType]} · {tag.title} · {tag.count}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TrendingTagsWidget
