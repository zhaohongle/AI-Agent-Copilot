'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store'

/**
 * 纯客户端主题同步组件，仅负责把 dark class 写到 <html> 上。
 * 将此组件抽离出来，让 layout.tsx 保持为 Server Component。
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useThemeStore()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return <>{children}</>
}
