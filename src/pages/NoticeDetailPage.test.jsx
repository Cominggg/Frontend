import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import NoticeDetailPage from './NoticeDetailPage'
import { getNotice } from '@/services/noticeApi'

vi.mock('@/services/noticeApi', () => ({
  getNotice: vi.fn(),
}))

const NOTICE = {
  id: 1,
  title: '서비스 점검 안내',
  content: {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '9월 26일 새벽 점검이 진행됩니다.' }] }],
  },
  createdAt: '2026-09-26T10:00:00',
}

function renderPage(route = '/community/notices/1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/community/notices/:id" element={<NoticeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NoticeDetailPage', () => {
  it('공지를 조회하면 제목을 표시', async () => {
    getNotice.mockResolvedValue(NOTICE)
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: NOTICE.title })).toBeInTheDocument()
    expect(getNotice).toHaveBeenCalledWith(1)
  })

  it('공지를 조회하면 Tiptap JSON 본문을 텍스트로 렌더링', async () => {
    getNotice.mockResolvedValue(NOTICE)
    renderPage()

    expect(await screen.findByText('9월 26일 새벽 점검이 진행됩니다.')).toBeInTheDocument()
  })

  it('없는 공지면 안내 문구와 커뮤니티 목록 링크 표시', async () => {
    getNotice.mockRejectedValue(new Error('Not Found'))
    renderPage('/community/notices/999')

    expect(await screen.findByText('공지사항이 존재하지 않습니다')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '커뮤니티 목록으로' })).toBeInTheDocument()
  })
})
