import { useState } from 'react'
import styles from './PolicyPage.module.css'

function PolicyPage({ title, versions }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const current = versions[selectedIndex]

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {versions.length > 1 && (
            <select
              className={styles.versionSelect}
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              aria-label="이전 버전 보기"
            >
              {versions.map((v, i) => (
                <option key={v.version} value={i}>
                  {i === 0 ? `v${v.version} (현재 시행)` : `v${v.version} (이전 버전)`}
                </option>
              ))}
            </select>
          )}
        </div>
        <pre className={styles.content}>{current.content}</pre>
      </div>
    </div>
  )
}

export default PolicyPage
