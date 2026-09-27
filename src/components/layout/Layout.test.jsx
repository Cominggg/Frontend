import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import Layout from './Layout'
import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import { refreshAccessToken } from '@/services/api'
import { getMe } from '@/services/authApi'

vi.mock('@/services/api', () => ({
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/services/authApi', () => ({
  getMe: vi.fn(),
}))

vi.mock('./Header', () => ({ default: () => null }))
vi.mock('./Footer', () => ({ default: () => null }))
vi.mock('@/components/auth/LoginModal', () => ({ default: () => null }))

const USER = { id: 1, nickname: '테스트유저', role: 'USER' }

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  localStorage.clear()
  vi.clearAllMocks()
})

describe('Layout 세션 복원', () => {
  it('SESSION_HINT가 없으면 refresh 없이 초기화 완료', () => {
    render(<Layout />)

    expect(refreshAccessToken).not.toHaveBeenCalled()
    expect(useAuthStore.getState().isInitialized).toBe(true)
  })

  it('SESSION_HINT가 있으면 refresh 후 사용자 정보 복원', async () => {
    localStorage.setItem(SESSION_HINT, '1')
    refreshAccessToken.mockResolvedValue('new-token')
    getMe.mockResolvedValue(USER)

    render(<Layout />)

    await waitFor(() => expect(useAuthStore.getState().isInitialized).toBe(true))
    expect(useAuthStore.getState().user).toEqual(USER)
  })

  it('StrictMode로 렌더링해도 세션 복원은 한 번만 실행', async () => {
    localStorage.setItem(SESSION_HINT, '1')
    refreshAccessToken.mockResolvedValue('new-token')
    getMe.mockResolvedValue(USER)

    render(<StrictMode><Layout /></StrictMode>)

    await waitFor(() => expect(useAuthStore.getState().isInitialized).toBe(true))
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(getMe).toHaveBeenCalledTimes(1)
  })

  it('refresh가 실패하면 SESSION_HINT를 지우고 초기화 완료', async () => {
    localStorage.setItem(SESSION_HINT, '1')
    refreshAccessToken.mockRejectedValue(new Error('refresh failed'))

    render(<Layout />)

    await waitFor(() => expect(useAuthStore.getState().isInitialized).toBe(true))
    expect(localStorage.getItem(SESSION_HINT)).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
