export function getSpotifyAlbumUrl(spotifyId) {
  return spotifyId ? `https://open.spotify.com/album/${spotifyId}` : null
}

export function getSpotifyTrackUrl(spotifyId) {
  return spotifyId ? `https://open.spotify.com/track/${spotifyId}` : null
}

// Spotify 앨범 커버는 URL 접두어로 크기가 정해진다 (640: ab67616d0000b273, 300: ab67616d00001e02).
// 목록 카드는 200px 안팎으로 표시되므로 300px 버전을 받는다. 접두어가 없는 URL은 그대로 둔다.
const SPOTIFY_COVER_640 = '/image/ab67616d0000b273'
const SPOTIFY_COVER_300 = '/image/ab67616d00001e02'

export function getSpotifyCoverThumbnail(coverUrl) {
  return coverUrl?.replace(SPOTIFY_COVER_640, SPOTIFY_COVER_300)
}

// 아티스트 이미지도 같은 방식이다 (640: ab6761610000e5eb, 320: ab67616100005174).
const SPOTIFY_ARTIST_640 = '/image/ab6761610000e5eb'
const SPOTIFY_ARTIST_320 = '/image/ab67616100005174'

export function getSpotifyArtistThumbnail(imageUrl) {
  return imageUrl?.replace(SPOTIFY_ARTIST_640, SPOTIFY_ARTIST_320)
}
