import api from './api'

export async function createArtist(body) {
  const { data } = await api.post('/admin/artists', body)
  return data
}

export async function updateArtist(id, body) {
  const { data } = await api.put(`/admin/artists/${id}`, body)
  return data
}

export async function createConcert(body) {
  const { data } = await api.post('/admin/concerts', body)
  return data
}

export async function updateConcert(id, body) {
  const { data } = await api.put(`/admin/concerts/${id}`, body)
  return data
}

export async function deleteConcert(id) {
  const { data } = await api.delete(`/admin/concerts/${id}`)
  return data
}

export async function updateConcertState(id, body) {
  const { data } = await api.put(`/admin/concerts/${id}/state`, body)
  return data
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
export async function triggerConcertCollect() {
  await api.post('/admin/data/collect/concert')
}

export async function triggerArtistReleasesCollect(artistId) {
  await api.post(`/admin/data/collect/artists/${artistId}/releases`)
}

export async function triggerConcertSetlistCollect(concertId) {
  await api.post(`/admin/data/collect/concerts/${concertId}/setlist`)
}
