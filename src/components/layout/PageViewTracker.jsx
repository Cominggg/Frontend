import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { trackPageView } from '@/utils/analytics'

function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`, document.title)
  }, [location.pathname, location.search])

  return null
}

export default PageViewTracker
