import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { fetchAllItems } from './lib/fetchAllItems.js'
import { injectMeta } from './lib/injectMeta.js'
import { SITE_URL, SITE_LOGO_URL } from '../src/constants/site.js'
import { STATIC_PAGE_META, buildArtistMeta, buildConcertMeta, buildReleaseMeta } from '../src/utils/pageMeta.js'

// SPA라 서버 HTML이 모든 URL에서 같아, JS를 실행하지 않는 크롤러(네이버 등)·공유 미리보기 봇이
// 전 페이지를 같은 title·description으로 인식한다. 빌드 후 URL별로 head만 바꾼
// dist/{path}/index.html을 만들어 두면 Vercel이 rewrite보다 정적 파일을 먼저 서빙한다.
// 배포 이후 추가된 항목은 파일이 없어 기존처럼 기본 index.html로 fallback된다.
const DIST_DIR = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../dist')

const DETAIL_TYPES = [
  { endpoint: '/concerts', buildMeta: buildConcertMeta, isValid: (item) => item.title },
  { endpoint: '/artists', buildMeta: buildArtistMeta, isValid: (item) => item.name },
  { endpoint: '/releases', buildMeta: buildReleaseMeta, isValid: (item) => item.title },
]

async function writePage(template, pathname, meta, { withCanonical }) {
  const html = injectMeta(template, {
    ...meta,
    image: meta.image || SITE_LOGO_URL,
    url: `${SITE_URL}${pathname}`,
    withCanonical,
  })
  const dir = path.join(DIST_DIR, pathname)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), html, 'utf-8')
}

async function main() {
  const template = await readFile(path.join(DIST_DIR, 'index.html'), 'utf-8')

  // 목록 페이지는 쿼리와 무관하게 같은 파일이 서빙되는데 ?page=N의 canonical은 JS가 따로 지정하므로,
  // 목록·정적 페이지의 canonical은 JS(usePageMeta)에만 맡긴다.
  for (const [pathname, meta] of Object.entries(STATIC_PAGE_META)) {
    await writePage(template, pathname, meta, { withCanonical: false })
  }

  // 한 타입의 수집이 실패해도 나머지는 생성한다. 실패한 타입은 기본 index.html로 fallback.
  const counts = []
  for (const { endpoint, buildMeta, isValid } of DETAIL_TYPES) {
    try {
      const items = (await fetchAllItems(endpoint)).filter(isValid)
      await Promise.all(items.map((item) => writePage(template, `${endpoint}/${item.id}`, buildMeta(item), { withCanonical: true })))
      counts.push(`${endpoint} ${items.length}`)
    } catch (err) {
      console.warn(`[prerender-meta] ${endpoint} 수집 실패, 해당 상세는 기본 HTML로 서빙됩니다: ${err.message}`)
    }
  }

  console.log(`[prerender-meta] 생성 완료 — 정적 ${Object.keys(STATIC_PAGE_META).length}개 · ${counts.join(' · ')}`)
}

main()
