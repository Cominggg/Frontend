import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PostWritePage from './PostWritePage'
import { createPost, getPost, updatePost } from '@/services/postApi'

vi.mock('@/services/postApi', () => ({
  createPost: vi.fn(),
  getPost: vi.fn(),
  updatePost: vi.fn(),
}))
vi.mock('@/utils/analytics', () => ({ trackEvent: vi.fn() }))

// Tiptap 에디터 대신 최신 props를 보관해 테스트가 onChange·onCharacterCountChange를 직접 호출한다
// ref에는 insertTrigger만 노출해 힌트 버튼 호출을 검증한다 (React 19는 ref를 props로 전달)
const editor = vi.hoisted(() => ({ props: null, insertTrigger: vi.fn() }))
vi.mock('@/components/post/editor/PostEditor', () => ({
  default: (props) => {
    editor.props = props
    if (props.ref) props.ref.current = { insertTrigger: editor.insertTrigger }
    return null
  },
}))

function concertCard(entityId, title) {
  return {
    type: 'entityMentionCard',
    attrs: { entityType: 'CONCERT', entityId, title, subtitle: null, thumbnailUrl: null, releaseGroupId: null },
  }
}

function createDoc(...cards) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '공연 후기입니다' }] }, ...cards],
  }
}

const ONE_CONCERT_DOC = createDoc(concertCard(1, 'YOASOBI ASIA TOUR 2026'))
const TWO_CONCERTS_DOC = createDoc(
  concertCard(1, 'YOASOBI ASIA TOUR 2026'),
  concertCard(2, 'Ado WORLD TOUR 2026'),
)

function renderPage(route = '/community/write') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/community/write" element={<PostWritePage />} />
          <Route path="/community/:id/edit" element={<PostWritePage />} />
          <Route path="/community/:id" element={<div>게시글 상세</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function typeContent(contentJson, length = 10) {
  act(() => {
    editor.props.onChange(contentJson)
    editor.props.onCharacterCountChange(length)
  })
}

async function fillAndSubmit(user, contentJson) {
  await user.type(screen.getByPlaceholderText('제목을 입력하세요'), '내한 후기')
  typeContent(contentJson)
  await user.click(screen.getByRole('button', { name: '등록' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  editor.props = null
  createPost.mockResolvedValue({ id: 10 })
  updatePost.mockResolvedValue({})
})

describe('PostWritePage', () => {
  describe('작성', () => {
    it('등록하면 payload에 entityTags가 없음', async () => {
      const user = userEvent.setup()
      renderPage()

      await fillAndSubmit(user, ONE_CONCERT_DOC)

      expect(createPost).toHaveBeenCalledTimes(1)
      expect(createPost.mock.calls[0][0]).not.toHaveProperty('entityTags')
    })

    it('공연 카드가 1개면 대표 공연 선택 UI 미표시', () => {
      renderPage()

      typeContent(ONE_CONCERT_DOC)

      expect(screen.queryByRole('group', { name: '대표 공연' })).not.toBeInTheDocument()
    })

    it('공연 카드가 2개 이상이면 대표 공연 선택 UI 표시', () => {
      renderPage()

      typeContent(TWO_CONCERTS_DOC)

      expect(screen.getByRole('group', { name: '대표 공연' })).toBeInTheDocument()
    })

    it('대표 공연을 고르지 않고 등록하면 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage()

      await fillAndSubmit(user, TWO_CONCERTS_DOC)

      expect(createPost.mock.calls[0][0]).not.toHaveProperty('coverConcertId')
    })

    it('대표 공연을 고르고 등록하면 payload에 고른 coverConcertId 포함', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByPlaceholderText('제목을 입력하세요'), '내한 후기')
      typeContent(TWO_CONCERTS_DOC)

      await user.click(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' }))
      await user.click(screen.getByRole('button', { name: '등록' }))

      expect(createPost.mock.calls[0][0]).toMatchObject({ coverConcertId: 2 })
    })

    it('고른 대표 공연 카드를 지웠다가 다시 넣으면 선택이 초기화되어 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage()
      await user.type(screen.getByPlaceholderText('제목을 입력하세요'), '내한 후기')
      typeContent(TWO_CONCERTS_DOC)
      await user.click(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' }))

      typeContent(ONE_CONCERT_DOC)
      typeContent(TWO_CONCERTS_DOC)

      expect(screen.getByRole('radio', { name: 'YOASOBI ASIA TOUR 2026' })).toBeChecked()
      await user.click(screen.getByRole('button', { name: '등록' }))
      expect(createPost.mock.calls[0][0]).not.toHaveProperty('coverConcertId')
    })

    it('글자 수가 10,000자를 초과하면 등록 버튼 비활성화', () => {
      renderPage()

      typeContent(ONE_CONCERT_DOC, 10001)

      expect(screen.getByRole('button', { name: '등록' })).toBeDisabled()
    })

    it.each([
      ['CONTENT_INVALID_FORMAT', '지원하지 않는 서식이 있어요. 붙여넣은 내용을 확인해주세요.'],
      ['POST_COVER_CONCERT_NOT_TAGGED', '대표 공연이 본문에 없어요. 대표 공연을 다시 골라주세요.'],
      ['UNKNOWN_ERROR', '게시글 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'],
    ])('등록 실패 코드가 %s이면 안내 문구 표시', async (code, message) => {
      const user = userEvent.setup()
      createPost.mockRejectedValue({ response: { data: { code } } })
      renderPage()

      await fillAndSubmit(user, ONE_CONCERT_DOC)

      expect(await screen.findByText(message)).toBeInTheDocument()
    })
  })

  describe('수정', () => {
    beforeEach(() => {
      getPost.mockResolvedValue({
        id: 5,
        category: 'REVIEW',
        title: '내한 후기',
        content: TWO_CONCERTS_DOC,
        coverConcertId: 2,
        isAuthor: true,
      })
    })

    it('기존 coverConcertId의 공연이 선택된 상태로 표시', async () => {
      renderPage('/community/5/edit')

      expect(await screen.findByRole('radio', { name: 'Ado WORLD TOUR 2026' })).toBeChecked()
    })

    it('대표 공연을 건드리지 않고 수정하면 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage('/community/5/edit')

      await user.click(await screen.findByRole('button', { name: '수정 완료' }))

      expect(updatePost).toHaveBeenCalledTimes(1)
      expect(updatePost.mock.calls[0][0]).toBe(5)
      expect(updatePost.mock.calls[0][1]).not.toHaveProperty('coverConcertId')
    })

    // 기존 대표 공연 카드가 본문에서 빠지면 BE가 대표 공연을 비운다 (spec/api/posts.md PATCH 비고)
    it('기존 대표 공연 카드를 본문에서 지우고 수정하면 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage('/community/5/edit')
      await screen.findByRole('radio', { name: 'Ado WORLD TOUR 2026' })

      typeContent(ONE_CONCERT_DOC)
      await user.click(screen.getByRole('button', { name: '수정 완료' }))

      expect(updatePost).toHaveBeenCalledTimes(1)
      expect(updatePost.mock.calls[0][1]).not.toHaveProperty('coverConcertId')
      expect(updatePost.mock.calls[0][1].content).toEqual(ONE_CONCERT_DOC)
    })

    it('다른 공연을 골랐다가 기존 대표 공연으로 되돌리면 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage('/community/5/edit')

      await user.click(await screen.findByRole('radio', { name: 'YOASOBI ASIA TOUR 2026' }))
      await user.click(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' }))
      await user.click(screen.getByRole('button', { name: '수정 완료' }))

      expect(updatePost.mock.calls[0][1]).not.toHaveProperty('coverConcertId')
    })

    it('다른 공연을 고르고 수정하면 payload에 고른 coverConcertId 포함', async () => {
      const user = userEvent.setup()
      renderPage('/community/5/edit')

      await user.click(await screen.findByRole('radio', { name: 'YOASOBI ASIA TOUR 2026' }))
      await user.click(screen.getByRole('button', { name: '수정 완료' }))

      expect(updatePost.mock.calls[0][1]).toMatchObject({ coverConcertId: 1 })
    })

    // 최종 본문에 기존 대표 공연이 있으면 BE가 기존 대표 공연을 유지한다
    it('기존 대표 공연 카드를 지웠다가 다시 넣으면 기존 공연이 다시 선택된 상태로 표시', async () => {
      renderPage('/community/5/edit')
      await screen.findByRole('radio', { name: 'Ado WORLD TOUR 2026' })

      typeContent(ONE_CONCERT_DOC)
      typeContent(TWO_CONCERTS_DOC)

      expect(screen.getByRole('radio', { name: 'Ado WORLD TOUR 2026' })).toBeChecked()
    })

    it('기존 대표 공연 카드를 지웠다가 다시 넣고 수정하면 payload에 coverConcertId 없음', async () => {
      const user = userEvent.setup()
      renderPage('/community/5/edit')
      await screen.findByRole('radio', { name: 'Ado WORLD TOUR 2026' })
      typeContent(ONE_CONCERT_DOC)
      typeContent(TWO_CONCERTS_DOC)

      await user.click(screen.getByRole('button', { name: '수정 완료' }))

      expect(updatePost.mock.calls[0][1]).not.toHaveProperty('coverConcertId')
    })
  })

  describe('힌트 버튼', () => {
    it.each(['/ 서식', '@ 태그'])('%s 버튼 렌더', (name) => {
      renderPage()

      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })

    it.each([
      ['/ 서식', '/'],
      ['@ 태그', '@'],
    ])('%s 버튼을 클릭하면 insertTrigger(%s) 호출', async (name, char) => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name }))

      expect(editor.insertTrigger).toHaveBeenCalledWith(char)
    })
  })
})
