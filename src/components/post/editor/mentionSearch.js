import { searchMentions as apiSearchMentions } from '@/services/postApi'
import { POST_ENTITY_TAG_MAX_COUNT } from '@/constants/post'
import { entityTagKey } from './extractEntityTags'

// '/' 메뉴의 서식 커맨드 — 선택과 동시에 블록 서식을 적용한다
// 라벨은 앱 툴바와 같고, shortcut은 같은 결과를 내는 단축 입력이다
export const FORMAT_OPTIONS = [
  { format: 'heading2', label: '큰 소제목', icon: 'H2', shortcut: '#' },
  { format: 'heading3', label: '작은 소제목', icon: 'H3', shortcut: '##' },
  { format: 'bulletList', label: '글머리 목록', icon: '•', shortcut: '-' },
  { format: 'orderedList', label: '번호 목록', icon: '1.', shortcut: '1.' },
  { format: 'blockquote', label: '인용', icon: '"', shortcut: '>' },
]

export function filterFormatOptions(query) {
  if (!query) return FORMAT_OPTIONS
  return FORMAT_OPTIONS.filter((o) => o.label.includes(query))
}

// 후보 정렬의 동순위 순서이자 '더 찾기' 탭 순서
export const MENTION_TYPES = ['CONCERT', 'ARTIST', 'RELEASE', 'TRACK']

const MENTION_SEARCH_LIMIT = 20
const TAG_QUERY_MAX_LENGTH = 30
const SUGGESTION_COUNT = 5

// '@검색어'의 검색어가 검색할 만한지 (앱 PostEditorText.tagQuery()와 같은 규칙)
// 한 글자 이상, 첫 글자는 공백이 아님, 공백 두 칸이 들어가면 끝난 것으로 봄, 30자까지
export function isTagQuery(query) {
  return (
    query.length > 0 &&
    query.length <= TAG_QUERY_MAX_LENGTH &&
    !/^\s/.test(query) &&
    !query.includes('  ')
  )
}

// items 배열에 hasMore를 얹어 반환한다 — 페이지 메타는 배열의 부가 속성으로 실어 무한 스크롤에 전달한다
export async function searchMentions(type, term, page = 0) {
  const q = term.trim()
  if (!q) return []
  const { content, totalPages } = await apiSearchMentions({ type, q, limit: MENTION_SEARCH_LIMIT, page })
  // 응답 배열을 건드리지 않게 복사본에 얹는다
  return Object.assign([...content], { hasMore: page + 1 < totalPages })
}

// 언급이 한도만큼 차 있으면 이미 넣은 엔티티만 후보로 남긴다.
// 남은 게 없는데 원래 후보가 있었다면 limitReached로 한도 안내를 띄우게 한다
export function applyTagLimit(results, tags) {
  if (tags.length < POST_ENTITY_TAG_MAX_COUNT) return { results, limitReached: false }
  const tagged = new Set(tags.map((t) => entityTagKey(t.entityType, t.entityId)))
  const usable = results.filter((r) => tagged.has(entityTagKey(r.type, r.id)))
  return { results: usable, limitReached: usable.length === 0 && results.length > 0 }
}

// '@검색어' 후보 — 네 종류를 따로 불러 합친다 (통합 검색 API가 생기면 한 번으로 바꾼다).
// 이름이 검색어로 시작하는 것을 먼저, 같으면 공연·아티스트·음악·트랙 순서로 5개까지.
// 일부 종류만 실패하면 성공한 것만 보여 주고, 모두 실패했을 때만 failed로 알린다
export async function searchTagSuggestions(query, tags) {
  const q = query.trim()
  const settled = await Promise.allSettled(
    MENTION_TYPES.map((type) => apiSearchMentions({ type, q, limit: SUGGESTION_COUNT, page: 0 })),
  )
  if (settled.every((s) => s.status === 'rejected')) {
    return Object.assign([], { failed: true, limitReached: false })
  }

  const lower = q.toLowerCase()
  const found = settled.flatMap((s) => (s.status === 'fulfilled' ? s.value.content : []))
  // sort는 안정 정렬이라 같은 순위 안에서는 MENTION_TYPES 순서가 유지된다
  const ranked = found.sort(
    (a, b) => Number(!a.title.toLowerCase().startsWith(lower)) - Number(!b.title.toLowerCase().startsWith(lower)),
  )
  const { results, limitReached } = applyTagLimit(ranked, tags)
  return Object.assign(results.slice(0, SUGGESTION_COUNT), { failed: false, limitReached })
}
