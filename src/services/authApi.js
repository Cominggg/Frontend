import api from './api'

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateMe(formData) {
  const { data } = await api.put('/auth/me', formData)
  return data
}

export async function withdraw() {
  await api.delete('/auth/withdraw')
}

export async function devLogin(nickname, role) {
  const { data } = await api.post('/dev/login', { nickname, role })
  return data
}
