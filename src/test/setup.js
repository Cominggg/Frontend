import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// globals 미사용이라 RTL 자동 cleanup이 동작하지 않으므로 직접 등록
afterEach(cleanup)
