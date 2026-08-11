import { useEffect } from 'react'

const DEFAULT_TITLE = '커밍'
const DEFAULT_OG_TITLE = '커밍 - Jpop 아티스트 내한 공연 정보'
const DEFAULT_DESCRIPTION = 'Jpop 아티스트 내한 공연 정보를 한 곳에서 확인하세요. 공연 일정, 아티스트, 발매 소식을 통합 제공하는 커밍입니다.'
const DEFAULT_URL = 'https://comingg.com'
const DEFAULT_IMAGE = 'https://comingg.com/logo-transparent.png'

function setMetaContent(property, content) {
  document.querySelector(`meta[property="${property}"]`)?.setAttribute('content', content)
}

// SSR/프리렌더링이 없는 CSR 환경이라 JS를 실행하지 않는 공유 미리보기 봇(카카오톡·페이스북 등)에는
// 반영되지 않는다. 브라우저 탭 제목과 JS를 렌더링하는 검색엔진(Googlebot 등) 대상 개선용.
export default function usePageMeta({ title, description, path, image }) {
  useEffect(() => {
    if (!title) return

    document.title = title
    setMetaContent('og:title', title)
    setMetaContent('og:description', description || DEFAULT_DESCRIPTION)
    setMetaContent('og:url', `https://comingg.com${path}`)
    setMetaContent('og:image', image || DEFAULT_IMAGE)

    return () => {
      document.title = DEFAULT_TITLE
      setMetaContent('og:title', DEFAULT_OG_TITLE)
      setMetaContent('og:description', DEFAULT_DESCRIPTION)
      setMetaContent('og:url', DEFAULT_URL)
      setMetaContent('og:image', DEFAULT_IMAGE)
    }
  }, [title, description, path, image])
}
