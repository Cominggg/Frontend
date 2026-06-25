import api from './api'

export async function getCalendar(params) {
  const { data } = await api.get('/calendar', { params })
  return data
}

export async function getUpcomingConcerts(params) {
  const { data } = await api.get('/me/concerts/upcoming', { params })
  return data
}

export async function addToCalendar(concertId) {
  const { data } = await api.post(`/calendar/${concertId}`)
  return data
}

export async function removeFromCalendar(concertId) {
  const { data } = await api.delete(`/calendar/${concertId}`)
  return data
}
