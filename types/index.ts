export type AgentStatus = 'online' | 'offline'
export type AgentState = 'idle' | 'working' | 'alert'

export type Agent = {
  id: string
  name: string
  avatar: string
  role: string
  status: AgentStatus
  state: AgentState
  currentTask: string
  lastOutput: string
  schedule: boolean
  todayTasks: number
  todayTokens: number
  totalTokens: number
  latency: number
  // Extended fields for detail page
  todayOutputs?: number
  todayCompletedTasks?: number
  totalCompletedTasks?: number
  successRate?: number
  alertCount?: number
  currentTaskProgress?: number
  currentTaskStartTime?: string
  recentAlerts?: AgentAlert[]
  history?: AgentHistory[]
  tokenTrend?: TrendData[]
  outputs?: AgentOutput[]
  description?: string
  createdAt?: string
}

export type AgentAlert = {
  time: string
  desc: string
  level: 'error' | 'warning' | 'info'
}

export type AgentHistory = {
  desc: string
  status: 'completed' | 'failed' | 'running'
  time: string
  tokens: number
}

export type AgentOutput = {
  desc: string
  time: string
  type: string
}

export type Metrics = {
  activeAgents: number
  tasks: number
  successRate: number
  latency: number
  tokens: number
  cost: number
  alerts: number
}

export type TrendData = {
  date: string
  value: number
  value2?: number
}

export type Alert = {
  id: string
  level: 'error' | 'warning' | 'info'
  message: string
  time: string
  agentId?: string
}

export type Task = {
  id: string
  name: string
  status: 'running' | 'waiting' | 'completed' | 'failed'
  agentId: string
  agentName: string
  progress: number
  startTime: string
  estimatedTime?: string
}

export type CronJob = {
  id: string
  name: string
  schedule: string
  nextRun: string
  status: 'active' | 'paused'
  lastRun?: string
}

export type DonutDataItem = {
  name: string
  value: number
  color: string
}

export type MemoryFile = {
  id: string
  name: string
  category: string
  size: string
  updatedAt: string
  content?: string
}
