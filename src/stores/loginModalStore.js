import { create } from 'zustand'

const useLoginModalStore = create((set) => ({
  isOpen: false,
  redirectUri: null,
  open: (redirectUri = null) => set({ isOpen: true, redirectUri }),
  close: () => set({ isOpen: false, redirectUri: null }),
}))

export default useLoginModalStore
