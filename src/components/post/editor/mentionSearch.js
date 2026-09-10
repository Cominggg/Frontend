import { searchMentions as apiSearchMentions } from '@/services/postApi'

export const MENTION_TYPE_OPTIONS = [
  { stage: 'type', type: 'CONCERT', label: '공연' },
  { stage: 'type', type: 'ARTIST', label: '아티스트' },
  { stage: 'type', type: 'RELEASE', label: '음악' },
]

const TYPE_LABEL_TO_TYPE = { 공연: 'CONCERT', 아티스트: 'ARTIST', 음악: 'RELEASE' }

// '/공연 vaundy' 형태의 슬래시 커맨드 쿼리를 단계별로 해석한다
// 1단계(type): 타입 선택 전 — 입력값으로 타입 목록을 좁혀 보여준다
// 2단계(search): '{타입} ' 뒤로 검색어를 입력하면 해당 타입 내에서 검색한다
export function parseSlashQuery(query) {
  const spaceIdx = query.indexOf(' ')
  if (spaceIdx === -1) return { stage: 'type', typeQuery: query }

  const typeToken = query.slice(0, spaceIdx)
  const type = TYPE_LABEL_TO_TYPE[typeToken]
  if (!type) return { stage: 'type', typeQuery: query }

  return { stage: 'search', type, searchTerm: query.slice(spaceIdx + 1) }
}

export function filterTypeOptions(typeQuery) {
  if (!typeQuery) return MENTION_TYPE_OPTIONS
  return MENTION_TYPE_OPTIONS.filter((o) => o.label.includes(typeQuery))
}

export async function searchMentions(type, term) {
  const q = term.trim()
  if (!q) return []
  const results = await apiSearchMentions({ type, q })
  return results.map((item) => ({ stage: 'search', ...item }))
}
