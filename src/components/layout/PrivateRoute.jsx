import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'

function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const location = useLocation()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const close = useLoginModalStore((s) => s.close)
  const initialPath = useRef(location.pathname + location.search)

  useEffect(() => {
    if (!isInitialized) return
    if (!user) {
      openLoginModal(initialPath.current)
    } else {
      close()
    }
  }, [user, isInitialized, openLoginModal, close])

  if (!isInitialized || !user) return null
  if (user.role === 'PENDING') return <Navigate to={ROUTES.SIGNUP} replace />

  return children
}

export default PrivateRoute
