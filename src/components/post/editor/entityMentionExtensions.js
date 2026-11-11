import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import EntityMentionCardView from './EntityMentionCardView'

// 같은 에디터 안에서 잘라내기·붙여넣기하면 카드가 HTML을 거쳐 다시 만들어진다.
// Tiptap 기본 변환은 숫자처럼 보이는 문자열을 숫자로 바꿔("1989" → 1989) BE 스키마(title 문자열)에 어긋나므로
// 문자열 attr은 그대로, id attr만 숫자로 읽는다
const stringAttr = (name, fallback = null) => ({
  default: fallback,
  parseHTML: (element) => element.getAttribute(name) ?? fallback,
})

const idAttr = (name) => ({
  default: null,
  parseHTML: (element) => {
    const value = element.getAttribute(name)
    return value == null ? null : Number(value)
  },
})

function entityAttributes() {
  return {
    entityType: stringAttr('entityType'),
    entityId: idAttr('entityId'),
    title: stringAttr('title', ''),
    subtitle: stringAttr('subtitle'),
    thumbnailUrl: stringAttr('thumbnailUrl'),
    // 트랙 멘션 전용 — 트랙이 속한 앨범(ReleaseGroup) id. 앨범 상세 페이지로의 딥링크에 쓰인다
    releaseGroupId: idAttr('releaseGroupId'),
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
