import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('PostActionMenu', () => {
  it('트리거를 누르면 메뉴가 열리고 aria-expanded가 true', async () => {
    const user = userEvent.setup()
    renderMenu()

    await openMenu(user)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '게시글 메뉴' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('작성자면 수정·삭제만 표시하고 신고는 없음', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })

    await openMenu(user)

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['수정', '삭제'])
  })

  it('작성자가 아니면 신고만 표시', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: false })

    await openMenu(user)

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['신고'])
  })

  it('수정을 클릭하면 onEdit 호출 후 메뉴 닫힘', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderMenu({ isAuthor: true })
    await openMenu(user)

    await user.click(screen.getByRole('menuitem', { name: '수정' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('신고를 클릭하면 onReport 호출 후 메뉴 닫힘', async () => {
    const user = userEvent.setup()
    const { onReport } = renderMenu({ isAuthor: false })
    await openMenu(user)

    await user.click(screen.getByRole('menuitem', { name: '신고' }))

    expect(onReport).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('삭제를 클릭하면 onDelete 호출 없이 확인 문구와 취소·삭제 버튼 표시', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })
    await openMenu(user)

    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByText('게시글을 삭제할까요?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument()
  })

  it('확인 단계에서 삭제를 클릭하면 onDelete 1회 호출 후 메뉴 닫힘', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    await user.click(screen.getByRole('button', { name: '삭제' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('확인 단계에서 취소를 클릭하면 onDelete 호출 없이 수정·삭제 항목으로 복귀', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderMenu({ isAuthor: true })
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.queryByText('게시글을 삭제할까요?')).not.toBeInTheDocument()
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['수정', '삭제'])
  })

  it('isDeleting이면 확인 단계의 삭제 버튼 비활성화', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true, isDeleting: true })
    await openMenu(user)

    await user.click(screen.getByRole('menuitem', { name: '삭제' }))

    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled()
  })

  it('Escape 키를 누르면 메뉴 닫힘', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('바깥 영역을 누르면 메뉴 닫힘', async () => {
    const user = userEvent.setup()
    renderMenu()
    await openMenu(user)

    await user.click(screen.getByRole('button', { name: '바깥' }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('삭제 확인 중 닫았다가 다시 열면 확인 상태가 초기화됨', async () => {
    const user = userEvent.setup()
    renderMenu({ isAuthor: true })
    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: '삭제' }))
    await user.keyboard('{Escape}')

    await openMenu(user)

    expect(screen.queryByText('게시글을 삭제할까요?')).not.toBeInTheDocument()
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['수정', '삭제'])
  })
})
