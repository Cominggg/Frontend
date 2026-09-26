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

// 구글은 원본 HTML의 canonical을 JS로 다른 값으로 바꾸는 것을 잘못된 구현으로 본다. 그래서 모든
// URL의 fallback인 index.html에는 canonical을 두지 않고, 빌드 시 생성된 페이지(scripts/prerender-meta.js)만
// 같은 값의 canonical을 갖는다. 여기서는 있으면 갱신, 없으면 생성해 페이지당 하나만 존재하게 한다.
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

// 첫 요청의 메타는 빌드 시 생성된 URL별 HTML(scripts/prerender-meta.js)이 담당하고, 이 훅은
// SPA 내 이동 시 갱신과 배포 이후 추가돼 생성 파일이 없는 항목을 담당한다.
// 문구는 src/utils/pageMeta.js를 두 곳이 공유한다.
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
