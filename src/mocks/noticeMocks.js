// TODO: API 연동 후 제거 — noticeApi.js/adminApi.js의 실제 공지 엔드포인트(/api/notices, /api/admin/notices/**)로 교체 (BE #123 완료 후)
export const MOCK_NOTICES = [
  {
    id: 1,
    title: '커뮤니티 이용 안내 및 신고 기능 오픈',
    content: '안녕하세요, 커밍입니다.\n\n커뮤니티를 더 안전하게 이용하실 수 있도록 게시글·댓글 신고 기능이 추가되었습니다.',
    active: true,
    createdAt: '2026-09-15 09:00',
  },
  {
    id: 2,
    title: '9월 정기 점검 안내',
    content: '보다 안정적인 서비스 제공을 위해 정기 점검을 진행합니다.\n\n일시: 2026-09-25 02:00 ~ 04:00',
    active: true,
    createdAt: '2026-09-18 14:00',
  },
  {
    id: 3,
    title: '베타 이벤트 종료 안내',
    content: '진행해주신 베타 이벤트가 종료되었습니다. 참여해주셔서 감사합니다.',
    active: false,
    createdAt: '2026-08-01 10:00',
  },
]

let nextId = 4

export async function mockGetNotices() {
  return [...MOCK_NOTICES].sort((a, b) => b.id - a.id)
}

export async function mockGetActiveNotices() {
  return (await mockGetNotices()).filter((n) => n.active)
}

export async function mockGetNotice(id) {
  return MOCK_NOTICES.find((n) => n.id === Number(id))
}

export async function mockCreateNotice({ title, content, active }) {
  const notice = {
    id: nextId++,
    title,
    content,
    active: active ?? true,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
  MOCK_NOTICES.push(notice)
  return notice
}

export async function mockUpdateNotice(id, { title, content, active }) {
  const notice = MOCK_NOTICES.find((n) => n.id === Number(id))
  if (notice) Object.assign(notice, { title, content, active })
  return notice
}

export async function mockToggleNoticeActive(id, active) {
  const notice = MOCK_NOTICES.find((n) => n.id === Number(id))
  if (notice) notice.active = active
  return notice
}

export async function mockDeleteNotice(id) {
  const idx = MOCK_NOTICES.findIndex((n) => n.id === Number(id))
  if (idx >= 0) MOCK_NOTICES.splice(idx, 1)
}
