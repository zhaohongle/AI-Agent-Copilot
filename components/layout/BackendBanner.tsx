'use client'

import { useState } from 'react'
import { useApiStatus } from '@/lib/dashboard-context'

export function BackendBanner() {
  const { isLive, isChecking, reconnect, retrying } = useApiStatus()
  const [showConfig, setShowConfig] = useState(false)

  // 后端在线不显示
  if (isLive) return null

  return (
    <div className="fixed top-[64px] left-[220px] right-[320px] z-40 bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 text-sm text-amber-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base">{isChecking ? '🔄' : '⚠️'}</span>
          <span>
            {retrying
              ? '正在连接后端...'
              : isChecking
                ? '检测后端连接中...'
                : '后端未连接，当前显示演示数据'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reconnect}
            disabled={retrying}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 transition-colors text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retrying ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                连接中
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                </svg>
                重新连接
              </>
            )}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-2 py-1 rounded hover:bg-amber-500/20 transition-colors"
            title="配置后端地址"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 后端地址配置面板 */}
      {showConfig && <BackendConfigPanel onClose={() => setShowConfig(false)} />}
    </div>
  )
}

function BackendConfigPanel({ onClose }: { onClose: () => void }) {
  const currentUrl = typeof window !== 'undefined'
    ? localStorage.getItem('cockpit_api_base') || ''
    : ''
  const [url, setUrl] = useState(currentUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

  const handleSave = () => {
    const trimmed = url.trim().replace(/\/$/, '')
    localStorage.setItem('cockpit_api_base', trimmed)
    setTestResult(null)
    onClose()
    // 刷新页面以应用新地址
    window.location.reload()
  }

  const handleReset = () => {
    localStorage.removeItem('cockpit_api_base')
    setTestResult(null)
    onClose()
    window.location.reload()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const base = url.trim().replace(/\/$/, '') || window.location.origin
      const res = await fetch(`${base}/health`, {
        signal: AbortSignal.timeout(3000),
      })
      setTestResult(res.ok ? 'ok' : 'fail')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mt-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-amber-300">后端地址配置</span>
        <button onClick={onClose} className="text-amber-400 hover:text-amber-300">✕</button>
      </div>
      <p className="text-xs text-amber-400/70 mb-3">
        默认使用当前域名代理（适合前后端同域部署）。如果后端在其他地址，请填写完整 URL。
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="例如: http://localhost:3001（留空=使用当前域名代理）"
          className="flex-1 px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200 placeholder:text-amber-500/40 text-xs focus:outline-none focus:border-amber-400"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button
          onClick={handleTest}
          disabled={testing}
          className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-colors disabled:opacity-50"
        >
          {testing ? '...' : '测试'}
        </button>
      </div>
      {testResult && (
        <p className={`text-xs mt-2 ${testResult === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {testResult === 'ok' ? '✅ 连接成功' : '❌ 连接失败，请检查地址和后端状态'}
        </p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded-md bg-amber-500 text-amber-950 text-xs font-medium hover:bg-amber-400 transition-colors"
        >
          保存并刷新
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30 transition-colors"
        >
          重置为默认
        </button>
      </div>
    </div>
  )
}
