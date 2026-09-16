import { Link } from 'react-router-dom'
import { NodeViewWrapper } from '@tiptap/react'

import { MENTION_TYPE_LABEL } from '@/constants/post'
import { ROUTES } from '@/constants/routes'
import styles from './EntityMentionCard.module.css'

function CardInner({ entityType, title, subtitle, thumbnailUrl }) {
  return (
    <>
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
    </>
  )
}

function getDetailPath(entityType, entityId, releaseGroupId) {
  if (entityType === 'CONCERT') return ROUTES.CONCERT_DETAIL(entityId)
  if (entityType === 'TRACK') return `${ROUTES.RELEASE_DETAIL(releaseGroupId)}#track-${entityId}`
  return ROUTES.RELEASE_DETAIL(entityId)
}

function EntityMentionCardView({ node, editor }) {
  const { entityType, entityId, title, subtitle, thumbnailUrl, releaseGroupId } = node.attrs
  const variantClass = entityType === 'CONCERT' ? styles.concert : entityType === 'TRACK' ? styles.track : styles.release
  const className = `${styles.card} ${variantClass}`

  if (!editor.isEditable) {
    return (
      <NodeViewWrapper as="div">
        <Link to={getDetailPath(entityType, entityId, releaseGroupId)} className={className}>
          <CardInner entityType={entityType} title={title} subtitle={subtitle} thumbnailUrl={thumbnailUrl} />
        </Link>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="div" className={className} contentEditable={false}>
      <CardInner entityType={entityType} title={title} subtitle={subtitle} thumbnailUrl={thumbnailUrl} />
    </NodeViewWrapper>
  )
}

export default EntityMentionCardView
