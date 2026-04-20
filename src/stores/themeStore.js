import { create } from 'zustand'

const STORAGE_KEY = 'coming-theme'

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initial = getInitialTheme()
applyTheme(initial)

const useThemeStore = create((set) => ({
  theme: initial,
  toggle() {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return { theme: next }
    })
  },
}))

export default useThemeStore
