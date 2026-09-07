const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

export function initGA() {
  if (!GA_MEASUREMENT_ID) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag(...args) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  // CSR SPA라 라우트 변경 시 PageViewTracker가 page_view를 직접 전송한다.
  // 자동 전송을 꺼두지 않으면 최초 진입 페이지에서 이벤트가 중복 발생한다.
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
}

export function trackPageView(pagePath, pageTitle) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
  })
}

export function trackEvent(name, params = {}) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
