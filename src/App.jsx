import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import useAuthStore, { SESSION_HINT } from '@/stores/authStore'
import { buildOrganizationJsonLd, buildWebsiteJsonLd, toSafeJsonLd } from '@/utils/structuredData'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminRoute from '@/components/layout/AdminRoute'
import Layout from '@/components/layout/Layout'
import PageViewTracker from '@/components/layout/PageViewTracker'
import PrivateRoute from '@/components/layout/PrivateRoute'
import ScrollToTop from '@/components/layout/ScrollToTop'
import HomePage from '@/pages/HomePage'
import AdminPage from '@/pages/admin/AdminPage'
import AdminArtistFormPage from '@/pages/admin/AdminArtistFormPage'
import AdminConcertFormPage from '@/pages/admin/AdminConcertFormPage'
import AdminConcertCreatePage from '@/pages/admin/AdminConcertCreatePage'
import AdminInquiriesPage from '@/pages/admin/AdminInquiriesPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import AdminNoticesPage from '@/pages/admin/AdminNoticesPage'
import AdminNoticeFormPage from '@/pages/admin/AdminNoticeFormPage'
import AdminPendingConcertsPage from '@/pages/admin/AdminPendingConcertsPage'
import AdminExcludedConcertsPage from '@/pages/admin/AdminExcludedConcertsPage'
import AdminPolicyPage from '@/pages/admin/AdminPolicyPage'
import { TERMS_VERSIONS, PRIVACY_VERSIONS } from '@/constants/policy'
import { ROUTES } from '@/constants/routes'

// 첫 진입 화면(HomePage)을 제외한 페이지는 라우트 단위로 분할해 초기 번들에서 뺀다
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'))
const SignupPage = lazy(() => import('@/pages/SignupPage'))
const ArtistDetailPage = lazy(() => import('@/pages/ArtistDetailPage'))
const ArtistsPage = lazy(() => import('@/pages/ArtistsPage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const ConcertDetailPage = lazy(() => import('@/pages/ConcertDetailPage'))
const ConcertsPage = lazy(() => import('@/pages/ConcertsPage'))
const ReleaseDetailPage = lazy(() => import('@/pages/ReleaseDetailPage'))
const ReleasesPage = lazy(() => import('@/pages/ReleasesPage'))
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'))
const PostsPage = lazy(() => import('@/pages/PostsPage'))
const PostWritePage = lazy(() => import('@/pages/PostWritePage'))
const NoticeDetailPage = lazy(() => import('@/pages/NoticeDetailPage'))
const MyPage = lazy(() => import('@/pages/MyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const PolicyPage = lazy(() => import('@/pages/PolicyPage'))

function App() {
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    function handleStorage(e) {
      if (e.key === SESSION_HINT && e.newValue === null) {
        clearUser()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [clearUser])

  return (
    <>
    <script type="application/ld+json">{toSafeJsonLd(buildWebsiteJsonLd())}</script>
    <script type="application/ld+json">{toSafeJsonLd(buildOrganizationJsonLd())}</script>
    <Layout>
      <ScrollToTop />
      <Suspense fallback={null}>
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
        <Route path={ROUTES.COMMUNITY} element={<PostsPage />} />
        <Route path={ROUTES.COMMUNITY_WRITE} element={<PrivateRoute><PostWritePage /></PrivateRoute>} />
        <Route path="/community/:id/edit" element={<PrivateRoute><PostWritePage /></PrivateRoute>} />
        <Route path={ROUTES.NOTICE_DETAIL(':id')} element={<NoticeDetailPage />} />
        <Route path="/community/:id" element={<PostDetailPage />} />
        <Route path={ROUTES.TERMS} element={<PolicyPage title="서비스 이용약관" versions={TERMS_VERSIONS} />} />
        <Route path={ROUTES.PRIVACY} element={<PolicyPage title="개인정보처리방침" versions={PRIVACY_VERSIONS} />} />
        <Route path={ROUTES.ME} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_UPCOMING} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_HISTORY} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_INQUIRIES} element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path={ROUTES.ME_SETTINGS} element={<PrivateRoute><MyPage /></PrivateRoute>} />

        {/* 관리자 — 중첩 라우트 */}
        <Route
          path={ROUTES.ADMIN}
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route index element={<AdminPage />} />
          <Route path="artists/:id/edit" element={<AdminArtistFormPage />} />
          <Route path="concerts/new" element={<AdminConcertCreatePage />} />
          <Route path="concerts/pending" element={<AdminPendingConcertsPage />} />
          <Route path="concerts/excluded" element={<AdminExcludedConcertsPage />} />
          <Route path="concerts/:id/edit" element={<AdminConcertFormPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="notices/new" element={<AdminNoticeFormPage />} />
          <Route path="notices/:id/edit" element={<AdminNoticeFormPage />} />
          <Route path="policies" element={<AdminPolicyPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      <PageViewTracker />
      <Analytics />
      <SpeedInsights />
    </Layout>
    </>
  )
}

export default App
