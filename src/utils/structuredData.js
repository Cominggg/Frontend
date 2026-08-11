const EVENT_STATUS_SCHEMA = {
  UPCOMING: 'https://schema.org/EventScheduled',
  ONGOING: 'https://schema.org/EventScheduled',
  ENDED: 'https://schema.org/EventScheduled',
  CANCELLED: 'https://schema.org/EventCancelled',
}

// 공연 상세 페이지용 schema.org/Event 구조화 데이터. 검색 결과 리치 스니펫 노출용.
export function buildConcertEventJsonLd(concert) {
  const eventStatus = EVENT_STATUS_SCHEMA[concert.status]
  if (!eventStatus) return null

  const { title, startDate, endDate, venue, posterUrl, artists = [], ticketLinks = [], price } = concert

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    startDate,
    endDate: endDate || startDate,
    eventStatus,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venue,
      address: venue,
    },
    ...(posterUrl && { image: [posterUrl] }),
    performer: artists.map((artist) => ({
      '@type': 'PerformingGroup',
      name: artist.name,
    })),
    ...(ticketLinks.length > 0 && {
      offers: ticketLinks.map((link) => ({
        '@type': 'Offer',
        url: link.url,
        availability: 'https://schema.org/InStock',
        ...(typeof price === 'number' && { price, priceCurrency: 'KRW' }),
      })),
    }),
  }
}

// 사이트 전역용 schema.org/WebSite 구조화 데이터. 브랜드 키워드("커밍") 검색 시 사이트 정체성 인식용.
export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '커밍',
    alternateName: 'Coming',
    url: 'https://comingg.com',
    description: 'Jpop 아티스트 내한 공연 정보를 한 곳에서 확인하세요. 공연 일정, 아티스트, 발매 소식을 통합 제공하는 커밍입니다.',
  }
}

// script 태그 조기 종료(</script>) 인젝션 방지
export function toSafeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
