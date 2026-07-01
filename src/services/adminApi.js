import api from './api'

export async function getAdminArtist(id) {
  const { data } = await api.get(`/admin/artists/${id}`)
  return data
}

export async function updateArtist(id, body) {
  await api.put(`/admin/artists/${id}`, body)
}

export async function getAdminConcert(id) {
  const { data } = await api.get(`/admin/concerts/${id}`)
  return data
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

// EXCLUDED 공연 목록
export async function getExcludedConcerts(params) {
  const { data } = await api.get('/admin/concerts/excluded', { params })
  return data
}

// DB 아티스트 검색 (별칭 포함 부분 일치, EXCLUDED 아티스트 지정용)
export async function searchDbArtists(name, params) {
  const { data } = await api.get('/admin/artists', { params: { name, ...params } })
  return data
}

export async function approveConcert(id, body = {}) {
  await api.put(`/admin/concerts/${id}/approve`, body)
}

export async function rejectConcert(id) {
  await api.put(`/admin/concerts/${id}/reject`)
}

export async function addConcertArtist(concertId, artistId) {
  await api.post(`/admin/concerts/${concertId}/artists`, { artistId })
}

export async function removeConcertArtist(concertId, artistId) {
  await api.delete(`/admin/concerts/${concertId}/artists/${artistId}`)
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
  const { data } = await api.get('/admin/data/search/artists', { params: { name: query } })
  return data
}

export async function searchKopisConcerts(query) {
  const { data } = await api.get('/admin/data/search/concerts', { params: { title: query } })
  return data
}
