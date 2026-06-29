import api from './api'

export async function getConcertHistory(params) {
  const { data } = await api.get('/me/concerts/history', { params })
  return data
}

export async function checkInquiryExists(type, targetId) {
  const { data } = await api.get('/me/inquiries/exists', { params: { type, targetId } })
  return data
}

export async function createInquiry(body) {
  const { data } = await api.post('/inquiries', body)
  return data
}

export async function getMyInquiries(params) {
  const { data } = await api.get('/me/inquiries', { params })
  return data
}

export async function getMyInquiry(id) {
  const { data } = await api.get(`/me/inquiries/${id}`)
  return data
}
