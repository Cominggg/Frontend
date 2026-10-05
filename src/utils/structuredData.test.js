import { describe, expect, it } from 'vitest'
import { SITE_LOGO_URL, SITE_URL } from '@/constants/site'
import { HOME_PAGE_META } from '@/utils/pageMeta'
import {
  buildConcertEventJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
  toSafeJsonLd,
} from './structuredData'

describe('buildConcertEventJsonLd', () => {
  const concert = {
    title: 'YOASOBI ASIA TOUR 2026',
    status: 'UPCOMING',
    startDate: '2026-09-26',
    endDate: '2026-09-27',
    venue: 'KSPO DOME',
    posterUrl: 'https://cdn.comingg.com/posters/1.jpg',
    artists: [{ name: 'YOASOBI' }, { name: 'Ado' }],
    ticketLinks: [{ url: 'https://tickets.interpark.com/goods/26001234' }],
    price: 154000,
  }

  it('공연 정보를 schema.org Event로 변환', () => {
    expect(buildConcertEventJsonLd(concert)).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'YOASOBI ASIA TOUR 2026',
      startDate: '2026-09-26',
      endDate: '2026-09-27',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'KSPO DOME', address: 'KSPO DOME' },
      image: ['https://cdn.comingg.com/posters/1.jpg'],
    })
  })

  it('알 수 없는 status면 null', () => {
    expect(buildConcertEventJsonLd({ ...concert, status: 'POSTPONED' })).toBeNull()
  })

  it.each([
    ['UPCOMING', 'https://schema.org/EventScheduled'],
    ['CANCELLED', 'https://schema.org/EventCancelled'],
  ])('status가 %s면 eventStatus는 %s', (status, eventStatus) => {
    expect(buildConcertEventJsonLd({ ...concert, status }).eventStatus).toBe(eventStatus)
  })

  it.each(['UPCOMING', 'ONGOING'])('status가 %s이고 ticketLinks가 있으면 offers 포함', (status) => {
    expect(buildConcertEventJsonLd({ ...concert, status }).offers).toEqual([
      {
        '@type': 'Offer',
        url: 'https://tickets.interpark.com/goods/26001234',
        availability: 'https://schema.org/InStock',
        price: 154000,
        priceCurrency: 'KRW',
      },
    ])
  })

  it.each(['ENDED', 'CANCELLED'])('status가 %s면 ticketLinks가 있어도 offers 없음', (status) => {
    expect(buildConcertEventJsonLd({ ...concert, status })).not.toHaveProperty('offers')
  })

  it.each([
    ['비어 있으면', { ticketLinks: [] }],
    ['없으면', { ticketLinks: undefined }],
  ])('ticketLinks가 %s offers 없음', (_label, override) => {
    expect(buildConcertEventJsonLd({ ...concert, ...override })).not.toHaveProperty('offers')
  })

  it('ticketLinks마다 Offer 생성', () => {
    const ticketLinks = [
      { url: 'https://tickets.interpark.com/goods/26001234' },
      { url: 'https://ticket.yes24.com/Perf/55555' },
    ]

    expect(buildConcertEventJsonLd({ ...concert, ticketLinks }).offers.map((offer) => offer.url)).toEqual([
      'https://tickets.interpark.com/goods/26001234',
      'https://ticket.yes24.com/Perf/55555',
    ])
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['문자열', '154,000원'],
  ])('price가 %s이면 offer에 price·priceCurrency 없음', (_label, price) => {
    const [offer] = buildConcertEventJsonLd({ ...concert, price }).offers

    expect(offer).not.toHaveProperty('price')
    expect(offer).not.toHaveProperty('priceCurrency')
  })

  it('price가 0이어도 number면 price 포함', () => {
    const [offer] = buildConcertEventJsonLd({ ...concert, price: 0 }).offers

    expect(offer).toMatchObject({ price: 0, priceCurrency: 'KRW' })
  })

  it('endDate가 없으면 startDate로 대체', () => {
    const { endDate: _endDate, ...withoutEndDate } = concert

    expect(buildConcertEventJsonLd(withoutEndDate).endDate).toBe('2026-09-26')
  })

  it('posterUrl이 없으면 image 키 없음', () => {
    const { posterUrl: _posterUrl, ...withoutPoster } = concert

    expect(buildConcertEventJsonLd(withoutPoster)).not.toHaveProperty('image')
  })

  it('artists를 PerformingGroup으로 매핑해 performer 생성', () => {
    expect(buildConcertEventJsonLd(concert).performer).toEqual([
      { '@type': 'PerformingGroup', name: 'YOASOBI' },
      { '@type': 'PerformingGroup', name: 'Ado' },
    ])
  })

  it('artists가 없으면 performer는 빈 배열', () => {
    const { artists: _artists, ...withoutArtists } = concert

    expect(buildConcertEventJsonLd(withoutArtists).performer).toEqual([])
  })
})

describe('buildWebsiteJsonLd', () => {
  it('사이트 URL·홈 description으로 WebSite 생성', () => {
    expect(buildWebsiteJsonLd()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '커밍',
      alternateName: 'Coming',
      url: SITE_URL,
      description: HOME_PAGE_META.description,
    })
  })
})

describe('buildOrganizationJsonLd', () => {
  it('사이트 URL·로고로 Organization 생성', () => {
    expect(buildOrganizationJsonLd()).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '커밍',
      alternateName: 'Coming',
      url: SITE_URL,
      logo: SITE_LOGO_URL,
    })
  })
})

describe('toSafeJsonLd', () => {
  it('</script>가 포함되면 <를 \\u003c로 이스케이프', () => {
    const result = toSafeJsonLd({ name: '</script><script>alert(1)</script>' })

    expect(result).toBe('{"name":"\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"}')
  })

  it('이스케이프 결과를 파싱하면 원본 데이터와 같음', () => {
    const data = { name: 'A < B </script>', artists: ['YOASOBI'] }

    expect(JSON.parse(toSafeJsonLd(data))).toEqual(data)
  })
})
