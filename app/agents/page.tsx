'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { Activity, Cpu, AlertTriangle, Clock, FileText, CheckCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactECharts from 'echarts-for-react'
import { useSearchParams } from 'next/navigation'
import { useAgents } from '@/lib/use-dashboard-data'
import { AgentAvatar } from '@/components/agent/AgentAvatar'

// Inline MiniSparkArea component for metric cards
interface MiniSparkAreaProps {
  data: number[]
  color: string
}

function MiniSparkArea({ data, color }: MiniSparkAreaProps) {
  const width = 100
  const height = 40
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Create points for the line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * (height - padding * 2) - padding
    return { x, y }
  })

  // Create path for line
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Create path for area (add bottom corners)
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#gradient-${color})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function AgentsPageContent() {
  const searchParams = useSearchParams()
  const urlAgentId = searchParams.get('id')
  const { agents } = useAgents()
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')
  const [tokenPeriod, setTokenPeriod] = useState<'7days' | '30days'>('7days')
  const agent = agents.find(a => a.id === selectedAgentId)

  useEffect(() => {
    if (urlAgentId && agents.find(a => a.id === urlAgentId)) {
      setSelectedAgentId(urlAgentId)
    } else if (!selectedAgentId && agents.length > 0) {
      // 默认选中第一个
      setSelectedAgentId(agents[0].id)
    }
  }, [urlAgentId, agents, selectedAgentId])

  // Generate stable mock historical data for each metric based on current values
  // 用 seeded 伪随机替代 Math.random()，保证同一 value 产出相同数据，避免 hydration 闪烁
  const generateHistoricalData = useCallback(
    (currentValue: number, days: number = 7): number[] => {
      const data: number[] = []
      const baseValue = currentValue * 0.85
      const variation = currentValue * 0.15
      // 简单线性同余伪随机，seed 基于 currentValue
      let seed = Math.round(currentValue * 100) || 1
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) & 0x7fffffff
        return seed / 0x7fffffff
      }

      for (let i = 0; i < days; i++) {
        const trend = (i / days) * variation
        const randomFluctuation = (rand() - 0.5) * variation * 0.3
        data.push(baseValue + trend + randomFluctuation)
      }
      return data
    },
    []
  )

  // agent 未加载时的守卫（所有 hooks 都已调用完毕，可以安全 early return）
  if (!agent) {
    return (
      <div className="space-y-5 pt-[15px]">
        <div className="bg-card border border-custom rounded-xl p-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {agents.length === 0 && (
              <div className="text-secondary text-sm py-2 px-4">加载中...</div>
            )}
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentId(a.id)}
                className="flex flex-col items-center gap-2 px-5 py-3 rounded-xl border border-custom hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all min-w-[96px] flex-shrink-0"
              >
                <AgentAvatar avatar={a.avatar} name={a.name} size="md" />
                <span className="text-xs font-medium text-primary text-center leading-tight">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-secondary text-sm">
          正在加载智能体数据...
        </div>
      </div>
    )
  }

  // 以下代码 agent 已确保非空
  const getStateColor = (state: typeof agent.state) => {
    switch (state) {
      case 'working': return 'bg-blue-500'
      case 'alert': return 'bg-red-500'
      default: return 'bg-green-500'
    }
  }

  const getStateLabel = (state: typeof agent.state) => {
    switch (state) {
      case 'working': return '工作中'
      case 'alert': return '异常'
      default: return '空闲'
    }
  }

  const getStatusText = (status: typeof agent.status) =>
    status === 'online' ? '在线' : '离线'

  // Sparkline data and changes for metric cards
  const metricsData = [
    {
      label: '今日完成任务',
      value: `${agent.todayCompletedTasks ?? 0}`,
      unit: '个',
      icon: CheckCircle,
      color: 'text-blue-500',
      colorHex: '#3B82F6',
      sparkData: generateHistoricalData(agent.todayCompletedTasks ?? 0),
      change: 8.3,
      isGoodUp: true
    },
    {
      label: '累计完成任务',
      value: `${agent.totalCompletedTasks ?? 0}`,
      unit: '个',
      icon: TrendingUp,
      color: 'text-indigo-500',
      colorHex: '#6366F1',
      sparkData: generateHistoricalData(agent.totalCompletedTasks ?? 0),
      change: 0.6,
      isGoodUp: true
    },
    {
      label: '今日Token消耗',
      value: `${((agent.todayTokens ?? 0) / 1000).toFixed(1)}K`,
      unit: '',
      icon: Cpu,
      color: 'text-purple-500',
      colorHex: '#A855F7',
      sparkData: generateHistoricalData((agent.todayTokens ?? 0) / 1000),
      change: 6.8,
      isGoodUp: true
    },
    {
      label: '累计Token消耗',
      value: `${((agent.totalTokens ?? 0) / 1000000).toFixed(2)}M`,
      unit: '',
      icon: Cpu,
      color: 'text-violet-500',
      colorHex: '#8B5CF6',
      sparkData: generateHistoricalData((agent.totalTokens ?? 0) / 1000000),
      change: 1.8,
      isGoodUp: true
    },
    {
      label: '今日产物数',
      value: `${agent.todayOutputs ?? 0}`,
      unit: '个',
      icon: FileText,
      color: 'text-emerald-500',
      colorHex: '#10B981',
      sparkData: generateHistoricalData(agent.todayOutputs ?? 0),
      change: 15.4,
      isGoodUp: true
    },
    {
      label: '响应时间',
      value: `${agent.latency}`,
      unit: 'ms',
      icon: Clock,
      color: 'text-amber-500',
      colorHex: '#F59E0B',
      sparkData: generateHistoricalData(agent.latency ?? 180).reverse(), // Reverse for decreasing trend
      change: -1.1,
      isGoodUp: false // Lower is better for latency
    },
    {
      label: '成功率',
      value: `${agent.successRate ?? 0}`,
      unit: '%',
      icon: Activity,
      color: 'text-green-500',
      colorHex: '#22C55E',
      sparkData: generateHistoricalData(agent.successRate ?? 96),
      change: 0.1,
      isGoodUp: true
    },
    {
      label: '系统告警',
      value: `${agent.alertCount ?? 0}`,
      unit: '条',
      icon: AlertTriangle,
      color: 'text-red-500',
      colorHex: '#EF4444',
      sparkData: generateHistoricalData(agent.alertCount ?? 1),
      change: -50,
      isGoodUp: false // Lower is better for alerts
    }
  ]

  // Token trend data
  const tokenTrend7Days = {
    dates: ['04/24', '04/25', '04/26', '04/27', '04/28', '04/29', '04/30'],
    tokens: [98000, 110000, 115000, 108000, 120000, 118000, 126000],
    requests: [450, 510, 530, 490, 560, 545, 580]
  }

  const tokenTrend30Days = {
    dates: ['03/31', '04/01', '04/02', '04/03', '04/04', '04/05', '04/06', '04/07', '04/08', '04/09',
            '04/10', '04/11', '04/12', '04/13', '04/14', '04/15', '04/16', '04/17', '04/18', '04/19',
            '04/20', '04/21', '04/22', '04/23', '04/24', '04/25', '04/26', '04/27', '04/28', '04/29', '04/30'],
    tokens: [85000, 88000, 90000, 87000, 92000, 95000, 91000, 94000, 96000, 99000,
             101000, 98000, 102000, 105000, 103000, 107000, 110000, 108000, 112000, 115000,
             113000, 118000, 120000, 117000, 98000, 110000, 115000, 108000, 120000, 118000, 126000],
    requests: [420, 435, 445, 430, 455, 470, 450, 465, 475, 490,
               500, 485, 505, 520, 510, 530, 545, 535, 555, 570,
               560, 585, 595, 580, 450, 510, 530, 490, 560, 545, 580]
  }

  const currentTrendData = tokenPeriod === '7days' ? tokenTrend7Days : tokenTrend30Days

  const getTokenTrendOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: false,
        zoomLock: false
      }
    ],
    xAxis: {
      type: 'category',
      data: currentTrendData.dates,
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280' }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Token消耗',
        scale: true,
        nameTextStyle: { color: '#6B7280' },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisLabel: {
          color: '#6B7280',
          formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
        },
        splitLine: { lineStyle: { color: '#E5E7EB', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '请求数',
        scale: true,
        nameTextStyle: { color: '#6B7280' },
        axisLine: { lineStyle: { color: '#E5E7EB' } },
        axisLabel: { color: '#6B7280' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Token消耗',
        type: 'bar',
        barMaxWidth: 20,
        data: currentTrendData.tokens,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#60A5FA' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '请求数',
        type: 'line',
        yAxisIndex: 1,
        data: currentTrendData.requests,
        smooth: true,
        lineStyle: { width: 3, color: '#22C55E' },
        itemStyle: { color: '#22C55E' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(34, 197, 94, 0.15)' },
              { offset: 1, color: 'rgba(34, 197, 94, 0)' }
            ]
          }
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  })

  return (
    <div className="space-y-5 pt-[15px]">
      {/* ── TOP: 横排所有 Agent 小卡片 ── */}
      <div className="bg-card border border-custom rounded-xl p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAgentId(a.id)}
              className={cn(
                'flex flex-col items-center gap-2 px-5 py-3 rounded-xl border transition-all min-w-[96px] flex-shrink-0',
                selectedAgentId === a.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent hover:border-custom hover:bg-main'
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <AgentAvatar avatar={a.avatar} name={a.name} size="md" />
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                  getStateColor(a.state),
                  a.state === 'working' && 'animate-pulse'
                )} />
              </div>
              {/* 名称 */}
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                selectedAgentId === a.id ? 'text-blue-600 dark:text-blue-400' : 'text-secondary'
              )}>{a.name}</span>
              {/* 状态标签 */}
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                a.state === 'working' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                a.state === 'alert' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                a.state === 'idle' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              )}>
                {getStateLabel(a.state)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── DETAIL AREA ── */}
      {/* ② 核心指标（2行 × 4列） */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metricsData.map(({ label, value, unit, icon: Icon, color, colorHex, sparkData, change, isGoodUp }) => {
          const isPositive = change > 0
          const shouldShowGreen = isGoodUp ? isPositive : !isPositive
          const changeColor = shouldShowGreen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          const arrow = isPositive ? '↑' : '↓'

          return (
            <div key={label} className="bg-card border border-custom rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', color)} />
                  <span className="text-xs text-tertiary">{label}</span>
                </div>
                <div className={cn('text-xs font-medium', changeColor)}>
                  {arrow}{Math.abs(change)}%
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-primary">{value}</span>
                {unit && <span className="text-xs text-tertiary">{unit}</span>}
              </div>
              <div style={{ height: '40px' }}>
                <MiniSparkArea data={sparkData} color={colorHex} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Token 趋势图 */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-primary flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            Token 趋势
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTokenPeriod('7days')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tokenPeriod === '7days'
                  ? 'bg-blue-500 text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              最近7天
            </button>
            <button
              onClick={() => setTokenPeriod('30days')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                tokenPeriod === '30days'
                  ? 'bg-blue-500 text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              最近30天
            </button>
          </div>
        </div>
        <div style={{ height: '260px' }}>
          <ReactECharts
            option={getTokenTrendOption()}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>

      {/* ③ 当前任务 & ④ 异常信息 (side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ③ 当前任务 */}
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            当前任务
          </h3>
          <div className="p-4 rounded-lg bg-main">
            <p className="text-primary font-medium mb-3">{agent.currentTask}</p>
            {agent.currentTaskProgress !== undefined && agent.currentTaskProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">进度</span>
                  <span className="text-primary font-semibold">{agent.currentTaskProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${agent.currentTaskProgress}%` }}
                  />
                </div>
                {agent.currentTaskStartTime && (
                  <p className="text-xs text-tertiary">开始时间：{agent.currentTaskStartTime}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ④ 异常信息 */}
        {agent.recentAlerts && agent.recentAlerts.length > 0 && (
          <div className="bg-card border border-custom rounded-xl p-6">
            <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              异常信息
            </h3>
            <div className="space-y-2">
              {agent.recentAlerts.slice(0, 3).map((alert, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'px-3 py-2.5 rounded-lg border text-sm flex items-start justify-between gap-3',
                    alert.level === 'error' && 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
                    alert.level === 'warning' && 'border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300',
                    alert.level === 'info' && 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
                  )}
                >
                  <p className="flex-1">{alert.desc}</p>
                  <span className="text-xs opacity-70 whitespace-nowrap flex-shrink-0">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ⑤ 执行历史表格 */}
      {agent.history && agent.history.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" />
            执行历史
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-custom">
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-tertiary uppercase tracking-wider">任务描述</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-tertiary uppercase tracking-wider">状态</th>
                  <th className="text-left py-2.5 px-3 text-xs font-semibold text-tertiary uppercase tracking-wider">时间</th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-tertiary uppercase tracking-wider">Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-custom">
                {agent.history.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="hover:bg-main transition-colors">
                    <td className="py-3 px-3 text-sm text-primary">{item.desc}</td>
                    <td className="py-3 px-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        item.status === 'completed' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                        item.status === 'failed' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                        item.status === 'running' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      )}>
                        {item.status === 'completed' && '已完成'}
                        {item.status === 'failed' && '失败'}
                        {item.status === 'running' && '进行中'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-tertiary whitespace-nowrap">{item.time}</td>
                    <td className="py-3 px-3 text-sm text-secondary text-right font-mono">{(item.tokens / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⑦ 产出记录 */}
      {agent.outputs && agent.outputs.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            产出记录
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agent.outputs.map((output, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-main border border-custom hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-primary font-medium text-sm flex-1 leading-snug">{output.desc}</p>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {output.type}
                  </span>
                </div>
                <p className="text-xs text-tertiary">{output.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="space-y-5 pt-[15px]">Loading...</div>}>
      <AgentsPageContent />
    </Suspense>
  )
}
