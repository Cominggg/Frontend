import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HOME_PAGE_META, STATIC_PAGE_META, buildArtistMeta, buildConcertMeta, buildReleaseMeta } from './pageMeta'

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

  it('아티스트명·날짜·공연장을 · 로 이어 description 생성', () => {
    expect(buildConcertMeta(concert).description).toBe(
      'YOASOBI, Ado 내한 공연 · 2026.09.26 · KSPO DOME · 공연 일정·티켓 정보',
    )
  })

  it('한글명이 있으면 원어명(한글명)으로 description 생성', () => {
    const withKoreanName = {
      ...concert,
      startDate: '2027-01-23',
      endDate: '2027-01-23',
      venue: '킨텍스',
      artists: [{ name: 'CUTIE STREET', koreanName: '큐티 스트릿' }],
    }

    expect(buildConcertMeta(withKoreanName).description).toBe(
      'CUTIE STREET(큐티 스트릿) 내한 공연 · 2027.01.23 · 킨텍스 · 공연 일정·티켓 정보',
    )
  })

  it('종료일이 시작일과 다르면 기간으로 description 생성', () => {
    expect(buildConcertMeta({ ...concert, endDate: '2026-09-27' }).description).toBe(
      'YOASOBI, Ado 내한 공연 · 2026.09.26 ~ 2026.09.27 · KSPO DOME · 공연 일정·티켓 정보',
    )
  })

  it('posterUrl을 image로 사용', () => {
    expect(buildConcertMeta(concert).image).toBe('https://cdn.comingg.com/posters/1.jpg')
  })

  it('artists가 없어도 에러 없이 description 생성', () => {
    const { artists: _artists, ...withoutArtists } = concert

    expect(buildConcertMeta(withoutArtists).description).toBe('내한 공연 · 2026.09.26 · KSPO DOME · 공연 일정·티켓 정보')
  })
})

describe('buildArtistMeta', () => {
  const artist = { name: 'YOASOBI', imageUrl: 'https://cdn.comingg.com/artists/1.jpg' }

  it('한글명이 없으면 원어명으로 title·description 생성', () => {
    expect(buildArtistMeta(artist)).toMatchObject({
      title: 'YOASOBI 내한 공연·프로필 - 커밍',
      description: 'YOASOBI 내한 공연 일정, 지난 공연, 발매 음반 정보',
    })
  })

  it('한글명이 있으면 원어명(한글명)으로 title·description 생성', () => {
    expect(buildArtistMeta({ ...artist, koreanName: '요아소비' })).toMatchObject({
      title: 'YOASOBI(요아소비) 내한 공연·프로필 - 커밍',
      description: 'YOASOBI(요아소비) 내한 공연 일정, 지난 공연, 발매 음반 정보',
    })
  })

  it('imageUrl을 image로 사용', () => {
    expect(buildArtistMeta(artist).image).toBe('https://cdn.comingg.com/artists/1.jpg')
  })
})

describe('buildReleaseMeta', () => {
  const release = {
    title: 'ぬくもり列車',
    artistName: '水樹奈々',
    artistKoreanName: '미즈키 나나',
    type: 'Single',
    releaseDate: '2026-10-03',
    coverUrl: 'https://cdn.comingg.com/covers/1.jpg',
  }

  it('음반명·아티스트명에 서비스명을 붙여 title 생성', () => {
    expect(buildReleaseMeta(release).title).toBe('ぬくもり列車 - 水樹奈々(미즈키 나나) - 커밍')
  })

  it('아티스트명·타입·음반명·발매일로 description 생성', () => {
    expect(buildReleaseMeta(release).description).toBe('水樹奈々(미즈키 나나) 싱글 「ぬくもり列車」 · 2026.10.03 발매')
  })

  it('한글명이 없으면 원어명으로 title 생성', () => {
    const { artistKoreanName: _artistKoreanName, ...withoutKoreanName } = release

    expect(buildReleaseMeta(withoutKoreanName).title).toBe('ぬくもり列車 - 水樹奈々 - 커밍')
  })

  it('Album 타입이면 앨범으로 표기', () => {
    expect(buildReleaseMeta({ ...release, type: 'Album' }).description).toBe(
      '水樹奈々(미즈키 나나) 앨범 「ぬくもり列車」 · 2026.10.03 발매',
    )
  })

  it('알 수 없는 타입이면 타입 표기 생략', () => {
    expect(buildReleaseMeta({ ...release, type: 'EP' }).description).toBe(
      '水樹奈々(미즈키 나나) 「ぬくもり列車」 · 2026.10.03 발매',
    )
  })

  it('releaseDate가 없으면 발매일 없이 description 생성', () => {
    const { releaseDate: _releaseDate, ...withoutReleaseDate } = release

    expect(buildReleaseMeta(withoutReleaseDate).description).toBe('水樹奈々(미즈키 나나) 싱글 「ぬくもり列車」')
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

  it('HOME_PAGE_META를 포함한 모든 항목의 description이 서로 다름', () => {
    const descriptions = [HOME_PAGE_META, ...Object.values(STATIC_PAGE_META)].map((meta) => meta.description)

    expect(new Set(descriptions).size).toBe(descriptions.length)
  })
})

describe('HOME_PAGE_META', () => {
  const indexHtml = readFileSync(resolve(import.meta.dirname, '../../index.html'), 'utf-8')

  it('index.html의 정적 title과 값이 같음', () => {
    expect(indexHtml).toContain(`<title>${HOME_PAGE_META.title}</title>`)
  })

  it('index.html의 정적 description과 값이 같음', () => {
    expect(indexHtml).toContain(`content="${HOME_PAGE_META.description}"`)
  })
})
