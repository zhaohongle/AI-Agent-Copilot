'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Users, CheckCircle, TrendingUp, Zap, DollarSign, AlertTriangle, Cpu, MessageSquare } from 'lucide-react'
import { MetricCard } from '@/components/cards/MetricCard'
import { AgentCard } from '@/components/agent/AgentCard'

// 图表组件延迟加载（跳过 SSR），避免 ECharts 阻塞服务端渲染
const TrendChart = dynamic(() => import('@/components/charts/TrendChart').then(m => ({ default: m.TrendChart })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">加载图表中…</div>,
})
const DonutChart = dynamic(() => import('@/components/charts/DonutChart').then(m => ({ default: m.DonutChart })), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">加载图表中…</div>,
})
import {
  latencyTrend,
  cumulativeTokenTrend,
  cumulativeTaskTrend,
  taskStatusData,
  queueDistribution,
  modelDistribution,
  getYesterdayChange,
} from '@/lib/mock-data'
import { useMetrics, useAgents, useTasks, useTrends } from '@/lib/use-dashboard-data'
import { cn } from '@/lib/utils'
import { useLocaleStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

export default function OverviewPage() {
  const [trendTab, setTrendTab] = useState<'token' | 'task' | 'latency'>('token')
  const [periodTab, setPeriodTab] = useState<'today' | 'cumulative'>('today')
  const { locale } = useLocaleStore()
  const t = useI18n(locale)

  // 使用真实数据或 mock 数据
  const { metrics } = useMetrics()
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const { trends: tokenTrend30days } = useTrends('token', '30days')
  const { trends: tokenTrendToday } = useTrends('token', 'today')
  const { trends: taskTrend30days } = useTrends('task', '30days')
  const { trends: taskTrendToday } = useTrends('task', 'today')

  const getTrendData = () => {
    if (trendTab === 'latency') {
      return { data: latencyTrend, title: '', yAxis: t.overview.responseTime + '(ms)', yAxis2: 'P95' + t.overview.latency + '(ms)' }
    }

    if (trendTab === 'token') {
      if (periodTab === 'today') {
        return { data: tokenTrendToday, title: '', yAxis: 'Token' + t.common.unit.count, yAxis2: locale === 'zh' ? '请求数' : 'Requests' }
      } else {
        return { data: cumulativeTokenTrend, title: '', yAxis: 'Token' + t.common.unit.count, yAxis2: locale === 'zh' ? '请求数' : 'Requests' }
      }
    }

    if (trendTab === 'task') {
      if (periodTab === 'today') {
        return { data: taskTrendToday, title: '', yAxis: locale === 'zh' ? '任务数' : 'Tasks', yAxis2: locale === 'zh' ? '完成数' : 'Completed' }
      } else {
        return { data: cumulativeTaskTrend, title: '', yAxis: locale === 'zh' ? '任务数' : 'Tasks', yAxis2: locale === 'zh' ? '完成数' : 'Completed' }
      }
    }

    return { data: tokenTrend30days, title: '', yAxis: 'Token' + t.common.unit.count, yAxis2: locale === 'zh' ? '请求数' : 'Requests' }
  }

  const trendData = getTrendData()

  return (
    <div className="space-y-6 pt-[15px]">
      {/* ① Top指标卡片（7个） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={MessageSquare}
          title={locale === 'zh' ? '活跃会话' : 'Active Sessions'}
          value={agents.filter(a => a.status === 'online').reduce((sum, a) => sum + Math.floor(Math.random() * 5 + 1), 0)}
          unit={locale === 'zh' ? '个' : ''}
          change={getYesterdayChange(18).value}
          isUp={getYesterdayChange(18).isUp}
          sparklineData={tokenTrend30days.slice(-7)}
          color="#10B981"
        />
        <MetricCard
          icon={Users}
          title={t.overview.activeAgents}
          value={metrics.activeAgents}
          unit={t.common.unit.count}
          change={getYesterdayChange(metrics.activeAgents).value}
          isUp={getYesterdayChange(metrics.activeAgents).isUp}
          sparklineData={tokenTrend30days.slice(-7)}
          color="#3B82F6"
        />
        <MetricCard
          icon={CheckCircle}
          title={t.overview.completedTasks}
          value={metrics.tasks}
          unit={t.common.unit.count}
          change={getYesterdayChange(metrics.tasks).value}
          isUp={getYesterdayChange(metrics.tasks).isUp}
          sparklineData={taskTrend30days.slice(-7)}
          color="#22C55E"
        />
        <MetricCard
          icon={TrendingUp}
          title={t.overview.successRate}
          value={metrics.successRate}
          unit={t.common.unit.percent}
          change={getYesterdayChange(metrics.successRate).value}
          isUp={getYesterdayChange(metrics.successRate).isUp}
          sparklineData={latencyTrend.slice(-7)}
          color="#6366F1"
          decimals={1}
        />
        <MetricCard
          icon={Zap}
          title={t.overview.latency}
          value={metrics.latency}
          unit={t.common.unit.ms}
          change={getYesterdayChange(metrics.latency).value}
          isUp={false}
          sparklineData={latencyTrend.slice(-7)}
          color="#F59E0B"
        />
        <MetricCard
          icon={Cpu}
          title={t.overview.tokenConsumption}
          value={Math.round(metrics.tokens / 1000)}
          unit={t.common.unit.k}
          change={getYesterdayChange(metrics.tokens).value}
          isUp={getYesterdayChange(metrics.tokens).isUp}
          sparklineData={tokenTrend30days.slice(-7)}
          color="#8B5CF6"
        />
        <MetricCard
          icon={DollarSign}
          title={t.overview.todayCost}
          value={metrics.cost}
          unit={t.common.unit.yuan}
          change={getYesterdayChange(metrics.cost).value}
          isUp={getYesterdayChange(metrics.cost).isUp}
          sparklineData={tokenTrend30days.slice(-7)}
          color="#EC4899"
          decimals={2}
        />
        <MetricCard
          icon={AlertTriangle}
          title={t.overview.systemAlerts}
          value={metrics.alerts}
          unit={t.common.unit.items}
          change={getYesterdayChange(metrics.alerts).value}
          isUp={false}
          sparklineData={taskTrend30days.slice(-7)}
          color="#EF4444"
        />
      </div>

      {/* ② 趋势图（Tab切换） */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrendTab('token')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                trendTab === 'token'
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {t.overview.tokenConsumption}
            </button>
            <button
              onClick={() => setTrendTab('task')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                trendTab === 'task'
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {t.overview.taskVolume}
            </button>
            <button
              onClick={() => setTrendTab('latency')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                trendTab === 'latency'
                  ? 'bg-primary text-white'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {t.overview.responseTime}
            </button>
          </div>

          {/* Today/Cumulative sub-tabs (only for token and task) */}
          {trendTab !== 'latency' && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setPeriodTab('today')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  periodTab === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {t.overview.today}
              </button>
              <button
                onClick={() => setPeriodTab('cumulative')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  periodTab === 'cumulative'
                    ? 'bg-blue-500 text-white'
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {t.overview.cumulative}
              </button>
            </div>
          )}
        </div>
        <TrendChart
          data={trendData.data}
          title={trendData.title}
          yAxisName={trendData.yAxis}
          yAxisName2={trendData.yAxis2}
          height={238}
        />
      </div>

      {/* ③ 环形图（3个，水平排列） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4">{t.overview.realTimeTasks}</h3>
          <div className="flex gap-4">
            <div className="flex-shrink-0 transform scale-110 origin-center" style={{ width: '180px' }}>
              <DonutChart
                data={taskStatusData}
                title="任务状态"
                centerText="2875"
                centerSubtext="总任务"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-[5px]">
              {taskStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-tertiary text-xs">{item.name}</span>
                  </div>
                  <span className="font-semibold text-primary">{item.value}</span>
                </div>
              ))}
              <div className="pt-1.5 mt-1.5 border-t border-custom flex items-center justify-between text-sm font-bold">
                <span className="text-secondary">合计</span>
                <span className="text-primary">{taskStatusData.reduce((sum, item) => sum + item.value, 0)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4">{t.overview.queueDistribution}</h3>
          <div className="flex gap-4">
            <div className="flex-shrink-0 transform scale-110 origin-center" style={{ width: '180px' }}>
              <DonutChart
                data={queueDistribution}
                title="队列状态"
                centerText="9"
                centerSubtext="龙虾总数"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-[5px]">
              {queueDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-tertiary text-xs">{item.name}</span>
                  </div>
                  <span className="font-semibold text-primary">{item.value}</span>
                </div>
              ))}
              <div className="pt-1.5 mt-1.5 border-t border-custom flex items-center justify-between text-sm font-bold">
                <span className="text-secondary">合计</span>
                <span className="text-primary">{queueDistribution.reduce((sum, item) => sum + item.value, 0)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4">{t.overview.modelDistribution}</h3>
          <div className="flex gap-4">
            <div className="flex-shrink-0 transform scale-110 origin-center" style={{ width: '180px' }}>
              <DonutChart
                data={modelDistribution}
                title="模型使用"
                centerText="100%"
                centerSubtext="总使用率"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-[5px]">
              {modelDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-tertiary text-xs">{item.name}</span>
                  </div>
                  <span className="font-semibold text-primary">{item.value}%</span>
                </div>
              ))}
              <div className="pt-1.5 mt-1.5 border-t border-custom flex items-center justify-between text-sm font-bold">
                <span className="text-secondary">合计</span>
                <span className="text-primary">{modelDistribution.reduce((sum, item) => sum + item.value, 0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ④ Agent卡片（拟人化，一行3个） */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">{t.overview.agentStaff}</h2>
          <a href="/agents" className="text-primary hover:underline">
            {t.overview.viewAll} →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* ⑤ 任务简表 */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-base font-bold text-primary mb-4">{t.overview.taskManagement}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-custom">
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.taskName}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.assignedAgent}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.status}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.progress}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.startTime}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="border-b border-custom hover:bg-main transition-colors">
                  <td className="py-3 px-4 text-sm text-primary">{task.name}</td>
                  <td className="py-3 px-4 text-sm text-secondary">{task.agentName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        task.status === 'running' && 'bg-primary text-white',
                        task.status === 'waiting' && 'bg-warning text-white',
                        task.status === 'completed' && 'bg-success text-white',
                        task.status === 'failed' && 'bg-error text-white'
                      )}
                    >
                      {task.status === 'running' && t.taskStatus.running}
                      {task.status === 'waiting' && t.taskStatus.waiting}
                      {task.status === 'completed' && t.taskStatus.completed}
                      {task.status === 'failed' && t.taskStatus.failed}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {task.status === 'running' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-secondary">{task.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-tertiary">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-tertiary">{task.startTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
