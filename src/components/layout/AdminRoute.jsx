import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const ROLE_ADMIN = 'ADMIN'

function AdminRoute({ children }) {
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

  if (user.role !== ROLE_ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

export default AdminRoute
