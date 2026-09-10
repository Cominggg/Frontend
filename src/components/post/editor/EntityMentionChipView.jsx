import { Link } from 'react-router-dom'
import { NodeViewWrapper } from '@tiptap/react'

import { ROUTES } from '@/constants/routes'
import styles from './EntityMentionCard.module.css'

function EntityMentionChipView({ node, editor }) {
  const { entityId, title, thumbnailUrl } = node.attrs
  const className = `${styles.card} ${styles.artist}`

  const thumb = (
    <span
      className={styles.thumb}
      style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
    />
  )

  if (!editor.isEditable) {
    return (
      <NodeViewWrapper as="span">
        <Link to={ROUTES.ARTIST_DETAIL(entityId)} className={className}>
          {thumb}
          <span className={styles.name}>{title}</span>
        </Link>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="span" className={className} contentEditable={false}>
      {thumb}
      <span className={styles.name}>{title}</span>
    </NodeViewWrapper>
  )
}

export default EntityMentionChipView
