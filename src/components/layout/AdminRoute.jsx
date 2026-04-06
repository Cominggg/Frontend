import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'

const ROLE_ADMIN = 'ADMIN'

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />
  }

  if (user.role !== ROLE_ADMIN) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

export default AdminRoute
