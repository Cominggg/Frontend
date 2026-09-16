import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import EntityMentionCardView from './EntityMentionCardView'
import EntityMentionChipView from './EntityMentionChipView'

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

// 공연·음악(발매) 멘션 — 세로 포스터/정사각 앨범아트 블록 카드로 문단 흐름을 끊고 삽입된다
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

// 아티스트 멘션 — 원형 아바타 인라인 칩으로 문장 중간에 자연스럽게 삽입된다
export const EntityMentionChip = Node.create({
  name: 'entityMentionChip',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes: entityAttributes,

  parseHTML() {
    return [{ tag: 'span[data-entity-mention-chip]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-entity-mention-chip': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EntityMentionChipView)
  },
})
