import api from './api'

export async function getPosts(params) {
  const { data } = await api.get('/posts', { params })
  return data
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`)
  return data
}
