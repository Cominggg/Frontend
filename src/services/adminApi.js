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

export async function getAdminInquiries(params) {
  const { data } = await api.get('/admin/inquiries', { params })
  return data
}

export async function getAdminInquiry(id) {
  const { data } = await api.get(`/admin/inquiries/${id}`)
  return data
}

export async function updateInquiryStatus(id, body) {
  const { data } = await api.patch(`/admin/inquiries/${id}/status`, body)
  return data
}
