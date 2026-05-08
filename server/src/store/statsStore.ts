import { collectSessionStats } from '../collectors/sessionCollector'
import { getAgentConfigs, getAllAgentIds } from '../collectors/fileWatcher'
import { collectCronJobs } from '../collectors/cronCollector'
import { Metrics, Agent, TrendData, DonutDataItem, Alert, Task, SessionEntry } from '../types'

/**
 * 从原始消息内容中提取可读的任务名称
 * 处理以下格式：
 * 1. 带 "Sender (untrusted metadata)" 前缀的系统包裹消息
 * 2. JSON 数组格式 [{"type":"text","text":"..."}]
 * 3. 纯文本
 */
function extractReadableTaskName(content: string): string {
  if (!content || typeof content !== 'string') return '(任务消息)'

  let text = content

  // Step 1: 尝试解析为 JSON 数组格式（如 [{"type":"text","text":"..."}]）
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      const textItem = parsed.find((item: { type?: string; text?: string }) => item.type === 'text' && item.text)
      if (textItem?.text) {
        text = textItem.text
      }
    } else if (typeof parsed === 'object' && parsed.text) {
      text = parsed.text
    }
  } catch {
    // Not JSON, use as-is
  }

  // Step 2: 过滤系统标记前缀（如 "Sender (untrusted metadata): ..." 或 "[timestamp]" 等）
  // 匹配 "Sender" 开头的元数据行并移除
  text = text.replace(/^Sender\s*\([^)]*\)\s*:\s*/gm, '')

  // Step 3: 移除 markdown 代码块标记
  text = text.replace(/```[\s\S]*?```/g, '')

  // Step 4: 移除 JSON 代码块起始标记（如 ```json）
  text = text.replace(/```\w*\n?/g, '')

  // Step 5: 清理多余空白
  text = text.replace(/\n{2,}/g, '\n').trim()

  // Step 6: 如果清理后为空或只有标点/空格，返回默认
  if (!text || /^[\s\W]+$/.test(text)) return '(任务消息)'

  // Step 7: 截断
  if (text.length > 50) {
    return text.slice(0, 50) + '...'
  }

  return text
}

interface StatsCache {
  metrics: Metrics
  agents: Agent[]
  trends: {
    token: TrendData[]
    task: TrendData[]
    latency: TrendData[]
  }
  todayTrends: {
    token: TrendData[]
    task: TrendData[]
  }
  agentTokenDist: DonutDataItem[]
  taskStatus: DonutDataItem[]
  alerts: Alert[]
  tasks: Task[]
  updatedAt: Date
}

let cache: StatsCache = {
  metrics: {
    activeAgents: 0,
    activeSessions: 0,
    tasks: 0,
    successRate: 0,
    latency: 0,
    tokens: 0,
    cost: 0,
    alerts: 0
  },
  agents: [],
  trends: {
    token: [],
    task: [],
    latency: []
  },
  todayTrends: {
    token: [],
    task: []
  },
  agentTokenDist: [],
  taskStatus: [],
  alerts: [],
  tasks: [],
  updatedAt: new Date()
}

function generateAlerts(
  sessionStats: ReturnType<typeof collectSessionStats>,
  agents: Agent[]
): Alert[] {
  const alerts: Alert[] = []
  let alertId = 1

  // Rule 1: Token consumption anomaly (today > yesterday * 1.5)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const yesterdayData = sessionStats.sessionsByDate.get(yesterdayStr)

  if (yesterdayData && sessionStats.todayTokens > yesterdayData.tokens * 1.5) {
    alerts.push({
      id: `alert_${alertId++}`,
      level: 'warning',
      message: 'Token消耗异常增长',
      time: new Date().toISOString(),
      agentId: undefined
    })
  }

  // Rule 2: Agent high failure rate (> 30% in last 10 tasks)
  agents.forEach(agent => {
    const agentStat = sessionStats.agentStats.get(agent.id)
    if (agentStat && agentStat.sessions.length >= 10) {
      const recentSessions = agentStat.sessions.slice(-10)
      const failures = recentSessions.filter(s =>
        (s.message?.role || s.role) === 'assistant' && (s.error || JSON.stringify(s.message?.content || s.content || '').toLowerCase().includes('error'))
      ).length

      if (failures >= 3) {
        alerts.push({
          id: `alert_${alertId++}`,
          level: 'error',
          message: `${agent.name} 任务失败率偏高`,
          time: new Date().toISOString(),
          agentId: agent.id
        })
      }
    }
  })

  // Rule 3: Agent idle for > 2 hours but marked online
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
  agents.forEach(agent => {
    if (agent.status === 'online') {
      const agentStat = sessionStats.agentStats.get(agent.id)
      if (agentStat && agentStat.sessions.length > 0) {
        let lastTime2 = 0
        for (const s of agentStat.sessions) {
          const ts = s.timestamp || s.createdAt
          if (ts) {
            const t = new Date(ts).getTime()
            if (t > lastTime2) lastTime2 = t
          }
        }

        if (lastTime2 > 0 && lastTime2 < twoHoursAgo) {
          alerts.push({
            id: `alert_${alertId++}`,
            level: 'warning',
            message: `${agent.name} 长时间无响应`,
            time: new Date().toISOString(),
            agentId: agent.id
          })
        }
      }
    }
  })

  // Rule 4: Disk usage > 1GB
  try {
    const { execSync } = require('child_process')
    const workspaceRoot = process.env.OPENCLAW_WORKSPACE || `${process.env.HOME}/.openclaw/workspace`
    const output = execSync(`du -sb "${workspaceRoot}" 2>/dev/null || echo "0"`, { encoding: 'utf-8' })
    const bytes = parseInt(output.split('\t')[0] || '0')
    const gb = bytes / (1024 * 1024 * 1024)

    if (gb > 1) {
      alerts.push({
        id: `alert_${alertId++}`,
        level: 'info',
        message: '工作区磁盘占用较大',
        time: new Date().toISOString()
      })
    }
  } catch {
    // Ignore disk check errors
  }

  return alerts
}

function parseIdentityMd(content: string): { name?: string; role?: string; description?: string } {
  const lines = content.split('\n')
  const result: { name?: string; role?: string; description?: string } = {}

  for (const line of lines) {
    const trimmed = line.trim()
    // Support "Name:", "- **Name:**", "名称：", "名字：" formats (EN/ZH)
    const nameMatch = trimmed.match(/^\-?\s*\*{0,2}(?:Name|名称|名字)[：:]\*{0,2}\s*(.+)/)
    const creatureMatch = trimmed.match(/^\-?\s*\*{0,2}Creature:\*{0,2}\s*(.+)/)
    const roleMatch = trimmed.match(/^\-?\s*\*{0,2}(?:Role|角色)[：:]\*{0,2}\s*(.+)/)
    const vibeMatch = trimmed.match(/^\-?\s*\*{0,2}(?:Vibe|气质|风格)[：:]\*{0,2}\s*(.+)/)
    const descMatch = trimmed.match(/^\-?\s*\*{0,2}Description:\*{0,2}\s*(.+)/)

    if (nameMatch) result.name = nameMatch[1].trim()
    else if (creatureMatch) result.role = creatureMatch[1].trim()
    else if (roleMatch && !result.role) result.role = roleMatch[1].trim()
    else if (vibeMatch && !result.description) result.description = vibeMatch[1].trim()
    else if (descMatch && !result.description) result.description = descMatch[1].trim()
  }

  return result
}

export function refresh(): void {
  console.log(`[StatsStore] refreshed at ${new Date().toISOString()}`)

  const sessionStats = collectSessionStats()
  const agentConfigs = getAgentConfigs()
  const allAgentIds = getAllAgentIds()
  const cronJobs = collectCronJobs()

  // Build agents array (deduplicated by agentId)
  const agents: Agent[] = []
  const seenAgentIds = new Set<string>()
  const now = Date.now()
  const fifteenMinutesAgo = now - 15 * 60 * 1000
  const fiveMinutesAgo = now - 5 * 60 * 1000
  const oneHourAgo = now - 60 * 60 * 1000

  allAgentIds.forEach((agentId: string) => {
    if (seenAgentIds.has(agentId)) return  // Deduplicate
    seenAgentIds.add(agentId)
    const agentConfig = agentConfigs.find((c: any) => c.agentId === agentId)
    const identityFile = agentConfig?.files.find((f: any) => f.name === 'IDENTITY.md')
    const identity = identityFile ? parseIdentityMd(identityFile.content) : {}

    const agentStat = sessionStats.agentStats.get(agentId)
    const recentSessions = agentStat?.sessions || []

    // Determine status (online if activity in last 15 minutes)
    let status: 'online' | 'offline' = 'offline'
    let lastActivityTime = 0

    if (recentSessions.length > 0) {
      // Find the most recent activity time across ALL sessions
      // (sessions may not be sorted by time if read from multiple files)
      for (const s of recentSessions) {
        const ts = s.timestamp || s.createdAt
        if (ts) {
          const t = new Date(ts).getTime()
          if (t > lastActivityTime) lastActivityTime = t
        }
      }
      if (lastActivityTime > fifteenMinutesAgo) {
        status = 'online'
      }
    }

    // Determine state
    let state: 'idle' | 'working' | 'alert' = 'idle'
    if (lastActivityTime > fiveMinutesAgo) {
      state = 'working'
    } else if (lastActivityTime > 0 && lastActivityTime < oneHourAgo) {
      // Check for recent alerts
      state = 'alert'
    }

    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = recentSessions.filter((s: SessionEntry) => (s.timestamp || s.createdAt)?.startsWith(today))
    const todayTasks = todaySessions.filter((s: SessionEntry) => (s.message?.role || s.role) === 'user').length
        const getEntryTokens = (s: SessionEntry) => {
      const u = s.message?.usage as Record<string, number> | undefined
      const u2 = s.usage as Record<string, number> | undefined
      return (u?.input || u2?.input || u2?.inputTokens || 0) + (u?.output || u2?.output || u2?.outputTokens || 0)
    }
    const getEntryRole = (s: SessionEntry) => s.message?.role || s.role
    const getEntryContent = (s: SessionEntry): string => {
      const c = s.message?.content || s.content
      if (typeof c === 'string') return c
      return JSON.stringify(c || '')
    }

    const todayTokens = todaySessions.reduce((sum: number, s: SessionEntry) => sum + getEntryTokens(s), 0)
    const todayOutputs = todaySessions.filter((s: SessionEntry) => {
      const content = getEntryContent(s).toLowerCase()
      return getEntryRole(s) === 'assistant' && (content.includes('write') || content.includes('created'))
    }).length

    // Get current task
    let currentTask = '待命中'
    const lastUser = [...todaySessions].reverse().find(s => getEntryRole(s) === 'user')
    if (lastUser) {
      currentTask = extractReadableTaskName(getEntryContent(lastUser))
    }

    // Get last output
    let lastOutput = '暂无'
    const lastAssistant = [...recentSessions].reverse().find(s => getEntryRole(s) === 'assistant')
    if (lastAssistant) {
      lastOutput = extractReadableTaskName(getEntryContent(lastAssistant))
    }

    agents.push({
      id: agentId,
      name: identity.name || agentId,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentId}`,
      role: identity.role || '智能助手',
      status,
      state,
      currentTask,
      lastOutput,
      schedule: cronJobs.some((job: any) => job.name.includes(agentId)),
      todayTasks,
      todayTokens,
      totalTokens: agentStat?.tokens || 0,
      latency: sessionStats.avgLatency,
      todayOutputs,
      description: identity.description
    })
  })

  // Generate alerts
  const alerts = generateAlerts(sessionStats, agents)

  // Generate metrics
  const activeAgents = agents.filter(a => a.status === 'online').length
  const metrics: Metrics = {
    activeAgents,
    activeSessions: activeAgents,
    tasks: sessionStats.totalTasks,
    successRate: sessionStats.successRate,
    latency: sessionStats.avgLatency,
    tokens: sessionStats.todayTokens,
    cost: Math.round(sessionStats.todayTokens * 0.000003 * 100) / 100,
    alerts: alerts.length
  }

  // Generate task status donut
  const taskStatus: DonutDataItem[] = [
    { name: '已完成', value: Math.floor(sessionStats.todayTasks * 0.7), color: '#22C55E' },
    { name: '进行中', value: Math.floor(sessionStats.todayTasks * 0.2), color: '#3B82F6' },
    { name: '排队中', value: Math.floor(sessionStats.todayTasks * 0.1), color: '#F59E0B' }
  ]

  // Generate tasks list
  const tasks: Task[] = []
  let taskId = 1
  agents.forEach((agent: Agent) => {
    const agentStat = sessionStats.agentStats.get(agent.id)
    if (agentStat) {
      const recentUserMessages = agentStat.sessions
        .filter((s: SessionEntry) => (s.message?.role || s.role) === 'user')
        .slice(-5)
        .reverse()

      recentUserMessages.forEach((msg: SessionEntry, index: number) => {
        const isLast = index === 0
        const nextMsg = agentStat.sessions[agentStat.sessions.indexOf(msg) + 1]

        const msgContent = (() => {
          const c = msg.message?.content || msg.content
          if (typeof c === 'string') return c
          if (Array.isArray(c)) {
            const textItem = (c as Array<{type?: string; text?: string}>).find(i => i.type === 'text')
            return textItem?.text || JSON.stringify(c)
          }
          return JSON.stringify(c || '')
        })()
        const nextMsgRole = nextMsg ? (nextMsg.message?.role || nextMsg.role) : undefined
        const status = nextMsgRole === 'assistant' ? 'completed' : 'running'

        tasks.push({
          id: `task_${taskId++}`,
          name: extractReadableTaskName(msgContent),
          status,
          agentId: agent.id,
          agentName: agent.name,
          progress: status === 'completed' ? 100 : (isLast ? 50 : 0),
          startTime: msg.timestamp || msg.createdAt || new Date().toISOString(),
          estimatedTime: status === 'running' ? '预计 2 分钟' : undefined
        })
      })
    }
  })

  // Generate latency trends (mock based on token trends)
  const latencyTrends: TrendData[] = sessionStats.trends30Days.map((t: TrendData) => ({
    date: t.date,
    value: Math.round(150 + Math.random() * 100), // Mock latency
    value2: t.value2
  }))

  // Update cache
  cache = {
    metrics,
    agents,
    trends: {
      token: sessionStats.trends30Days,
      task: sessionStats.trends30Days.map((t: TrendData) => ({ date: t.date, value: t.value2 || 0 })),
      latency: latencyTrends
    },
    todayTrends: {
      token: sessionStats.todayTrends24Hours,
      task: sessionStats.todayTrends24Hours.map((t: TrendData) => ({ date: t.date, value: t.value2 || 0 }))
    },
    agentTokenDist: sessionStats.agentTokenDist,
    taskStatus,
    alerts,
    tasks: tasks.slice(0, 20),
    updatedAt: new Date()
  }
}

export function getCache(): StatsCache {
  return cache
}
