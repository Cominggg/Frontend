import api from './api'

export async function getCalendar(params) {
  const { data } = await api.get('/calendar', { params })
  return data
}

export async function getMyCalendar(params) {
  const { data } = await api.get('/calendar/my', { params })
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
