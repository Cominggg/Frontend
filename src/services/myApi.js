import api from './api'

export async function getConcertHistory(params) {
  const { data } = await api.get('/my/history', { params })
  return data
}

export async function createInquiry(body) {
  const { data } = await api.post('/inquiries', body)
  return data
}

export async function getMyInquiries(params) {
  const { data } = await api.get('/inquiries/my', { params })
  return data
}

export async function getMyInquiry(id) {
  const { data } = await api.get(`/inquiries/my/${id}`)
  return data
}
