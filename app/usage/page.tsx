'use client'

import dynamic from 'next/dynamic'
import { Cpu, DollarSign, Zap, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/cards/MetricCard'
import { getYesterdayChange } from '@/lib/mock-data'
import { useLocaleStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { useMetrics, useAgents, useTrends } from '@/lib/use-dashboard-data'
import { AgentAvatar } from '@/components/agent/AgentAvatar'

const TrendChart = dynamic(() => import('@/components/charts/TrendChart').then(m => ({ default: m.TrendChart })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">加载图表中…</div>,
})
const DonutChart = dynamic(() => import('@/components/charts/DonutChart').then(m => ({ default: m.DonutChart })), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">加载图表中…</div>,
})

export default function UsagePage() {
  const { locale } = useLocaleStore()
  const t = useI18n(locale)
  const { metrics } = useMetrics()
  const { agents } = useAgents()
  const { trends: tokenTrend } = useTrends('token', '30days')

  const agentTokenData = agents.map(agent => ({
    name: agent.name,
    value: agent.todayTokens,
    color: ['#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA', '#EC4899', '#F59E0B'][agents.indexOf(agent)]
  }))

  return (
    <div className="space-y-6 pt-[15px]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={TrendingUp}
          title={locale === 'zh' ? '本月预估' : 'Monthly Est.'}
          value={4730}
          unit={t.common.unit.yuan}
          change={8.2}
          isUp={true}
          sparklineData={tokenTrend.slice(-7)}
          color="#F59E0B"
        />
        <MetricCard
          icon={Cpu}
          title={locale === 'zh' ? '今日Token' : 'Today Tokens'}
          value={Math.round(metrics.tokens / 1000)}
          unit={t.common.unit.k}
          change={getYesterdayChange(metrics.tokens).value}
          isUp={getYesterdayChange(metrics.tokens).isUp}
          sparklineData={tokenTrend.slice(-7)}
          color="#3B82F6"
        />
        <MetricCard
          icon={Cpu}
          title={locale === 'zh' ? '累计Token' : 'Total Tokens'}
          value={Math.round(metrics.tokens * 30 / 1000)}
          unit={t.common.unit.k}
          change={getYesterdayChange(metrics.tokens * 30).value}
          isUp={getYesterdayChange(metrics.tokens * 30).isUp}
          sparklineData={tokenTrend.slice(-7)}
          color="#8B5CF6"
        />
        <MetricCard
          icon={DollarSign}
          title={t.overview.todayCost}
          value={metrics.cost}
          unit={t.common.unit.yuan}
          change={getYesterdayChange(metrics.cost).value}
          isUp={getYesterdayChange(metrics.cost).isUp}
          sparklineData={tokenTrend.slice(-7)}
          color="#EC4899"
          decimals={2}
        />
        <MetricCard
          icon={Zap}
          title={locale === 'zh' ? '平均效率' : 'Average Efficiency'}
          value={2.8}
          unit={locale === 'zh' ? '任务/小时' : 'tasks/hr'}
          change={3.5}
          isUp={true}
          sparklineData={tokenTrend.slice(-7)}
          color="#22C55E"
          decimals={1}
        />
      </div>

      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4">{locale === 'zh' ? 'Token消耗趋势（近30天）' : 'Token Consumption Trend (Last 30 Days)'}</h3>
        <TrendChart
          data={tokenTrend}
          title=""
          yAxisName={locale === 'zh' ? 'Token数' : 'Tokens'}
          yAxisName2={locale === 'zh' ? '成本(元)' : 'Cost(¥)'}
          height={252}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-lg font-bold text-primary mb-4">{locale === 'zh' ? '龙虾Token分布' : 'Agent Token Distribution'}</h3>
          <DonutChart
            data={agentTokenData}
            title={locale === 'zh' ? 'Token消耗' : 'Token Usage'}
            centerText={(metrics.tokens / 1000).toFixed(0) + t.common.unit.k}
            centerSubtext={locale === 'zh' ? '今日总量' : 'Today Total'}
            showLeaderLine={true}
          />
        </div>

        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-lg font-bold text-primary mb-4">{locale === 'zh' ? '龙虾效率排行' : 'Agent Efficiency Ranking'}</h3>
          <div className="space-y-3">
            {agents
              .sort((a, b) => b.todayTasks - a.todayTasks)
              .map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-main">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">{agent.name}</p>
                    <p className="text-xs text-tertiary">{agent.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{agent.todayTasks}</p>
                    <p className="text-xs text-tertiary">{locale === 'zh' ? '任务' : 'tasks'}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4">{locale === 'zh' ? '详细用量统计' : 'Detailed Usage Statistics'}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-custom">
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{locale === 'zh' ? '龙虾' : 'Agent'}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{locale === 'zh' ? '今日任务' : 'Today Tasks'}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{locale === 'zh' ? '今日Token' : 'Today Tokens'}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{locale === 'zh' ? '总Token' : 'Total Tokens'}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{locale === 'zh' ? '平均响应' : 'Avg Latency'}</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">{t.overview.status}</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-custom hover:bg-main transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <AgentAvatar avatar={agent.avatar} name={agent.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-primary">{agent.name}</p>
                        <p className="text-xs text-tertiary">{agent.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-primary font-medium">{agent.todayTasks}</td>
                  <td className="py-3 px-4 text-sm text-primary">{(agent.todayTokens / 1000).toFixed(1)}K</td>
                  <td className="py-3 px-4 text-sm text-secondary">{(agent.totalTokens / 1000000).toFixed(2)}M</td>
                  <td className="py-3 px-4 text-sm text-secondary">{agent.latency}ms</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.state === 'working' ? 'bg-primary text-white' :
                      agent.state === 'alert' ? 'bg-error text-white' :
                      'bg-success text-white'
                    }`}>
                      {agent.state === 'working' ? t.agentState.working : agent.state === 'alert' ? t.agentState.alert : t.agentState.idle}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
