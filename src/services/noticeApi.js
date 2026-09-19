import api from './api'

export async function getPinnedNotices(params) {
  const { data } = await api.get('/notices', { params })
  return data
}

export async function getNotice(id) {
  const { data } = await api.get(`/notices/${id}`)
  return data
}
