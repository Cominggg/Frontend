import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { parseSlashQuery, searchMentions } from './mentionSearch'
import styles from './SlashCommandMenu.module.css'

const SCROLL_THRESHOLD_PX = 48

const SlashCommandMenu = forwardRef(function SlashCommandMenu({ items, query, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevItems, setPrevItems] = useState(items)
  const [allItems, setAllItems] = useState(items)
  const [hasMore, setHasMore] = useState(items.hasMore ?? false)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingMoreRef = useRef(false)

  if (items !== prevItems) {
    setPrevItems(items)
    setSelectedIndex(0)
    setAllItems(items)
    setHasMore(items.hasMore ?? false)
    setPage(0)
  }

  function selectItem(index) {
    const item = allItems[index]
    if (item) command(item)
  }

  async function handleScroll(event) {
    if (!hasMore || loadingMoreRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD_PX) return

    const parsed = parseSlashQuery(query)
    if (parsed.stage !== 'search') return

    loadingMoreRef.current = true
    setIsLoadingMore(true)
    const nextPage = page + 1
    const more = await searchMentions(parsed.type, parsed.searchTerm, nextPage)
    setAllItems((prev) => [...prev, ...more])
    setHasMore(more.hasMore ?? false)
    setPage(nextPage)
    setIsLoadingMore(false)
    loadingMoreRef.current = false
  }

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (allItems.length === 0) return false
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + allItems.length - 1) % allItems.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % allItems.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (allItems.length === 0) {
    return (
      <div className={styles.menu}>
        <div className={styles.empty}>검색 결과가 없습니다</div>
      </div>
    )
  }

  return (
    <div className={styles.menu} onScroll={handleScroll}>
      {allItems.map((item, i) => (
        <button
          key={item.stage === 'format' ? item.format : item.stage === 'type' ? item.type : `${item.type}-${item.id}`}
          type="button"
          className={i === selectedIndex ? styles.itemActive : styles.item}
          onMouseEnter={() => setSelectedIndex(i)}
          onClick={() => selectItem(i)}
        >
          {item.stage === 'format' ? (
            <>
              <span className={styles.formatIcon}>{item.icon}</span>
              <span className={styles.typeLabel}>{item.label}</span>
            </>
          ) : item.stage === 'type' ? (
            <span className={styles.typeLabel}>{item.label}</span>
          ) : (
            <>
              <span
                className={`${styles.thumb} ${item.type === 'CONCERT' ? styles.thumbPortrait : item.type === 'ARTIST' ? styles.thumbCircle : styles.thumbSquare}`}
                style={item.thumbnailUrl ? { backgroundImage: `url(${item.thumbnailUrl})` } : undefined}
              />
              <span className={styles.resultTxt}>
                <span className={styles.resultTitle}>{item.title}</span>
                {item.subtitle && <span className={styles.resultSub}>{item.subtitle}</span>}
              </span>
            </>
          )}
        </button>
      ))}
      {isLoadingMore && <div className={styles.loadingMore}>불러오는 중...</div>}
    </div>
  )
})

export default SlashCommandMenu
