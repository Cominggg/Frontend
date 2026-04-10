import axios from 'axios'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Refresh Token HttpOnly Cookie 전송
})

// Request interceptor: Access Token 주입 (메모리에서 읽음)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: 401 → refresh → 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { data } = await axios.post('/api/auth/refresh', null, {
          withCredentials: true,
        })
        useAuthStore.getState().setAccessToken(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearUser()
        useLoginModalStore.getState().open(window.location.pathname + window.location.search)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export async function logout() {
  await api.post('/auth/logout')
  useAuthStore.getState().clearUser()
}

export default api
