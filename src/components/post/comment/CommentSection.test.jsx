import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CommentSection from './CommentSection'
import { createComment, getComments } from '@/services/postApi'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

vi.mock('@/services/postApi', () => ({
  createComment: vi.fn(),
  deleteComment: vi.fn(),
  getComments: vi.fn(),
  likeComment: vi.fn(),
  unlikeComment: vi.fn(),
}))
vi.mock('@/services/reportApi', () => ({ createReport: vi.fn() }))

function renderSection(props) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CommentSection postId={1} commentCount={0} {...props} />
    </QueryClientProvider>,
  )
}

async function submitComment(user, content) {
  await screen.findByText('아직 댓글이 없어요. 첫 댓글을 남겨보세요.')
  await user.type(screen.getByRole('textbox', { name: '댓글 내용' }), content)
  await user.click(screen.getByRole('button', { name: '등록' }))
  await screen.findByText(content)
}

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState(useAuthStore.getInitialState(), true)
    useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
    localStorage.clear()
    useAuthStore.setState({ user: { id: 1, nickname: '테스트유저' }, accessToken: 'token', isInitialized: true })
    getComments.mockResolvedValue({ content: [], page: 0, totalPages: 1 })
    createComment.mockResolvedValue({ id: 101 })
  })

  describe('댓글 등록', () => {
    it('isPostAuthor true면 새 댓글에 작성자 라벨 표시', async () => {
      const user = userEvent.setup()
      renderSection({ isPostAuthor: true })

      await submitComment(user, 'YOASOBI 내한 기대돼요')

      expect(screen.getByText('작성자', { exact: true })).toBeInTheDocument()
    })

    it('isPostAuthor false면 새 댓글에 작성자 라벨 없음', async () => {
      const user = userEvent.setup()
      renderSection({ isPostAuthor: false })

      await submitComment(user, 'YOASOBI 내한 기대돼요')

      expect(screen.queryByText('작성자', { exact: true })).not.toBeInTheDocument()
    })
  })
})
