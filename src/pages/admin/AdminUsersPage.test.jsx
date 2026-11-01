import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminUsersPage from './AdminUsersPage'
import { liftSuspension, searchUsers, suspendUser, withdrawUser } from '@/services/adminApi'

vi.mock('@/services/adminApi', () => ({
  searchUsers: vi.fn(),
  suspendUser: vi.fn(),
  liftSuspension: vi.fn(),
  withdrawUser: vi.fn(),
}))

const ACTIVE_USER = {
  id: 1, nickname: '하루', email: 'haru@example.com', provider: 'google', createdAt: '2026-09-26',
  role: 'USER', status: 'ACTIVE', suspendedUntil: null, suspensionReason: null,
}
const SUSPENDED_USER = {
  id: 2, nickname: '유키', email: 'yuki@example.com', provider: 'kakao', createdAt: '2026-10-01',
  role: 'USER', status: 'SUSPENDED', suspendedUntil: '2026-11-05T14:30:00', suspensionReason: 'ABUSE',
}
const PERMANENT_USER = {
  id: 3, nickname: null, email: 'pending@example.com', provider: 'apple', createdAt: '2026-10-10',
  role: 'USER', status: 'SUSPENDED', suspendedUntil: null, suspensionReason: 'SPAM',
}
const ADMIN_USER = {
  id: 4, nickname: '운영자', email: 'admin@example.com', provider: 'google', createdAt: '2026-01-01',
  role: 'ADMIN', status: 'ACTIVE', suspendedUntil: null, suspensionReason: null,
}

function pageOf(content, totalPages = 1) {
  return { content, totalPages }
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminUsersPage />
    </QueryClientProvider>,
  )
}

async function findRow(name) {
  const nickname = await screen.findByText(name)
  return screen.getAllByRole('listitem').find((li) => li.contains(nickname))
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AdminUsersPage', () => {
  describe('조회', () => {
    it('처음 렌더링하면 검색어 없이 첫 페이지 조회', async () => {
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      renderPage()

      await screen.findByText('하루')

      expect(searchUsers).toHaveBeenCalledWith({ keyword: undefined, page: 0, size: 20 })
    })

    it('검색어를 제출하면 공백을 제거한 검색어로 첫 페이지 조회', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      renderPage()
      await screen.findByText('하루')

      await user.type(screen.getByRole('textbox', { name: '회원 검색어' }), '  haru  ')
      await user.click(screen.getByRole('button', { name: '검색' }))

      await waitFor(() => expect(searchUsers).toHaveBeenLastCalledWith({ keyword: 'haru', page: 0, size: 20 }))
    })

    it('결과가 비어 있으면 빈 상태 메시지 표시', async () => {
      searchUsers.mockResolvedValue(pageOf([], 0))
      renderPage()

      expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument()
    })

    it('조회에 실패하면 에러 메시지와 다시 시도 버튼 표시', async () => {
      searchUsers.mockRejectedValue(new Error('Server Error'))
      renderPage()

      expect(await screen.findByText('회원 목록을 불러오지 못했습니다.')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    })

    it('다시 시도를 클릭하면 재조회해 목록 표시', async () => {
      const user = userEvent.setup()
      searchUsers.mockRejectedValueOnce(new Error('Server Error')).mockResolvedValue(pageOf([ACTIVE_USER]))
      renderPage()

      await user.click(await screen.findByRole('button', { name: '다시 시도' }))

      expect(await screen.findByText('하루')).toBeInTheDocument()
    })

    it('전체 페이지가 2 이상이면 다음 클릭 시 다음 페이지 조회', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER], 2))
      renderPage()

      await user.click(await screen.findByRole('button', { name: '다음' }))

      await waitFor(() => expect(searchUsers).toHaveBeenLastCalledWith({ keyword: undefined, page: 1, size: 20 }))
    })

    it('전체 페이지가 1이면 페이지 이동 버튼 미표시', async () => {
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER], 1))
      renderPage()

      await screen.findByText('하루')

      expect(screen.queryByRole('button', { name: '다음' })).not.toBeInTheDocument()
    })
  })

  describe('행 표시', () => {
    it('활성 회원이면 닉네임·이메일·로그인 방식·가입일 표시', async () => {
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      renderPage()

      const row = await findRow('하루')

      expect(within(row).getByText('haru@example.com · Google · 가입 2026-09-26')).toBeInTheDocument()
    })

    it('기한 있는 정지 회원이면 만료 시각과 사유 표시', async () => {
      searchUsers.mockResolvedValue(pageOf([SUSPENDED_USER]))
      renderPage()

      const row = await findRow('유키')

      expect(within(row).getByText('정지 · 2026.11.05 14:30까지')).toBeInTheDocument()
      expect(within(row).getByText('yuki@example.com · Kakao · 가입 2026-10-01 · 사유 욕설/비방')).toBeInTheDocument()
    })

    it('닉네임이 없고 영구 정지면 가입 미완료와 영구 정지 표시', async () => {
      searchUsers.mockResolvedValue(pageOf([PERMANENT_USER]))
      renderPage()

      const row = await findRow('가입 미완료')

      expect(within(row).getByText('정지 · 영구 정지')).toBeInTheDocument()
      expect(within(row).getByText(/사유 스팸\/광고/)).toBeInTheDocument()
    })

    it('관리자 회원이면 액션 버튼 미표시', async () => {
      searchUsers.mockResolvedValue(pageOf([ADMIN_USER]))
      renderPage()

      const row = await findRow('운영자')

      expect(within(row).getByText('관리자')).toBeInTheDocument()
      expect(within(row).queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('정지', () => {
    async function openSuspendModal(user) {
      const row = await findRow('하루')
      await user.click(within(row).getByRole('button', { name: '정지' }))
      return screen.getByRole('dialog', { name: '하루 정지' })
    }

    it('기간·사유·상세 사유를 선택해 제출하면 해당 값으로 정지 요청', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      suspendUser.mockResolvedValue()
      renderPage()
      const dialog = await openSuspendModal(user)

      await user.selectOptions(within(dialog).getByRole('combobox', { name: /정지 기간/ }), '영구')
      await user.selectOptions(within(dialog).getByRole('combobox', { name: /사유/ }), '욕설/비방')
      await user.type(within(dialog).getByRole('textbox', { name: /상세 사유/ }), '반복적인 비방 댓글')
      await user.click(within(dialog).getByRole('button', { name: '정지' }))

      expect(suspendUser).toHaveBeenCalledWith(1, { days: null, reason: 'ABUSE', detail: '반복적인 비방 댓글' })
    })

    it('정지에 성공하면 모달이 닫히고 목록 재조회', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      suspendUser.mockResolvedValue()
      renderPage()
      const dialog = await openSuspendModal(user)

      await user.click(within(dialog).getByRole('button', { name: '정지' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      await waitFor(() => expect(searchUsers).toHaveBeenCalledTimes(2))
    })

    it('기본값 그대로 제출하면 7일·스팸 사유로 요청하고 빈 상세 사유는 제외', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      suspendUser.mockResolvedValue()
      renderPage()
      const dialog = await openSuspendModal(user)

      await user.type(within(dialog).getByRole('textbox', { name: /상세 사유/ }), '   ')
      await user.click(within(dialog).getByRole('button', { name: '정지' }))

      expect(suspendUser).toHaveBeenCalledWith(1, { days: 7, reason: 'SPAM', detail: undefined })
    })

    it('정지에 실패하면 모달에 에러 메시지 표시', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      suspendUser.mockRejectedValue(new Error('Server Error'))
      renderPage()
      const dialog = await openSuspendModal(user)

      await user.click(within(dialog).getByRole('button', { name: '정지' }))

      expect(await within(dialog).findByText('정지 처리에 실패했습니다.')).toBeInTheDocument()
    })

    it('Escape를 누르면 모달 닫힘', async () => {
      const user = userEvent.setup()
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      renderPage()
      await openSuspendModal(user)

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(suspendUser).not.toHaveBeenCalled()
    })
  })

  describe('정지 해제', () => {
    it('확인하면 정지 해제 요청', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      searchUsers.mockResolvedValue(pageOf([SUSPENDED_USER]))
      liftSuspension.mockResolvedValue()
      renderPage()
      const row = await findRow('유키')

      await user.click(within(row).getByRole('button', { name: '정지 해제' }))

      expect(liftSuspension).toHaveBeenCalledWith(2)
    })

    it('취소하면 정지 해제를 요청하지 않음', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      searchUsers.mockResolvedValue(pageOf([SUSPENDED_USER]))
      renderPage()
      const row = await findRow('유키')

      await user.click(within(row).getByRole('button', { name: '정지 해제' }))

      expect(liftSuspension).not.toHaveBeenCalled()
    })
  })

  describe('대리 탈퇴', () => {
    it('확인하면 탈퇴 요청', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      withdrawUser.mockResolvedValue()
      renderPage()
      const row = await findRow('하루')

      await user.click(within(row).getByRole('button', { name: '대리 탈퇴' }))

      expect(withdrawUser).toHaveBeenCalledWith(1)
    })

    it('탈퇴 요청이 실패하면 에러 메시지 표시', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      searchUsers.mockResolvedValue(pageOf([ACTIVE_USER]))
      withdrawUser.mockRejectedValue(new Error('Server Error'))
      renderPage()
      const row = await findRow('하루')

      await user.click(within(row).getByRole('button', { name: '대리 탈퇴' }))

      expect(await screen.findByText('탈퇴 처리에 실패했습니다.')).toBeInTheDocument()
    })

    async function openSecondPage(user, secondPageUsers) {
      searchUsers.mockImplementation(({ page }) =>
        Promise.resolve(pageOf(page === 0 ? [ACTIVE_USER] : secondPageUsers, 2)),
      )
      renderPage()
      await user.click(await screen.findByRole('button', { name: '다음' }))
      await screen.findByText('2 / 2')
      searchUsers.mockClear()
    }

    it('2페이지의 마지막 회원을 탈퇴시키면 이전 페이지 조회', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      withdrawUser.mockResolvedValue()
      await openSecondPage(user, [SUSPENDED_USER])
      const row = await findRow('유키')

      await user.click(within(row).getByRole('button', { name: '대리 탈퇴' }))

      await waitFor(() => expect(searchUsers).toHaveBeenCalledWith({ keyword: undefined, page: 0, size: 20 }))
    })

    it('2페이지의 마지막 회원 탈퇴가 실패하면 페이지 유지', async () => {
      const user = userEvent.setup()
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      withdrawUser.mockRejectedValue(new Error('Server Error'))
      await openSecondPage(user, [SUSPENDED_USER])
      const row = await findRow('유키')

      await user.click(within(row).getByRole('button', { name: '대리 탈퇴' }))

      expect(await screen.findByText('탈퇴 처리에 실패했습니다.')).toBeInTheDocument()
      expect(screen.getByText('2 / 2')).toBeInTheDocument()
      expect(searchUsers).not.toHaveBeenCalledWith({ keyword: undefined, page: 0, size: 20 })
    })
  })
})
