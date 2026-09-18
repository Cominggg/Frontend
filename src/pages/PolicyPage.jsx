import { useState } from 'react'
import { getCurrentVersionIndex } from '@/constants/policy'
import styles from './PolicyPage.module.css'

function labelFor(version, index, currentIndex) {
  if (index === currentIndex) return `v${version.version} (현재 시행)`
  if (index < currentIndex) return `v${version.version} (시행 예정 · ${version.effectiveDate})`
  return `v${version.version} (이전 버전)`
}

function PolicyPage({ title, versions }) {
  const currentIndex = getCurrentVersionIndex(versions)
  const [selectedIndex, setSelectedIndex] = useState(currentIndex)
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
              aria-label="버전 보기"
            >
              {versions.map((v, i) => (
                <option key={v.version} value={i}>
                  {labelFor(v, i, currentIndex)}
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
