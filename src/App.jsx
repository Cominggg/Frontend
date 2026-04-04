import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<div>홈</div>} />
      <Route path={ROUTES.ARTISTS} element={<div>아티스트 목록</div>} />
      <Route path="/artists/:id" element={<div>아티스트 상세</div>} />
      <Route path={ROUTES.CONCERTS} element={<div>공연 목록</div>} />
      <Route path="/concerts/:id" element={<div>공연 상세</div>} />
      <Route path={ROUTES.CALENDAR} element={<div>캘린더</div>} />
      <Route path={ROUTES.SEARCH} element={<div>통합 검색</div>} />
      <Route path={ROUTES.MY} element={<div>마이페이지</div>} />
      <Route path={ROUTES.ADMIN} element={<div>관리자</div>} />
    </Routes>
  )
}

export default App
