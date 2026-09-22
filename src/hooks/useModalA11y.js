import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// 모달 공통 접근성 훅 — 열렸을 때 첫 요소에 포커스를 주고, Tab을 모달
// 안에 가두고, Escape로 닫는다. contentKey를 넘기면 모달 내부 화면이
// (폼 → 완료 화면처럼) 바뀔 때 포커스 가능한 요소 목록을 다시 계산한다.
export default function useModalA11y(onClose, { isOpen = true, contentKey } = {}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    const focusable = modal ? [...modal.querySelectorAll(FOCUSABLE)] : []
    focusable[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, contentKey])

  return modalRef
}
