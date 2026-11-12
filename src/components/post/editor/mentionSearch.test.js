import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchMentions as apiSearchMentions } from '@/services/postApi'
import { POST_ENTITY_TAG_MAX_COUNT } from '@/constants/post'
import {
  FORMAT_OPTIONS,
  applyTagLimit,
  filterFormatOptions,
  isTagQuery,
  searchMentions,
  searchTagSuggestions,
} from './mentionSearch'

vi.mock('@/services/postApi', () => ({
  searchMentions: vi.fn(),
}))

const makeTags = (count) =>
  Array.from({ length: count }, (_, i) => ({ entityType: 'ARTIST', entityId: i + 1 }))

beforeEach(() => {
  apiSearchMentions.mockReset()
})

describe('filterFormatOptions', () => {
  it('빈 쿼리면 서식 5개 전부 반환', () => {
    expect(filterFormatOptions('')).toHaveLength(5)
  })

  it('쿼리가 있으면 label에 포함된 서식만 반환', () => {
    const result = filterFormatOptions('소제목')

    expect(result.map((o) => o.format)).toEqual(['heading2', 'heading3'])
  })

  it('일치하는 label이 없으면 빈 배열', () => {
    expect(filterFormatOptions('표')).toEqual([])
  })

  it('전체 목록은 FORMAT_OPTIONS와 같음', () => {
    expect(filterFormatOptions('')).toBe(FORMAT_OPTIONS)
  })
})

describe('isTagQuery', () => {
  it.each([
    ['한 글자', 'Y', true],
    ['일반 검색어', 'YOASOBI', true],
    ['공백 한 칸 포함', 'Kenshi Yonezu', true],
    ['30자', 'a'.repeat(30), true],
    ['31자', 'a'.repeat(31), false],
    ['빈 문자열', '', false],
    ['첫 글자 공백', ' YOASOBI', false],
    ['공백 두 칸 포함', 'YOA  SOBI', false],
  ])('%s이면 %s', (_, query, expected) => {
    expect(isTagQuery(query)).toBe(expected)
  })
})

describe('searchMentions', () => {
  it('공백만 있는 검색어면 API 호출 없이 빈 배열', async () => {
    const result = await searchMentions('ARTIST', '   ')

    expect([...result]).toEqual([])
    expect(apiSearchMentions).not.toHaveBeenCalled()
  })

  it('다듬은 검색어와 limit 20, page로 API 호출', async () => {
    apiSearchMentions.mockResolvedValue({ content: [], totalPages: 0 })

    await searchMentions('ARTIST', ' YOASOBI ', 2)

    expect(apiSearchMentions).toHaveBeenCalledWith({ type: 'ARTIST', q: 'YOASOBI', limit: 20, page: 2 })
  })

  it('다음 페이지가 있으면 hasMore true', async () => {
    const content = [{ type: 'ARTIST', id: 1, title: 'YOASOBI' }]
    apiSearchMentions.mockResolvedValue({ content, totalPages: 2 })

    const result = await searchMentions('ARTIST', 'YOASOBI', 0)

    expect([...result]).toEqual(content)
    expect(result.hasMore).toBe(true)
  })

  it('마지막 페이지면 hasMore false', async () => {
    apiSearchMentions.mockResolvedValue({ content: [], totalPages: 2 })

    const result = await searchMentions('ARTIST', 'YOASOBI', 1)

    expect(result.hasMore).toBe(false)
  })
})

describe('applyTagLimit', () => {
  const results = [
    { type: 'ARTIST', id: 1, title: 'YOASOBI' },
    { type: 'CONCERT', id: 1, title: 'YOASOBI ASIA TOUR' },
  ]

  it('태그가 한도 미만이면 결과를 그대로 반환', () => {
    const tags = makeTags(POST_ENTITY_TAG_MAX_COUNT - 1)

    expect(applyTagLimit(results, tags)).toEqual({ results, limitReached: false })
  })

  it('태그가 한도에 도달하면 이미 태그된 결과만 반환', () => {
    const tags = makeTags(POST_ENTITY_TAG_MAX_COUNT)

    expect(applyTagLimit(results, tags)).toEqual({ results: [results[0]], limitReached: false })
  })

  it('한도에 도달했고 남은 결과가 없으면 limitReached true', () => {
    const tags = makeTags(POST_ENTITY_TAG_MAX_COUNT)

    expect(applyTagLimit([results[1]], tags)).toEqual({ results: [], limitReached: true })
  })

  it('한도에 도달했어도 원래 결과가 없으면 limitReached false', () => {
    const tags = makeTags(POST_ENTITY_TAG_MAX_COUNT)

    expect(applyTagLimit([], tags)).toEqual({ results: [], limitReached: false })
  })
})

describe('searchTagSuggestions', () => {
  const byType = (map) => ({ type }) =>
    map[type] instanceof Error ? Promise.reject(map[type]) : Promise.resolve({ content: map[type] ?? [] })

  it('네 종류를 limit 5, page 0으로 각각 호출', async () => {
    apiSearchMentions.mockResolvedValue({ content: [] })

    await searchTagSuggestions(' YOASOBI ', [])

    for (const type of ['CONCERT', 'ARTIST', 'RELEASE', 'TRACK']) {
      expect(apiSearchMentions).toHaveBeenCalledWith({ type, q: 'YOASOBI', limit: 5, page: 0 })
    }
  })

  it('검색어로 시작하는 제목을 대소문자 무시하고 먼저 정렬하고 동순위는 종류 순서 유지', async () => {
    apiSearchMentions.mockImplementation(
      byType({
        CONCERT: [{ type: 'CONCERT', id: 1, title: 'Live YOASOBI' }],
        ARTIST: [{ type: 'ARTIST', id: 1, title: 'yoasobi' }],
        RELEASE: [{ type: 'RELEASE', id: 1, title: 'THE BOOK' }],
        TRACK: [{ type: 'TRACK', id: 1, title: 'YOASOBI Idol' }],
      }),
    )

    const result = await searchTagSuggestions('Yoasobi', [])

    expect(result.map((r) => r.type)).toEqual(['ARTIST', 'TRACK', 'CONCERT', 'RELEASE'])
  })

  it('제목이 null인 후보가 있어도 예외 없이 뒤로 정렬', async () => {
    apiSearchMentions.mockImplementation(
      byType({
        CONCERT: [{ type: 'CONCERT', id: 1, title: null }],
        ARTIST: [{ type: 'ARTIST', id: 1, title: 'YOASOBI' }],
      }),
    )

    const result = await searchTagSuggestions('YOASOBI', [])

    expect(result.map((r) => r.type)).toEqual(['ARTIST', 'CONCERT'])
  })

  it('결과가 5개를 넘으면 5개까지만 반환', async () => {
    apiSearchMentions.mockImplementation(({ type }) =>
      Promise.resolve({ content: [1, 2].map((id) => ({ type, id, title: `YOASOBI ${id}` })) }),
    )

    const result = await searchTagSuggestions('YOASOBI', [])

    expect(result).toHaveLength(5)
  })

  it('일부 종류만 실패하면 성공한 결과만 반환하고 failed false', async () => {
    apiSearchMentions.mockImplementation(
      byType({
        CONCERT: new Error('fail'),
        ARTIST: [{ type: 'ARTIST', id: 1, title: 'YOASOBI' }],
        RELEASE: new Error('fail'),
        TRACK: new Error('fail'),
      }),
    )

    const result = await searchTagSuggestions('YOASOBI', [])

    expect([...result]).toEqual([{ type: 'ARTIST', id: 1, title: 'YOASOBI' }])
    expect(result.failed).toBe(false)
  })

  it('모든 종류가 실패하면 빈 배열과 failed true', async () => {
    apiSearchMentions.mockRejectedValue(new Error('fail'))

    const result = await searchTagSuggestions('YOASOBI', [])

    expect([...result]).toEqual([])
    expect(result.failed).toBe(true)
  })

  it('태그 한도에 도달해 남은 후보가 없으면 limitReached true', async () => {
    apiSearchMentions.mockImplementation(
      byType({ CONCERT: [{ type: 'CONCERT', id: 99, title: 'YOASOBI ASIA TOUR' }] }),
    )

    const result = await searchTagSuggestions('YOASOBI', makeTags(POST_ENTITY_TAG_MAX_COUNT))

    expect([...result]).toEqual([])
    expect(result.limitReached).toBe(true)
  })
})
