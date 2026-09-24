import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { MENTION_TYPE_LABEL, POST_CATEGORY_LABEL } from '@/constants/post'
import { formatPostDate } from '@/utils/date'
import styles from './PostListItem.module.css'

const MAX_VISIBLE_TAGS = 2

function PostListItem({ post }) {
  const { id, category, title, authorNickname, recommendCount, viewCount, createdAt, entityTags } = post
  const visibleTags = entityTags?.slice(0, MAX_VISIBLE_TAGS) ?? []
  const hiddenTagCount = (entityTags?.length ?? 0) - visibleTags.length

  return (
    <Link to={ROUTES.COMMUNITY_DETAIL(id)} className={styles.row}>
      <div className={styles.main}>
        <span className={styles.badge}>
          {POST_CATEGORY_LABEL[category] ?? category}
        </span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.meta}>
          <span className={styles.author}>{authorNickname ?? '탈퇴 회원'}</span>
          <span className={styles.date}>{formatPostDate(createdAt)}</span>
          <span className={styles.stat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {viewCount.toLocaleString()}
          </span>
          <span className={styles.stat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            {recommendCount.toLocaleString()}
          </span>
        </div>
        {visibleTags.length > 0 && (
          <div className={styles.tags}>
            {visibleTags.map((tag) => (
              <span key={`${tag.entityType}:${tag.entityId}`} className={styles.tagChip}>
                {MENTION_TYPE_LABEL[tag.entityType]} · {tag.title}
              </span>
            ))}
            {hiddenTagCount > 0 && <span className={styles.tagChip}>+{hiddenTagCount}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}

export default PostListItem
