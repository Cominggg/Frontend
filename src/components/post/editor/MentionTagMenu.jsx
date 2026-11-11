import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { MENTION_TYPE_LABEL, POST_ENTITY_TAG_MAX_COUNT } from '@/constants/post'
import { MENTION_TYPES, applyTagLimit, searchMentions, searchTagSuggestions } from './mentionSearch'
import styles from './MentionTagMenu.module.css'

const SCROLL_THRESHOLD_PX = 48
const LIMIT_MESSAGE = `공연·아티스트·음악은 ${POST_ENTITY_TAG_MAX_COUNT}개까지 넣을 수 있어요`
// 펼친 목록에서 검색어가 바뀌면 이만큼 기다렸다 찾는다 (접힌 후보의 Suggestion debounce와 같음)
const QUERY_DEBOUNCE_MS = 300

const THUMB_CLASS = { CONCERT: styles.thumbPortrait, ARTIST: styles.thumbCircle }

function Highlighted({ text, query }) {
  const start = text.toLowerCase().indexOf(query.trim().toLowerCase())
  if (!query.trim() || start < 0) return text
  const end = start + query.trim().length
  return (
    <>
      {text.slice(0, start)}
      <mark className={styles.match}>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

function ResultRow({ item, query, active, showType, onHover, onPick }) {
  const meta = [showType && MENTION_TYPE_LABEL[item.type], item.subtitle].filter(Boolean).join(' · ')
  return (
    <button
      type="button"
      className={active ? styles.itemActive : styles.item}
      onMouseEnter={onHover}
      onClick={onPick}
    >
      <span
        className={`${styles.thumb} ${THUMB_CLASS[item.type] ?? styles.thumbSquare}`}
        style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}
      />
      <span className={styles.resultTxt}>
        <span className={styles.resultTitle}>
          <Highlighted text={item.title} query={query} />
        </span>
        {meta && <span className={styles.resultSub}>{meta}</span>}
      </span>
    </button>
  )
}

// '@검색어' 후보 메뉴. 기본은 네 종류를 합친 상위 5건, '더 찾기'를 누르면 같은 자리에서 종류 탭 + 무한 스크롤 목록으로 넓어진다
const MentionTagMenu = forwardRef(function MentionTagMenu({ items, loading, query, command, getTags }, ref) {
  // 새 결과가 올 때까지 이전 후보를 그대로 둬서 메뉴가 깜박이지 않게 한다
  const [shown, setShown] = useState(loading ? null : items)
  const [shownQuery, setShownQuery] = useState(query)
  const [prevItems, setPrevItems] = useState(items)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [retrying, setRetrying] = useState(false)
  const [expandedType, setExpandedType] = useState(null)
  // 펼친 목록. key(종류|검색어)가 지금과 다르면 아직 불러오는 중이다
  const [list, setList] = useState({ key: null, items: [], hasMore: false, page: 0, failed: false })
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingMoreRef = useRef(false)
  const fetchedQueryRef = useRef(null)

  if (!loading && items !== prevItems) {
    setPrevItems(items)
    setShown(items)
    setShownQuery(query)
    setSelectedIndex(0)
  }

  const listKey = expandedType ? `${expandedType}|${query}` : null

  useEffect(() => {
    if (!listKey) return
    let cancelled = false
    // 탭을 바꿀 때는 바로, 검색어를 치는 중에는 잠시 기다렸다 찾는다
    const delay = fetchedQueryRef.current !== null && fetchedQueryRef.current !== query ? QUERY_DEBOUNCE_MS : 0
    const timer = setTimeout(() => {
      fetchedQueryRef.current = query
      searchMentions(expandedType, query).then(
        (result) => {
          if (!cancelled) setList({ key: listKey, items: result, hasMore: result.hasMore ?? false, page: 0, failed: false })
        },
        () => {
          if (!cancelled) setList({ key: listKey, items: [], hasMore: false, page: 0, failed: true })
        },
      )
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [listKey, expandedType, query])

  const listReady = list.key === listKey
  const limited = expandedType
    ? applyTagLimit(listReady ? list.items : [], getTags())
    : { results: shown ?? [], limitReached: shown?.limitReached ?? false }
  const rows = limited.results

  function pick(index) {
    const item = rows[index]
    if (!item) return
    command({
      type: item.type,
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      thumbnailUrl: item.thumbnailUrl,
      releaseGroupId: item.releaseGroupId,
    })
  }

  function openType(type) {
    setExpandedType(type)
    setSelectedIndex(0)
  }

  function expand() {
    openType(shown?.[0]?.type ?? MENTION_TYPES[0])
  }

  function cycleType(step) {
    const i = MENTION_TYPES.indexOf(expandedType)
    openType(MENTION_TYPES[(i + step + MENTION_TYPES.length) % MENTION_TYPES.length])
  }

  async function retry() {
    setRetrying(true)
    try {
      setShown(await searchTagSuggestions(query, getTags()))
      setShownQuery(query)
    } finally {
      setRetrying(false)
    }
  }

  async function handleScroll(event) {
    if (!expandedType || !listReady || !list.hasMore || loadingMoreRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD_PX) return

    const key = listKey
    loadingMoreRef.current = true
    setIsLoadingMore(true)
    try {
      const nextPage = list.page + 1
      const more = await searchMentions(expandedType, query, nextPage)
      setList((prev) =>
        prev.key === key
          ? { ...prev, items: [...prev.items, ...more], hasMore: more.hasMore ?? false, page: nextPage }
          : prev,
      )
    } catch {
      // 다음 페이지를 못 불러오면 지금 목록을 그대로 둔다. 다시 스크롤하면 또 시도한다
    } finally {
      setIsLoadingMore(false)
      loadingMoreRef.current = false
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === 'Tab') {
        if (expandedType) cycleType(event.shiftKey ? -1 : 1)
        else if (rows.length > 0) expand()
        else return false
        return true
      }
      if (rows.length === 0) return false
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + rows.length - 1) % rows.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % rows.length)
        return true
      }
      if (event.key === 'Enter') {
        pick(selectedIndex)
        return true
      }
      return false
    },
  }))

  const busy = expandedType ? !listReady : loading || retrying
  const failed = expandedType ? listReady && list.failed : shown?.failed

  let message = null
  if (limited.limitReached) message = LIMIT_MESSAGE
  else if (rows.length === 0 && !failed) {
    const firstLoad = expandedType ? !listReady : shown === null
    message = firstLoad ? '찾고 있어요' : `'${expandedType ? query : shownQuery}' 검색 결과가 없어요`
  }

  return (
    // 메뉴를 눌러도 본문 커서가 그대로 남아 이어서 칠 수 있게 포커스를 가져가지 않는다
    <div
      className={styles.menu}
      onMouseDown={(e) => e.preventDefault()}
      role="region"
      aria-label={`태그 후보 ${rows.length}개`}
    >
      {busy && (shown !== null || expandedType) && <div className={styles.progress} aria-hidden="true" />}

      {expandedType && (
        <div className={styles.tabs} role="tablist" aria-label="태그 종류">
          {MENTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={type === expandedType}
              className={type === expandedType ? styles.tabActive : styles.tab}
              onClick={() => openType(type)}
            >
              {MENTION_TYPE_LABEL[type]}
            </button>
          ))}
        </div>
      )}

      <div className={styles.list} onScroll={handleScroll}>
        {rows.map((item, i) => (
          <ResultRow
            key={`${item.type}-${item.id}`}
            item={item}
            query={expandedType ? query : shownQuery}
            active={i === selectedIndex}
            showType={!expandedType}
            onHover={() => setSelectedIndex(i)}
            onPick={() => pick(i)}
          />
        ))}
        {isLoadingMore && <div className={styles.note}>불러오는 중...</div>}
      </div>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      {failed && rows.length === 0 && (
        <div className={styles.message} role="status">
          검색하지 못했어요
          {!expandedType && (
            <button type="button" className={styles.retry} onClick={retry} disabled={retrying}>
              다시 시도
            </button>
          )}
        </div>
      )}

      {!expandedType && rows.length > 0 && (
        <div className={styles.foot}>
          <span className={styles.source}>공연·아티스트·음악·트랙에서 찾았어요</span>
          <button type="button" className={styles.more} onClick={expand}>
            &apos;{shownQuery}&apos; 종류별로 더 찾기
            <kbd className={styles.kbd}>Tab</kbd>
          </button>
        </div>
      )}
    </div>
  )
})

export default MentionTagMenu
