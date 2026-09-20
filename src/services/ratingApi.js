import api from './api'

export async function getMyConcertRating(concertId) {
  const { data } = await api.get(`/concerts/${concertId}/rating/me`)
  return data
}

export async function rateConcert(concertId, score) {
  const { data } = await api.put(`/concerts/${concertId}/rating`, { score })
  return data
}

export async function deleteConcertRating(concertId) {
  const { data } = await api.delete(`/concerts/${concertId}/rating`)
  return data
}

export async function getMyReleaseRating(releaseId) {
  const { data } = await api.get(`/releases/${releaseId}/rating/me`)
  return data
}

export async function rateRelease(releaseId, score) {
  const { data } = await api.put(`/releases/${releaseId}/rating`, { score })
  return data
}

export async function deleteReleaseRating(releaseId) {
  const { data } = await api.delete(`/releases/${releaseId}/rating`)
  return data
}
