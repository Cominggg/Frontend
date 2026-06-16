import api from './api'

export async function getReleases(params) {
  const { data } = await api.get('/releases', { params })
  return data
}

export async function searchReleases(params) {
  const { data } = await api.get('/releases/search', { params })
  return data
}

export async function getRelease(id) {
  const { data } = await api.get(`/releases/${id}`)
  return data
}
