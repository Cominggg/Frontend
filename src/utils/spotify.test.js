import { describe, expect, it } from 'vitest'
import { getSpotifyAlbumUrl, getSpotifyArtistThumbnail, getSpotifyCoverThumbnail, getSpotifyTrackUrl } from './spotify'

describe('getSpotifyAlbumUrl', () => {
  it('id가 있으면 앨범 URL', () => {
    expect(getSpotifyAlbumUrl('4yP0hdKOZPNshxUOjY0cZj')).toBe('https://open.spotify.com/album/4yP0hdKOZPNshxUOjY0cZj')
  })

  it.each([null, undefined, ''])('id가 %j이면 null', (id) => {
    expect(getSpotifyAlbumUrl(id)).toBeNull()
  })
})

describe('getSpotifyTrackUrl', () => {
  it('id가 있으면 트랙 URL', () => {
    expect(getSpotifyTrackUrl('7MXVkk9YMctZqd1Srtv4MB')).toBe('https://open.spotify.com/track/7MXVkk9YMctZqd1Srtv4MB')
  })

  it.each([null, undefined, ''])('id가 %j이면 null', (id) => {
    expect(getSpotifyTrackUrl(id)).toBeNull()
  })
})

describe('getSpotifyCoverThumbnail', () => {
  const HASH = 'a1b2c3d4e5f60718293a4b5c'

  it('640px 커버 URL이면 300px 접두어로 치환', () => {
    expect(getSpotifyCoverThumbnail(`https://i.scdn.co/image/ab67616d0000b273${HASH}`))
      .toBe(`https://i.scdn.co/image/ab67616d00001e02${HASH}`)
  })

  it('이미 300px 커버 URL이면 그대로 반환', () => {
    const url = `https://i.scdn.co/image/ab67616d00001e02${HASH}`

    expect(getSpotifyCoverThumbnail(url)).toBe(url)
  })

  it('접두어가 없는 다른 출처 URL이면 그대로 반환', () => {
    const url = 'https://coverartarchive.org/release/abc/front-500.jpg'

    expect(getSpotifyCoverThumbnail(url)).toBe(url)
  })

  it.each([null, undefined])('URL이 %j이면 undefined', (url) => {
    expect(getSpotifyCoverThumbnail(url)).toBeUndefined()
  })
})

describe('getSpotifyArtistThumbnail', () => {
  const HASH = 'f1e2d3c4b5a60718293a4b5c'

  it('640px 아티스트 이미지 URL이면 320px 접두어로 치환', () => {
    expect(getSpotifyArtistThumbnail(`https://i.scdn.co/image/ab6761610000e5eb${HASH}`))
      .toBe(`https://i.scdn.co/image/ab67616100005174${HASH}`)
  })

  it('이미 320px 아티스트 이미지 URL이면 그대로 반환', () => {
    const url = `https://i.scdn.co/image/ab67616100005174${HASH}`

    expect(getSpotifyArtistThumbnail(url)).toBe(url)
  })

  it('접두어가 없는 다른 출처 URL이면 그대로 반환', () => {
    const url = 'https://example.com/artist/yoasobi.jpg'

    expect(getSpotifyArtistThumbnail(url)).toBe(url)
  })

  it.each([null, undefined])('URL이 %j이면 undefined', (url) => {
    expect(getSpotifyArtistThumbnail(url)).toBeUndefined()
  })
})
