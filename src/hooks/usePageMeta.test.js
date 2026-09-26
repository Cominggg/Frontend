import { afterEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { SITE_URL } from '@/constants/site'
import usePageMeta from './usePageMeta'

function getCanonicalLinks() {
  return document.head.querySelectorAll('link[rel="canonical"]')
}

describe('usePageMeta', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('title이 있으면 canonical을 SITE_URL + path로 생성', () => {
    renderHook(() => usePageMeta({ title: 'YOASOBI 내한 공연', path: '/concerts/1' }))

    const links = getCanonicalLinks()
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', `${SITE_URL}/concerts/1`)
  })

  it('path가 바뀌면 canonical을 새로 만들지 않고 href만 갱신', () => {
    const { rerender } = renderHook(({ path }) => usePageMeta({ title: 'YOASOBI 내한 공연', path }), {
      initialProps: { path: '/concerts/1' },
    })

    rerender({ path: '/concerts/2' })

    const links = getCanonicalLinks()
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', `${SITE_URL}/concerts/2`)
  })

  it('unmount하면 canonical 제거', () => {
    const { unmount } = renderHook(() => usePageMeta({ title: 'YOASOBI 내한 공연', path: '/concerts/1' }))

    unmount()

    expect(getCanonicalLinks()).toHaveLength(0)
  })

  it('title이 없으면 canonical을 만들지 않음', () => {
    renderHook(() => usePageMeta({ title: undefined, path: '/concerts/1' }))

    expect(getCanonicalLinks()).toHaveLength(0)
  })
})
