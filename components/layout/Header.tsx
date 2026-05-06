'use client'

import { Search, Moon, Sun, Globe } from 'lucide-react'
import { useThemeStore, useLocaleStore } from '@/lib/store'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgents, useApiStatus } from '@/lib/use-dashboard-data'

export function Header() {
  const { isDark, toggle } = useThemeStore()
  const { locale, toggle: toggleLocale } = useLocaleStore()
  const { agents } = useAgents()
  const { isLive } = useApiStatus()
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter agents based on search query
  const filteredAgents = searchQuery.trim()
    ? agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.role.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAgentClick = (agentId: string) => {
    setShowResults(false)
    setSearchQuery('')
    router.push(`/agents?id=${agentId}`)
  }

  return (
    <header className="h-16 bg-card border-b border-custom px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🦞</span>
          <div>
            <h1 className="text-base font-bold text-primary">360安全龙虾驾驶舱</h1>
            <p className="text-xs text-tertiary">OpenClaw Agent Cockpit</p>
          </div>
        </div>
      </div>

      {/* Centered search box */}
      <div className="absolute left-1/2 -translate-x-1/2" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
          <input
            type="text"
            placeholder="搜索龙虾、任务、文档..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            className="w-64 h-10 pl-10 pr-4 rounded-lg bg-main border border-custom text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Search results dropdown */}
          {showResults && filteredAgents.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-card border border-custom rounded-lg shadow-lg overflow-hidden z-50">
              {filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentClick(agent.id)}
                  className="w-full px-4 py-3 text-left hover:bg-main transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">{agent.avatar}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary">{agent.name}</div>
                    <div className="text-xs text-tertiary">{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* API Status Indicator */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-main border border-custom">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-yellow-500'} ${isLive ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium text-secondary">
              {isLive ? '🟢 实时数据' : '🟡 演示数据'}
            </span>
          </div>
          {showTooltip && (
            <div className="absolute top-full mt-2 right-0 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-50 shadow-lg">
              {isLive ? '后端 API: http://localhost:3001' : '后端 API 未连接，使用 mock 数据'}
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45" />
            </div>
          )}
        </div>

        <button
          onClick={toggleLocale}
          className="w-10 h-10 rounded-lg bg-main border border-custom flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-medium text-primary"
        >
          {locale === 'zh' ? '中' : 'EN'}
        </button>

        <button
          onClick={toggle}
          className="w-10 h-10 rounded-lg bg-main border border-custom flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}
