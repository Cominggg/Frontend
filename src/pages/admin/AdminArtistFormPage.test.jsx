import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminArtistFormPage from './AdminArtistFormPage'
import { getAdminArtist } from '@/services/adminApi'

vi.mock('@/services/adminApi', () => ({
  getAdminArtist: vi.fn(),
  updateArtist: vi.fn(),
  triggerArtistReleasesCollect: vi.fn(),
}))

const ARTIST = { id: 1, name: 'YOASOBI', aliases: {}, imageUrl: '', links: [] }
const URL_A = 'https://example.com/yoasobi-a.jpg'
const URL_B = 'https://example.com/yoasobi-b.jpg'

async function renderPage() {
  render(
    <MemoryRouter initialEntries={['/admin/artists/1']}>
      <Routes>
        <Route path="/admin/artists/:id" element={<AdminArtistFormPage />} />
      </Routes>
    </MemoryRouter>,
  )
  await screen.findByDisplayValue('YOASOBI')
}

async function changeImageUrl(user, url) {
  const input = screen.getByLabelText('이미지 URL')
  await user.clear(input)
  await user.type(input, url)
}

beforeEach(() => {
  vi.clearAllMocks()
  getAdminArtist.mockResolvedValue(ARTIST)
})

describe('AdminArtistFormPage 이미지 미리보기', () => {
  it('이미지 URL을 입력하면 미리보기 이미지 표시', async () => {
    const user = userEvent.setup()
    await renderPage()

    await changeImageUrl(user, URL_A)

    expect(screen.getByRole('img', { name: '아티스트 이미지 미리보기' })).toHaveAttribute('src', URL_A)
  })

  it('미리보기 이미지 로드에 실패하면 "이미지 없음" 표시', async () => {
    const user = userEvent.setup()
    await renderPage()
    await changeImageUrl(user, URL_A)

    fireEvent.error(screen.getByRole('img', { name: '아티스트 이미지 미리보기' }))

    expect(screen.getByText('이미지 없음')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: '아티스트 이미지 미리보기' })).not.toBeInTheDocument()
  })

  it('실패한 URL에서 다른 URL로 바꿨다가 다시 되돌리면 미리보기 이미지를 재시도', async () => {
    const user = userEvent.setup()
    await renderPage()
    await changeImageUrl(user, URL_A)
    fireEvent.error(screen.getByRole('img', { name: '아티스트 이미지 미리보기' }))
    await changeImageUrl(user, URL_B)

    await changeImageUrl(user, URL_A)

    expect(screen.getByRole('img', { name: '아티스트 이미지 미리보기' })).toHaveAttribute('src', URL_A)
    expect(screen.queryByText('이미지 없음')).not.toBeInTheDocument()
  })
})
