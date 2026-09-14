import { forwardRef, useImperativeHandle, useState } from 'react'

import styles from './SlashCommandMenu.module.css'

const SlashCommandMenu = forwardRef(function SlashCommandMenu({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevItems, setPrevItems] = useState(items)

  if (items !== prevItems) {
    setPrevItems(items)
    setSelectedIndex(0)
  }

  function selectItem(index) {
    const item = items[index]
    if (item) command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (items.length === 0) return false
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (items.length === 0) {
    return (
      <div className={styles.menu}>
        <div className={styles.empty}>검색 결과가 없습니다</div>
      </div>
    )
  }

  return (
    <div className={styles.menu}>
      {items.map((item, i) => (
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
    </div>
  )
})

export default SlashCommandMenu
