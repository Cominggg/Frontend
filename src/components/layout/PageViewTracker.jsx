import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { trackPageView } from '@/utils/analytics'

// 검색어(q)는 사용자가 자유 텍스트로 입력하는 값이라 이메일·전화번호 등이
// 섞여 들어올 수 있어 GA4로 전송되는 경로에서 제외한다.
function sanitizeSearch(search) {
  const params = new URLSearchParams(search)
  params.delete('q')
  const query = params.toString()
  return query ? `?${query}` : ''
}

function PageViewTracker() {
  const location = useLocation()
  const pathRef = useRef('')

  useEffect(() => {
    pathRef.current = `${location.pathname}${sanitizeSearch(location.search)}`
    trackPageView(pathRef.current, document.title)

    // 상세페이지는 데이터 로딩 후 usePageMeta가 document.title을 비동기로
    // 갱신하므로, 최초 전송 이후 실제 타이틀이 확정되면 한 번 더 보정 전송한다.
    const titleEl = document.querySelector('title')
    if (!titleEl) return

    const observer = new MutationObserver(() => {
      trackPageView(pathRef.current, document.title)
    })
    observer.observe(titleEl, { childList: true, characterData: true, subtree: true })
    return () => observer.disconnect()
  }, [location.pathname, location.search])

  return null
}

export default PageViewTracker
