import { describe, expect, it } from 'vitest'
import { POST_CONTENT_JSON_MAX_LENGTH, POST_CONTENT_MAX_LENGTH } from '@/constants/post'
import { countPostContentLength, isContentJsonTooLong } from './postContentLength'

const text = (value, marks) => (marks ? { type: 'text', text: value, marks } : { type: 'text', text: value })
const br = () => ({ type: 'hardBreak' })
const p = (...children) => ({
  type: 'paragraph',
  ...(children.length > 0 && {
    content: children.map((child) => (typeof child === 'string' ? text(child) : child)),
  }),
})
const h = (level, value) => ({ type: 'heading', attrs: { level }, content: [text(value)] })
const bq = (...content) => ({ type: 'blockquote', content })
const li = (...content) => ({ type: 'listItem', content })
const ul = (...content) => ({ type: 'bulletList', content })
const ol = (...content) => ({ type: 'orderedList', attrs: { start: 1 }, content })
const card = () => ({
  type: 'entityMentionCard',
  attrs: { entityType: 'ARTIST', entityId: 1, title: 'YOASOBI', subtitle: null, thumbnailUrl: null, releaseGroupId: null },
})
const doc = (...content) => ({ type: 'doc', content })

describe('countPostContentLength', () => {
  it.each([
    ['N1', doc(p('a')), 1],
    ['N2', doc(p('a'), p('b')), 3],
    ['N3', doc(bq(p('a')), p('b')), 4],
    ['N4', doc(ul(li(p('a'))), p('b')), 5],
    ['N5', doc(ul(li(p('a')), li(p('b')))), 4],
    ['N6', doc(ol(li(p('a')), li(p('b'))), p('c')), 8],
    ['N7', doc(h(2, 'ab'), p('c')), 4],
    ['N8', doc(p('a', br(), 'b')), 2],
    ['N9', doc(p('a'), card(), p('b')), 3],
    ['N10', doc(card()), 0],
    ['N11', doc(p('a'), p(), p('b')), 3],
    ['N12', doc(p('ab', text('c', [{ type: 'bold' }]))), 3],
    ['N13', doc(p('  a  b  ')), 4],
    ['N14', doc(p('😀')), 2],
  ])('%s: 글자 수 계산', (_id, content, expected) => {
    expect(countPostContentLength(content)).toBe(expected)
  })

  it.each([
    ['B1', doc(p('가'.repeat(9999))), 9999, false],
    ['B2', doc(p('가'.repeat(10000))), 10000, false],
    ['B3', doc(p('가'.repeat(10001))), 10001, true],
    ['B4', doc(bq(p('가'.repeat(9997))), p('나')), 10000, false],
    ['B5', doc(bq(p('가'.repeat(9998))), p('나')), 10001, true],
    ['B6', doc(ul(li(p('가'.repeat(9996)))), p('나')), 10000, false],
    ['B7', doc(ul(li(p('가'.repeat(9997)))), p('나')), 10001, true],
  ])('%s: 글자 수 %i, 최대 길이 초과 %s', (_id, content, expected, rejected) => {
    const length = countPostContentLength(content)

    expect(length).toBe(expected)
    expect(length > POST_CONTENT_MAX_LENGTH).toBe(rejected)
  })

  it('null이면 0', () => {
    expect(countPostContentLength(null)).toBe(0)
  })
})

describe('isContentJsonTooLong', () => {
  // 직렬화 길이가 정확히 length가 되는 문서
  function docWithSerializedLength(length) {
    const overhead = JSON.stringify(doc(p(''))).length
    const content = doc(p('a'.repeat(length - overhead)))
    expect(JSON.stringify(content)).toHaveLength(length)
    return content
  }

  it('직렬화 길이가 정확히 최대값이면 false', () => {
    expect(isContentJsonTooLong(docWithSerializedLength(POST_CONTENT_JSON_MAX_LENGTH))).toBe(false)
  })

  it('직렬화 길이가 최대값보다 1 길면 true', () => {
    expect(isContentJsonTooLong(docWithSerializedLength(POST_CONTENT_JSON_MAX_LENGTH + 1))).toBe(true)
  })

  it('일반 문서면 false', () => {
    expect(isContentJsonTooLong(doc(h(2, '공연 후기'), p('YOASOBI 내한 공연'), card()))).toBe(false)
  })
})
