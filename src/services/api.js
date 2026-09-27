import axios from 'axios'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Refresh Token HttpOnly Cookie 전송
})

let refreshPromise = null

const REFRESH_LOCK = 'coming-auth-refresh'

function requestRefresh() {
  return axios.post('/api/auth/refresh', null, { withCredentials: true })
}

// Refresh Token으로 Access Token 재발급. 동시 호출은 진행 중인 요청 하나로 합친다
// (BE가 RT를 회전하므로 같은 RT로 두 번 요청하면 한쪽이 실패한다)
// 탭 간에는 Web Locks로 직렬화 — 대기한 탭은 앞 탭이 갱신한 RT 쿠키로 요청한다
export function refreshAccessToken() {
  if (!refreshPromise) {
    const request = navigator.locks
      ? navigator.locks.request(REFRESH_LOCK, requestRefresh)
      : requestRefresh()
    refreshPromise = request
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

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
        const accessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
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
  try {
    await api.post('/auth/logout')
  } finally {
    useAuthStore.getState().clearUser()
  }
}

export default api
