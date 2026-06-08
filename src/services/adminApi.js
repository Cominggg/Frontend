import api from './api'

export async function updateArtist(id, body) {
  await api.put(`/admin/artists/${id}`, body)
}

export async function updateConcert(id, body) {
  await api.put(`/admin/concerts/${id}`, body)
}

export async function updateConcertState(id, body) {
  await api.put(`/admin/concerts/${id}/state`, body)
}

export async function getInquiries(params) {
  const { data } = await api.get('/admin/inquiries', { params })
  return data
}

export async function getInquiry(id) {
  const { data } = await api.get(`/admin/inquiries/${id}`)
  return data
}

export async function updateInquiryStatus(id, body) {
  const { data } = await api.patch(`/admin/inquiries/${id}/status`, body)
  return data
}

// PENDING 공연 검토
export async function getPendingConcerts(params) {
  const { data } = await api.get('/admin/concerts/pending', { params })
  return data
}

export async function approveConcert(id) {
  await api.put(`/admin/concerts/${id}/approve`)
}

export async function rejectConcert(id) {
  await api.put(`/admin/concerts/${id}/reject`)
}

export async function addConcertArtist(concertId, artistId) {
  await api.post(`/admin/concerts/${concertId}/artists`, { artistId })
}

// 파이프라인 트리거
export async function triggerArtistCollect(mbid) {
  await api.post('/admin/data/collect/artists', { mbid })
}

export async function triggerConcertCollect(kopisId) {
  await api.post('/admin/data/collect/concerts', { kopisId })
}

export async function triggerArtistReleasesCollect(artistId) {
  await api.post(`/admin/data/collect/artists/${artistId}/releases`)
}

export async function triggerConcertSetlistCollect(concertId) {
  await api.post(`/admin/data/collect/concerts/${concertId}/setlist`)
}

// 파이프라인 검색
export async function searchMbArtists(query) {
  const { data } = await api.get('/admin/data/search/artists', { params: { query } })
  return data
}

export async function searchKopisConcerts(query) {
  const { data } = await api.get('/admin/data/search/concerts', { params: { query } })
  return data
}
