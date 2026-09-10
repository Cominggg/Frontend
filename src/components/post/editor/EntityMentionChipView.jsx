import { NodeViewWrapper } from '@tiptap/react'

import styles from './EntityMentionCard.module.css'

function EntityMentionChipView({ node }) {
  const { title, thumbnailUrl } = node.attrs

  return (
    <NodeViewWrapper as="span" className={`${styles.card} ${styles.artist}`} contentEditable={false}>
      <span
        className={styles.thumb}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      />
      <span className={styles.name}>{title}</span>
    </NodeViewWrapper>
  )
}

export default EntityMentionChipView
