import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminNoticeFormPage from './AdminNoticeFormPage'
import { ROUTES } from '@/constants/routes'
import { createNotice, getAdminNotice, updateNotice } from '@/services/adminApi'

vi.mock('@/services/adminApi', () => ({
  getAdminNotice: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
}))

// Tiptap 에디터 대신 받은 content를 JSON 문자열로 보여 주고, 최신 props를 보관해
// 테스트가 onChange·onCharacterCountChange를 직접 호출한다
const editor = vi.hoisted(() => ({ props: null }))
vi.mock('@/components/post/editor/PostEditor', () => ({
  default: (props) => {
    editor.props = props
    return <pre>{JSON.stringify(props.content)}</pre>
  },
}))

function createDoc(text) {
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }
}

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }
const NOTICE_V1 = { id: 1, title: '서비스 점검 안내', content: createDoc('9월 26일 새벽 점검이 진행됩니다.'), active: true }
const NOTICE_V2 = { id: 1, title: '서비스 점검 일정 변경', content: createDoc('점검이 9월 27일로 연기되었습니다.'), active: false }
const NEW_DOC = createDoc('10월 정기 점검 안내입니다.')

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPage({ route, queryClient = createQueryClient() }) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/admin/notices/new" element={<AdminNoticeFormPage />} />
          <Route path="/admin/notices/:id/edit" element={<AdminNoticeFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function getTitle() {
  return screen.getByRole('textbox', { name: /제목/ })
}

function getActive() {
  return screen.getByRole('checkbox', { name: '커뮤니티 홈에 노출' })
}

function queryContentGroup() {
  return screen.queryByRole('group', { name: /내용/ })
}

function typeContent(contentJson, length = 10) {
  act(() => {
    editor.props.onChange(contentJson)
    editor.props.onCharacterCountChange(length)
  })
}

function getSubmit() {
  return screen.getByRole('button', { name: '저장' })
}

async function fillNewNotice(user, { content = NEW_DOC, length = 10 } = {}) {
  await user.type(getTitle(), '10월 정기 점검')
  typeContent(content, length)
}

function serverError(code) {
  return Object.assign(new Error('Bad Request'), { response: { data: { code } } })
}

beforeEach(() => {
  vi.clearAllMocks()
  editor.props = null
  createNotice.mockResolvedValue({ id: 2 })
  updateNotice.mockResolvedValue({ id: 1 })
})

describe('AdminNoticeFormPage', () => {
  describe('수정 모드', () => {
    it('조회 중이면 입력 필드가 비활성화', () => {
      getAdminNotice.mockReturnValue(deferred().promise)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      expect(getTitle()).toBeDisabled()
      expect(getActive()).toBeDisabled()
    })

    it('조회 중이면 에디터 대신 로딩 자리표시를 표시', () => {
      getAdminNotice.mockReturnValue(deferred().promise)
      const { container } = renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      expect(queryContentGroup()).not.toBeInTheDocument()
      expect(editor.props).toBeNull()
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    })

    it('조회가 끝나면 결과로 폼을 채우고 입력 필드 활성화', async () => {
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      expect(await screen.findByDisplayValue(NOTICE_V1.title)).toBeEnabled()
      expect(getAdminNotice).toHaveBeenCalledWith('1')
      expect(getActive()).toBeChecked()
      expect(getActive()).toBeEnabled()
    })

    it('조회가 끝나면 조회한 content로 에디터를 띄움', async () => {
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })

      const group = await screen.findByRole('group', { name: /내용/ })

      expect(within(group).getByText(JSON.stringify(NOTICE_V1.content))).toBeInTheDocument()
    })

    it('같은 QueryClient로 다시 진입하면 이전 캐시가 아닌 새 조회 결과로 폼을 채움', async () => {
      const queryClient = createQueryClient()
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      const { unmount } = renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1), queryClient })
      await screen.findByDisplayValue(NOTICE_V1.title)
      unmount()
      // gcTime: 0이라 언마운트 후 setTimeout(0)으로 캐시가 제거됨
      await waitFor(() => expect(queryClient.getQueryData(['admin', 'notice', '1'])).toBeUndefined())
      const second = deferred()
      getAdminNotice.mockReturnValue(second.promise)

      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1), queryClient })

      expect(getTitle()).toBeDisabled()
      expect(getTitle()).toHaveValue('')
      expect(queryContentGroup()).not.toBeInTheDocument()
      second.resolve(NOTICE_V2)
      expect(await screen.findByDisplayValue(NOTICE_V2.title)).toBeEnabled()
      const group = screen.getByRole('group', { name: /내용/ })
      expect(within(group).getByText(JSON.stringify(NOTICE_V2.content))).toBeInTheDocument()
      expect(getActive()).not.toBeChecked()
      expect(screen.queryByDisplayValue(NOTICE_V1.title)).not.toBeInTheDocument()
    })

    it('조회에 실패하면 에러 메시지 표시', async () => {
      getAdminNotice.mockRejectedValue(new Error('Not Found'))
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(999) })

      expect(await screen.findByText('공지를 찾을 수 없습니다.')).toBeInTheDocument()
    })

    it('저장하면 updateNotice에 content JSON을 그대로 전달', async () => {
      const user = userEvent.setup()
      getAdminNotice.mockResolvedValue(NOTICE_V1)
      renderPage({ route: ROUTES.ADMIN_NOTICE_EDIT(1) })
      await screen.findByDisplayValue(NOTICE_V1.title)
      typeContent(NEW_DOC)

      await user.click(getSubmit())

      expect(updateNotice).toHaveBeenCalledWith('1', { title: NOTICE_V1.title, content: NEW_DOC, active: true })
    })
  })

  describe('작성 모드', () => {
    it('id가 없으면 조회하지 않고 입력 필드 활성화', () => {
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })

      expect(getAdminNotice).not.toHaveBeenCalled()
      expect(getTitle()).toBeEnabled()
      expect(getActive()).toBeEnabled()
      expect(queryContentGroup()).toBeInTheDocument()
    })

    it('에디터에 tagLimit={false}를 전달', () => {
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })

      expect(editor.props.tagLimit).toBe(false)
    })

    it('제목만 있고 본문이 비면 저장 버튼 비활성화', async () => {
      const user = userEvent.setup()
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })

      await fillNewNotice(user, { content: EMPTY_DOC, length: 0 })

      expect(getSubmit()).toBeDisabled()
    })

    it('제목과 본문을 채우면 저장 버튼 활성화', async () => {
      const user = userEvent.setup()
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })

      await fillNewNotice(user)

      expect(getSubmit()).toBeEnabled()
    })

    it('저장하면 createNotice에 content JSON을 그대로 전달', async () => {
      const user = userEvent.setup()
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })
      await fillNewNotice(user)

      await user.click(getSubmit())

      expect(createNotice).toHaveBeenCalledWith({ title: '10월 정기 점검', content: NEW_DOC, active: true })
    })

    it('글자 수가 10,000자를 넘으면 저장 시 안내를 표시하고 API를 호출하지 않음', async () => {
      const user = userEvent.setup()
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })
      await fillNewNotice(user, { length: 10001 })

      await user.click(getSubmit())

      expect(screen.getByText('내용은 10,000자를 넘을 수 없습니다.')).toBeInTheDocument()
      expect(createNotice).not.toHaveBeenCalled()
    })

    it.each([
      ['CONTENT_INVALID_FORMAT', '지원하지 않는 서식이 있어요. 붙여넣은 내용을 확인해주세요.'],
      ['CONTENT_TOO_LONG', '본문이 너무 길어요. 글자 수를 줄여주세요.'],
      ['INTERNAL_SERVER_ERROR', '저장에 실패했습니다. 다시 시도해주세요.'],
    ])('서버가 %s 코드로 실패하면 안내 문구 표시', async (code, message) => {
      const user = userEvent.setup()
      createNotice.mockRejectedValue(serverError(code))
      renderPage({ route: ROUTES.ADMIN_NOTICE_NEW })
      await fillNewNotice(user)

      await user.click(getSubmit())

      expect(await screen.findByText(message)).toBeInTheDocument()
    })
  })
})
