import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const initialPath = useRef(location.pathname + location.search)

  useEffect(() => {
    if (!user) {
      openLoginModal(initialPath.current)
    }
  }, [user, openLoginModal])

  if (!user) return null

  return children
}

export default PrivateRoute
