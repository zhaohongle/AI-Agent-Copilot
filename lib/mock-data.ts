import type { Agent, Metrics, TrendData, Alert, Task, CronJob, DonutDataItem, MemoryFile } from '@/types'

// Mock 数据 - 演示模式下使用
// 真实数据通过 /server 后端 API 自动从 OpenClaw 工作区读取
// Agent id 仅作演示，真实环境会从 ~/.openclaw/workspace/agents/ 自动发现

// Helper function to generate 7-day token trend for each agent
const generateAgentTokenTrend = (): TrendData[] => {
  const data: TrendData[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    data.push({
      date: dateStr,
      value: Math.round(1000000 + Math.random() * 3000000)
    })
  }
  return data
}

// 基于真实 Agent 的 mock 数据（id与真实一致，名称来自IDENTITY.md，tokens量级与真实数据对齐）
export const mockAgents: Agent[] = [
  {
    id: 'nami_claudequanzhankaifazhuanjia',
    name: 'Claude开发专家',
    avatar: '🐦',
    role: 'AI编程助手',
    status: 'online',
    state: 'working',
    currentTask: '正在构建驾驶舱后端API层，已完成70%',
    lastOutput: '成功构建后端Express服务，已接通真实JSONL数据',
    schedule: true,
    todayTasks: 9,
    todayTokens: 4988959,
    totalTokens: 39989748,
    latency: 245,
    todayOutputs: 8,
    todayCompletedTasks: 8,
    totalCompletedTasks: 74,
    successRate: 96.5,
    alertCount: 1,
    currentTaskProgress: 70,
    currentTaskStartTime: '09:30',
    description: '负责全栈开发工作，擅长前后端技术栈，是团队核心主力',
    createdAt: '2024-01-15',
    recentAlerts: [
      { time: '10:25', desc: '检测到内存使用率偏高', level: 'warning' },
      { time: '09:15', desc: '成功完成后端API联调', level: 'info' }
    ],
    history: [
      { desc: '构建驾驶舱后端API层', status: 'running', time: '09:30', tokens: 1500000 },
      { desc: '修复trends数据解析逻辑', status: 'completed', time: '08:45', tokens: 1200000 },
      { desc: '对接OpenClaw真实JSONL', status: 'completed', time: '08:00', tokens: 890000 },
      { desc: '修复token字段解析', status: 'completed', time: '07:30', tokens: 560000 },
      { desc: '路径修正与类型修复', status: 'completed', time: '07:00', tokens: 720000 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: '后端API服务 server/', time: '10:00', type: '代码工程' },
      { desc: 'sessionCollector.ts', time: '08:50', type: '数据采集' },
    ]
  },
  {
    id: 'nami_chanpinjingli',
    name: 'Alex',
    avatar: '🎯',
    role: '执行型产品经理',
    status: 'online',
    state: 'idle',
    currentTask: '等待新任务中',
    lastOutput: '完成了驾驶舱PRD审查，选定混合模式实现方案',
    schedule: true,
    todayTasks: 0,
    todayTokens: 0,
    totalTokens: 4254423,
    latency: 210,
    todayOutputs: 0,
    todayCompletedTasks: 0,
    totalCompletedTasks: 28,
    successRate: 98.2,
    alertCount: 0,
    currentTaskProgress: 0,
    currentTaskStartTime: '-',
    description: '专注需求澄清、方案设计、PRD产出，善于从业务角度推进项目',
    createdAt: '2024-01-20',
    recentAlerts: [
      { time: '昨天 18:00', desc: '完成PRD选型评审', level: 'info' }
    ],
    history: [
      { desc: '驾驶舱PRD审查', status: 'completed', time: '昨天 17:00', tokens: 980000 },
      { desc: '需求澄清与方案设计', status: 'completed', time: '昨天 15:00', tokens: 1200000 },
      { desc: '数据对照清单评审', status: 'completed', time: '昨天 13:00', tokens: 680000 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: '驾驶舱设计简报', time: '昨天 17:30', type: '产品文档' },
    ]
  },
  {
    id: 'nami_chanpinjiaohushejishi',
    name: 'UX Design Agent',
    avatar: '🎨',
    role: 'UI/UX设计师',
    status: 'online',
    state: 'working',
    currentTask: '正在设计驾驶舱移动端适配方案，已完成60%',
    lastOutput: '完成了5个关键页面的交互原型，驾驶舱UI规范已输出',
    schedule: true,
    todayTasks: 0,
    todayTokens: 0,
    totalTokens: 1667388,
    latency: 195,
    todayOutputs: 0,
    todayCompletedTasks: 0,
    totalCompletedTasks: 15,
    successRate: 95.8,
    alertCount: 0,
    currentTaskProgress: 60,
    currentTaskStartTime: '08:00',
    description: '专业UI/UX设计师，关注用户体验与视觉设计，用HTML做高保真原型',
    createdAt: '2024-02-01',
    recentAlerts: [],
    history: [
      { desc: '驾驶舱界面高保真原型', status: 'running', time: '08:00', tokens: 850000 },
      { desc: '交互规范文档', status: 'completed', time: '昨天 17:00', tokens: 560000 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: '驾驶舱交互原型HTML', time: '09:30', type: '原型文件' },
    ]
  },
  {
    id: 'nami_xiangmuguanlicaopanshou',
    name: '泊客 (Block)',
    avatar: '⚓',
    role: '项目操盘手',
    status: 'online',
    state: 'alert',
    currentTask: '协调驾驶舱项目各模块进度，跟进后端API联调',
    lastOutput: '梳理了mock数据与真实数据的对照清单，共8大类',
    schedule: true,
    todayTasks: 0,
    todayTokens: 0,
    totalTokens: 2325041,
    latency: 185,
    todayOutputs: 0,
    todayCompletedTasks: 0,
    totalCompletedTasks: 19,
    successRate: 93.2,
    alertCount: 2,
    currentTaskProgress: 45,
    currentTaskStartTime: '10:15',
    description: 'ToB互联网项目操盘手，负责多智能体协同与项目里程碑管理',
    createdAt: '2024-01-10',
    recentAlerts: [
      { time: '10:20', desc: '后端数据路径需要修正', level: 'warning' },
      { time: '09:45', desc: 'mock数据数量级与真实不符', level: 'warning' }
    ],
    history: [
      { desc: '数据对照清单整理', status: 'running', time: '10:15', tokens: 680000 },
      { desc: '后端API层规划', status: 'completed', time: '09:00', tokens: 920000 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: 'DATA_SOURCES.md 数据源文档', time: '09:15', type: '技术文档' },
    ]
  },
  {
    id: 'nami_qa_engineer',
    name: '测试总控工程师',
    avatar: '🔬',
    role: 'AI测试工程智能体',
    status: 'online',
    state: 'idle',
    currentTask: '待命中',
    lastOutput: '完成驾驶舱前端构建验证，11个页面全部通过',
    schedule: false,
    todayTasks: 0,
    todayTokens: 0,
    totalTokens: 0,
    latency: 230,
    todayOutputs: 0,
    todayCompletedTasks: 0,
    totalCompletedTasks: 5,
    successRate: 97.8,
    alertCount: 0,
    currentTaskProgress: 0,
    currentTaskStartTime: '-',
    description: '负责测试规划、自动化测试执行与质量把关',
    createdAt: '2024-02-10',
    recentAlerts: [],
    history: [
      { desc: 'npm run build 全量验证', status: 'completed', time: '昨天 10:00', tokens: 0 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: '构建验证报告（11页面通过）', time: '昨天 10:15', type: '测试报告' },
    ]
  },
  {
    id: 'nami-fullstack-engineer',
    name: 'FullStack Builder',
    avatar: '🚀',
    role: 'Web/SaaS交付搭档',
    status: 'online',
    state: 'idle',
    currentTask: '待命中',
    lastOutput: '协助完成驾驶舱前端页面开发与样式优化',
    schedule: true,
    todayTasks: 0,
    todayTokens: 0,
    totalTokens: 0,
    latency: 175,
    todayOutputs: 0,
    todayCompletedTasks: 0,
    totalCompletedTasks: 8,
    successRate: 99.1,
    alertCount: 0,
    currentTaskProgress: 0,
    currentTaskStartTime: '-',
    description: '全栈交付搭档，负责前后端完整交付',
    createdAt: '2024-01-25',
    recentAlerts: [],
    history: [
      { desc: '驾驶舱前端页面开发', status: 'completed', time: '昨天 14:00', tokens: 0 },
    ],
    tokenTrend: generateAgentTokenTrend(),
    outputs: [
      { desc: '驾驶舱前端工程', time: '昨天 14:30', type: '代码工程' },
    ]
  }
]

// 核心指标（数量级与真实数据对齐：tokens~670万/天，累计~4800万，tasks~74轮/天）
export const mockMetrics: Metrics = {
  activeAgents: 4,
  tasks: 74,
  successRate: 96.5,
  latency: 245,
  tokens: 6728525,
  cost: 20.19,
  alerts: 1
}

// 生成趋势数据（最近30天）—— 数量级与真实数据对齐（tokens/天 ~300万~4000万，tasks/天 ~5~62）
const generateTrendData = (baseValue: number, variance: number): TrendData[] => {
  const data: TrendData[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    const randomVariance = (Math.random() - 0.5) * variance
    const value = Math.round(baseValue + randomVariance)

    data.push({
      date: dateStr,
      value: value > 0 ? value : 0,
      value2: Math.round(value * (0.8 + Math.random() * 0.4))
    })
  }

  return data
}

// Token消耗趋势（30天，基准~500万/天，与真实量级一致）
export const tokenTrend = generateTrendData(5000000, 3000000)

// 任务量趋势（30天，基准~40轮/天）
export const taskTrend = generateTrendData(40, 30)

// 响应时间趋势（ms）
export const latencyTrend = generateTrendData(245, 60)

// 今日Token消耗趋势（24小时，总量约670万，每小时平均约28万）
export const todayTokenTrend: TrendData[] = Array.from({ length: 24 }, (_, i) => ({
  date: `${i}:00`,
  value: Math.round(150000 + Math.random() * 350000),
  value2: Math.round(100000 + Math.random() * 250000)
}))

// 累计Token消耗趋势（30天，使用真实日期格式 M/D，呈上升趋势，累计约4800万）
export const cumulativeTokenTrend: TrendData[] = Array.from({ length: 30 }, (_, i) => {
  const today = new Date()
  const date = new Date(today)
  date.setDate(date.getDate() - (29 - i))
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
  const baseValue = 5000000 + i * 1400000
  return {
    date: dateStr,
    value: Math.round(baseValue + Math.random() * 2000000),
    value2: Math.round(baseValue * 0.85 + Math.random() * 1500000)
  }
})

// 今日任务量趋势（24小时，总量约74轮）
export const todayTaskTrend: TrendData[] = Array.from({ length: 24 }, (_, i) => ({
  date: `${i}:00`,
  value: Math.round(2 + Math.random() * 8),
  value2: Math.round(1 + Math.random() * 6)
}))

// 累计任务量趋势（30天，使用真实日期格式 M/D）
export const cumulativeTaskTrend: TrendData[] = Array.from({ length: 30 }, (_, i) => {
  const today = new Date()
  const date = new Date(today)
  date.setDate(date.getDate() - (29 - i))
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
  const baseValue = 20 + i * 8
  return {
    date: dateStr,
    value: Math.round(baseValue + Math.random() * 20),
    value2: Math.round(baseValue * 0.9 + Math.random() * 15)
  }
})

// 告警列表
export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    level: 'error',
    message: '泊客(Block)检测到API数据解析异常',
    time: '2分钟前',
    agentId: 'nami_xiangmuguanlicaopanshou'
  },
  {
    id: 'alert-002',
    level: 'warning',
    message: '测试总控工程师发现构建验证超时',
    time: '15分钟前',
    agentId: 'nami_qa_engineer'
  },
  {
    id: 'alert-003',
    level: 'info',
    message: 'Claude开发专家完成了后端API层构建',
    time: '1小时前',
    agentId: 'nami_claudequanzhankaifazhuanjia'
  },
  {
    id: 'alert-004',
    level: 'warning',
    message: 'Token使用量已达本月配额的80%',
    time: '3小时前'
  },
  {
    id: 'alert-005',
    level: 'info',
    message: '系统自动备份已完成',
    time: '5小时前'
  },
  {
    id: 'alert-006',
    level: 'info',
    message: 'Alex完成驾驶舱PRD选型评审',
    time: '6小时前',
    agentId: 'nami_chanpinjingli'
  }
]

// 任务队列
export const mockTasks: Task[] = [
  {
    id: 'task-001',
    name: '生成周报数据分析',
    status: 'running',
    agentId: 'nami_chanpinjingli',
    agentName: 'Alex',
    progress: 75,
    startTime: '10:25',
    estimatedTime: '5分钟'
  },
  {
    id: 'task-002',
    name: '优化首页加载性能',
    status: 'running',
    agentId: 'nami_claudequanzhankaifazhuanjia',
    agentName: 'Claude开发专家',
    progress: 60,
    startTime: '10:15',
    estimatedTime: '12分钟'
  },
  {
    id: 'task-003',
    name: '设计移动端适配方案',
    status: 'waiting',
    agentId: 'nami_chanpinjiaohushejishi',
    agentName: 'UX Design Agent',
    progress: 0,
    startTime: '10:40'
  },
  {
    id: 'task-004',
    name: '更新API文档',
    status: 'waiting',
    agentId: 'nami_qa_engineer',
    agentName: '测试总控工程师',
    progress: 0,
    startTime: '11:00'
  },
  {
    id: 'task-005',
    name: '数据库性能测试',
    status: 'waiting',
    agentId: 'nami_xiangmuguanlicaopanshou',
    agentName: '泊客 (Block)',
    progress: 0,
    startTime: '11:30'
  },
  {
    id: 'task-006',
    name: '安全漏洞扫描',
    status: 'waiting',
    agentId: 'nami-fullstack-engineer',
    agentName: 'FullStack Builder',
    progress: 0,
    startTime: '12:00'
  }
]

// Cron定时任务
export const mockCronJobs: CronJob[] = [
  {
    id: 'cron-001',
    name: '每日数据备份',
    schedule: '0 2 * * *',
    nextRun: '明天 02:00',
    status: 'active',
    lastRun: '今天 02:00'
  },
  {
    id: 'cron-002',
    name: '用户行为分析',
    schedule: '0 */6 * * *',
    nextRun: '今天 16:00',
    status: 'active',
    lastRun: '今天 10:00'
  },
  {
    id: 'cron-003',
    name: '系统健康检查',
    schedule: '*/30 * * * *',
    nextRun: '10分钟后',
    status: 'active',
    lastRun: '20分钟前'
  },
  {
    id: 'cron-004',
    name: '周报自动生成',
    schedule: '0 9 * * 1',
    nextRun: '下周一 09:00',
    status: 'paused',
    lastRun: '本周一 09:00'
  },
  {
    id: 'cron-005',
    name: '日志清理任务',
    schedule: '0 3 * * 0',
    nextRun: '下周日 03:00',
    status: 'active',
    lastRun: '本周日 03:00'
  },
  {
    id: 'cron-006',
    name: '性能报告生成',
    schedule: '0 8 1 * *',
    nextRun: '下月1日 08:00',
    status: 'active',
    lastRun: '本月1日 08:00'
  }
]

// 环形图数据 - 实时任务（总数74，成功率~96.5%）
export const taskStatusData: DonutDataItem[] = [
  { name: '成功', value: 68, color: '#22C55E' },
  { name: '失败', value: 3, color: '#EF4444' },
  { name: '进行中', value: 3, color: '#3B82F6' }
]

// 环形图数据 - 队列分布（对应4个活跃agent）
export const queueDistribution: DonutDataItem[] = [
  { name: '运行中', value: 1, color: '#3B82F6' },
  { name: '等待', value: 2, color: '#F59E0B' },
  { name: '空闲', value: 1, color: '#22C55E' },
  { name: '异常', value: 0, color: '#EF4444' }
]

// 环形图数据 - 模型占比
export const modelDistribution: DonutDataItem[] = [
  { name: 'Coding模型', value: 45, color: '#3B82F6' },
  { name: 'Ultra模型', value: 30, color: '#6366F1' },
  { name: 'Kimi模型', value: 18, color: '#8B5CF6' },
  { name: '其他', value: 7, color: '#A78BFA' }
]

// 记忆文件列表
export const mockMemoryFiles: MemoryFile[] = [
  {
    id: 'mem-001',
    name: '用户认证流程.md',
    category: '技术文档',
    size: '12KB',
    updatedAt: '2小时前',
    content: '# 用户认证流程\n\n## OAuth 2.0 认证\n...'
  },
  {
    id: 'mem-002',
    name: '数据库设计规范.md',
    category: '技术文档',
    size: '8KB',
    updatedAt: '1天前',
    content: '# 数据库设计规范\n\n## 命名规则\n...'
  },
  {
    id: 'mem-003',
    name: '本周工作总结.md',
    category: '工作记录',
    size: '6KB',
    updatedAt: '3天前'
  },
  {
    id: 'mem-004',
    name: 'API接口文档.md',
    category: '技术文档',
    size: '25KB',
    updatedAt: '5天前'
  },
  {
    id: 'mem-005',
    name: '性能优化建议.md',
    category: '技术方案',
    size: '15KB',
    updatedAt: '1周前'
  }
]

// 计算较昨日变化
export const getYesterdayChange = (current: number, max: number = 100): { value: number; isUp: boolean } => {
  const change = (Math.random() * 10 - 3).toFixed(1)
  const numChange = parseFloat(change)
  return {
    value: Math.abs(numChange),
    isUp: numChange > 0
  }
}
