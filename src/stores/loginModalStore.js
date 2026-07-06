import { create } from 'zustand'

const useLoginModalStore = create((set) => ({
  isOpen: false,
  redirectUri: null,
  open: (redirectUri = null) => {
    let safeUri = null
    if (redirectUri) {
      try {
        const url = new URL(redirectUri, window.location.origin)
        if (url.origin === window.location.origin) {
          safeUri = url.pathname + url.search
        }
      } catch {
        safeUri = null
      }
    }
    set({ isOpen: true, redirectUri: safeUri })
  },
  close: () => set({ isOpen: false, redirectUri: null }),
}))

export default useLoginModalStore
