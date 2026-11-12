import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostActionMenu from './PostActionMenu'

function renderMenu(props = {}) {
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onReport: vi.fn() }
  render(
    <>
      <PostActionMenu isAuthor={false} {...handlers} {...props} />
      <button type="button">바깥</button>
    </>,
  )
  return handlers
}

async function openMenu(user) {
  await user.click(screen.getByRole('button', { name: '게시글 메뉴' }))
}

function getPanel() {
  return screen.getByRole('group', { name: '게시글 작업' })
}

function queryPanel() {
  return screen.queryByRole('group', { name: '게시글 작업' })
}

function panelButtonLabels() {
  return within(getPanel())
    .getAllByRole('button')
    .map((button) => button.textContent)
}

async function openDeleteConfirm(user) {
  await openMenu(user)
  await user.click(within(getPanel()).getByRole('button', { name: '삭제' }))
}

describe('PostActionMenu', () => {
  it('트리거를 누르면 패널이 열리고 aria-expanded가 true', async () => {
    const user = userEvent.setup()
    renderMenu()

    await openMenu(user)

    expect(getPanel()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '게시글 메뉴' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('열리면 트리거의 aria-controls가 패널 id를 가리킴', async () => {
    const user = userEvent.setup()
    renderMenu()

    await openMenu(user)

    expect(screen.getByRole('button', { name: '게시글 메뉴' })).toHaveAttribute('aria-controls', getPanel().id)
  })

  it('작성자면 수정·삭제만 표시하고 신고는 없음', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })

    await openMenu(user)

    expect(panelButtonLabels()).toEqual(['수정', '삭제'])
  })

  it('작성자가 아니면 신고만 표시', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: false })

    await openMenu(user)

    expect(panelButtonLabels()).toEqual(['신고'])
  })

  it('수정을 클릭하면 onEdit 호출 후 패널 닫힘', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderMenu({ isAuthor: true })
    await openMenu(user)

    await user.click(within(getPanel()).getByRole('button', { name: '수정' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('신고를 클릭하면 onReport 호출 후 패널 닫힘', async () => {
    const user = userEvent.setup()
    const { onReport } = renderMenu({ isAuthor: false })
    await openMenu(user)

    await user.click(within(getPanel()).getByRole('button', { name: '신고' }))

    expect(onReport).toHaveBeenCalledTimes(1)
    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('삭제를 클릭하면 onDelete 호출 없이 확인 문구와 취소·삭제 버튼 표시', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })

    await openDeleteConfirm(user)

    expect(onDelete).not.toHaveBeenCalled()
    expect(within(getPanel()).getByText('게시글을 삭제할까요?')).toBeInTheDocument()
    expect(panelButtonLabels()).toEqual(['취소', '삭제'])
  })

  it('확인 단계에서 삭제를 클릭하면 onDelete 1회 호출하고 패널은 열린 채 유지', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })
    await openDeleteConfirm(user)

    await user.click(within(getPanel()).getByRole('button', { name: '삭제' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(getPanel()).toBeInTheDocument()
  })

  it('확인 단계에서 취소를 클릭하면 onDelete 호출 없이 수정·삭제 항목으로 복귀', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })
    await openDeleteConfirm(user)

    await user.click(within(getPanel()).getByRole('button', { name: '취소' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByText('게시글을 삭제할까요?')).not.toBeInTheDocument()
    expect(panelButtonLabels()).toEqual(['수정', '삭제'])
  })

  it('isDeleting이면 확인 단계의 삭제 버튼이 삭제 중...으로 바뀌고 비활성화', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true, isDeleting: true })

    await openDeleteConfirm(user)

    expect(within(getPanel()).getByRole('button', { name: '삭제 중...' })).toBeDisabled()
  })

  it('isDeleting이면 확인 단계의 취소 버튼 비활성화', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true, isDeleting: true })

    await openDeleteConfirm(user)

    expect(within(getPanel()).getByRole('button', { name: '취소' })).toBeDisabled()
  })

  it('deleteError가 있으면 확인 단계에서 alert로 메시지 표시', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true, deleteError: '삭제에 실패했어요. 다시 시도해 주세요.' })

    await openDeleteConfirm(user)

    expect(within(getPanel()).getByRole('alert')).toHaveTextContent('삭제에 실패했어요. 다시 시도해 주세요.')
  })

  it('deleteError가 없으면 확인 단계에 alert 없음', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })

    await openDeleteConfirm(user)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Escape 키를 누르면 패널 닫힘', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    await user.keyboard('{Escape}')

    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('Escape 키로 닫으면 트리거 버튼으로 포커스 복귀', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)
    within(getPanel()).getByRole('button', { name: '신고' }).focus()

    await user.keyboard('{Escape}')

    expect(screen.getByRole('button', { name: '게시글 메뉴' })).toHaveFocus()
  })

  it('바깥 영역을 누르면 패널 닫힘', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    await user.click(screen.getByRole('button', { name: '바깥' }))

    expect(queryPanel()).not.toBeInTheDocument()
  })

  it('삭제를 눌러 확인 단계에 들어가면 onDeleteConfirmStart 1회 호출', async () => {
    const user = userEvent.setup()
    const onDeleteConfirmStart = vi.fn()
    renderMenu({ isAuthor: true, onDeleteConfirmStart })

    await openDeleteConfirm(user)

    expect(onDeleteConfirmStart).toHaveBeenCalledTimes(1)
  })

  it('삭제 확인 중 닫았다가 다시 열면 확인 상태가 초기화됨', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })
    await openDeleteConfirm(user)
    await user.keyboard('{Escape}')

    await openMenu(user)

    expect(screen.queryByText('게시글을 삭제할까요?')).not.toBeInTheDocument()
    expect(panelButtonLabels()).toEqual(['수정', '삭제'])
  })

  it('isDeleting이면 작성자 메뉴의 수정 버튼 비활성화', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true, isDeleting: true })

    await openMenu(user)

    expect(within(getPanel()).getByRole('button', { name: '수정' })).toBeDisabled()
  })

  it('isDeleting이 아니면 작성자 메뉴의 수정 버튼 활성화', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })

    await openMenu(user)

    expect(within(getPanel()).getByRole('button', { name: '수정' })).toBeEnabled()
  })

  it('삭제를 눌러 확인 단계에 들어가면 취소 버튼으로 포커스 이동', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })

    await openDeleteConfirm(user)

    expect(within(getPanel()).getByRole('button', { name: '취소' })).toHaveFocus()
  })

  it('확인 단계에서 취소를 누르면 삭제 항목 버튼으로 포커스 복귀', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })
    await openDeleteConfirm(user)

    await user.click(within(getPanel()).getByRole('button', { name: '취소' }))

    expect(within(getPanel()).getByRole('button', { name: '삭제' })).toHaveFocus()
  })
})
