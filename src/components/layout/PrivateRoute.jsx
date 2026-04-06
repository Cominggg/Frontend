import { Navigate, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import useAuthStore from '@/stores/authStore'

function PrivateRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
