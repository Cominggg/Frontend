import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminNoticeFormPage from './AdminNoticeFormPage'
import { ROUTES } from '@/constants/routes'
import { getAdminNotice } from '@/services/adminApi'

vi.mock('@/services/adminApi', () => ({
  getAdminNotice: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
}))

const NOTICE_V1 = { id: 1, title: '서비스 점검 안내', content: '9월 26일 새벽 점검이 진행됩니다.', active: true }
const NOTICE_V2 = { id: 1, title: '서비스 점검 일정 변경', content: '점검이 9월 27일로 연기되었습니다.', active: false }

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPage({ route, queryClient = createQueryClient() }) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/notices/new" element={<AdminNoticeFormPage />} />
          <Route path="/admin/notices/:id/edit" element={<AdminNoticeFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function getFields() {
  return {
    title: screen.getByRole('textbox', { name: /제목/ }),
    content: screen.getByRole('textbox', { name: /내용/ }),
    active: screen.getByRole('checkbox', { name: '커뮤니티 홈에 노출' }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminNoticeFormPage', () => {
  describe('수정 모드', () => {
    it('조회 중이면 입력 필드가 비활성화', () => {
      getAdminNotice.mockReturnValue(deferred().promise)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      const { title, content, active } = getFields()

      expect(title).toBeDisabled()
      expect(content).toBeDisabled()
      expect(active).toBeDisabled()
    })

    it('조회가 끝나면 결과로 폼을 채우고 입력 필드 활성화', async () => {
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      expect(await screen.findByDisplayValue(NOTICE_V1.title)).toBeEnabled()
      const { content, active } = getFields()
      expect(getAdminNotice).toHaveBeenCalledWith('1')
      expect(content).toHaveValue(NOTICE_V1.content)
      expect(content).toBeEnabled()
      expect(active).toBeChecked()
      expect(active).toBeEnabled()
    })

    it('같은 QueryClient로 다시 진입하면 이전 캐시가 아닌 새 조회 결과로 폼을 채움', async () => {
      const queryClient = createQueryClient()
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      const { unmount } = renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1), queryClient })
      await screen.findByDisplayValue(NOTICE_V1.title)
      unmount()
      // gcTime: 0이라 언마운트 후 setTimeout(0)으로 캐시가 제거됨
      await waitFor(() => expect(queryClient.getQueryData(['admin', 'notice', '1'])).toBeUndefined())
      const second = deferred()
      getAdminNotice.mockReturnValue(second.promise)

      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1), queryClient })

      const { title, content, active } = getFields()
      expect(title).toBeDisabled()
      expect(title).toHaveValue('')
      second.resolve(NOTICE_V2)
      expect(await screen.findByDisplayValue(NOTICE_V2.title)).toBeEnabled()
      expect(content).toHaveValue(NOTICE_V2.content)
      expect(active).not.toBeChecked()
      expect(screen.queryByDisplayValue(NOTICE_V1.title)).not.toBeInTheDocument()
    })

    it('조회에 실패하면 에러 메시지 표시', async () => {
      getAdminNotice.mockRejectedValue(new Error('Not Found'))
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(999) })

      expect(await screen.findByText('공지를 찾을 수 없습니다.')).toBeInTheDocument()
    })
  })

  describe('작성 모드', () => {
    it('id가 없으면 조회하지 않고 입력 필드 활성화', () => {
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })

      const { title, content, active } = getFields()

      expect(getAdminNotice).not.toHaveBeenCalled()
      expect(title).toBeEnabled()
      expect(content).toBeEnabled()
      expect(active).toBeEnabled()
    })
  })
})
