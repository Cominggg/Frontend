import { useEffect } from 'react'
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

  useEffect(() => {
    const path = `${location.pathname}${sanitizeSearch(location.search)}`
    trackPageView(path, document.title)
  }, [location.pathname, location.search])

  return null
}

export default PageViewTracker
