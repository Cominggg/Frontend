import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const openLoginModal = useLoginModalStore((s) => s.open)

  useEffect(() => {
    if (!user) {
      openLoginModal(location.pathname + location.search)
    }
  }, [user, location, openLoginModal])

  if (!user) return null

  return children
}

export default PrivateRoute
