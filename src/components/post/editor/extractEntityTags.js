// Tiptap JSON 트리를 순회해 본문에 삽입된 entityMentionCard·entityMentionChip
// 노드들을 entityTags 형태({entityType, entityId})로 추출한다 (중복 제거)
export function extractEntityTags(contentJson) {
  const tags = []
  const seen = new Set()

  function walk(node) {
    if (!node) return

    if (node.type === 'entityMentionCard' || node.type === 'entityMentionChip') {
      const { entityType, entityId, title } = node.attrs ?? {}
      const key = `${entityType}:${entityId}`
      if (entityType && entityId != null && !seen.has(key)) {
        seen.add(key)
        tags.push({ entityType, entityId, title })
      }
    }

    node.content?.forEach(walk)
  }

  walk(contentJson)
  return tags
}
