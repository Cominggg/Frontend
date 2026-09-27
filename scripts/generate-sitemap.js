import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { fetchAllItems } from './lib/fetchAllItems.js'

const SITE_URL = 'https://www.comingg.com'
const OUTPUT_PATH = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../public/sitemap.xml')

const STATIC_URLS = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/artists', changefreq: 'daily', priority: '0.8' },
  { loc: '/concerts', changefreq: 'daily', priority: '0.8' },
  { loc: '/releases', changefreq: 'daily', priority: '0.7' },
  { loc: '/calendar', changefreq: 'weekly', priority: '0.6' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.2' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
]

function buildUrlEntry({ loc, changefreq, priority }) {
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

// 동적 URL은 공연 상세만 넣는다. 발매(5천여 개)·아티스트(1천여 개)까지 한꺼번에 제출하면
// 신규 도메인의 크롤링 수요가 분산돼 핵심인 공연 페이지까지 '발견됨 - 색인 미생성'에 머문다.
// 아티스트·발매 상세는 목록 페이지네이션과 상세 간 링크를 통해 크롤러가 발견하도록 둔다.
async function main() {
  let concertIds
  try {
    concertIds = (await fetchAllItems('/concerts')).map((concert) => concert.id)
  } catch (err) {
    // 일부 구간만 빠진 채로 sitemap.xml을 덮어쓰면 이미 색인된 URL이 검색엔진에서
    // 통째로 빠질 수 있어, 실패 시에는 파일을 건드리지 않고 기존 버전을 유지한다.
    console.warn(`[sitemap] API 수집 실패, 기존 public/sitemap.xml을 유지합니다: ${err.message}`)
    return
  }

  const dynamicUrls = concertIds.map((id) => ({ loc: `/concerts/${id}`, changefreq: 'weekly', priority: '0.6' }))

  const body = [...STATIC_URLS, ...dynamicUrls].map(buildUrlEntry).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

  await writeFile(OUTPUT_PATH, xml, 'utf-8')
  console.log(`[sitemap] 생성 완료 — 정적 ${STATIC_URLS.length}개 + 동적 ${dynamicUrls.length}개 (콘서트 ${concertIds.length})`)
}

main()
