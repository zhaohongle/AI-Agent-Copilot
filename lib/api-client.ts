import type { Agent, Metrics, TrendData, Alert, Task, CronJob, MemoryFile } from '@/types'

// API Base URL - 默认使用相对路径（通过 Next.js 代理）
// 用户可在 BackendBanner 中自定义后端地址（存入 localStorage）
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('cockpit_api_base')
    if (custom) return custom.replace(/\/$/, '')
  }
  return ''
}

const API_BASE_URL = ''  // 默认值，实际使用 getApiBaseUrl()

// 内存缓存层（客户端单例）
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5秒缓存，避免快速切换页面时重复请求

/**
 * 通用 fetch 封装，带内存缓存
 */
async function fetchAPI<T>(endpoint: string, useCache = true): Promise<T | null> {
  const base = getApiBaseUrl()

  // 检查缓存
  if (useCache && typeof window !== 'undefined') {
    const cached = cache.get(endpoint)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T
    }
  }

  try {
    const response = await fetch(`${base}${endpoint}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000), // 统一 5 秒超时
    })

    if (!response.ok) {
      console.warn(`API request failed: ${endpoint} (${response.status})`)
      return null
    }

    const data = await response.json()

    // 写入缓存
    if (useCache && typeof window !== 'undefined') {
      cache.set(endpoint, { data, timestamp: Date.now() })
    }

    return data
  } catch (error) {
    console.warn(`API request error: ${endpoint}`, error)
    return null
  }
}

/**
 * 检查后端 API 是否可用（不缓存，超时 2 秒）
 */
export async function checkApiAvailable(): Promise<boolean> {
  const base = getApiBaseUrl()
  try {
    const response = await fetch(`${base}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000), // 缩短到 2 秒
    })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * 获取全局指标
 */
export async function fetchMetrics(): Promise<Metrics | null> {
  return fetchAPI<Metrics>('/api/metrics')
}

/**
 * 获取 Agent 列表
 */
export async function fetchAgents(): Promise<Agent[] | null> {
  return fetchAPI<Agent[]>('/api/agents')
}

/**
 * 获取趋势数据
 */
export async function fetchTrends(
  type: 'token' | 'task',
  period: '30days' | 'today' = '30days'
): Promise<TrendData[] | null> {
  const result = await fetchAPI<{ data: TrendData[] }>(`/api/trends?type=${type}&period=${period}`)
  return result?.data || null
}

/**
 * 获取告警列表
 */
export async function fetchAlerts(): Promise<Alert[] | null> {
  return fetchAPI<Alert[]>('/api/alerts')
}

/**
 * 获取任务队列
 */
export async function fetchTasks(): Promise<Task[] | null> {
  return fetchAPI<Task[]>('/api/tasks')
}

/**
 * 获取 Cron 定时任务
 */
export async function fetchCronJobs(): Promise<CronJob[] | null> {
  return fetchAPI<CronJob[]>('/api/cron')
}

/**
 * 获取记忆文件列表
 */
export async function fetchMemoryFiles(): Promise<MemoryFile[] | null> {
  return fetchAPI<MemoryFile[]>('/api/memory')
}

/**
 * 获取配置文档内容
 */
export async function fetchDocs(): Promise<{ files: Record<string, string> } | null> {
  return fetchAPI<{ files: Record<string, string> }>('/api/docs')
}
