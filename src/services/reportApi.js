import api from './api'

export async function createReport({ targetType, targetId, reason, detail }) {
  const { data } = await api.post('/reports', { targetType, targetId, reason, detail })
  return data
}
