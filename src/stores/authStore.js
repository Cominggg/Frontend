import { create } from 'zustand'

export const SESSION_HINT = 'coming-session'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => {
    localStorage.setItem(SESSION_HINT, '1')
    set({ accessToken: token })
  },
  setInitialized: () => set({ isInitialized: true }),
  clearUser: () => {
    localStorage.removeItem(SESSION_HINT)
    set({ user: null, accessToken: null })
  },
}))

export default useAuthStore
