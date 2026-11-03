import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import { ROUTES } from '@/constants/routes'
import { getConcerts, getPopularConcerts, getTicketingConcerts } from '@/services/concertApi'
import { getReleases } from '@/services/releaseApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

vi.mock('@/services/concertApi', () => ({
  getPopularConcerts: vi.fn(),
  getConcerts: vi.fn(),
  getTicketingConcerts: vi.fn(),
}))
vi.mock('@/services/releaseApi', () => ({
  getReleases: vi.fn(),
}))

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function logIn() {
  useAuthStore.setState({ user: { id: 1, nickname: '테스트유저' }, accessToken: 'token', isInitialized: true })
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  getPopularConcerts.mockResolvedValue([])
  getTicketingConcerts.mockResolvedValue([])
  getConcerts.mockResolvedValue({ content: [] })
  getReleases.mockResolvedValue({ content: [] })
})

describe('HomePage', () => {
  describe('빈 상태', () => {
    it.each([
      ['인기 공연이 없으면', '집계된 인기 공연이 없습니다.'],
      ['다가오는 공연이 없으면', '예정된 내한 공연이 없습니다.'],
      ['신보가 없으면', '등록된 앨범·싱글이 없습니다.'],
    ])('%s 안내 문구 표시: %s', async (_condition, message) => {
      renderPage()

      expect(await screen.findByText(message)).toBeInTheDocument()
    })

    it('티켓팅 일정이 없으면 안내 문구와 캘린더 링크 표시', async () => {
      renderPage()

      expect(await screen.findByText('예정된 티켓팅 일정이 없습니다.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '캘린더 보기' })).toHaveAttribute('href', ROUTES.CALENDAR)
    })
  })

  describe('관심 아티스트 공연', () => {
    it('로그인 사용자의 관심 공연이 없으면 안내 문구와 아티스트 목록 링크 표시', async () => {
      logIn()
      renderPage()

      expect(await screen.findByText('팔로우한 아티스트의 공연이 여기에 표시됩니다.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '아티스트 둘러보기' })).toHaveAttribute('href', ROUTES.ARTISTS)
    })

    it('비로그인이면 로그인 안내 문구 표시', () => {
      renderPage()

      expect(screen.getByText('로그인하면 팔로우한 아티스트의 공연을 볼 수 있습니다.')).toBeInTheDocument()
    })

    it('비로그인 상태에서 로그인 버튼 클릭하면 현재 경로로 로그인 모달 오픈', async () => {
      const user = userEvent.setup()
      const open = vi.fn()
      useLoginModalStore.setState({ open })
      renderPage()

      await user.click(screen.getByRole('button', { name: '로그인 / 회원가입' }))

      expect(open).toHaveBeenCalledWith(window.location.pathname + window.location.search)
    })
  })
})
