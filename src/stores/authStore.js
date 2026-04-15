import { create } from 'zustand'

// TODO: 개발 확인용 더미 — API 연동 후 아래 user: null 로 복구
const DEV_USER = { name: '유혁', profileImage: null, role: 'ADMIN' }

const useAuthStore = create((set) => ({
  user: DEV_USER,
  accessToken: 'dev-token',
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearUser: () => set({ user: null, accessToken: null }),
}))

export default useAuthStore
