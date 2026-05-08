'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { Agent, Metrics, TrendData, Alert, Task, CronJob, MemoryFile } from '@/types'
import {
  checkApiAvailable,
  fetchMetrics,
  fetchAgents,
  fetchTrends,
  fetchAlerts,
  fetchTasks,
  fetchCronJobs,
  fetchMemoryFiles,
} from './api-client'
import {
  mockMetrics,
  mockAgents,
  mockAlerts,
  mockTasks,
  mockCronJobs,
  mockMemoryFiles,
  tokenTrend as mockTokenTrend,
  taskTrend as mockTaskTrend,
  todayTokenTrend as mockTodayTokenTrend,
} from './mock-data'

interface DashboardState {
  isLive: boolean
  isLoading: boolean
  isRefreshing: boolean
  metrics: Metrics
  agents: Agent[]
  alerts: Alert[]
  tasks: Task[]
  cronJobs: CronJob[]
  memoryFiles: MemoryFile[]
  tokenTrend30: TrendData[]
  tokenTrendToday: TrendData[]
  taskTrend30: TrendData[]
  lastUpdated: number
  refresh: () => void
  reconnect: () => void
  retrying: boolean
}

const DashboardContext = createContext<DashboardState | null>(null)

const POLL_INTERVAL = 30_000
// 断开提示延迟：连续失败 N 次才显示"未连接"（N × 30s ≈ 5分钟）
const DISCONNECT_THRESHOLD = 10

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // ── 用 mock 数据作为初始值，页面立即有内容显示 ──
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)  // 不阻塞初始渲染
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [metrics, setMetrics] = useState<Metrics>(mockMetrics)
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [cronJobs, setCronJobs] = useState<CronJob[]>(mockCronJobs)
  const [memoryFiles, setMemoryFiles] = useState<MemoryFile[]>(mockMemoryFiles)
  const [tokenTrend30, setTokenTrend30] = useState<TrendData[]>(mockTokenTrend)
  const [tokenTrendToday, setTokenTrendToday] = useState<TrendData[]>(mockTodayTokenTrend)
  const [taskTrend30, setTaskTrend30] = useState<TrendData[]>(mockTaskTrend)
  const [lastUpdated, setLastUpdated] = useState(0)

  const isFetching = useRef(false)
  const isInitialized = useRef(false)

  const [retrying, setRetrying] = useState(false)
  const consecutiveFailures = useRef(0)
  const everConnected = useRef(false)  // 是否曾经成功连上过后端

  const fetchAll = useCallback(async (silent = false) => {
    if (isFetching.current) return
    isFetching.current = true

    if (!silent) {
      setIsRefreshing(true)
    }

    try {
      // ✅ 关键优化：/health 与所有数据请求并行发出，不再串行等待
      const [
        aliveResult,
        metricsData,
        agentsData,
        alertsData,
        tasksData,
        cronData,
        memoryData,
        tok30,
        tokToday,
        task30,
      ] = await Promise.allSettled([
        checkApiAvailable(),
        fetchMetrics(),
        fetchAgents(),
        fetchAlerts(),
        fetchTasks(),
        fetchCronJobs(),
        fetchMemoryFiles(),
        fetchTrends('token', '30days'),
        fetchTrends('token', 'today'),
        fetchTrends('task', '30days'),
      ])

      const alive = aliveResult.status === 'fulfilled' ? aliveResult.value : false

      // 连续失败计数：后端在线时重置为0；离线时累加
      if (alive) {
        consecutiveFailures.current = 0
        everConnected.current = true
      } else {
        consecutiveFailures.current += 1
      }

      // 判定是否真正离线：
      // - 从未连上过后端 → 首次失败就标记离线（显示提示条）
      // - 曾经连上过 → 连续失败达到阈值才标记离线（容错5分钟）
      // - 重新连上 → 计数归零，立即恢复在线
      if (!everConnected.current) {
        setIsLive(alive)
      } else {
        setIsLive(consecutiveFailures.current < DISCONNECT_THRESHOLD)
      }

      if (alive) {
        // Real data mode: completely replace mock data with live API data
        if (metricsData.status === 'fulfilled' && metricsData.value) setMetrics(metricsData.value)
        if (agentsData.status === 'fulfilled' && agentsData.value) setAgents(agentsData.value)
        if (alertsData.status === 'fulfilled' && alertsData.value) setAlerts(alertsData.value)
        if (tasksData.status === 'fulfilled' && tasksData.value) setTasks(tasksData.value)
        // For cron/metrics: always replace when backend is alive (even with fewer items)
        if (cronData.status === 'fulfilled') setCronJobs(cronData.value || [])
        if (memoryData.status === 'fulfilled' && memoryData.value) setMemoryFiles(memoryData.value)
        if (tok30.status === 'fulfilled' && tok30.value) setTokenTrend30(tok30.value)
        if (tokToday.status === 'fulfilled' && tokToday.value) setTokenTrendToday(tokToday.value)
        if (task30.status === 'fulfilled' && task30.value) setTaskTrend30(task30.value)
      }
      // 后端离线时，初始 mock 数据保持不变，UI 不闪烁

      setLastUpdated(Date.now())
    } finally {
      isInitialized.current = true
      setIsLoading(false)
      setIsRefreshing(false)
      isFetching.current = false
    }
  }, [])

  const reconnect = useCallback(async () => {
    if (retrying) return
    setRetrying(true)
    try {
      await fetchAll(false)
    } finally {
      setRetrying(false)
    }
  }, [fetchAll, retrying])

  useEffect(() => {
    // 页面挂载后立即后台获取真实数据（不阻塞渲染）
    fetchAll(true)
    const timer = setInterval(() => fetchAll(true), POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [fetchAll])

  return (
    <DashboardContext.Provider value={{
      isLive, isLoading, isRefreshing, metrics, agents, alerts, tasks,
      cronJobs, memoryFiles, tokenTrend30, tokenTrendToday, taskTrend30,
      lastUpdated, refresh: fetchAll, reconnect, retrying,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

export function useApiStatus() {
  const { isLive, isLoading: isChecking, reconnect, retrying } = useDashboard()
  return { isLive, isChecking, reconnect, retrying }
}

export function useMetrics() {
  const { metrics, isLoading, isLive } = useDashboard()
  return { metrics, isLoading, isLive }
}

export function useAgents() {
  const { agents, isLoading, isLive } = useDashboard()
  return { agents, isLoading, isLive }
}

export function useAlerts() {
  const { alerts, isLoading, isLive } = useDashboard()
  return { alerts, isLoading, isLive }
}

export function useTasks() {
  const { tasks, isLoading, isLive } = useDashboard()
  return { tasks, isLoading, isLive }
}

export function useCronJobs() {
  const { cronJobs, isLoading, isLive } = useDashboard()
  return { cronJobs, isLoading, isLive }
}

export function useMemoryFiles() {
  const { memoryFiles, isLoading, isLive } = useDashboard()
  return { memoryFiles, isLoading, isLive }
}

export function useTrends(type: 'token' | 'task', period: '30days' | 'today' = '30days') {
  const { tokenTrend30, tokenTrendToday, taskTrend30, isLoading, isLive } = useDashboard()
  const trends =
    type === 'token' && period === 'today' ? tokenTrendToday :
    type === 'token' ? tokenTrend30 : taskTrend30
  return { trends, isLoading, isLive }
}
