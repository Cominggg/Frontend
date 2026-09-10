import api from './api'

export async function getPosts(params) {
  const { data } = await api.get('/posts', { params })
  return data
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`)
  return data
}

export async function searchMentions(params) {
  const { data } = await api.get('/mentions/search', { params })
  return data
}

export async function recommendPost(id) {
  const { data } = await api.post(`/posts/${id}/recommend`)
  return data
}

export async function unrecommendPost(id) {
  const { data } = await api.delete(`/posts/${id}/recommend`)
  return data
}
