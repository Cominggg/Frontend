import { describe, expect, it } from 'vitest'
import { toKopisHttpsUrl } from './kopis'

describe('toKopisHttpsUrl', () => {
  it('http://www.kopis.or.kr 주소면 https://kopis.or.kr로 치환', () => {
    expect(toKopisHttpsUrl('http://www.kopis.or.kr/upload/pfmPoster/PF_PF123456_260801_123456.jpg'))
      .toBe('https://kopis.or.kr/upload/pfmPoster/PF_PF123456_260801_123456.jpg')
  })

  it('www가 없는 http://kopis.or.kr 주소면 https://kopis.or.kr로 치환', () => {
    expect(toKopisHttpsUrl('http://kopis.or.kr/upload/pfmIntroImage/PF_PF123456_260801_0123456.jpg'))
      .toBe('https://kopis.or.kr/upload/pfmIntroImage/PF_PF123456_260801_0123456.jpg')
  })

  it('쿼리 문자열이 있으면 경로와 쿼리를 보존', () => {
    expect(toKopisHttpsUrl('http://www.kopis.or.kr/upload/pfmPoster/poster.gif?v=2&size=large'))
      .toBe('https://kopis.or.kr/upload/pfmPoster/poster.gif?v=2&size=large')
  })

  it.each([
    'https://kopis.or.kr/upload/pfmPoster/poster.jpg',
    'https://www.kopis.or.kr/upload/pfmPoster/poster.jpg',
  ])('이미 https인 KOPIS 주소 %s면 그대로 반환', (url) => {
    expect(toKopisHttpsUrl(url)).toBe(url)
  })

  it.each([
    'http://example.com/posters/yoasobi.jpg',
    'https://example.com/posters/yoasobi.jpg',
    'http://example.com/http://www.kopis.or.kr/upload/poster.jpg',
    'http://cdn.example.com/kopis.or.kr/upload/poster.jpg',
  ])('KOPIS가 아닌 출처 %s면 그대로 반환', (url) => {
    expect(toKopisHttpsUrl(url)).toBe(url)
  })

  it.each([null, undefined])('URL이 %j이면 undefined', (url) => {
    expect(toKopisHttpsUrl(url)).toBeUndefined()
  })

  it('URL이 빈 문자열이면 빈 문자열', () => {
    expect(toKopisHttpsUrl('')).toBe('')
  })
})
