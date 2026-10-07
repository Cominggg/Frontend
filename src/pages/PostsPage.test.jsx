import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import PostsPage from './PostsPage'
import { getPosts, getSearch } from '@/services/postApi'
import useAuthStore from '@/stores/authStore'

vi.mock('@/services/postApi', () => ({
  getPosts: vi.fn(),
  getPopularBoardPosts: vi.fn(),
  getSearch: vi.fn(),
}))
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }))

// 자체 API를 호출하는 하위 컴포넌트는 제외
vi.mock('@/components/post/PinnedNotices', () => ({ default: () => null }))
vi.mock('@/components/post/sidebar/PostsSidebar', () => ({ default: () => null }))
// 스켈레톤은 접근 가능한 표식이 없어 식별용 표식으로 대체
vi.mock('@/components/post/PostListItemSkeleton', () => ({
  default: () => <div role="status" aria-label="게시글 불러오는 중" />,
}))

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// resolve가 React Query 상태·렌더링까지 반영되도록 대기
function flushPromises() {
  return act(() => new Promise((r) => setTimeout(r, 0)))
}

function createPost(id, title, category = 'FREE') {
  return {
    id,
    category,
    title,
    authorNickname: '테스트유저',
    recommendCount: 0,
    viewCount: 0,
    createdAt: '2026-09-26T10:00:00',
    entityTags: [],
  }
}

function createPage(posts, totalPages = 1) {
  return { content: posts, totalElements: posts.length, totalPages }
}

function renderPage(route = '/community') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <PostsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function querySkeletons() {
  return screen.queryAllByRole('status', { name: '게시글 불러오는 중' })
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  // Pagination이 matchMedia로 모바일 여부를 판단
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })))
  vi.stubGlobal('scrollTo', vi.fn())
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('PostsPage 목록 전환 중 표시', () => {
  it('페이지만 바뀌면 다음 페이지 응답 대기 중에도 이전 목록을 유지하고 스켈레톤 미표시', async () => {
    const user = userEvent.setup()
    const page2Deferred = createDeferred()
    getPosts.mockImplementation(({ page }) => (
      page === 0
        ? Promise.resolve(createPage([createPost(1, '1페이지 첫 글')], 2))
        : page2Deferred.promise
    ))
    renderPage()
    await screen.findByText('1페이지 첫 글')

    await user.click(screen.getByRole('button', { name: '2페이지' }))
    await flushPromises()

    expect(getPosts).toHaveBeenLastCalledWith({ category: undefined, page: 1, size: 10 })
    expect(screen.getByText('1페이지 첫 글')).toBeInTheDocument()
    expect(querySkeletons()).toHaveLength(0)
  })

  it('페이지만 바뀐 뒤 응답이 오면 다음 페이지 글로 교체', async () => {
    const user = userEvent.setup()
    const page2Deferred = createDeferred()
    getPosts.mockImplementation(({ page }) => (
      page === 0
        ? Promise.resolve(createPage([createPost(1, '1페이지 첫 글')], 2))
        : page2Deferred.promise
    ))
    renderPage()
    await screen.findByText('1페이지 첫 글')
    await user.click(screen.getByRole('button', { name: '2페이지' }))

    page2Deferred.resolve(createPage([createPost(11, '2페이지 첫 글')], 2))

    expect(await screen.findByText('2페이지 첫 글')).toBeInTheDocument()
    expect(screen.queryByText('1페이지 첫 글')).not.toBeInTheDocument()
  })

  it('카테고리가 바뀌면 응답 대기 중 이전 목록 대신 스켈레톤 표시', async () => {
    const user = userEvent.setup()
    const freeDeferred = createDeferred()
    getPosts.mockImplementation(({ category }) => (
      category === 'FREE'
        ? freeDeferred.promise
        : Promise.resolve(createPage([createPost(1, '전체 목록 글', 'INFO')]))
    ))
    renderPage()
    await screen.findByText('전체 목록 글')

    await user.click(screen.getByRole('tab', { name: '자유' }))
    await flushPromises()

    expect(screen.queryByText('전체 목록 글')).not.toBeInTheDocument()
    expect(querySkeletons().length).toBeGreaterThan(0)
  })

  it('카테고리가 바뀐 뒤 응답이 오면 스켈레톤 대신 새 카테고리 글 표시', async () => {
    const user = userEvent.setup()
    const freeDeferred = createDeferred()
    getPosts.mockImplementation(({ category }) => (
      category === 'FREE'
        ? freeDeferred.promise
        : Promise.resolve(createPage([createPost(1, '전체 목록 글', 'INFO')]))
    ))
    renderPage()
    await screen.findByText('전체 목록 글')
    await user.click(screen.getByRole('tab', { name: '자유' }))

    freeDeferred.resolve(createPage([createPost(2, '자유 게시판 글')]))

    expect(await screen.findByText('자유 게시판 글')).toBeInTheDocument()
    expect(querySkeletons()).toHaveLength(0)
  })

  it('검색어가 바뀌면 응답 대기 중 이전 검색 결과 대신 스켈레톤 표시', async () => {
    const user = userEvent.setup()
    const nextDeferred = createDeferred()
    getSearch.mockImplementation(({ q }) => (
      q === 'YOASOBI'
        ? Promise.resolve(createPage([createPost(1, 'YOASOBI 내한 후기', 'REVIEW')]))
        : nextDeferred.promise
    ))
    renderPage('/community?q=YOASOBI')
    await screen.findByText('YOASOBI 내한 후기')

    await user.type(screen.getByRole('textbox', { name: '게시글 검색' }), ' 2026')

    expect(await screen.findAllByRole('status', { name: '게시글 불러오는 중' })).not.toHaveLength(0)
    expect(getSearch).toHaveBeenLastCalledWith({ q: 'YOASOBI 2026', page: 0, size: 10 })
    expect(screen.queryByText('YOASOBI 내한 후기')).not.toBeInTheDocument()
  })
})
