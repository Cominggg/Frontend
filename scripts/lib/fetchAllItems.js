const API_BASE_URL = process.env.SITEMAP_API_BASE_URL || 'https://api.comingg.com/api'
const PAGE_SIZE = 200

// 리스트 엔드포인트를 끝까지 페이지네이션하며 항목을 수집. 실패 시 에러를 그대로 던져
// 호출 측이 기존 산출물을 훼손하지 않고 유지하도록 한다.
// 페이지 수집 도중 데이터가 추가/삭제되면 offset이 밀리면서 같은 항목이 여러 페이지에
// 걸쳐 중복 수집될 수 있어 id 기준으로 걸러낸다.
export async function fetchAllItems(endpoint) {
  const items = new Map()
  let page = 0

  while (true) {
    const res = await fetch(`${API_BASE_URL}${endpoint}?page=${page}&size=${PAGE_SIZE}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}`)
    const data = await res.json()

    for (const item of data.content ?? []) {
      if (item?.id != null) items.set(item.id, item)
    }

    page += 1
    if (page >= (data.totalPages ?? 0)) break
  }

  return [...items.values()]
}
