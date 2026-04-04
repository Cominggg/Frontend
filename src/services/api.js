import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Refresh Token HttpOnly Cookie 전송
})

// Request interceptor: Access Token 주입
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: 401 → refresh → 재시도 / 5xx → 에러 전파
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
        localStorage.setItem('access_token', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('access_token')
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  },
)

export default api
