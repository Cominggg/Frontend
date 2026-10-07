import { beforeEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from './AdminRoute'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const ADMIN = { id: 1, nickname: '관리자', role: 'ADMIN' }
const USER = { id: 2, nickname: '테스트유저', role: 'USER' }

function renderAdminRoute(route = '/admin/reports?status=PENDING') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<h1>홈</h1>} />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <h1>신고 관리</h1>
            </AdminRoute>
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

describe('AdminRoute', () => {
  describe('초기화 전', () => {
    it('초기화 전이면 관리자 콘텐츠를 표시하지 않음', () => {
      renderAdminRoute()

      expect(screen.queryByRole('heading', { name: '신고 관리' })).not.toBeInTheDocument()
    })

    it('초기화 전이면 홈으로 이동하지 않음', () => {
      renderAdminRoute()

      expect(screen.queryByRole('heading', { name: '홈' })).not.toBeInTheDocument()
    })

    it('초기화 전이면 로그인 모달을 열지 않음', () => {
      renderAdminRoute()

      expect(useLoginModalStore.getState().isOpen).toBe(false)
    })

    it('관리자로 초기화가 완료되면 관리자 콘텐츠 표시', () => {
      renderAdminRoute()

      act(() => useAuthStore.setState({ user: ADMIN, accessToken: 'token', isInitialized: true }))

      expect(screen.getByRole('heading', { name: '신고 관리' })).toBeInTheDocument()
    })
  })

  describe('비로그인', () => {
    beforeEach(() => {
      useAuthStore.setState({ isInitialized: true })
    })

    it('비로그인이면 관리자 콘텐츠를 표시하지 않음', () => {
      renderAdminRoute()

      expect(screen.queryByRole('heading', { name: '신고 관리' })).not.toBeInTheDocument()
    })

    it('비로그인이면 현재 pathname과 search를 redirectUri로 로그인 모달 오픈', () => {
      renderAdminRoute('/admin/reports?status=PENDING')

      expect(useLoginModalStore.getState()).toMatchObject({
        isOpen: true,
        redirectUri: '/admin/reports?status=PENDING',
      })
    })

    it('비로그인이면 홈으로 이동하지 않음', () => {
      renderAdminRoute()

      expect(screen.queryByRole('heading', { name: '홈' })).not.toBeInTheDocument()
    })

    it('비로그인 상태에서 관리자로 로그인하면 로그인 모달 닫힘', () => {
      renderAdminRoute()

      act(() => useAuthStore.setState({ user: ADMIN, accessToken: 'token' }))

      expect(useLoginModalStore.getState()).toMatchObject({ isOpen: false, redirectUri: null })
    })
  })

  describe('권한 부족', () => {
    it.each([
      ['일반 사용자(USER)', 'USER'],
      ['가입 대기(PENDING)', 'PENDING'],
    ])('%s면 홈으로 이동', (_label, role) => {
      useAuthStore.setState({ user: { ...USER, role }, accessToken: 'token', isInitialized: true })

      renderAdminRoute()

      expect(screen.getByRole('heading', { name: '홈' })).toBeInTheDocument()
    })

    it('일반 사용자면 관리자 콘텐츠를 표시하지 않음', () => {
      useAuthStore.setState({ user: USER, accessToken: 'token', isInitialized: true })

      renderAdminRoute()

      expect(screen.queryByRole('heading', { name: '신고 관리' })).not.toBeInTheDocument()
    })

    it('일반 사용자면 로그인 모달을 열지 않음', () => {
      useAuthStore.setState({ user: USER, accessToken: 'token', isInitialized: true })

      renderAdminRoute()

      expect(useLoginModalStore.getState().isOpen).toBe(false)
    })
  })

  describe('관리자', () => {
    it('관리자면 관리자 콘텐츠 표시', () => {
      useAuthStore.setState({ user: ADMIN, accessToken: 'token', isInitialized: true })

      renderAdminRoute()

      expect(screen.getByRole('heading', { name: '신고 관리' })).toBeInTheDocument()
    })

    it('관리자면 열려 있던 로그인 모달 닫힘', () => {
      useAuthStore.setState({ user: ADMIN, accessToken: 'token', isInitialized: true })
      useLoginModalStore.getState().open('/admin/reports')

      renderAdminRoute()

      expect(useLoginModalStore.getState().isOpen).toBe(false)
    })
  })
})
