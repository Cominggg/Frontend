import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import AdminReportsPage from './AdminReportsPage'
import { getReport, getReports, updateReportStatus } from '@/services/adminApi'

vi.mock('@/services/adminApi', () => ({
  getReports: vi.fn(),
  getReport: vi.fn(),
  updateReportStatus: vi.fn(),
}))

const LIST_ITEM = {
  id: 7,
  targetType: 'POST',
  targetId: 42,
  status: 'PENDING',
  reason: 'ABUSE',
  reporterNickname: '요아소비팬',
  createdAt: '2026-10-28',
}

const REPORT = {
  ...LIST_ITEM,
  detail: '댓글에서 다른 회원을 비방했습니다.',
  adminNote: null,
  targetAuthorId: 3,
  targetAuthorNickname: '악성유저',
  targetAuthorSuspended: false,
  targetAuthorSuspendedUntil: null,
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function openModal(user, report = {}) {
  getReport.mockResolvedValue({ ...REPORT, ...report })
  renderPage()
  await user.click(await screen.findByRole('button', { name: /대상 ID 42/ }))
  await screen.findByText('작성자')
}

function apiError(code) {
  return Object.assign(new Error('Request failed'), { response: { data: { code } } })
}

beforeEach(() => {
  vi.clearAllMocks()
  getReports.mockResolvedValue({ content: [LIST_ITEM], totalElements: 1 })
  updateReportStatus.mockResolvedValue(undefined)
})

describe('AdminReportsPage', () => {
  describe('상세 모달 작성자 표시', () => {
    it('작성자 닉네임이 있으면 닉네임 표시', async () => {
      const user = userEvent.setup()

      await openModal(user)

      expect(screen.getByText('악성유저')).toBeInTheDocument()
    })

    it('작성자 ID는 있고 닉네임이 null이면 탈퇴 회원', async () => {
      const user = userEvent.setup()

      await openModal(user, { targetAuthorNickname: null })

      expect(screen.getByText('탈퇴 회원')).toBeInTheDocument()
    })

    it('작성자 ID가 null이면 알 수 없음 (대상 삭제)', async () => {
      const user = userEvent.setup()

      await openModal(user, { targetAuthorId: null, targetAuthorNickname: null })

      expect(screen.getByText('알 수 없음 (대상 삭제)')).toBeInTheDocument()
    })

    it('정지 중이고 종료 시각이 있으면 종료 시각까지 표시', async () => {
      const user = userEvent.setup()

      await openModal(user, { targetAuthorSuspended: true, targetAuthorSuspendedUntil: '2026-11-05T14:30:00' })

      expect(screen.getByText('정지 · 2026.11.05 14:30까지')).toBeInTheDocument()
    })

    it('정지 중이고 종료 시각이 null이면 영구 정지 표시', async () => {
      const user = userEvent.setup()

      await openModal(user, { targetAuthorSuspended: true, targetAuthorSuspendedUntil: null })

      expect(screen.getByText('정지 · 영구 정지')).toBeInTheDocument()
    })

    it('신고자 닉네임이 빈 문자열이면 탈퇴 회원', async () => {
      const user = userEvent.setup()

      await openModal(user, { reporterNickname: '' })

      expect(screen.getByText('탈퇴 회원')).toBeInTheDocument()
    })
  })

  describe('작성자 정지 옵션', () => {
    it('대기 중이고 작성자를 정지할 수 있으면 정지 옵션 표시', async () => {
      const user = userEvent.setup()

      await openModal(user)

      expect(screen.getByRole('group', { name: '처리완료 시 작성자 정지' })).toBeInTheDocument()
    })

    it.each([
      ['작성자가 탈퇴', { targetAuthorNickname: null }],
      ['대상이 삭제', { targetAuthorId: null, targetAuthorNickname: null }],
    ])('%s됐으면 정지 옵션 미표시', async (_, report) => {
      const user = userEvent.setup()

      await openModal(user, report)

      expect(screen.queryByRole('group', { name: '처리완료 시 작성자 정지' })).not.toBeInTheDocument()
    })

    it('정지 사유 기본값은 신고 사유', async () => {
      const user = userEvent.setup()

      await openModal(user)

      expect(screen.getByRole('combobox', { name: '정지 사유' })).toHaveValue('ABUSE')
    })

    it('기간·사유·상세를 입력하고 처리완료하면 정지 정보와 함께 요청', async () => {
      const user = userEvent.setup()
      await openModal(user)

      await user.selectOptions(screen.getByRole('combobox', { name: '정지 기간' }), '30일')
      await user.selectOptions(screen.getByRole('combobox', { name: '정지 사유' }), '스팸/광고')
      await user.type(screen.getByRole('textbox', { name: '정지 상세 사유' }), '반복 홍보 게시')
      await user.click(screen.getByRole('button', { name: '처리완료' }))

      expect(updateReportStatus).toHaveBeenCalledWith(7, expect.objectContaining({
        status: 'RESOLVED',
        suspend: { days: 30, reason: 'SPAM', detail: '반복 홍보 게시' },
      }))
    })

    it('영구를 선택하고 처리완료하면 정지 기간 null로 요청', async () => {
      const user = userEvent.setup()
      await openModal(user)

      await user.selectOptions(screen.getByRole('combobox', { name: '정지 기간' }), '영구')
      await user.click(screen.getByRole('button', { name: '처리완료' }))

      expect(updateReportStatus).toHaveBeenCalledWith(7, expect.objectContaining({
        suspend: expect.objectContaining({ days: null }),
      }))
    })

    it('정지 안 함 상태로 처리완료하면 정지 정보 없이 요청', async () => {
      const user = userEvent.setup()
      await openModal(user)

      await user.click(screen.getByRole('button', { name: '처리완료' }))

      expect(updateReportStatus).toHaveBeenCalledWith(7, expect.objectContaining({
        status: 'RESOLVED',
        suspend: undefined,
      }))
    })

    it('기간을 선택해도 반려하면 정지 정보 없이 요청', async () => {
      const user = userEvent.setup()
      await openModal(user)

      await user.selectOptions(screen.getByRole('combobox', { name: '정지 기간' }), '30일')
      await user.click(screen.getByRole('button', { name: '반려' }))

      expect(updateReportStatus).toHaveBeenCalledWith(7, expect.objectContaining({
        status: 'REJECTED',
        suspend: undefined,
      }))
    })
  })

  describe('처리 실패', () => {
    it.each([
      ['REPORT_TARGET_NOT_FOUND', '신고 대상이 삭제되어 작성자를 정지할 수 없습니다.'],
      ['USER_NOT_FOUND', '작성자가 탈퇴한 회원이라 정지할 수 없습니다.'],
      ['INTERNAL_SERVER_ERROR', '처리에 실패했습니다.'],
    ])('실패 코드가 %s이면 안내 문구 표시', async (code, message) => {
      const user = userEvent.setup()
      updateReportStatus.mockRejectedValue(apiError(code))
      await openModal(user)

      await user.click(screen.getByRole('button', { name: '처리완료' }))

      expect(await screen.findByText(message)).toBeInTheDocument()
    })
  })
})
