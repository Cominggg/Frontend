import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import EntityMentionCardView from './EntityMentionCardView'

function entityAttributes() {
  return {
    entityType: { default: null },
    entityId: { default: null },
    title: { default: '' },
    subtitle: { default: null },
    thumbnailUrl: { default: null },
    // 트랙 멘션 전용 — 트랙이 속한 앨범(ReleaseGroup) id. 앨범 상세 페이지로의 딥링크에 쓰인다
    releaseGroupId: { default: null },
  }
}

// 언급 카드 — 공연(세로 포스터)·아티스트(원형 사진)·음악·트랙(정사각 앨범아트)을 블록으로 삽입한다.
// 본문 스키마상 최상위에만 올 수 있다
export const EntityMentionCard = Node.create({
  name: 'entityMentionCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes: entityAttributes,

  parseHTML() {
    return [{ tag: 'div[data-entity-mention-card]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-entity-mention-card': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EntityMentionCardView)
  },
})
