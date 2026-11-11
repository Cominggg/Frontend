import { createRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { searchMentions, searchTagSuggestions } from './mentionSearch'
import MentionTagMenu from './MentionTagMenu'

vi.mock('./mentionSearch', async (importOriginal) => ({
  ...(await importOriginal()),
  searchMentions: vi.fn(),
  searchTagSuggestions: vi.fn(),
}))

const CONCERT = {
  type: 'CONCERT',
  id: 1,
  title: 'YOASOBI ASIA TOUR 2026',
  subtitle: '2026.09.26',
  thumbnailUrl: 'https://example.com/concert.jpg',
  releaseGroupId: null,
}
const ARTIST = {
  type: 'ARTIST',
  id: 2,
  title: 'YOASOBI',
  subtitle: '일본',
  thumbnailUrl: 'https://example.com/artist.jpg',
  releaseGroupId: null,
}
const RELEASE = {
  type: 'RELEASE',
  id: 3,
  title: 'THE BOOK',
  subtitle: 'YOASOBI',
  thumbnailUrl: null,
  releaseGroupId: 'rg-the-book',
}

function results(list, meta = {}) {
  return Object.assign([...list], { failed: false, limitReached: false, ...meta })
}

function pageOf(list) {
  return Object.assign([...list], { hasMore: false })
}

// Suggestion처럼 loading 상태로 먼저 열고, 결과가 오면 새 items 배열로 다시 그린다
function renderMenu({ items, query = 'YOA', command = vi.fn(), getTags = () => [] } = {}) {
  const ref = createRef()
  const props = { query, command, getTags }
  const view = render(<MentionTagMenu ref={ref} items={[]} loading {...props} />)
  const update = (next) => view.rerender(<MentionTagMenu ref={ref} {...props} {...next} />)
  if (items) update({ items, loading: false })
  return { ref, command, update }
}

function pressKey(ref, key, options = {}) {
  let handled
  act(() => {
    handled = ref.current.onKeyDown({ event: { key, shiftKey: false, ...options } })
  })
  return handled
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MentionTagMenu', () => {
  describe('기본 후보', () => {
    it('처음 불러오는 중이면 찾고 있어요 표시', () => {
      renderMenu()

      expect(screen.getByRole('status')).toHaveTextContent('찾고 있어요')
    })

    it('결과가 오면 후보 행 표시', () => {
      renderMenu({ items: results([CONCERT, ARTIST]) })

      expect(screen.getByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^YOASOBI아티스트/ })).toBeInTheDocument()
    })

    it('종류 라벨과 subtitle을 가운뎃점으로 이어 표시', () => {
      renderMenu({ items: results([CONCERT]) })

      const row = screen.getByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })
      expect(within(row).getByText('공연 · 2026.09.26')).toBeInTheDocument()
    })

    it('제목 중 검색어 부분을 mark로 강조', () => {
      renderMenu({ items: results([CONCERT]), query: 'tour' })

      const row = screen.getByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })
      expect(within(row).getByText('TOUR', { selector: 'mark' })).toBeInTheDocument()
    })

    it('다시 불러오는 중이어도 이전 결과 유지', () => {
      const { update } = renderMenu({ items: results([CONCERT]) })

      update({ items: [], loading: true, query: 'YOAS' })

      expect(screen.getByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })).toBeInTheDocument()
    })

    it('결과가 비어 있으면 검색 결과 없음 안내', () => {
      renderMenu({ items: results([]), query: '없는가수' })

      expect(screen.getByRole('status')).toHaveTextContent("'없는가수' 검색 결과가 없어요")
    })

    it('limitReached면 태그 한도 안내', () => {
      renderMenu({ items: results([], { limitReached: true }) })

      expect(screen.getByRole('status')).toHaveTextContent('공연·아티스트·음악은 10개까지 넣을 수 있어요')
    })

    it('failed면 검색 실패 안내와 다시 시도 버튼 표시', () => {
      renderMenu({ items: results([], { failed: true }) })

      expect(screen.getByRole('status')).toHaveTextContent('검색하지 못했어요')
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
    })

    it('다시 시도를 누르면 다시 검색해 결과 표시', async () => {
      const user = userEvent.setup()
      const tags = [{ entityType: 'ARTIST', entityId: 2 }]
      searchTagSuggestions.mockResolvedValue(results([CONCERT]))
      renderMenu({ items: results([], { failed: true }), getTags: () => tags })

      await user.click(screen.getByRole('button', { name: '다시 시도' }))

      expect(searchTagSuggestions).toHaveBeenCalledWith('YOA', tags)
      expect(await screen.findByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })).toBeInTheDocument()
    })

    it('행을 클릭하면 command에 언급 정보 전달', async () => {
      const user = userEvent.setup()
      const { command } = renderMenu({ items: results([CONCERT, RELEASE]) })

      await user.click(screen.getByRole('button', { name: /THE BOOK/ }))

      expect(command).toHaveBeenCalledWith({
        type: 'RELEASE',
        id: 3,
        title: 'THE BOOK',
        subtitle: 'YOASOBI',
        thumbnailUrl: null,
        releaseGroupId: 'rg-the-book',
      })
    })
  })

  describe('onKeyDown', () => {
    it('Enter를 누르면 첫 후보로 command 호출', () => {
      const { ref, command } = renderMenu({ items: results([CONCERT, ARTIST]) })

      pressKey(ref, 'Enter')

      expect(command).toHaveBeenCalledWith(expect.objectContaining({ type: 'CONCERT', id: 1 }))
    })

    it('ArrowDown 후 Enter면 다음 후보 선택', () => {
      const { ref, command } = renderMenu({ items: results([CONCERT, ARTIST]) })

      pressKey(ref, 'ArrowDown')
      pressKey(ref, 'Enter')

      expect(command).toHaveBeenCalledWith(expect.objectContaining({ type: 'ARTIST', id: 2 }))
    })

    it('마지막에서 ArrowDown을 누르면 처음으로 순환', () => {
      const { ref, command } = renderMenu({ items: results([CONCERT, ARTIST]) })

      pressKey(ref, 'ArrowDown')
      pressKey(ref, 'ArrowDown')
      pressKey(ref, 'Enter')

      expect(command).toHaveBeenCalledWith(expect.objectContaining({ type: 'CONCERT', id: 1 }))
    })

    it('처음에서 ArrowUp을 누르면 마지막으로 순환', () => {
      const { ref, command } = renderMenu({ items: results([CONCERT, ARTIST, RELEASE]) })

      pressKey(ref, 'ArrowUp')
      pressKey(ref, 'Enter')

      expect(command).toHaveBeenCalledWith(expect.objectContaining({ type: 'RELEASE', id: 3 }))
    })

    it('결과가 없으면 키 입력을 처리하지 않고 false 반환', () => {
      const { ref } = renderMenu({ items: results([]) })

      expect(pressKey(ref, 'Enter')).toBe(false)
      expect(pressKey(ref, 'Tab')).toBe(false)
    })
  })

  describe('종류별로 더 찾기', () => {
    it('더 찾기 버튼을 누르면 종류 탭 4개 표시', async () => {
      const user = userEvent.setup()
      searchMentions.mockResolvedValue(pageOf([ARTIST]))
      renderMenu({ items: results([ARTIST, CONCERT]) })

      await user.click(screen.getByRole('button', { name: /'YOA' 종류별로 더 찾기/ }))

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['공연', '아티스트', '음악', '트랙'])
    })

    it('펼치면 맨 위 후보의 종류 탭이 선택됨', async () => {
      const user = userEvent.setup()
      searchMentions.mockResolvedValue(pageOf([ARTIST]))
      renderMenu({ items: results([ARTIST, CONCERT]) })

      await user.click(screen.getByRole('button', { name: /종류별로 더 찾기/ }))

      expect(screen.getByRole('tab', { name: '아티스트' })).toHaveAttribute('aria-selected', 'true')
    })

    it('펼치면 그 종류로 검색한 결과 목록 표시', async () => {
      const user = userEvent.setup()
      const artistPage = { ...ARTIST, id: 20, title: 'YOASOBI (Ayase)' }
      searchMentions.mockResolvedValue(pageOf([artistPage]))
      renderMenu({ items: results([ARTIST, CONCERT]) })

      await user.click(screen.getByRole('button', { name: /종류별로 더 찾기/ }))

      expect(searchMentions).toHaveBeenCalledWith('ARTIST', 'YOA')
      expect(await screen.findByRole('button', { name: /YOASOBI \(Ayase\)/ })).toBeInTheDocument()
    })

    it('Tab을 누르면 펼쳐짐', async () => {
      searchMentions.mockResolvedValue(pageOf([CONCERT]))
      const { ref } = renderMenu({ items: results([CONCERT]) })

      const handled = pressKey(ref, 'Tab')

      expect(handled).toBe(true)
      expect(screen.getByRole('tab', { name: '공연' })).toHaveAttribute('aria-selected', 'true')
      await screen.findByRole('button', { name: /YOASOBI ASIA TOUR 2026/ })
    })

    it('펼친 상태에서 Tab을 누르면 다음 종류 탭 선택', async () => {
      searchMentions.mockResolvedValue(pageOf([]))
      const { ref } = renderMenu({ items: results([CONCERT]) })
      pressKey(ref, 'Tab')

      pressKey(ref, 'Tab')

      expect(screen.getByRole('tab', { name: '아티스트' })).toHaveAttribute('aria-selected', 'true')
      await screen.findByRole('status')
    })

    it('펼친 상태에서 Shift+Tab을 누르면 이전 종류 탭 선택', async () => {
      searchMentions.mockResolvedValue(pageOf([]))
      const { ref } = renderMenu({ items: results([ARTIST]) })
      pressKey(ref, 'Tab')

      pressKey(ref, 'Tab', { shiftKey: true })

      expect(screen.getByRole('tab', { name: '공연' })).toHaveAttribute('aria-selected', 'true')
      await screen.findByRole('status')
    })

    it('공연 탭에서 Shift+Tab을 누르면 트랙 탭으로 순환', async () => {
      searchMentions.mockResolvedValue(pageOf([]))
      const { ref } = renderMenu({ items: results([CONCERT]) })
      pressKey(ref, 'Tab')

      pressKey(ref, 'Tab', { shiftKey: true })

      expect(screen.getByRole('tab', { name: '트랙' })).toHaveAttribute('aria-selected', 'true')
      await screen.findByRole('status')
    })

    it('트랙 탭에서 Tab을 누르면 공연 탭으로 순환', async () => {
      searchMentions.mockResolvedValue(pageOf([]))
      const { ref } = renderMenu({ items: results([CONCERT]) })
      pressKey(ref, 'Tab')
      pressKey(ref, 'Tab', { shiftKey: true })

      pressKey(ref, 'Tab')

      expect(screen.getByRole('tab', { name: '공연' })).toHaveAttribute('aria-selected', 'true')
      await screen.findByRole('status')
    })

    it('태그가 10개 이상이면 펼친 목록에 이미 태그된 것만 남김', async () => {
      const user = userEvent.setup()
      const otherArtist = { ...ARTIST, id: 99, title: 'YOAKE' }
      const tags = [
        { entityType: 'ARTIST', entityId: 2 },
        ...Array.from({ length: 9 }, (_, i) => ({ entityType: 'CONCERT', entityId: 100 + i })),
      ]
      searchMentions.mockResolvedValue(pageOf([ARTIST, otherArtist]))
      renderMenu({ items: results([ARTIST]), getTags: () => tags })

      await user.click(screen.getByRole('button', { name: /종류별로 더 찾기/ }))

      expect(await screen.findByRole('button', { name: /^YOASOBI/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /YOAKE/ })).not.toBeInTheDocument()
    })
  })
})
