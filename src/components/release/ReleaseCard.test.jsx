import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ReleaseCard from './ReleaseCard'

function makeRelease(overrides = {}) {
  return {
    id: 1,
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273a1b2c3d4e5f60718293a4b5c',
    artistName: 'YOASOBI',
    artistKoreanName: '요아소비',
    title: 'THE BOOK 3',
    releaseDate: '2026-09-26',
    type: 'Album',
    spotifyId: null,
    averageRating: null,
    ...overrides,
  }
}

function renderCard(props) {
  return render(
    <MemoryRouter>
      <ReleaseCard {...props} />
    </MemoryRouter>,
  )
}

describe('ReleaseCard', () => {
  it('priority를 지정하지 않으면 커버를 지연 로드', () => {
    const release = makeRelease()
    renderCard({ release })

    const cover = screen.getByRole('img', { name: release.title })

    expect(cover).toHaveAttribute('loading', 'lazy')
    expect(cover).toHaveAttribute('fetchpriority', 'auto')
  })

  it('priority를 지정하면 커버를 우선 로드', () => {
    const release = makeRelease()
    renderCard({ release, priority: true })

    const cover = screen.getByRole('img', { name: release.title })

    expect(cover).toHaveAttribute('loading', 'eager')
    expect(cover).toHaveAttribute('fetchpriority', 'high')
  })

  it.each([false, true])('coverUrl이 없으면 priority가 %s여도 커버 이미지 없음', (priority) => {
    const release = makeRelease({ coverUrl: null })
    renderCard({ release, priority })

    expect(screen.queryByRole('img', { name: release.title })).not.toBeInTheDocument()
  })
})
