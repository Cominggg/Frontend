import { NodeViewWrapper } from '@tiptap/react'

import { MENTION_TYPE_LABEL } from '@/constants/post'
import styles from './EntityMentionCard.module.css'

function EntityMentionCardView({ node }) {
  const { entityType, title, subtitle, thumbnailUrl } = node.attrs
  const variantClass = entityType === 'CONCERT' ? styles.concert : styles.release

  return (
    <NodeViewWrapper as="div" className={`${styles.card} ${variantClass}`} contentEditable={false}>
      <div
        className={styles.thumb}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      />
      <div className={styles.txt}>
        <span className={styles.type}>{MENTION_TYPE_LABEL[entityType]}</span>
        <span className={styles.name}>{title}</span>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </div>
      <span className={styles.chev} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </span>
    </NodeViewWrapper>
  )
}

export default EntityMentionCardView
