import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(modal) {
  return modal ? [...modal.querySelectorAll(FOCUSABLE)] : []
}

// 모달 공통 접근성 훅 — 열렸을 때 첫 요소에 포커스를 주고, Tab을 모달
// 안에 가두고, Escape로 닫고, 닫히면 모달을 연 요소로 포커스를 되돌린다.
// contentKey를 넘기면 모달 내부 화면이 (폼 → 완료 화면처럼) 바뀌어 포커스가
// 모달 밖으로 빠졌을 때 첫 요소로 다시 잡아준다.
export default function useModalA11y(onClose, { isOpen = true, contentKey } = {}) {
  const modalRef = useRef(null)
  // 호출부가 인라인 화살표 함수를 넘기므로 ref로 보관해 부모 리렌더 때
  // effect가 다시 돌며 포커스가 튀지 않도록 한다.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!isOpen) return undefined

    const opener = document.activeElement
    getFocusable(modalRef.current)[0]?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      // 비활성 버튼·교체된 요소를 반영하도록 Tab마다 현재 목록을 다시 읽는다.
      const focusable = getFocusable(modalRef.current)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const modal = modalRef.current
    if (modal && !modal.contains(document.activeElement)) {
      getFocusable(modal)[0]?.focus()
    }
  }, [isOpen, contentKey])

  return modalRef
}
