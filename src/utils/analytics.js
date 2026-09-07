const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const COLLECT_URL = 'https://www.google-analytics.com/g/collect'
const CLIENT_ID_KEY = 'ga_client_id'
const SESSION_KEY = 'ga_session'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

// gtag.js를 통한 정상 로드·dataLayer 전달까지는 확인됐지만, 라이브러리
// 내부 태그 실행 엔진이 히트를 한 건도 전송하지 못하는 문제가 있어(원인 불명,
// GA4 DebugView에 "config 명령을 기다리는 중" 상태로 계속 멈춰 있음),
// gtag.js를 거치지 않고 GA4 Measurement Protocol(g/collect)을 직접 호출한다.
function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY)
  if (!clientId) {
    clientId = `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`
    localStorage.setItem(CLIENT_ID_KEY, clientId)
  }
  return clientId
}

function getSessionId() {
  const now = Date.now()
  const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  if (stored && now - stored.lastActive < SESSION_TIMEOUT_MS) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: stored.id, lastActive: now }))
    return { id: stored.id, isNewSession: false }
  }
  const id = Math.floor(now / 1000).toString()
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id, lastActive: now }))
  return { id, isNewSession: true }
}

function sendHit(params) {
  if (!GA_MEASUREMENT_ID) return

  const { id: sessionId, isNewSession } = getSessionId()
  const search = new URLSearchParams({
    v: '2',
    tid: GA_MEASUREMENT_ID,
    cid: getClientId(),
    sid: sessionId,
    ...(isNewSession && { _ss: '1' }),
    ...params,
  })
  const url = `${COLLECT_URL}?${search.toString()}`

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url)
  } else {
    fetch(url, { method: 'GET', keepalive: true, mode: 'no-cors' })
  }
}

export function trackPageView(pagePath, pageTitle) {
  sendHit({
    en: 'page_view',
    dl: `${window.location.origin}${pagePath}`,
    dt: pageTitle,
  })
}

export function trackEvent(name, params = {}) {
  const eventParams = {}
  Object.entries(params).forEach(([key, value]) => {
    eventParams[typeof value === 'number' ? `epn.${key}` : `ep.${key}`] = value
  })
  sendHit({ en: name, ...eventParams })
}
