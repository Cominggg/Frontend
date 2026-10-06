import { beforeEach, describe, expect, it } from 'vitest'
import useAuthStore, { SESSION_HINT } from './authStore'

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  localStorage.clear()
})

describe('useAuthStore', () => {
  it('초기 상태이면 user·accessToken은 null, isInitialized는 false', () => {
    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      accessToken: null,
      isInitialized: false,
    })
  })

  describe('setUser', () => {
    it('호출하면 user 저장', () => {
      const user = { id: 1, nickname: '테스트유저' }

      useAuthStore.getState().setUser(user)

      expect(useAuthStore.getState().user).toEqual(user)
    })
  })

  describe('setAccessToken', () => {
    it('호출하면 accessToken 저장', () => {
      useAuthStore.getState().setAccessToken('token')

      expect(useAuthStore.getState().accessToken).toBe('token')
    })

    it('호출하면 localStorage에 SESSION_HINT를 1로 기록', () => {
      useAuthStore.getState().setAccessToken('token')

      expect(localStorage.getItem(SESSION_HINT)).toBe('1')
    })
  })

  describe('setInitialized', () => {
    it('호출하면 isInitialized가 true', () => {
      useAuthStore.getState().setInitialized()

      expect(useAuthStore.getState().isInitialized).toBe(true)
    })
  })

  describe('clearUser', () => {
    beforeEach(() => {
      useAuthStore.getState().setUser({ id: 1, nickname: '테스트유저' })
      useAuthStore.getState().setAccessToken('token')
      useAuthStore.getState().setInitialized()
    })

    it('호출하면 user·accessToken이 null로 초기화', () => {
      useAuthStore.getState().clearUser()

      expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null })
    })

    it('호출하면 localStorage에서 SESSION_HINT 제거', () => {
      useAuthStore.getState().clearUser()

      expect(localStorage.getItem(SESSION_HINT)).toBeNull()
    })

    it('호출해도 isInitialized는 true로 유지', () => {
      useAuthStore.getState().clearUser()

      expect(useAuthStore.getState().isInitialized).toBe(true)
    })
  })
})
