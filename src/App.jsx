import { Routes, Route } from 'react-router-dom'

import AdminLayout from '@/components/layout/AdminLayout'
import AdminRoute from '@/components/layout/AdminRoute'
import Layout from '@/components/layout/Layout'
import PrivateRoute from '@/components/layout/PrivateRoute'
import ScrollToTop from '@/components/layout/ScrollToTop'
import AuthCallbackPage from '@/pages/AuthCallbackPage'
import SignupPage from '@/pages/SignupPage'
import ArtistDetailPage from '@/pages/ArtistDetailPage'
import ArtistsPage from '@/pages/ArtistsPage'
import CalendarPage from '@/pages/CalendarPage'
import ConcertDetailPage from '@/pages/ConcertDetailPage'
import ConcertsPage from '@/pages/ConcertsPage'
import ReleaseDetailPage from '@/pages/ReleaseDetailPage'
import ReleasesPage from '@/pages/ReleasesPage'
import HomePage from '@/pages/HomePage'
import MyPage from '@/pages/MyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminPage from '@/pages/admin/AdminPage'
import AdminArtistFormPage from '@/pages/admin/AdminArtistFormPage'
import AdminConcertFormPage from '@/pages/admin/AdminConcertFormPage'
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage'
import AdminPendingConcertsPage from '@/pages/admin/AdminPendingConcertsPage'
import AdminExcludedConcertsPage from '@/pages/admin/AdminExcludedConcertsPage'
import PolicyPage from '@/pages/PolicyPage'
import { TERMS_CONTENT, PRIVACY_CONTENT } from '@/constants/policy'
import { ROUTES } from '@/constants/routes'

function App() {
  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ARTISTS} element={<ArtistsPage />} />
        <Route path="/artists/:id" element={<ArtistDetailPage />} />
        <Route path={ROUTES.CONCERTS} element={<ConcertsPage />} />
        <Route path="/concerts/:id" element={<ConcertDetailPage />} />
        <Route path={ROUTES.RELEASES} element={<ReleasesPage />} />
        <Route path="/releases/:id" element={<ReleaseDetailPage />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
        <Route path={ROUTES.SEARCH} element={<div>통합 검색</div>} />
        <Route path={ROUTES.TERMS} element={<PolicyPage title="서비스 이용약관" content={TERMS_CONTENT} />} />
        <Route path={ROUTES.PRIVACY} element={<PolicyPage title="개인정보처리방침" content={PRIVACY_CONTENT} />} />
        <Route path={ROUTES.ME} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_UPCOMING} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_HISTORY} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_INQUIRIES} element={<PrivateRoute><MyPage /></PrivateRoute>} />

        {/* 관리자 — 중첩 라우트 */}
        <Route
          path={ROUTES.ADMIN}
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route index element={<AdminPage />} />
          <Route path="artists/:id/edit" element={<AdminArtistFormPage />} />
          <Route path="concerts/pending" element={<AdminPendingConcertsPage />} />
          <Route path="concerts/excluded" element={<AdminExcludedConcertsPage />} />
          <Route path="concerts/:id/edit" element={<AdminConcertFormPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
