import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginModal from './LoginModal'
import useLoginModalStore from '@/stores/loginModalStore'
import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import { devLogin, getMe } from '@/services/authApi'

vi.mock('@/services/authApi', () => ({
  devLogin: vi.fn(),
  getMe: vi.fn(),
}))

const LOGIN_REDIRECT_KEY = 'loginRedirectUri'
const USER = { id: 1, nickname: '테스트유저', role: 'USER' }

let location

function openModal(redirectUri) {
  act(() => useLoginModalStore.getState().open(redirectUri))
}

beforeEach(() => {
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  localStorage.clear()
  vi.clearAllMocks()
  // jsdom은 페이지 이동을 구현하지 않으므로 href 할당만 기록하는 객체로 대체
  location = { origin: window.location.origin, href: window.location.href }
  vi.stubGlobal('location', location)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LoginModal', () => {
  describe('열림/닫힘', () => {
    it('스토어가 닫힘 상태이면 아무것도 렌더링하지 않음', () => {
      render(<LoginModal />)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('스토어가 열리면 로그인 다이얼로그 표시', () => {
      render(<LoginModal />)

      openModal('/concerts/1')

      expect(screen.getByRole('dialog', { name: '로그인' })).toBeInTheDocument()
    })

    it('열린 상태에서 스토어가 닫히면 다이얼로그 제거', () => {
      openModal('/concerts/1')
      render(<LoginModal />)

      act(() => useLoginModalStore.getState().close())

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('다이얼로그는 aria-modal이 true', () => {
      openModal()
      render(<LoginModal />)

      expect(screen.getByRole('dialog', { name: '로그인' })).toHaveAttribute('aria-modal', 'true')
    })

    it('열리면 첫 번째 포커스 요소인 닫기 버튼에 포커스', () => {
      openModal()
      render(<LoginModal />)

      expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    })
  })

  describe('소셜 로그인', () => {
    it('Google과 Kakao 로그인 버튼만 표시', () => {
      openModal()
      render(<LoginModal />)

      expect(screen.getByRole('button', { name: 'Google로 계속하기' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Kakao로 계속하기' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Naver/ })).not.toBeInTheDocument()
    })

    it.each([
      ['Google로 계속하기', 'google'],
      ['Kakao로 계속하기', 'kakao'],
    ])('%s 클릭하면 /api/auth/login/%s로 이동', async (label, provider) => {
      const user = userEvent.setup()
      openModal()
      render(<LoginModal />)

      await user.click(screen.getByRole('button', { name: label }))

      expect(location.href).toBe(`/api/auth/login/${provider}`)
    })

    it('로그인 버튼을 클릭하면 SESSION_HINT 저장', async () => {
      const user = userEvent.setup()
      openModal()
      render(<LoginModal />)

      await user.click(screen.getByRole('button', { name: 'Google로 계속하기' }))

      expect(localStorage.getItem(SESSION_HINT)).toBe('1')
    })

    it('redirectUri가 있으면 로그인 클릭 시 localStorage에 저장', async () => {
      const user = userEvent.setup()
      openModal('/concerts/1?tab=setlist')
      render(<LoginModal />)

      await user.click(screen.getByRole('button', { name: 'Kakao로 계속하기' }))

      expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBe('/concerts/1?tab=setlist')
    })

    it.each([
      ['redirectUri가 없음', undefined],
      ['redirectUri가 루트', '/'],
      ['redirectUri가 외부 origin', 'https://evil.example.com/concerts/1'],
    ])('%s이면 로그인 클릭 시 redirectUri 저장 안 함', async (_, redirectUri) => {
      const user = userEvent.setup()
      openModal(redirectUri)
      render(<LoginModal />)

      await user.click(screen.getByRole('button', { name: 'Google로 계속하기' }))

      expect(localStorage.getItem(LOGIN_REDIRECT_KEY)).toBeNull()
    })
  })

  describe('닫기', () => {
    it('닫기 버튼을 클릭하면 모달이 닫힘', async () => {
      const user = userEvent.setup()
      openModal('/concerts/1')
      render(<LoginModal />)

      await user.click(screen.getByRole('button', { name: '닫기' }))

      expect(useLoginModalStore.getState()).toMatchObject({ isOpen: false, redirectUri: null })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('오버레이를 클릭하면 모달이 닫힘', async () => {
      const user = userEvent.setup()
      openModal()
      render(<LoginModal />)

      await user.click(screen.getByRole('dialog').parentElement)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('다이얼로그 내부를 클릭하면 모달이 유지됨', async () => {
      const user = userEvent.setup()
      openModal()
      render(<LoginModal />)

      await user.click(screen.getByText('로그인하고 내한 공연 정보를 맞춤으로 받아보세요'))

      expect(screen.getByRole('dialog', { name: '로그인' })).toBeInTheDocument()
    })

    it('ESC를 누르면 모달이 닫힘', async () => {
      const user = userEvent.setup()
      openModal()
      render(<LoginModal />)

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // import.meta.env.DEV가 true인 Vitest 환경에서만 렌더링되는 개발용 로그인
  describe('Dev Login', () => {
    it('닉네임이 비어 있으면 로그인 버튼 비활성화', () => {
      openModal()
      render(<LoginModal />)

      expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
    })

    it('로그인에 성공하면 사용자 정보를 저장하고 모달이 닫힘', async () => {
      const user = userEvent.setup()
      devLogin.mockResolvedValue({ accessToken: 'dev-token' })
      getMe.mockResolvedValue(USER)
      openModal()
      render(<LoginModal />)

      await user.type(screen.getByPlaceholderText('닉네임'), ' 테스트유저 ')
      await user.selectOptions(screen.getByRole('combobox'), 'ADMIN')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      expect(devLogin).toHaveBeenCalledWith('테스트유저', 'ADMIN')
      expect(useAuthStore.getState()).toMatchObject({ accessToken: 'dev-token', user: USER })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('로그인에 실패하면 에러 메시지 표시', async () => {
      const user = userEvent.setup()
      devLogin.mockRejectedValue(new Error('network'))
      openModal()
      render(<LoginModal />)

      await user.type(screen.getByPlaceholderText('닉네임'), '테스트유저')
      await user.click(screen.getByRole('button', { name: '로그인' }))

      expect(await screen.findByText(/Dev Login 실패/)).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: '로그인' })).toBeInTheDocument()
    })
  })
})
