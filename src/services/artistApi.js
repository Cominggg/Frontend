import api from './api'

export async function getArtists(params) {
  const { data } = await api.get('/artists', { params })
  return data
}

export async function getArtist(id) {
  const { data } = await api.get(`/artists/${id}`)
  return data
}

export async function getArtistConcerts(id, params) {
  const { data } = await api.get(`/artists/${id}/concerts`, { params })
  return data
}

export async function getArtistReleases(id, params) {
  const { data } = await api.get(`/artists/${id}/releases`, { params })
  return data
}

export async function followArtist(id) {
  await api.post(`/artists/${id}/follow`)
}

export async function unfollowArtist(id) {
  await api.delete(`/artists/${id}/follow`)
}

export async function getFollowingArtists() {
  const { data } = await api.get('/artists/following')
  return data
}
