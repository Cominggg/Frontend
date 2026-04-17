import { create } from 'zustand'

// TODO: API 연동 시 아래 두 줄(DEV_USER, user: DEV_USER) 제거 후 user: null, accessToken: null 으로 복구
const DEV_USER = import.meta.env.DEV ? { name: '유혁', profileImage: null, role: 'ADMIN' } : null

const useAuthStore = create((set) => ({
  user: DEV_USER,
  accessToken: DEV_USER ? 'dev-token' : null,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearUser: () => set({ user: null, accessToken: null }),
}))

export default useAuthStore
