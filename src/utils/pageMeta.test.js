import { describe, expect, it } from 'vitest'
import { STATIC_PAGE_META, buildArtistMeta, buildConcertMeta, buildReleaseMeta } from './pageMeta'

describe('buildConcertMeta', () => {
  const concert = {
    title: 'YOASOBI ASIA TOUR 2026',
    venue: 'KSPO DOME',
    startDate: '2026-09-26',
    posterUrl: 'https://cdn.comingg.com/posters/1.jpg',
    artists: [{ name: 'YOASOBI' }, { name: 'Ado' }],
  }

  it('공연명에 서비스명을 붙여 title 생성', () => {
    expect(buildConcertMeta(concert).title).toBe('YOASOBI ASIA TOUR 2026 - 커밍')
  })

  it('아티스트명·공연장·날짜를 · 로 이어 description 생성', () => {
    expect(buildConcertMeta(concert).description).toBe('YOASOBI · Ado · KSPO DOME · 2026.09.26')
  })

  it('posterUrl을 image로 사용', () => {
    expect(buildConcertMeta(concert).image).toBe('https://cdn.comingg.com/posters/1.jpg')
  })

  it('artists가 없어도 에러 없이 description 생성', () => {
    const { artists: _artists, ...withoutArtists } = concert

    expect(buildConcertMeta(withoutArtists).description).toBe(' · KSPO DOME · 2026.09.26')
  })
})

describe('buildArtistMeta', () => {
  const artist = { name: 'YOASOBI', imageUrl: 'https://cdn.comingg.com/artists/1.jpg' }

  it('아티스트명으로 title·description 생성', () => {
    expect(buildArtistMeta(artist)).toMatchObject({
      title: 'YOASOBI - 커밍',
      description: 'YOASOBI 아티스트 프로필 및 내한 공연 정보',
    })
  })

  it('imageUrl을 image로 사용', () => {
    expect(buildArtistMeta(artist).image).toBe('https://cdn.comingg.com/artists/1.jpg')
  })
})

describe('buildReleaseMeta', () => {
  const release = { title: '夜に駆ける', artistName: 'YOASOBI', coverUrl: 'https://cdn.comingg.com/covers/1.jpg' }

  it('앨범명으로 title 생성', () => {
    expect(buildReleaseMeta(release).title).toBe('夜に駆ける - 커밍')
  })

  it('아티스트명·앨범명으로 description 생성', () => {
    expect(buildReleaseMeta(release).description).toBe('YOASOBI · 夜に駆ける 발매 정보')
  })

  it('coverUrl을 image로 사용', () => {
    expect(buildReleaseMeta(release).image).toBe('https://cdn.comingg.com/covers/1.jpg')
  })
})

describe('STATIC_PAGE_META', () => {
  it.each(Object.entries(STATIC_PAGE_META))('%s 항목이면 title·description을 가짐', (_path, meta) => {
    expect(meta.title).toEqual(expect.any(String))
    expect(meta.title).not.toBe('')
    expect(meta.description).toEqual(expect.any(String))
    expect(meta.description).not.toBe('')
  })

  it('모든 항목의 description이 서로 다름', () => {
    const descriptions = Object.values(STATIC_PAGE_META).map((meta) => meta.description)

    expect(new Set(descriptions).size).toBe(descriptions.length)
  })
})
