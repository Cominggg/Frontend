import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const SITE_URL = 'https://www.comingg.com'
const API_BASE_URL = process.env.SITEMAP_API_BASE_URL || 'https://api.comingg.com/api'
const OUTPUT_PATH = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../public/sitemap.xml')
const PAGE_SIZE = 200

const STATIC_URLS = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/artists', changefreq: 'daily', priority: '0.8' },
  { loc: '/concerts', changefreq: 'daily', priority: '0.8' },
  { loc: '/releases', changefreq: 'daily', priority: '0.7' },
  { loc: '/calendar', changefreq: 'weekly', priority: '0.6' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.2' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.2' },
]

// 리스트 엔드포인트를 끝까지 페이지네이션하며 id만 수집. 실패 시 에러를 그대로
// 던져서 main()이 기존 sitemap.xml을 훼손하지 않고 유지하도록 한다.
async function fetchAllIds(endpoint) {
  const ids = []
  let page = 0

  while (true) {
    const res = await fetch(`${API_BASE_URL}${endpoint}?page=${page}&size=${PAGE_SIZE}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`)
    const data = await res.json()

    for (const item of data.content ?? []) {
      if (item?.id != null) ids.push(item.id)
    }

    page += 1
    if (page >= (data.totalPages ?? 0)) break
  }

  return ids
}

function buildUrlEntry({ loc, changefreq, priority }) {
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function main() {
  let concertIds, artistIds, releaseIds
  try {
    ;[concertIds, artistIds, releaseIds] = await Promise.all([
      fetchAllIds('/concerts'),
      fetchAllIds('/artists'),
      fetchAllIds('/releases'),
    ])
  } catch (err) {
    // 일부 구간만 빠진 채로 sitemap.xml을 덮어쓰면 이미 색인된 URL이 검색엔진에서
    // 통째로 빠질 수 있어, 실패 시에는 파일을 건드리지 않고 기존 버전을 유지한다.
    console.warn(`[sitemap] API 수집 실패, 기존 public/sitemap.xml을 유지합니다: ${err.message}`)
    return
  }

  const dynamicUrls = [
    ...concertIds.map((id) => ({ loc: `/concerts/${id}`, changefreq: 'weekly', priority: '0.6' })),
    ...artistIds.map((id) => ({ loc: `/artists/${id}`, changefreq: 'weekly', priority: '0.6' })),
    ...releaseIds.map((id) => ({ loc: `/releases/${id}`, changefreq: 'weekly', priority: '0.5' })),
  ]

  const body = [...STATIC_URLS, ...dynamicUrls].map(buildUrlEntry).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

  await writeFile(OUTPUT_PATH, xml, 'utf-8')
  console.log(`[sitemap] 생성 완료 — 정적 ${STATIC_URLS.length}개 + 동적 ${dynamicUrls.length}개 (콘서트 ${concertIds.length} · 아티스트 ${artistIds.length} · 릴리즈 ${releaseIds.length})`)
}

main()
