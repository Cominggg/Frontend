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
})
