import { Routes, Route } from 'react-router-dom'

import AdminRoute from '@/components/layout/AdminRoute'
import Layout from '@/components/layout/Layout'
import PrivateRoute from '@/components/layout/PrivateRoute'
import ScrollToTop from '@/components/layout/ScrollToTop'
import ArtistDetailPage from '@/pages/ArtistDetailPage'
import ArtistsPage from '@/pages/ArtistsPage'
import CalendarPage from '@/pages/CalendarPage'
import ConcertDetailPage from '@/pages/ConcertDetailPage'
import ConcertsPage from '@/pages/ConcertsPage'
import HomePage from '@/pages/HomePage'
import MyPage from '@/pages/MyPage'
import { ROUTES } from '@/constants/routes'

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ARTISTS} element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistDetailPage />} />
        <Route path={ROUTES.CONCERTS} element={<ConcertsPage />} />
        <Route path="/concerts/:id" element={<ConcertDetailPage />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path={ROUTES.SEARCH} element={<div>통합 검색</div>} />
        <Route path={ROUTES.MY} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ADMIN} element={<AdminRoute><div>관리자</div></AdminRoute>} />
      </Routes>
    </Layout>
  )
}

export default App
