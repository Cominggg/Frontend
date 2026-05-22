import api from './api'

export async function getConcerts(params) {
  const { data } = await api.get('/concerts', { params })
  return data
}

export async function getPopularConcerts() {
  const { data } = await api.get('/concerts/popular')
  return data
}

export async function getFollowingConcerts(params) {
  const { data } = await api.get('/concerts/following', { params })
  return data
}

export async function getConcertStats(params) {
  const { data } = await api.get('/concerts/stats', { params })
  return data
}

export async function getConcert(id) {
  const { data } = await api.get(`/concerts/${id}`)
  return data
}

export async function getConcertSetlist(id) {
  const { data } = await api.get(`/concerts/${id}/setlist`)
  return data
}
