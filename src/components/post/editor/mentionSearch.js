import { searchMentions as apiSearchMentions } from '@/services/postApi'

export const MENTION_TYPE_OPTIONS = [
  { stage: 'type', type: 'CONCERT', label: '공연' },
  { stage: 'type', type: 'ARTIST', label: '아티스트' },
  { stage: 'type', type: 'RELEASE', label: '음악' },
]

// 즉시 실행되는 서식 커맨드 — 엔티티 타입과 달리 검색 단계로 넘어가지 않고
// 선택과 동시에 블록 서식을 적용한다
export const FORMAT_OPTIONS = [
  { stage: 'format', format: 'heading1', label: '제목 1', icon: 'H1' },
  { stage: 'format', format: 'heading2', label: '제목 2', icon: 'H2' },
  { stage: 'format', format: 'heading3', label: '제목 3', icon: 'H3' },
  { stage: 'format', format: 'bulletList', label: '글머리 기호 목록', icon: '•' },
  { stage: 'format', format: 'orderedList', label: '번호 매기기 목록', icon: '1.' },
  { stage: 'format', format: 'blockquote', label: '인용', icon: '"' },
]

const TYPE_LABEL_TO_TYPE = { 공연: 'CONCERT', 아티스트: 'ARTIST', 음악: 'RELEASE' }

// '/공연 vaundy' 형태의 슬래시 커맨드 쿼리를 단계별로 해석한다
// 1단계(type): 타입/서식 선택 전 — 입력값으로 목록을 좁혀 보여준다
// 2단계(search): '{엔티티 타입} ' 뒤로 검색어를 입력하면 해당 타입 내에서 검색한다
export function parseSlashQuery(query) {
  const spaceIdx = query.indexOf(' ')
  if (spaceIdx === -1) return { stage: 'type', typeQuery: query }

  const typeToken = query.slice(0, spaceIdx)
  const type = TYPE_LABEL_TO_TYPE[typeToken]
  if (!type) return { stage: 'type', typeQuery: query }

  return { stage: 'search', type, searchTerm: query.slice(spaceIdx + 1) }
}

export function filterTypeOptions(typeQuery) {
  const options = [...FORMAT_OPTIONS, ...MENTION_TYPE_OPTIONS]
  if (!typeQuery) return options
  return options.filter((o) => o.label.includes(typeQuery))
}

const MENTION_SEARCH_LIMIT = 10

export async function searchMentions(type, term) {
  const q = term.trim()
  if (!q) return []
  const results = await apiSearchMentions({ type, q, limit: MENTION_SEARCH_LIMIT })
  return results.map((item) => ({ stage: 'search', ...item }))
}
