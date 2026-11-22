import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PostContentView from './PostContentView'

function paragraphDoc(text) {
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }
}

function trackCardDoc(attrs) {
  return {
    type: 'doc',
    content: [
      {
        type: 'entityMentionCard',
        attrs: {
          entityType: 'TRACK',
          entityId: 3,
          title: '夜に駆ける',
          subtitle: 'YOASOBI',
          thumbnailUrl: null,
          releaseGroupId: null,
          ...attrs,
        },
      },
    ],
  }
}

function renderView(content) {
  const ui = (c) => (
    <MemoryRouter>
      <PostContentView content={c} />
    </MemoryRouter>
  )
  const result = render(ui(content))
  return { ...result, rerender: (c) => result.rerender(ui(c)) }
}

describe('PostContentView', () => {
  it('content가 바뀌면 새 본문을 표시', async () => {
    const { rerender } = renderView(paragraphDoc('첫 번째 본문'))
    expect(await screen.findByText('첫 번째 본문')).toBeInTheDocument()

    rerender(paragraphDoc('수정된 본문'))

    expect(await screen.findByText('수정된 본문')).toBeInTheDocument()
  })

  it('앨범 연결이 없는 트랙 카드면 링크 없이 제목만 표시', async () => {
    renderView(trackCardDoc({ releaseGroupId: null }))

    expect(await screen.findByText('夜に駆ける')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('앨범 연결이 있는 트랙 카드면 앨범 상세의 트랙 위치로 링크', async () => {
    renderView(trackCardDoc({ releaseGroupId: 7 }))

    const link = await screen.findByRole('link', { name: /夜に駆ける/ })
    expect(link.getAttribute('href')).toMatch(/\/releases\/7#track-3$/)
  })

  describe('Spotify 로고', () => {
    it.each(['TRACK', 'ARTIST', 'RELEASE'])('%s 카드가 있으면 로고 표시', async (entityType) => {
      renderView(trackCardDoc({ entityType }))

      expect(await screen.findAllByRole('img', { name: 'Spotify' })).toHaveLength(2)
    })

    it('공연 카드만 있으면 로고 미표시', async () => {
      renderView(trackCardDoc({ entityType: 'CONCERT', title: 'YOASOBI ASIA TOUR 2026' }))

      expect(await screen.findByText('YOASOBI ASIA TOUR 2026')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Spotify' })).not.toBeInTheDocument()
    })

    it('텍스트만 있으면 로고 미표시', async () => {
      renderView(paragraphDoc('카드 없는 본문'))

      expect(await screen.findByText('카드 없는 본문')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Spotify' })).not.toBeInTheDocument()
    })

    it('카드가 여러 개여도 로고는 1회 표시', async () => {
      const content = {
        type: 'doc',
        content: [
          ...trackCardDoc().content,
          ...trackCardDoc({ entityType: 'ARTIST', entityId: 2, title: 'YOASOBI', subtitle: '일본' }).content,
          ...trackCardDoc({ entityType: 'RELEASE', entityId: 5, title: 'THE BOOK' }).content,
        ],
      }
      renderView(content)

      expect(await screen.findAllByRole('img', { name: 'Spotify' })).toHaveLength(2)
    })

    it('rerender로 카드가 사라지면 로고도 사라짐', async () => {
      const { rerender } = renderView(trackCardDoc())
      await screen.findAllByRole('img', { name: 'Spotify' })

      rerender(paragraphDoc('카드를 지운 본문'))

      expect(await screen.findByText('카드를 지운 본문')).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Spotify' })).not.toBeInTheDocument()
    })
  })
})
