import { Link } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { MENTION_TYPE_LABEL, POST_CATEGORY_LABEL } from '@/constants/post'
import { formatPostDate } from '@/utils/date'
import styles from './PostListItem.module.css'

const MAX_VISIBLE_TAGS = 2

// 목록 표면 안의 한 행 — 테두리·배경은 감싸는 목록이 맡고, 행은 구분선만 가진다
function PostListItem({ post }) {
  const { id, category, title, authorNickname, recommendCount, viewCount, createdAt, entityTags } = post
  const visibleTags = entityTags?.slice(0, MAX_VISIBLE_TAGS) ?? []
  const hiddenTagCount = (entityTags?.length ?? 0) - visibleTags.length

  return (
    <Link to={ROUTES.COMMUNITY_DETAIL(id)} className={styles.row}>
      <span className={styles.category}>{POST_CATEGORY_LABEL[category] ?? category}</span>
      <span className={styles.title}>{title}</span>
      <span className={styles.meta}>
        <span className={styles.author}>{authorNickname ?? '탈퇴 회원'}</span>
        <span>{formatPostDate(createdAt)}</span>
        {visibleTags.map((tag) => (
          <span key={`${tag.entityType}:${tag.entityId}`} className={styles.tagChip}>
            {MENTION_TYPE_LABEL[tag.entityType]} {tag.title}
          </span>
        ))}
        {hiddenTagCount > 0 && <span className={styles.tagChip}>+{hiddenTagCount}</span>}
      </span>
      <span className={styles.stats}>
        <span>
          추천 <b className={styles.statValue}>{recommendCount.toLocaleString()}</b>
        </span>
        <span>조회 {viewCount.toLocaleString()}</span>
      </span>
    </Link>
  )
}

export default PostListItem
