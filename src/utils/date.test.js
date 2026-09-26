import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatDate, formatDateTime, formatRelativeDate, isSameDay } from './date'

describe('isSameDay', () => {
  it('시각이 달라도 같은 날짜면 true', () => {
    expect(isSameDay(new Date(2026, 8, 26, 1), new Date(2026, 8, 26, 23))).toBe(true)
  })

  it('날짜가 다르면 false', () => {
    expect(isSameDay(new Date(2026, 8, 26), new Date(2026, 8, 27))).toBe(false)
  })
})

describe('formatDate', () => {
  it('YYYY-MM-DD를 YYYY.MM.DD로 변환', () => {
    expect(formatDate('2026-09-26')).toBe('2026.09.26')
  })

  it('빈 값이면 빈 문자열', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('formatDateTime', () => {
  it('ISO datetime을 YYYY.MM.DD HH:mm로 변환', () => {
    expect(formatDateTime('2026-09-26T19:30:00')).toBe('2026.09.26 19:30')
  })

  it('시간 부분이 없으면 날짜만 반환', () => {
    expect(formatDateTime('2026-09-26')).toBe('2026.09.26')
  })
})

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-26T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    ['2026-09-26T09:00:00', '오늘'],
    ['2026-09-25T12:00:00', '어제'],
    ['2026-09-23T12:00:00', '3일 전'],
    ['2026-09-12T12:00:00', '2주 전'],
    ['2026-07-28T12:00:00', '2개월 전'],
  ])('%s → %s', (input, expected) => {
    expect(formatRelativeDate(input)).toBe(expected)
  })
})
