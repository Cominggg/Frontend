const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

// gtag.js는 dataLayer에 arguments 객체가 들어와야 명령으로 인식하고 일반 배열은
// 무시한다. rest 파라미터(...args)로 배열을 넣으면 config가 실행되지 않아 히트가
// 한 건도 전송되지 않는다.
function gtag() {
  window.dataLayer.push(arguments)
}

export function initGA() {
  if (!GA_MEASUREMENT_ID) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  gtag('js', new Date())
  // page_view는 PageViewTracker가 검색어를 제거한 경로로 직접 전송한다.
  // config에 page_location을 넣으면 이후 gtag('set')보다 우선해 이전 주소가 남으므로 넣지 않는다.
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

let currentPageLocation = null

export function trackPageView(pagePath, pageTitle) {
  if (!GA_MEASUREMENT_ID) return

  // gtag.js는 기본적으로 현재 URL(검색어 q 포함)을 page_location으로, SPA 이동 시
  // 직전 URL을 page_referrer로 모든 이벤트에 붙이므로, 둘 다 정제된 주소로 전역 고정한다.
  const pageLocation = `${window.location.origin}${pagePath}`
  if (pageLocation !== currentPageLocation) {
    // 최초 진입은 외부 유입 경로(document.referrer)를 그대로 둔다
    if (currentPageLocation) gtag('set', { page_referrer: currentPageLocation })
    currentPageLocation = pageLocation
  }
  gtag('set', { page_location: pageLocation, page_title: pageTitle })
  gtag('event', 'page_view')
}

export function trackEvent(name, params = {}) {
  if (!GA_MEASUREMENT_ID) return

  gtag('event', name, params)
}
