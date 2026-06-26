import api from './api'

export async function getMe() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateMe({ nickname }) {
  const { data } = await api.put('/auth/me', new URLSearchParams({ nickname }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function withdraw() {
  await api.delete('/auth/withdraw')
}

export async function devLogin(nickname, role) {
  const { data } = await api.post('/dev/login', { nickname, role })
  return data
}
