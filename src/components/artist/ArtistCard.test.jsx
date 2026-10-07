import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import ArtistCard from './ArtistCard'

vi.mock('@/services/artistApi', () => ({
  followArtist: vi.fn(),
  unfollowArtist: vi.fn(),
}))

const HASH = 'f1e2d3c4b5a60718293a4b5c'

function makeArtist(overrides = {}) {
  return {
    id: 1,
    name: 'YOASOBI',
    koreanName: '요아소비',
    imageUrl: `https://i.scdn.co/image/ab6761610000e5eb${HASH}`,
    hasUpcomingConcert: false,
    spotifyUrl: null,
    isFollowing: false,
    ...overrides,
  }
}

function renderCard(props) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArtistCard {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// 아바타 링크가 aria-hidden이라 접근성 트리에서 제외되므로 hidden: true로 조회한다
function getAvatar(name) {
  return screen.getByRole('img', { name, hidden: true })
}

beforeEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true)
  useLoginModalStore.setState(useLoginModalStore.getInitialState(), true)
  localStorage.clear()
})

describe('ArtistCard', () => {
  it('640px Spotify 이미지면 320px 버전으로 렌더링', () => {
    const artist = makeArtist()
    renderCard({ artist })

    expect(getAvatar(artist.name)).toHaveAttribute('src', `https://i.scdn.co/image/ab67616100005174${HASH}`)
  })

  it('priority를 지정하지 않으면 이미지를 지연 로드', () => {
    const artist = makeArtist()
    renderCard({ artist })

    const avatar = getAvatar(artist.name)

    expect(avatar).toHaveAttribute('loading', 'lazy')
    expect(avatar).toHaveAttribute('fetchpriority', 'auto')
  })

  it('priority를 지정하면 이미지를 우선 로드', () => {
    const artist = makeArtist()
    renderCard({ artist, priority: true })

    const avatar = getAvatar(artist.name)

    expect(avatar).toHaveAttribute('loading', 'eager')
    expect(avatar).toHaveAttribute('fetchpriority', 'high')
  })

  it.each([false, true])('imageUrl이 없으면 priority가 %s여도 이미지 없음', (priority) => {
    const artist = makeArtist({ imageUrl: null })
    renderCard({ artist, priority })

    expect(screen.queryByRole('img', { name: artist.name, hidden: true })).not.toBeInTheDocument()
  })
})
