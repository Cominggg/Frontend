import { useEffect } from 'react'

import { SITE_LOGO_URL, SITE_URL } from '@/constants/site'

const DEFAULT_TITLE = '커밍 - Jpop 아티스트 내한일정·공연 정보'
const DEFAULT_OG_TITLE = DEFAULT_TITLE
const DEFAULT_DESCRIPTION = 'Jpop 아티스트 내한일정을 한 곳에서 확인하세요. 공연 정보, 아티스트, 발매 소식까지 통합 제공하는 커밍입니다.'
const DEFAULT_URL = SITE_URL
const DEFAULT_IMAGE = SITE_LOGO_URL

function setMetaContent(property, content) {
  document.querySelector(`meta[property="${property}"]`)?.setAttribute('content', content)
}

function setMetaByName(name, content) {
  document.querySelector(`meta[name="${name}"]`)?.setAttribute('content', content)
}

// 구글은 원본 HTML의 canonical을 JS로 바꾸는 것을 잘못된 구현으로 보므로, index.html에는
// canonical을 두지 않고 여기서만 생성·제거해 페이지당 하나만 존재하게 한다.
function setCanonicalHref(href) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove()
}

// SSR/프리렌더링이 없는 CSR 환경이라 JS를 실행하지 않는 공유 미리보기 봇(카카오톡·페이스북 등)에는
// 반영되지 않는다. 브라우저 탭 제목과 JS를 렌더링하는 검색엔진(Googlebot 등) 대상 개선용.
export default function usePageMeta({ title, description, path, image }) {
  useEffect(() => {
    if (!title) return

    const url = `${SITE_URL}${path}`

    document.title = title
    setMetaContent('og:title', title)
    setMetaContent('og:description', description || DEFAULT_DESCRIPTION)
    setMetaContent('og:url', url)
    setMetaContent('og:image', image || DEFAULT_IMAGE)
    setMetaByName('description', description || DEFAULT_DESCRIPTION)
    setCanonicalHref(url)

    return () => {
      document.title = DEFAULT_TITLE
      setMetaContent('og:title', DEFAULT_OG_TITLE)
      setMetaContent('og:description', DEFAULT_DESCRIPTION)
      setMetaContent('og:url', DEFAULT_URL)
      setMetaContent('og:image', DEFAULT_IMAGE)
      setMetaByName('description', DEFAULT_DESCRIPTION)
      removeCanonical()
    }
  }, [title, description, path, image])
}
