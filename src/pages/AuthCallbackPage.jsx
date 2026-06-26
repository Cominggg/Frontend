import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import useAuthStore from '@/stores/authStore'
import { getMe } from '@/services/authApi'
import { ROUTES } from '@/constants/routes'

const LOGIN_REDIRECT_KEY = 'loginRedirectUri'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    async function handleCallback() {
      try {
        const { data } = await axios.post('/api/auth/refresh', null, { withCredentials: true })
        setAccessToken(data.accessToken)

        const isNewUser = searchParams.get('isNewUser') === 'true'
        if (isNewUser) {
          navigate(ROUTES.SIGNUP, { replace: true })
          return
        }

        const user = await getMe()
        setUser(user)

        const redirectUri = localStorage.getItem(LOGIN_REDIRECT_KEY) || ROUTES.HOME
        localStorage.removeItem(LOGIN_REDIRECT_KEY)
        navigate(redirectUri, { replace: true })
      } catch {
        navigate(ROUTES.HOME, { replace: true })
      }
    }

    handleCallback()
  }, [navigate, searchParams, setAccessToken, setUser])

  return null
}

export default AuthCallbackPage
