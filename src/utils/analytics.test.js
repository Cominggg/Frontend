import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const GTAG_SRC = 'https://www.googletagmanager.com/gtag/js?id=G-TEST'

async function loadAnalytics(measurementId) {
  vi.stubEnv('VITE_GA_MEASUREMENT_ID', measurementId)
  vi.resetModules()
  return import('./analytics')
}

function pushedCommands() {
  return window.dataLayer.map((item) => Array.from(item))
}

afterEach(() => {
  delete window.dataLayer
  document.head.innerHTML = ''
  vi.unstubAllEnvs()
})

describe('initGA', () => {
  it('측정 ID가 없으면 스크립트를 삽입하지 않음', async () => {
    const { initGA } = await loadAnalytics('')

    initGA()

    expect(document.head.querySelector('script')).toBeNull()
  })

  it('측정 ID가 없으면 dataLayer를 만들지 않음', async () => {
    const { initGA } = await loadAnalytics('')

    initGA()

    expect(window.dataLayer).toBeUndefined()
  })

  it('측정 ID가 있으면 gtag.js 스크립트를 async로 head에 삽입', async () => {
    const { initGA } = await loadAnalytics('G-TEST')

    initGA()

    const script = document.head.querySelector('script')
    expect(script.src).toBe(GTAG_SRC)
    expect(script.async).toBe(true)
  })

  it('측정 ID가 있으면 js, config 순으로 명령을 push', async () => {
    const { initGA } = await loadAnalytics('G-TEST')

    initGA()

    const [jsCommand, configCommand] = pushedCommands()
    expect(window.dataLayer).toHaveLength(2)
    expect(jsCommand[0]).toBe('js')
    expect(jsCommand[1]).toBeInstanceOf(Date)
    expect(configCommand).toEqual(['config', 'G-TEST', { send_page_view: false }])
  })

  it('config에 page_location을 넣지 않음', async () => {
    const { initGA } = await loadAnalytics('G-TEST')

    initGA()

    const configParams = pushedCommands()[1][2]
    expect(configParams).not.toHaveProperty('page_location')
  })

  it('dataLayer에 배열이 아닌 arguments 객체를 push', async () => {
    const { initGA } = await loadAnalytics('G-TEST')

    initGA()

    window.dataLayer.forEach((item) => {
      expect(Array.isArray(item)).toBe(false)
      expect(Object.prototype.toString.call(item)).toBe('[object Arguments]')
    })
  })

  it('기존 dataLayer가 있으면 유지한 채 이어서 push', async () => {
    const { initGA } = await loadAnalytics('G-TEST')
    const existing = { event: 'gtm.js' }
    window.dataLayer = [existing]

    initGA()

    expect(window.dataLayer[0]).toBe(existing)
    expect(window.dataLayer).toHaveLength(3)
  })
})

describe('trackPageView', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('측정 ID가 없으면 아무것도 push하지 않음', async () => {
    const { trackPageView } = await loadAnalytics('')

    trackPageView('/artists/1', 'YOASOBI | Coming')

    expect(window.dataLayer).toHaveLength(0)
  })

  it('측정 ID가 있으면 set으로 정제된 주소·제목을 지정한 뒤 page_view 이벤트를 push', async () => {
    const { trackPageView } = await loadAnalytics('G-TEST')

    trackPageView('/artists/1', 'YOASOBI | Coming')

    expect(pushedCommands()).toEqual([
      ['set', { page_location: `${window.location.origin}/artists/1`, page_title: 'YOASOBI | Coming' }],
      ['event', 'page_view'],
    ])
  })

  it('최초 호출이면 page_referrer를 set하지 않음', async () => {
    const { trackPageView } = await loadAnalytics('G-TEST')

    trackPageView('/artists/1', 'YOASOBI | Coming')

    const setCommands = pushedCommands().filter(([command]) => command === 'set')
    expect(setCommands).toEqual([
      ['set', { page_location: `${window.location.origin}/artists/1`, page_title: 'YOASOBI | Coming' }],
    ])
  })

  it('다른 경로로 호출하면 직전 주소를 page_referrer로 page_location보다 먼저 set', async () => {
    const { trackPageView } = await loadAnalytics('G-TEST')
    trackPageView('/artists/1', 'YOASOBI | Coming')
    window.dataLayer = []

    trackPageView('/concerts/2', 'YOASOBI 내한 공연 | Coming')

    expect(pushedCommands()).toEqual([
      ['set', { page_referrer: `${window.location.origin}/artists/1` }],
      [
        'set',
        { page_location: `${window.location.origin}/concerts/2`, page_title: 'YOASOBI 내한 공연 | Coming' },
      ],
      ['event', 'page_view'],
    ])
  })

  it('같은 경로로 재호출하면 page_referrer를 다시 set하지 않음', async () => {
    const { trackPageView } = await loadAnalytics('G-TEST')
    trackPageView('/artists/1', 'Coming')
    trackPageView('/concerts/2', 'Coming')
    window.dataLayer = []

    trackPageView('/concerts/2', 'YOASOBI 내한 공연 | Coming')

    expect(pushedCommands()).toEqual([
      [
        'set',
        { page_location: `${window.location.origin}/concerts/2`, page_title: 'YOASOBI 내한 공연 | Coming' },
      ],
      ['event', 'page_view'],
    ])
  })

  it('dataLayer에 arguments 객체를 push', async () => {
    const { trackPageView } = await loadAnalytics('G-TEST')

    trackPageView('/artists/1', 'YOASOBI | Coming')

    window.dataLayer.forEach((item) => {
      expect(Array.isArray(item)).toBe(false)
      expect(Object.prototype.toString.call(item)).toBe('[object Arguments]')
    })
  })
})

describe('trackEvent', () => {
  beforeEach(() => {
    window.dataLayer = []
  })

  it('측정 ID가 없으면 아무것도 push하지 않음', async () => {
    const { trackEvent } = await loadAnalytics('')

    trackEvent('follow_artist', { artist_id: 1 })

    expect(window.dataLayer).toHaveLength(0)
  })

  it('측정 ID가 있으면 이벤트명과 params를 push', async () => {
    const { trackEvent } = await loadAnalytics('G-TEST')

    trackEvent('follow_artist', { artist_id: 1 })

    expect(pushedCommands()).toEqual([['event', 'follow_artist', { artist_id: 1 }]])
  })

  it('params를 생략하면 빈 객체로 push', async () => {
    const { trackEvent } = await loadAnalytics('G-TEST')

    trackEvent('search')

    expect(pushedCommands()).toEqual([['event', 'search', {}]])
  })

  it('dataLayer에 arguments 객체를 push', async () => {
    const { trackEvent } = await loadAnalytics('G-TEST')

    trackEvent('search')

    const [item] = window.dataLayer
    expect(Array.isArray(item)).toBe(false)
    expect(Object.prototype.toString.call(item)).toBe('[object Arguments]')
  })
})
