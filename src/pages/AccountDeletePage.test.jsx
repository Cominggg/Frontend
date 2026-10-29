import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AccountDeletePage from './AccountDeletePage'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const USER = { id: 1, nickname: '테스트유저', role: 'USER' }

function renderAccountDeletePage() {
  return render(
    <MemoryRouter initialEntries={['/account/delete']}>
      <Routes>
        <Route path="/account/delete" element={<AccountDeletePage />} />
        <Route path="/me/settings" element={<h1>설정</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  localStorage.clear()
})

describe('AccountDeletePage', () => {
  describe('회원 탈퇴하러 가기', () => {
    it('로그인 상태에서 클릭하면 설정 페이지로 이동', async () => {
      const user = userEvent.setup()
      useAuthStore.setState({ user: USER, accessToken: 'token', isInitialized: true })
      renderAccountDeletePage()

      await user.click(screen.getByRole('button', { name: '회원 탈퇴하러 가기' }))

      expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument()
    })

    it('비로그인 상태에서 클릭하면 설정 페이지를 redirectUri로 로그인 모달 오픈', async () => {
      const user = userEvent.setup()
      useAuthStore.setState({ isInitialized: true })
      renderAccountDeletePage()

      await user.click(screen.getByRole('button', { name: '회원 탈퇴하러 가기' }))

      expect(useLoginModalStore.getState()).toMatchObject({ isOpen: true, redirectUri: '/me/settings' })
    })

    it('비로그인 상태에서 클릭하면 페이지 이동 없음', async () => {
      const user = userEvent.setup()
      useAuthStore.setState({ isInitialized: true })
      renderAccountDeletePage()

      await user.click(screen.getByRole('button', { name: '회원 탈퇴하러 가기' }))

      expect(screen.getByRole('heading', { level: 1, name: '회원 탈퇴 안내' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: '설정' })).not.toBeInTheDocument()
    })
  })

  it('이메일 요청 링크는 지원 메일 주소의 mailto 링크', () => {
    renderAccountDeletePage()

    expect(screen.getByRole('link', { name: 'coming0626@gmail.com' }).getAttribute('href')).toMatch(
      /^mailto:coming0626@gmail\.com/,
    )
  })

  it.each([
    ['운영정책 보기', '/operation-policy'],
    ['개인정보처리방침', '/privacy'],
  ])('%s 링크는 %s로 연결', (name, href) => {
    renderAccountDeletePage()

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
  })

  it('이용 정지 회원의 이메일 요청 안내 표시', () => {
    renderAccountDeletePage()

    expect(screen.getByText(/이용 정지로 로그인할 수 없다면/)).toBeInTheDocument()
  })

  it('게시글·댓글 유지 안내 표시', () => {
    renderAccountDeletePage()

    expect(screen.getByRole('heading', { name: '게시글·댓글은 삭제되지 않습니다' })).toBeInTheDocument()
  })
})
