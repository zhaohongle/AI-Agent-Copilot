export type Locale = 'zh' | 'en'

export const translations = {
  zh: {
    // Navigation
    nav: {
      overview: '总览',
      usage: '资源用量',
      agents: '龙虾员工',
      memory: '记忆',
      docs: '文档',
      tasks: '任务',
      settings: '设置'
    },
    // Overview page
    overview: {
      title: '总览',
      subtitle: '实时监控龙虾员工的工作状态和系统运行情况',
      activeAgents: '活跃智能体',
      completedTasks: '完成任务',
      successRate: '任务成功率',
      latency: '响应时间',
      tokenConsumption: 'Token消耗',
      todayCost: '今日成本',
      systemAlerts: '系统告警',
      tokenTrend: 'Token消耗',
      taskVolume: '任务量',
      responseTime: '响应时间',
      today: '今日',
      cumulative: '累计',
      realTimeTasks: '实时任务',
      queueDistribution: '队列分布',
      modelDistribution: '模型占比',
      agentStaff: '龙虾员工',
      viewAll: '查看全部',
      taskManagement: '任务管理',
      taskName: '任务名称',
      assignedAgent: '负责龙虾',
      status: '状态',
      progress: '进度',
      startTime: '开始时间'
    },
    // Agent states
    agentState: {
      online: '在线',
      offline: '离线',
      working: '工作中',
      idle: '空闲',
      alert: '告警'
    },
    // Task states
    taskStatus: {
      running: '运行中',
      waiting: '等待中',
      completed: '已完成',
      failed: '失败'
    },
    // Agent card
    agentCard: {
      currentTask: '当前任务',
      recentOutput: '最近产出',
      todayTasks: '今日任务',
      todayToken: '今日Token',
      totalToken: '总Token',
      responseSpeed: '响应速度',
      todayOutputs: '今日产出',
      viewDetail: '查看详情'
    },
    // Right panel
    rightPanel: {
      alertCenter: '告警中心',
      taskQueue: '任务队列',
      scheduledTasks: '定时任务',
      viewMore: '查看更多',
      nextRun: '下次执行',
      active: '运行中',
      paused: '已暂停'
    },
    // Agent detail
    agentDetail: {
      backToList: '返回列表',
      basicInfo: '基本信息',
      coreMetrics: '核心指标',
      todayCompleted: '今日完成任务',
      totalCompleted: '累计完成任务',
      todayTokens: '今日Token消耗',
      totalTokens: '累计Token消耗',
      todayOutputs: '今日产物数',
      latency: '响应时间',
      successRate: '成功率',
      alertCount: '系统告警数',
      currentTask: '当前任务',
      exceptionInfo: '异常信息',
      executionHistory: '执行历史',
      tokenTrend: 'Token趋势',
      outputRecords: '产出记录',
      taskDesc: '任务描述',
      time: '时间',
      tokens: 'Token',
      type: '类型',
      description: '描述',
      level: '级别',
      createdAt: '创建时间',
      role: '职责'
    },
    // Common
    common: {
      unit: {
        count: '个',
        percent: '%',
        ms: 'ms',
        yuan: '元',
        items: '条',
        k: 'K',
        m: 'M'
      }
    }
  },
  en: {
    // Navigation
    nav: {
      overview: 'Overview',
      usage: 'Usage',
      agents: 'Agents',
      memory: 'Memory',
      docs: 'Docs',
      tasks: 'Tasks',
      settings: 'Settings'
    },
    // Overview page
    overview: {
      title: 'Overview',
      subtitle: 'Real-time monitoring of agent work status and system operations',
      activeAgents: 'Active Agents',
      completedTasks: 'Completed Tasks',
      successRate: 'Task Success Rate',
      latency: 'Latency',
      tokenConsumption: 'Token Usage',
      todayCost: 'Today Cost',
      systemAlerts: 'Alerts',
      tokenTrend: 'Token Usage',
      taskVolume: 'Task Volume',
      responseTime: 'Response Time',
      today: 'Today',
      cumulative: 'Cumulative',
      realTimeTasks: 'Real-time Tasks',
      queueDistribution: 'Queue Distribution',
      modelDistribution: 'Model Distribution',
      agentStaff: 'Agent Staff',
      viewAll: 'View All',
      taskManagement: 'Task Management',
      taskName: 'Task Name',
      assignedAgent: 'Assigned Agent',
      status: 'Status',
      progress: 'Progress',
      startTime: 'Start Time'
    },
    // Agent states
    agentState: {
      online: 'Online',
      offline: 'Offline',
      working: 'Working',
      idle: 'Idle',
      alert: 'Alert'
    },
    // Task states
    taskStatus: {
      running: 'Running',
      waiting: 'Waiting',
      completed: 'Completed',
      failed: 'Failed'
    },
    // Agent card
    agentCard: {
      currentTask: 'Current Task',
      recentOutput: 'Recent Output',
      todayTasks: 'Today Tasks',
      todayToken: 'Today Token',
      totalToken: 'Total Token',
      responseSpeed: 'Latency',
      todayOutputs: 'Today Outputs',
      viewDetail: 'View Detail'
    },
    // Right panel
    rightPanel: {
      alertCenter: 'Alert Center',
      taskQueue: 'Task Queue',
      scheduledTasks: 'Scheduled Tasks',
      viewMore: 'View More',
      nextRun: 'Next Run',
      active: 'Active',
      paused: 'Paused'
    },
    // Agent detail
    agentDetail: {
      backToList: 'Back to List',
      basicInfo: 'Basic Info',
      coreMetrics: 'Core Metrics',
      todayCompleted: 'Today Completed',
      totalCompleted: 'Total Completed',
      todayTokens: 'Today Tokens',
      totalTokens: 'Total Tokens',
      todayOutputs: 'Today Outputs',
      latency: 'Latency',
      successRate: 'Success Rate',
      alertCount: 'Alert Count',
      currentTask: 'Current Task',
      exceptionInfo: 'Exceptions',
      executionHistory: 'Execution History',
      tokenTrend: 'Token Trend',
      outputRecords: 'Output Records',
      taskDesc: 'Task',
      time: 'Time',
      tokens: 'Tokens',
      type: 'Type',
      description: 'Description',
      level: 'Level',
      createdAt: 'Created',
      role: 'Role'
    },
    // Common
    common: {
      unit: {
        count: '',
        percent: '%',
        ms: 'ms',
        yuan: '¥',
        items: '',
        k: 'K',
        m: 'M'
      }
    }
  }
}

export function useI18n(locale: Locale = 'zh') {
  return translations[locale]
}
