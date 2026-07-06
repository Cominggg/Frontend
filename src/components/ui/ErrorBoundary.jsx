import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', fontFamily: 'sans-serif' }}>
          <p style={{ margin: 0, color: '#555' }}>페이지를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '8px 20px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
