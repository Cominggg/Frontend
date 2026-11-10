// Tiptap JSON 트리를 순회해 본문에 삽입된 entityMentionCard 노드들을
// 본문 순서대로 추출한다 (중복 제거). 요청에는 보내지 않고 태그 표시·10개 초과 안내·대표 공연 후보에 쓴다
export function extractEntityTags(contentJson) {
  const tags = []
  const seen = new Set()

  function walk(node) {
    if (!node) return

    if (node.type === 'entityMentionCard') {
      const { entityType, entityId, title, thumbnailUrl } = node.attrs ?? {}
      const key = `${entityType}:${entityId}`
      if (entityType && entityId != null && !seen.has(key)) {
        seen.add(key)
        tags.push({ entityType, entityId, title, thumbnailUrl })
      }
    }

    node.content?.forEach(walk)
  }

  walk(contentJson)
  return tags
}

// 본문에 텍스트나 엔티티 멘션이 하나도 없는 완전히 빈 문서인지 확인한다
// (BE가 빈 content를 거부하므로, 제출 전 프론트에서 먼저 막아 안내한다)
export function isContentEmpty(contentJson) {
  let hasContent = false

  function walk(node) {
    if (!node || hasContent) return

    if (node.type === 'text' && node.text?.trim()) {
      hasContent = true
      return
    }
    if (node.type === 'entityMentionCard') {
      hasContent = true
      return
    }

    node.content?.forEach(walk)
  }

  walk(contentJson)
  return !hasContent
}
