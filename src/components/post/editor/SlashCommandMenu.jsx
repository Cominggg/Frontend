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
        <div className={styles.empty}>맞는 서식이 없어요</div>
      </div>
    )
  }

  return (
    <div className={styles.menu}>
      <div className={styles.group} role="presentation">서식</div>
      {items.map((item, i) => (
        <button
          key={item.format}
          type="button"
          className={i === selectedIndex ? styles.itemActive : styles.item}
          onMouseEnter={() => setSelectedIndex(i)}
          onClick={() => selectItem(i)}
        >
          <span className={styles.formatIcon}>{item.icon}</span>
          <span className={styles.typeLabel}>{item.label}</span>
          <kbd className={styles.shortcut}>{item.shortcut}</kbd>
        </button>
      ))}
    </div>
  )
})

export default SlashCommandMenu
