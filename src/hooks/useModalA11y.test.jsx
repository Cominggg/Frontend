import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useModalA11y from './useModalA11y'

function TestModal({ onClose, isOpen = true, contentKey, step = 'form', submitDisabled = false }) {
  const modalRef = useModalA11y(onClose, { isOpen, contentKey })
  if (!isOpen) return null

  return (
    <div role="dialog" aria-modal="true" aria-label="문의하기" ref={modalRef}>
      {step === 'form' ? (
        <>
          <button type="button" disabled={submitDisabled}>임시 저장</button>
          <input aria-label="문의 내용" />
          <button type="button">제출</button>
        </>
      ) : (
        <button type="button">확인</button>
      )}
      <button type="button" onClick={onClose}>닫기</button>
    </div>
  )
}

// 모달을 여는 버튼과 함께 렌더링해 포커스 복귀를 검증한다.
// conditional이면 닫힐 때 모달 컴포넌트 자체를 언마운트한다.
function App({ onClose = () => {}, conditional = false }) {
  const [open, setOpen] = useState(false)
  const handleClose = () => {
    onClose()
    setOpen(false)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>문의 열기</button>
      {conditional
        ? open && <TestModal onClose={handleClose} />
        : <TestModal onClose={handleClose} isOpen={open} />}
    </>
  )
}

describe('useModalA11y', () => {
  describe('초기 포커스', () => {
    it('열리면 모달 안 첫 포커스 가능 요소에 포커스', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getByRole('button', { name: '문의 열기' }))

      expect(screen.getByRole('button', { name: '임시 저장' })).toHaveFocus()
    })

    it('비활성 버튼은 건너뛰고 첫 활성 요소에 포커스', () => {
      render(<TestModal onClose={() => {}} submitDisabled />)

      expect(screen.getByRole('textbox', { name: '문의 내용' })).toHaveFocus()
    })

    it('isOpen이 false면 포커스를 옮기지 않음', () => {
      render(
        <>
          <button type="button" autoFocus>문의 열기</button>
          <TestModal onClose={() => {}} isOpen={false} />
        </>,
      )

      expect(screen.getByRole('button', { name: '문의 열기' })).toHaveFocus()
    })
  })

  describe('포커스 트랩', () => {
    it('마지막 요소에서 Tab하면 첫 요소로 이동', async () => {
      const user = userEvent.setup()
      render(<TestModal onClose={() => {}} />)
      screen.getByRole('button', { name: '닫기' }).focus()

      await user.tab()

      expect(screen.getByRole('button', { name: '임시 저장' })).toHaveFocus()
    })

    it('첫 요소에서 Shift+Tab하면 마지막 요소로 이동', async () => {
      const user = userEvent.setup()
      render(<TestModal onClose={() => {}} />)

      await user.tab({ shift: true })

      expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    })

    it('중간 요소에서 Tab하면 다음 요소로 이동', async () => {
      const user = userEvent.setup()
      render(<TestModal onClose={() => {}} />)

      await user.tab()

      expect(screen.getByRole('textbox', { name: '문의 내용' })).toHaveFocus()
    })

    it('첫 요소가 비활성화되면 그다음 활성 요소를 첫 요소로 보고 순환', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TestModal onClose={() => {}} />)
      rerender(<TestModal onClose={() => {}} submitDisabled />)
      screen.getByRole('button', { name: '닫기' }).focus()

      await user.tab()

      expect(screen.getByRole('textbox', { name: '문의 내용' })).toHaveFocus()
    })
  })

  describe('Escape', () => {
    it('Escape를 누르면 onClose 호출', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TestModal onClose={onClose} />)

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('리렌더로 onClose가 바뀌면 최신 onClose 호출', async () => {
      const user = userEvent.setup()
      const prevOnClose = vi.fn()
      const nextOnClose = vi.fn()
      const { rerender } = render(<TestModal onClose={prevOnClose} />)
      rerender(<TestModal onClose={nextOnClose} />)

      await user.keyboard('{Escape}')

      expect(prevOnClose).not.toHaveBeenCalled()
      expect(nextOnClose).toHaveBeenCalledTimes(1)
    })

    it('isOpen이 false면 Escape를 눌러도 onClose 미호출', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TestModal onClose={onClose} isOpen={false} />)

      await user.keyboard('{Escape}')

      expect(onClose).not.toHaveBeenCalled()
    })

    it('닫힌 뒤 Escape를 누르면 onClose 미호출', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<App onClose={onClose} />)
      await user.click(screen.getByRole('button', { name: '문의 열기' }))
      await user.keyboard('{Escape}')

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('포커스 유지·복귀', () => {
    it('부모가 리렌더돼도 포커스가 첫 요소로 튀지 않음', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TestModal onClose={() => {}} />)
      await user.tab()

      rerender(<TestModal onClose={() => {}} />)

      expect(screen.getByRole('textbox', { name: '문의 내용' })).toHaveFocus()
    })

    it('isOpen이 false로 바뀌면 모달을 연 요소로 포커스 복귀', async () => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('button', { name: '문의 열기' }))

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '문의 열기' })).toHaveFocus()
    })

    it('모달이 언마운트되면 모달을 연 요소로 포커스 복귀', async () => {
      const user = userEvent.setup()
      render(<App conditional />)
      await user.click(screen.getByRole('button', { name: '문의 열기' }))

      await user.click(screen.getByRole('button', { name: '닫기' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '문의 열기' })).toHaveFocus()
    })
  })

  describe('contentKey', () => {
    it('화면이 바뀌어 포커스가 모달 밖으로 빠지면 새 화면 첫 요소에 포커스', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TestModal onClose={() => {}} contentKey="form" step="form" />)
      await user.click(screen.getByRole('button', { name: '제출' }))

      rerender(<TestModal onClose={() => {}} contentKey="done" step="done" />)

      expect(screen.getByRole('button', { name: '확인' })).toHaveFocus()
    })

    it('화면이 바뀌어도 포커스가 모달 안에 있으면 유지', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<TestModal onClose={() => {}} contentKey="form" step="form" />)
      await user.tab({ shift: true })

      rerender(<TestModal onClose={() => {}} contentKey="done" step="done" />)

      expect(screen.getByRole('button', { name: '닫기' })).toHaveFocus()
    })
  })
})
