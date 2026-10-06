import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AuthCallbackPage from './AuthCallbackPage'
import useAuthStore from '@/stores/authStore'
import { refreshAccessToken } from '@/services/api'
import { getMe } from '@/services/authApi'
import { trackEvent } from '@/utils/analytics'
import { LOGIN_REDIRECT_KEY } from '@/constants/auth'

vi.mock('@/services/api', () => ({
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/services/authApi', () => ({
  getMe: vi.fn(),
}))

vi.mock('@/utils/analytics', () => ({
  trackEvent: vi.fn(),
}))

const USER = { id: 1, nickname: '테스트유저', role: 'USER' }

function renderCallback(query = '', { strict = false } = {}) {
  const ui = (
    <MemoryRouter initialEntries={[`/auth/callback${query}`]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<p>홈 화면</p>} />
        <Route path="/signup" element={<p>회원가입 화면</p>} />
        <Route path="/me" element={<p>마이페이지 화면</p>} />
      </Routes>
    </MemoryRouter>
  )
  return render(strict ? <StrictMode>{ui}</StrictMode> : ui)
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AuthCallbackPage', () => {
  describe('로그인 성공', () => {
    beforeEach(() => {
      refreshAccessToken.mockResolvedValue('new-token')
      getMe.mockResolvedValue(USER)
    })

    it('콜백에 진입하면 토큰 재발급 후 사용자 정보를 스토어에 저장', async () => {
      renderCallback()

      await screen.findByText('홈 화면')
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
      expect(useAuthStore.getState().user).toEqual(USER)
    })

    it('로그인에 성공하면 login 이벤트 전송', async () => {
      renderCallback()

      await screen.findByText('홈 화면')
      expect(trackEvent).toHaveBeenCalledWith('login')
    })

    it('저장된 redirect 경로가 있으면 해당 경로로 이동하고 저장값 삭제', async () => {
      localStorage.setItem(LOGIN_REDIRECT_KEY, '/me')

      renderCallback()

      expect(await screen.findByText('마이페이지 화면')).toBeInTheDocument()
      expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBeNull()
    })

    it('저장된 redirect 경로가 없으면 홈으로 이동', async () => {
      renderCallback()

      expect(await screen.findByText('홈 화면')).toBeInTheDocument()
    })

    it('redirect 경로가 /로 시작하지 않으면 홈으로 이동', async () => {
      localStorage.setItem(LOGIN_REDIRECT_KEY, 'https://evil.example.com/me')

      renderCallback()

      expect(await screen.findByText('홈 화면')).toBeInTheDocument()
      expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBeNull()
    })

    it('StrictMode로 렌더링해도 콜백 처리는 한 번만 실행', async () => {
      renderCallback('', { strict: true })

      await screen.findByText('홈 화면')
      expect(refreshAccessToken).toHaveBeenCalledTimes(1)
      expect(getMe).toHaveBeenCalledTimes(1)
    })
  })

  describe('신규 회원', () => {
    it('isNewUser=true이면 회원가입 페이지로 이동', async () => {
      refreshAccessToken.mockResolvedValue('new-token')
      getMe.mockResolvedValue(USER)

      renderCallback('?isNewUser=true')

      expect(await screen.findByText('회원가입 화면')).toBeInTheDocument()
    })

    it('사용자 role이 PENDING이면 회원가입 페이지로 이동', async () => {
      refreshAccessToken.mockResolvedValue('new-token')
      getMe.mockResolvedValue({ ...USER, role: 'PENDING' })

      renderCallback()

      expect(await screen.findByText('회원가입 화면')).toBeInTheDocument()
    })

    it('회원가입으로 이동하면 redirect 경로를 회원가입 이후를 위해 유지', async () => {
      localStorage.setItem(LOGIN_REDIRECT_KEY, '/me')
      refreshAccessToken.mockResolvedValue('new-token')
      getMe.mockResolvedValue(USER)

      renderCallback('?isNewUser=true')

      await screen.findByText('회원가입 화면')
      expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBe('/me')
    })
  })

  describe('에러 파라미터', () => {
    it.each([
      ['USER_SUSPENDED', '정지된 계정입니다. 문의하세요.'],
      ['OAUTH2_FAILED', '로그인에 실패했습니다. 다시 시도해 주세요.'],
      ['UNKNOWN_CODE', '알 수 없는 오류가 발생했습니다.'],
    ])('error=%s이면 "%s" 메시지 표시', async (code, message) => {
      renderCallback(`?error=${code}`)

      expect(await screen.findByText(message)).toBeInTheDocument()
    })

    it('error 파라미터가 있으면 토큰 재발급을 시도하지 않음', async () => {
      renderCallback('?error=OAUTH2_FAILED')

      await screen.findByText('로그인에 실패했습니다. 다시 시도해 주세요.')
      expect(refreshAccessToken).not.toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('홈으로 이동 버튼을 클릭하면 홈으로 이동', async () => {
      const user = userEvent.setup()
      renderCallback('?error=USER_SUSPENDED')

      await user.click(await screen.findByRole('button', { name: '홈으로 이동' }))

      expect(screen.getByText('홈 화면')).toBeInTheDocument()
    })
  })

  describe('처리 실패', () => {
    it('토큰 재발급이 실패하면 사용자 저장 없이 홈으로 이동', async () => {
      refreshAccessToken.mockRejectedValue(new Error('refresh failed'))

      renderCallback()

      expect(await screen.findByText('홈 화면')).toBeInTheDocument()
      expect(getMe).not.toHaveBeenCalled()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('사용자 정보 조회가 실패하면 홈으로 이동', async () => {
      localStorage.setItem(LOGIN_REDIRECT_KEY, '/me')
      refreshAccessToken.mockResolvedValue('new-token')
      getMe.mockRejectedValue(new Error('me failed'))

      renderCallback()

      expect(await screen.findByText('홈 화면')).toBeInTheDocument()
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
