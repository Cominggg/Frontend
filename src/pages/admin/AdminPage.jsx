import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { getInquiries, getPendingConcerts, triggerArtistCollect, triggerConcertCollect, searchMbArtists, searchKopisConcerts } from '@/services/adminApi'
import { ROUTES } from '@/constants/routes'
import styles from './AdminPage.module.css'

const STATIC_CARDS = [
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

function PipelineSearchBlock({ title, placeholder, onSearch, onCollect, collectLabel, resultNameKey, resultSubKey, resultTagKeys = [] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [collectingId, setCollectingId] = useState(null)
  const [msgs, setMsgs] = useState({})
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
    setMsgs((prev) => ({ ...prev, [key]: '' }))
    try {
      await onCollect(item)
      setMsgs((prev) => ({ ...prev, [key]: '수집 트리거 전송 완료' }))
    } catch {
      setMsgs((prev) => ({ ...prev, [key]: '전송 실패' }))
    } finally {
      setCollectingId(null)
    }
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
            return (
              <li key={key} className={styles.searchResultItem}>
                <div className={styles.searchResultInfo}>
                  <div className={styles.searchResultNameRow}>
                    <span className={styles.searchResultName}>{item[resultNameKey]}</span>
                    {resultTagKeys.length > 0 && (
                      <div className={styles.searchResultTags}>
                        {resultTagKeys.map((key) =>
                          item[key] ? <span key={key} className={styles.searchResultTag}>{item[key]}</span> : null
                        )}
                      </div>
                    )}
                  </div>
                  {resultSubKey && item[resultSubKey] && (
                    <span className={styles.searchResultSub}>{item[resultSubKey]}</span>
                  )}
                </div>
                <div className={styles.searchResultActions}>
                  {msgs[key] && <span className={styles.triggerMsg}>{msgs[key]}</span>}
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
          MusicBrainz 또는 KOPIS에서 데이터를 검색한 뒤 수집 트리거를 전송합니다.
          비동기 처리되며 응답은 트리거 성공 여부만 나타냅니다.
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
        />

        <PipelineSearchBlock
          title="공연 수집 (KOPIS)"
          placeholder="공연명으로 검색"
          onSearch={searchKopisConcerts}
          onCollect={(item) => triggerConcertCollect(item.kopisId)}
          collectLabel="수집"
          resultNameKey="title"
          resultSubKey="kopisId"
        />
      </section>
    </div>
  )
}

export default AdminPage
