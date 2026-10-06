import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const USER = { id: 1, nickname: '테스트유저', role: 'USER' }

function renderPrivateRoute(route = '/me/settings?tab=notification') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<h1>홈</h1>} />
        <Route path="/signup" element={<h1>회원가입</h1>} />
        <Route
          path="/me/settings"
          element={
            <PrivateRoute>
              <h1>설정</h1>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  localStorage.clear()
})

describe('PrivateRoute', () => {
  describe('초기화 전', () => {
    it('초기화 전이면 보호 콘텐츠를 표시하지 않음', () => {
      renderPrivateRoute()

      expect(screen.queryByRole('heading', { name: '설정' })).not.toBeInTheDocument()
    })

    it('초기화 전이면 로그인 모달을 열지 않음', () => {
      renderPrivateRoute()

      expect(useLoginModalStore.getState().isOpen).toBe(false)
    })

    it('비로그인으로 초기화가 완료되면 로그인 모달 오픈', () => {
      renderPrivateRoute()

      act(() => useAuthStore.setState({ isInitialized: true }))

      expect(useLoginModalStore.getState().isOpen).toBe(true)
    })
  })

  describe('비로그인', () => {
    beforeEach(() => {
      useAuthStore.setState({ isInitialized: true })
    })

    it('비로그인이면 보호 콘텐츠를 표시하지 않음', () => {
      renderPrivateRoute()

      expect(screen.queryByRole('heading', { name: '설정' })).not.toBeInTheDocument()
    })

    it('비로그인이면 현재 pathname과 search를 redirectUri로 로그인 모달 오픈', () => {
      renderPrivateRoute('/me/settings?tab=notification')

      expect(useLoginModalStore.getState()).toMatchObject({
        isOpen: true,
        redirectUri: '/me/settings?tab=notification',
      })
    })

    it('비로그인이면 다른 페이지로 이동하지 않음', () => {
      renderPrivateRoute()

      expect(screen.queryByRole('heading', { name: '홈' })).not.toBeInTheDocument()
    })

    it('비로그인 상태에서 로그인하면 보호 콘텐츠 표시', () => {
      renderPrivateRoute()

      act(() => useAuthStore.setState({ user: USER, accessToken: 'token' }))

      expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument()
    })

    it('비로그인 상태에서 로그인하면 로그인 모달 닫힘', () => {
      renderPrivateRoute()

      act(() => useAuthStore.setState({ user: USER, accessToken: 'token' }))

      expect(useLoginModalStore.getState()).toMatchObject({ isOpen: false, redirectUri: null })
    })
  })

  describe('로그인', () => {
    it('로그인 사용자면 보호 콘텐츠 표시', () => {
      useAuthStore.setState({ user: USER, accessToken: 'token', isInitialized: true })

      renderPrivateRoute()

      expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument()
    })

    it('로그인 사용자면 열려 있던 로그인 모달 닫힘', () => {
      useAuthStore.setState({ user: USER, accessToken: 'token', isInitialized: true })
      useLoginModalStore.getState().open('/me/settings')

      renderPrivateRoute()

      expect(useLoginModalStore.getState().isOpen).toBe(false)
    })

    it('가입 대기(PENDING) 사용자면 회원가입 페이지로 이동', () => {
      useAuthStore.setState({
        user: { ...USER, role: 'PENDING' },
        accessToken: 'token',
        isInitialized: true,
      })

      renderPrivateRoute()

      expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
    })
  })
})
