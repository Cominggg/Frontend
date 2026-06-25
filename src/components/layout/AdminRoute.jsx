import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'

const ROLE_ADMIN = 'ADMIN'

function AdminRoute({ children }) {
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

  if (user.role !== ROLE_ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

export default AdminRoute
