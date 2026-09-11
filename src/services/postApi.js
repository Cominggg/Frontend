import api from './api'

export async function getPosts(params) {
  const { data } = await api.get('/posts', { params })
  return data
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`)
  return data
}

export async function getPopularPosts(params) {
  const { data } = await api.get('/posts/popular', { params })
  return data
}

export async function getTrendingTags(params) {
  const { data } = await api.get('/posts/trending-tags', { params })
  return data
}

export async function createPost(payload) {
  const { data } = await api.post('/posts', payload)
  return data
}

export async function updatePost(id, payload) {
  const { data } = await api.patch(`/posts/${id}`, payload)
  return data
}

export async function deletePost(id) {
  const { data } = await api.delete(`/posts/${id}`)
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

export async function getComments(postId, params) {
  const { data } = await api.get(`/posts/${postId}/comments`, { params })
  return data
}

export async function createComment(postId, payload) {
  const { data } = await api.post(`/posts/${postId}/comments`, payload)
  return data
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/comments/${commentId}`)
  return data
}

export async function likeComment(commentId) {
  const { data } = await api.post(`/comments/${commentId}/like`)
  return data
}

export async function unlikeComment(commentId) {
  const { data } = await api.delete(`/comments/${commentId}/like`)
  return data
}
