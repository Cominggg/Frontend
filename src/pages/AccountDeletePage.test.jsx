import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

// 개인정보처리방침 v1.2 시행일(2026-12-02 KST) 전후로 시스템 시간을 고정한다 — userEvent 타이머는 건드리지 않도록 Date만 가짜로 둔다
function setSystemTime(isoUtc) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(isoUtc))
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
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

  it('개인정보처리방침 링크는 /privacy로 연결', () => {
    renderAccountDeletePage()

    expect(screen.getByRole('link', { name: '개인정보처리방침' })).toHaveAttribute('href', '/privacy')
  })

  it('이용 정지 회원의 이메일 요청 안내 표시', () => {
    renderAccountDeletePage()

    expect(screen.getByText(/이용 정지로 로그인할 수 없다면/)).toBeInTheDocument()
  })

  it('게시글·댓글 유지 안내 표시', () => {
    renderAccountDeletePage()

    expect(screen.getByRole('heading', { name: '게시글·댓글은 삭제되지 않습니다' })).toBeInTheDocument()
  })

  describe('개인정보처리방침 v1.2 시행 전', () => {
    beforeEach(() => {
      setSystemTime('2026-11-15T03:00:00Z') // 2026-11-15 12:00 KST
    })

    it.each(['서비스 이용 기록', '신고 접수·처리 기록', '소비자 불만·분쟁 처리 기록'])('보관 후 파기 목록에 %s 표시', (item) => {
      renderAccountDeletePage()

      expect(screen.getByText(item)).toBeInTheDocument()
    })

    it('보관 후 파기 목록에 소셜 로그인 식별자 미표시', () => {
      renderAccountDeletePage()

      expect(screen.queryByText('소셜 로그인 식별자')).not.toBeInTheDocument()
    })

    it('정지 중 탈퇴 시 재가입 제한 안내 미표시', () => {
      renderAccountDeletePage()

      expect(screen.queryByText(/이용 정지 중에 탈퇴하면 일정 기간 다시 가입할 수 없습니다/)).not.toBeInTheDocument()
    })

    it('운영정책 보기 링크 미표시', () => {
      renderAccountDeletePage()

      expect(screen.queryByRole('link', { name: '운영정책 보기' })).not.toBeInTheDocument()
    })
  })

  describe('개인정보처리방침 v1.2 시행 후', () => {
    beforeEach(() => {
      setSystemTime('2026-12-02T03:00:00Z') // 2026-12-02 12:00 KST
    })

    it.each(['서비스 이용 기록', '신고 접수·처리 기록', '소셜 로그인 식별자'])('보관 후 파기 목록에 %s 표시', (item) => {
      renderAccountDeletePage()

      expect(screen.getByText(item)).toBeInTheDocument()
    })

    it('보관 후 파기 목록에 소비자 불만·분쟁 처리 기록 미표시', () => {
      renderAccountDeletePage()

      expect(screen.queryByText('소비자 불만·분쟁 처리 기록')).not.toBeInTheDocument()
    })

    it('정지 중 탈퇴 시 재가입 제한 안내 표시', () => {
      renderAccountDeletePage()

      expect(screen.getByText(/이용 정지 중에 탈퇴하면 일정 기간 다시 가입할 수 없습니다/)).toBeInTheDocument()
    })

    it('운영정책 보기 링크는 /operation-policy로 연결', () => {
      renderAccountDeletePage()

      expect(screen.getByRole('link', { name: '운영정책 보기' })).toHaveAttribute('href', '/operation-policy')
    })
  })
})
