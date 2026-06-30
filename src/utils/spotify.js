export function getSpotifyAlbumUrl(spotifyId) {
  return spotifyId ? `https://open.spotify.com/album/${spotifyId}` : null
}

export function getSpotifyTrackUrl(spotifyId) {
  return spotifyId ? `https://open.spotify.com/track/${spotifyId}` : null
}
