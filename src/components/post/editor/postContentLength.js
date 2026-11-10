import { POST_CONTENT_JSON_MAX_LENGTH } from '@/constants/post'

// 본문 글자 수 — BE TiptapTextExtractor와 같은 계산식 (spec/client/post-content.md 길이 제한)
// - text 노드의 글자만 이어 붙이고 마크는 무시한다
// - text가 아닌 노드는 자식을 다 돈 뒤 글자가 늘었으면 공백 1자를 붙인다 (겹친 블록마다 각각)
// - hardBreak·언급 카드·빈 문단처럼 text 자손이 없으면 0자
// - 마지막에 trim한 길이(UTF-16 코드 유닛)를 센다
export function countPostContentLength(contentJson) {
  let text = ''

  function walk(node) {
    if (node.type === 'text') {
      text += node.text ?? ''
      return
    }
    const before = text.length
    node.content?.forEach(walk)
    if (text.length > before) text += ' '
  }

  if (contentJson) walk(contentJson)
  return text.trim().length
}

// BE는 content JSON 직렬화 길이도 따로 제한한다 (언급 카드 attrs가 많으면 글자 수보다 먼저 걸린다)
export function isContentJsonTooLong(contentJson) {
  return JSON.stringify(contentJson ?? null).length > POST_CONTENT_JSON_MAX_LENGTH
}
