import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios, { AxiosError } from 'axios'
import api, { refreshAccessToken } from './api'
import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

function mockRefreshSuccess(accessToken = 'new-token') {
  return vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken } })
}

function unauthorized(config) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
    status: 401, data: {}, headers: {}, config,
  })
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  delete navigator.locks
})

describe('refreshAccessToken', () => {
  it('성공하면 새 Access Token을 반환하고 스토어에 저장', async () => {
    mockRefreshSuccess('new-token')

    const token = await refreshAccessToken()

    expect(token).toBe('new-token')
    expect(useAuthStore.getState().accessToken).toBe('new-token')
    expect(localStorage.getItem(SESSION_HINT)).toBe('1')
  })

  it('동시에 여러 번 호출하면 refresh 요청은 한 번만 보냄', async () => {
    const post = mockRefreshSuccess()

    const tokens = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()])

    expect(post).toHaveBeenCalledTimes(1)
    expect(tokens).toEqual(['new-token', 'new-token', 'new-token'])
  })

  it('앞선 요청이 끝난 뒤 호출하면 새로 요청', async () => {
    const post = mockRefreshSuccess()

    await refreshAccessToken()
    await refreshAccessToken()

    expect(post).toHaveBeenCalledTimes(2)
  })

  it('실패하면 호출한 쪽으로 에러 전달', async () => {
    const error = new Error('refresh failed')
    vi.spyOn(axios, 'post').mockRejectedValue(error)

    await expect(refreshAccessToken()).rejects.toBe(error)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('Web Locks를 지원하면 lock 안에서 요청', async () => {
    const post = mockRefreshSuccess()
    const request = vi.fn((_name, callback) => callback())
    navigator.locks = { request }

    await refreshAccessToken()

    expect(request).toHaveBeenCalledWith('coming-auth-refresh', expect.any(Function))
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('다른 탭이 lock을 잡고 있으면 풀릴 때까지 요청하지 않음', async () => {
    const post = mockRefreshSuccess()
    let releaseLock
    const lockReleased = new Promise((resolve) => { releaseLock = resolve })
    navigator.locks = { request: (_name, callback) => lockReleased.then(callback) }

    const pending = refreshAccessToken()
    await Promise.resolve()
    expect(post).not.toHaveBeenCalled()

    releaseLock()
    await pending

    expect(post).toHaveBeenCalledTimes(1)
  })

  it('refresh 응답이 오기 전까지 lock을 놓지 않음', async () => {
    let resolvePost
    vi.spyOn(axios, 'post').mockReturnValue(new Promise((resolve) => { resolvePost = resolve }))
    let lockHeld = false
    navigator.locks = {
      request: async (_name, callback) => {
        lockHeld = true
        try {
          return await callback()
        } finally {
          lockHeld = false
        }
      },
    }

    const pending = refreshAccessToken()
    await Promise.resolve()
    expect(lockHeld).toBe(true)

    resolvePost({ data: { accessToken: 'new-token' } })
    await pending

    expect(lockHeld).toBe(false)
  })

  it('refresh 요청에 제한 시간을 설정', async () => {
    const post = mockRefreshSuccess()

    await refreshAccessToken()

    expect(post).toHaveBeenCalledWith('/api/auth/refresh', null, expect.objectContaining({ timeout: expect.any(Number) }))
  })
})

describe('api 401 응답 처리', () => {
  it('401이면 refresh 후 새 토큰으로 원래 요청 재시도', async () => {
    mockRefreshSuccess('new-token')
    useAuthStore.setState({ accessToken: 'expired-token' })
    const adapter = vi.fn()
      .mockImplementationOnce((config) => Promise.reject(unauthorized(config)))
      .mockImplementationOnce((config) => Promise.resolve({ status: 200, data: { ok: true }, headers: {}, config }))

    const response = await api.get('/auth/me', { adapter })

    expect(response.data).toEqual({ ok: true })
    expect(adapter).toHaveBeenCalledTimes(2)
    expect(adapter.mock.calls[1][0].headers.Authorization).toBe('Bearer new-token')
  })

  it('refresh가 실패하면 로그아웃 처리 후 로그인 모달 오픈', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'))
    useAuthStore.setState({ user: { id: 1, nickname: '테스트유저' }, accessToken: 'expired-token' })
    localStorage.setItem(SESSION_HINT, '1')
    const adapter = (config) => Promise.reject(unauthorized(config))

    await expect(api.get('/auth/me', { adapter })).rejects.toThrow('refresh failed')

    expect(useAuthStore.getState().user).toBeNull()
    expect(localStorage.getItem(SESSION_HINT)).toBeNull()
    expect(useLoginModalStore.getState().isOpen).toBe(true)
  })

  it('재시도한 요청도 401이면 다시 refresh하지 않음', async () => {
    const post = mockRefreshSuccess()
    const adapter = (config) => Promise.reject(unauthorized(config))

    await expect(api.get('/auth/me', { adapter })).rejects.toBeInstanceOf(AxiosError)

    expect(post).toHaveBeenCalledTimes(1)
  })
})
