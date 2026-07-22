import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { getInquiries, getPendingConcerts, triggerArtistCollect, triggerConcertCollect, searchMbArtists, searchKopisConcerts } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminPage.module.css'

const CONCERT_SKIP_REASONS = {
  not_touring: '내한 공연 아님',
  no_alias_match: '아티스트 매칭 없음',
}

const STATIC_CARDS = [
  {
    to: ROUTES.ADMIN_CONCERT_NEW,
    label: '공연 직접 등록',
    desc: '파이프라인 없이 어드민이 직접 공연 정보를 입력하고 아티스트를 연결합니다.',
    countKey: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_PENDING_CONCERTS,
    label: 'PENDING 공연 검토',
    desc: '파이프라인이 수집·매칭한 PENDING 공연을 검토하고 승인 또는 거절합니다.',
    countKey: 'pendingConcerts',
    countLabel: '대기',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_EXCLUDED_CONCERTS,
    label: 'EXCLUDED 공연 관리',
    desc: '거절 처리된 공연에 아티스트를 직접 연결하거나 상태를 복원합니다.',
    countKey: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
  {
    to: ROUTES.ADMIN_INQUIRIES,
    label: '문의 관리',
    desc: '사용자가 제출한 데이터 문의를 조회하고 처리 상태를 변경합니다.',
    countKey: 'pendingInquiries',
    countLabel: '미처리',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

// formatResult 반환 형태:
//   성공: { type: 'success', fields: [{ label, value }], editPath: string | null }
//   건너뜀: { type: 'skip', msg: string }
// 에러는 catch에서 { type: 'error', msg: string } 으로 내부 생성

function PipelineSearchBlock({ title, placeholder, onSearch, onCollect, collectLabel, resultNameKey, resultSubKey, resultTagKeys = [], formatResult }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [collectingId, setCollectingId] = useState(null)
  const [collectResults, setCollectResults] = useState({})
  const [searchError, setSearchError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    setResults([])
    try {
      const data = await onSearch(query.trim())
      setResults(Array.isArray(data) ? data : (data.content ?? []))
    } catch {
      setSearchError('검색에 실패했습니다.')
    } finally {
      setSearching(false)
    }
  }

  async function handleCollect(item) {
    const key = item.id ?? item.mbid ?? item.kopisId
    setCollectingId(key)
    setCollectResults((prev) => { const next = { ...prev }; delete next[key]; return next })
    try {
      const data = await onCollect(item)
      const formatted = formatResult
        ? formatResult(data)
        : { type: 'success', fields: [], editPath: null }
      setCollectResults((prev) => ({ ...prev, [key]: formatted }))
    } catch (err) {
      const code = err?.response?.data?.code
      const msg =
        code === 'PIPELINE_NOT_FOUND' ? '등록되지 않은 ID입니다.'
        : code === 'PIPELINE_CONFLICT' ? '이미 처리 중인 수집 요청입니다.'
        : '수집 실패'
      setCollectResults((prev) => ({ ...prev, [key]: { type: 'error', msg } }))
    } finally {
      setCollectingId(null)
    }
  }

  function dismissResult(key) {
    setCollectResults((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  return (
    <div className={styles.searchBlock}>
      <h3 className={styles.searchBlockTitle}>{title}</h3>
      <form className={styles.searchRow} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.triggerBtn} disabled={searching || !query.trim()}>
          {searching ? '검색 중...' : '검색'}
        </button>
      </form>
      {searchError && <p className={styles.triggerMsg}>{searchError}</p>}
      {results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((item) => {
            const key = item.id ?? item.mbid ?? item.kopisId
            const collectResult = collectResults[key]
            return (
              <li key={key} className={styles.searchResultItem}>
                <div className={styles.searchResultRow}>
                  <div className={styles.searchResultInfo}>
                    <div className={styles.searchResultNameRow}>
                      <span className={styles.searchResultName}>{item[resultNameKey]}</span>
                      {resultTagKeys.length > 0 && (
                        <div className={styles.searchResultTags}>
                          {resultTagKeys.map((tagKey) =>
                            item[tagKey] ? <span key={tagKey} className={styles.searchResultTag}>{item[tagKey]}</span> : null
                          )}
                        </div>
                      )}
                    </div>
                    {resultSubKey && item[resultSubKey] && (
                      <span className={styles.searchResultSub}>{item[resultSubKey]}</span>
                    )}
                  </div>
                  <div className={styles.searchResultActions}>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.triggerLink}>
                        바로가기 →
                      </a>
                    )}
                    <button
                      type="button"
                      className={styles.collectBtn}
                      disabled={collectingId === key}
                      onClick={() => handleCollect(item)}
                    >
                      {collectingId === key ? '전송 중...' : collectLabel}
                    </button>
                  </div>
                </div>
                {collectResult && (
                  <div className={`${styles.resultCard} ${
                    collectResult.type === 'success' ? styles.resultCardSuccess
                    : collectResult.type === 'skip' ? styles.resultCardSkip
                    : styles.resultCardError
                  }`}>
                    <p className={styles.resultCardTitle}>
                      {collectResult.type === 'success' ? '수집 완료'
                      : collectResult.type === 'skip' ? '수집 건너뜀'
                      : '수집 실패'}
                    </p>
                    {collectResult.type === 'success' && collectResult.fields?.length > 0 && (
                      <dl className={styles.resultFields}>
                        {collectResult.fields.map(({ label, value }) => (
                          <div key={label} className={styles.resultField}>
                            <dt className={styles.resultFieldLabel}>{label}</dt>
                            <dd className={styles.resultFieldValue}>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {(collectResult.type === 'skip' || collectResult.type === 'error') && (
                      <p className={styles.resultCardMsg}>{collectResult.msg}</p>
                    )}
                    <div className={styles.resultCardActions}>
                      <button
                        type="button"
                        className={styles.resultDismissBtn}
                        onClick={() => dismissResult(key)}
                      >
                        확인
                      </button>
                      {collectResult.type === 'success' && collectResult.editPath && (
                        <Link to={collectResult.editPath} className={styles.resultEditBtn}>
                          수정
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {results.length === 0 && !searching && query && !searchError && (
        <p className={styles.triggerMsg}>검색 결과가 없습니다.</p>
      )}
    </div>
  )
}

function AdminPage() {
  const [counts, setCounts] = useState({ pendingInquiries: null, pendingConcerts: null })

  useEffect(() => {
    Promise.allSettled([
      getInquiries({ status: 'PENDING', size: 1 }),
      getPendingConcerts({ size: 1 }),
    ]).then(([inquiryResult, concertResult]) => {
      setCounts({
        pendingInquiries: inquiryResult.status === 'fulfilled' ? inquiryResult.value.totalElements : null,
        pendingConcerts: concertResult.status === 'fulfilled' ? concertResult.value.totalElements : null,
      })
    })
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>Coming 관리자 콘솔에 오신 것을 환영합니다.</p>
      </div>

      <div className={styles.grid}>
        {STATIC_CARDS.map((card) => {
          const count = card.countKey ? counts[card.countKey] : null
          return (
            <Link key={card.to} to={card.to} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}>{card.icon}</div>
                {count != null && count > 0 && (
                  <span className={styles.cardBadge}>
                    {count} {card.countLabel}
                  </span>
                )}
              </div>
              <p className={styles.cardLabel}>{card.label}</p>
              <p className={styles.cardDesc}>{card.desc}</p>
              <div className={styles.cardArrow} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>

      <section className={styles.pipeline}>
        <h2 className={styles.pipelineTitle}>파이프라인 트리거</h2>
        <p className={styles.pipelineDesc}>
          MusicBrainz 또는 KOPIS에서 데이터를 검색한 뒤 수집합니다.
          외부 API 호출로 인해 수 초 이상 소요될 수 있습니다.
        </p>
        <p className={styles.pipelineHint}>
          기존 아티스트·공연 수정은 각 상세 페이지의 <strong>관리자 수정</strong> 버튼을 이용하세요.
        </p>

        <PipelineSearchBlock
          title="아티스트 수집 (MusicBrainz)"
          placeholder="아티스트명으로 검색"
          onSearch={searchMbArtists}
          onCollect={(item) => triggerArtistCollect(item.mbid)}
          collectLabel="수집"
          resultNameKey="name"
          resultSubKey="mbid"
          resultTagKeys={['type', 'country']}
          formatResult={(result) => ({
            type: 'success',
            fields: [
              { label: '아티스트명', value: result.name },
              { label: 'DB ID', value: String(result.artistId) },
            ],
            editPath: ROUTES.ADMIN_ARTIST_EDIT(result.artistId),
          })}
        />

        <PipelineSearchBlock
          title="공연 수집 (KOPIS)"
          placeholder="공연명으로 검색"
          onSearch={searchKopisConcerts}
          onCollect={(item) => triggerConcertCollect(item.kopisId)}
          collectLabel="수집"
          resultNameKey="title"
          resultSubKey="kopisId"
          formatResult={(result) =>
            result.success
              ? {
                  type: 'success',
                  fields: [
                    { label: '공연명', value: result.title },
                    { label: 'DB ID', value: String(result.concertId) },
                    {
                      label: '매칭 아티스트',
                      value: result.matchedArtists?.length
                        ? result.matchedArtists.map((a) => {
                            const display = a.koreanName ? `${a.name} (${a.koreanName})` : a.name
                            return `${display} (ID: ${a.artistId})`
                          }).join(', ')
                        : '없음',
                    },
                  ],
                  editPath: ROUTES.ADMIN_CONCERT_EDIT(result.concertId),
                }
              : {
                  type: 'skip',
                  msg: CONCERT_SKIP_REASONS[result.reason] ?? result.reason ?? '알 수 없음',
                }
          }
        />
      </section>
    </div>
  )
}

export default AdminPage
