'use client'

import { useApiStatus } from '@/lib/dashboard-context'

export function BackendBanner() {
  const { isLive, isChecking } = useApiStatus()

  // 后端在线或仍在检测中不显示
  if (isLive || isChecking) return null

  return (
    <div className="fixed top-[64px] left-[220px] right-[320px] z-40 flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 text-sm text-amber-400">
      <span className="text-base">⚠️</span>
      <span>
        后端未连接，当前显示演示数据。
      </span>
      <a
        href="https://github.com/zhaohongle/AI-Agent-Copilot#quick-start"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-amber-300 transition-colors"
      >
        查看启动说明 →
      </a>
    </div>
  )
}
