import api from './api'

export async function getConcerts(params) {
  const { data } = await api.get('/concerts', { params })
  return data
}

export async function getPopularConcerts() {
  const { data } = await api.get('/concerts/popular')
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

export async function getRecentConcerts() {
  const { data } = await api.get('/concerts', { params: { sort: 'createdAt,desc', size: 6 } })
  return data
}

export async function getRecentSetlists() {
  const { data } = await api.get('/concerts/setlists/recent', { params: { size: 5 } })
  return data
}

export async function getTicketingConcerts(params) {
  const { data } = await api.get('/concerts/ticketing', { params })
  return data
}
