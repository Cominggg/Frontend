import { beforeEach, describe, expect, it } from 'vitest'
import useLoginModalStore from './loginModalStore'

beforeEach(() => {
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
})

describe('useLoginModalStore', () => {
  describe('open', () => {
    it('호출하면 모달이 열림', () => {
      useLoginModalStore.getState().open('/concerts/1')

      expect(useLoginModalStore.getState().isOpen).toBe(true)
    })

    it.each([
      ['/concerts/1?tab=setlist', '/concerts/1?tab=setlist'],
      ['/artists/1', '/artists/1'],
      ['/concerts/1?tab=setlist#reviews', '/concerts/1?tab=setlist'],
    ])('같은 origin 상대 경로 %s이면 %s 저장', (input, expected) => {
      useLoginModalStore.getState().open(input)

      expect(useLoginModalStore.getState().redirectUri).toBe(expected)
    })

    it('같은 origin 절대 URL이면 pathname과 search만 저장', () => {
      const uri = `${window.location.origin}/artists/1?sort=latest#top`

      useLoginModalStore.getState().open(uri)

      expect(useLoginModalStore.getState().redirectUri).toBe('/artists/1?sort=latest')
    })

    it.each([
      ['https://evil.example.com/concerts/1'],
      ['//evil.example.com/concerts/1'],
      ['javascript:alert(1)'],
    ])('외부 origin %s이면 redirectUri는 null', (input) => {
      useLoginModalStore.getState().open(input)

      expect(useLoginModalStore.getState().redirectUri).toBeNull()
    })

    it('URL로 해석할 수 없는 값이면 redirectUri는 null', () => {
      useLoginModalStore.getState().open('http://[invalid')

      expect(useLoginModalStore.getState().redirectUri).toBeNull()
    })

    it.each([[''], [null], [undefined]])('빈 값 %s이면 redirectUri는 null', (input) => {
      useLoginModalStore.getState().open(input)

      expect(useLoginModalStore.getState().redirectUri).toBeNull()
    })

    it('다시 호출하면 이전 redirectUri를 덮어씀', () => {
      useLoginModalStore.getState().open('/concerts/1')

      useLoginModalStore.getState().open('https://evil.example.com/')

      expect(useLoginModalStore.getState().redirectUri).toBeNull()
    })
  })

  describe('close', () => {
    it('호출하면 모달이 닫히고 redirectUri 초기화', () => {
      useLoginModalStore.getState().open('/concerts/1')

      useLoginModalStore.getState().close()

      expect(useLoginModalStore.getState()).toMatchObject({ isOpen: false, redirectUri: null })
    })
  })
})
