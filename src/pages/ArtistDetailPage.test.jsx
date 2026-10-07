import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ArtistDetailPage from './ArtistDetailPage'
import styles from './ArtistDetailPage.module.css'
import { getArtist, getArtistConcerts, getArtistReleases } from '@/services/artistApi'
import useAuthStore from '@/stores/authStore'

vi.mock('@/services/artistApi', () => ({
  getArtist: vi.fn(),
  getArtistConcerts: vi.fn(),
  getArtistReleases: vi.fn(),
  followArtist: vi.fn(),
  unfollowArtist: vi.fn(),
}))

// 자체 API 호출을 하는 하위 컴포넌트는 제외. 관련 게시글은 로딩 중 마운트 여부를 확인하려고 표식만 렌더링
vi.mock('@/components/post/RelatedPostsSection', () => ({
  default: () => <section aria-label="관련 게시글" />,
}))
vi.mock('@/components/ui/InquiryModal', () => ({ default: () => null }))

const ARTIST = {
  id: 1,
  name: 'YOASOBI',
  koreanName: '요아소비',
  imageUrl: null,
  hasUpcomingConcert: false,
  followersCount: 0,
  links: [],
  isFollowing: false,
}

const NEXT_CONCERT = {
  id: 10,
  title: 'YOASOBI ASIA TOUR 2026 in Seoul',
  startDate: '2099-09-26',
  endDate: '2099-09-27',
  venue: 'KSPO DOME',
  status: 'UPCOMING',
}

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 1 }

function createDeferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// 한쪽 목록 resolve가 React Query 상태·렌더링까지 반영되도록 대기
function flushPromises() {
  return act(() => new Promise((r) => setTimeout(r, 0)))
}

let releasesDeferred
let concertsDeferred
let ddayDeferred

function renderPage(route = '/artists/1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/artists/:id" element={<ArtistDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function mockArtist(overrides = {}) {
  getArtist.mockResolvedValue({ ...ARTIST, ...overrides })
}

async function waitForArtist() {
  await screen.findByRole('heading', { level: 1 })
}

function getDeferredArea() {
  // 관련 게시글·문의·출처를 감싸는 래퍼 (inquiryRow의 부모)
  return screen.getByRole('button', { name: '아티스트 정보 문의' }).parentElement.parentElement
}

function getDdayPlaceholder(container) {
  return container.querySelector('div[aria-hidden="true"]')
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  releasesDeferred = createDeferred()
  concertsDeferred = createDeferred()
  ddayDeferred = createDeferred()
  getArtistReleases.mockReturnValue(releasesDeferred.promise)
  getArtistConcerts.mockImplementation((_id, params) => (
    params.tab === 'upcoming' && params.size === 1 ? ddayDeferred.promise : concertsDeferred.promise
  ))
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('ArtistDetailPage 목록 섹션 로딩', () => {
  it('목록 로딩 중이면 디스코그래피·내한 공연 내역 대신 스켈레톤 섹션 하나만 렌더링', async () => {
    mockArtist()
    const { container } = renderPage()

    await waitForArtist()

    expect(screen.queryByRole('heading', { name: /디스코그래피/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '내한 공연 내역' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(1)
  })

  it('목록 로딩 중이면 아래 영역을 숨김 래퍼 안에 마운트', async () => {
    mockArtist()
    renderPage()

    await waitForArtist()

    expect(screen.getByRole('region', { name: '관련 게시글' })).toBeInTheDocument()
    expect(getDeferredArea()).toHaveClass(styles.deferred)
    expect(getDeferredArea()).not.toHaveClass(styles.deferredShown)
  })

  it('음반 목록만 도착하면 여전히 스켈레톤 유지', async () => {
    mockArtist()
    const { container } = renderPage()
    await waitForArtist()

    releasesDeferred.resolve(EMPTY_PAGE)
    await flushPromises()

    expect(screen.queryByRole('heading', { name: /디스코그래피/ })).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(getDeferredArea()).toHaveClass(styles.deferred)
  })

  it('공연 목록만 도착하면 여전히 스켈레톤 유지', async () => {
    mockArtist()
    const { container } = renderPage()
    await waitForArtist()

    concertsDeferred.resolve(EMPTY_PAGE)
    await flushPromises()

    expect(screen.queryByRole('heading', { name: '내한 공연 내역' })).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(getDeferredArea()).toHaveClass(styles.deferred)
  })

  it('두 목록이 모두 도착하면 섹션 heading 표시하고 스켈레톤 제거', async () => {
    mockArtist()
    const { container } = renderPage()
    await waitForArtist()

    releasesDeferred.resolve({
      content: [{ id: 1, type: 'Album', title: 'THE BOOK', releaseDate: '2021-01-06', tracks: [] }],
      totalElements: 1,
      totalPages: 1,
    })
    concertsDeferred.resolve(EMPTY_PAGE)

    expect(await screen.findByRole('heading', { name: /디스코그래피/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '내한 공연 내역' })).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
  })

  it('두 목록이 모두 도착하면 아래 영역 래퍼를 표시 상태로 전환', async () => {
    mockArtist()
    renderPage()
    await waitForArtist()

    releasesDeferred.resolve(EMPTY_PAGE)
    concertsDeferred.resolve(EMPTY_PAGE)

    await waitFor(() => expect(getDeferredArea()).toHaveClass(styles.deferredShown))
    expect(getDeferredArea()).not.toHaveClass(styles.deferred)
  })
})

describe('ArtistDetailPage D-day 자리표시', () => {
  it('hasUpcomingConcert가 true이고 D-day 조회 중이면 링크가 아닌 aria-hidden 자리표시 렌더링', async () => {
    mockArtist({ hasUpcomingConcert: true })
    const { container } = renderPage()

    await waitForArtist()

    expect(getDdayPlaceholder(container)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /다음 내한 공연/ })).not.toBeInTheDocument()
  })

  it('hasUpcomingConcert가 true이면 예정 공연 1건만 D-day 조회', async () => {
    mockArtist({ hasUpcomingConcert: true })
    renderPage()

    await waitForArtist()

    await waitFor(() => (
      expect(getArtistConcerts).toHaveBeenCalledWith(1, { tab: 'upcoming', page: 0, size: 1 })
    ))
  })

  it('D-day 응답에 예정 공연이 있으면 자리표시 대신 다음 내한 공연 배너 링크 표시', async () => {
    mockArtist({ hasUpcomingConcert: true })
    const { container } = renderPage()
    await waitForArtist()

    ddayDeferred.resolve({ content: [NEXT_CONCERT], totalElements: 1, totalPages: 1 })

    expect(await screen.findByRole('link', { name: /다음 내한 공연/ })).toHaveAttribute('href', '/concerts/10')
    expect(getDdayPlaceholder(container)).not.toBeInTheDocument()
  })

  it('D-day 응답이 비어 있으면 자리표시와 배너 모두 미렌더링', async () => {
    mockArtist({ hasUpcomingConcert: true })
    const { container } = renderPage()
    await waitForArtist()

    ddayDeferred.resolve(EMPTY_PAGE)

    await waitFor(() => expect(getDdayPlaceholder(container)).not.toBeInTheDocument())
    expect(screen.queryByRole('link', { name: /다음 내한 공연/ })).not.toBeInTheDocument()
  })

  it('D-day 조회가 실패하면 자리표시와 배너 모두 미렌더링', async () => {
    mockArtist({ hasUpcomingConcert: true })
    const { container } = renderPage()
    await waitForArtist()

    ddayDeferred.reject(new Error('Network Error'))

    await waitFor(() => expect(getDdayPlaceholder(container)).not.toBeInTheDocument())
    expect(screen.queryByRole('link', { name: /다음 내한 공연/ })).not.toBeInTheDocument()
  })

  it('hasUpcomingConcert가 false이면 자리표시 미렌더링', async () => {
    mockArtist({ hasUpcomingConcert: false })
    const { container } = renderPage()

    await waitForArtist()

    expect(getDdayPlaceholder(container)).not.toBeInTheDocument()
    expect(getArtistConcerts).not.toHaveBeenCalledWith(1, { tab: 'upcoming', page: 0, size: 1 })
  })
})
