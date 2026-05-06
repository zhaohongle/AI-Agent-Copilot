'use client'

import { use, useState } from 'react'
import { Activity, Cpu, Zap, TrendingUp, AlertTriangle, Clock, FileText } from 'lucide-react'
import { TrendChart } from '@/components/charts/TrendChart'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAgents } from '@/lib/use-dashboard-data'

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { agents } = useAgents()
  const [selectedAgentId, setSelectedAgentId] = useState(id)

  const agent = agents.find(a => a.id === selectedAgentId)

  if (!agent) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-primary mb-2">龙虾不存在</h1>
        <Link href="/agents" className="text-primary hover:underline">
          返回列表
        </Link>
      </div>
    )
  }

  const getStateColor = (state: typeof agent.state) => {
    switch (state) {
      case 'working':
        return 'bg-primary'
      case 'alert':
        return 'bg-error'
      default:
        return 'bg-success'
    }
  }

  const getStateLabel = (state: typeof agent.state) => {
    switch (state) {
      case 'working':
        return '工作中'
      case 'alert':
        return '异常'
      default:
        return '空闲'
    }
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Agent Selector */}
      <div className="bg-card border border-custom rounded-xl p-4 overflow-x-auto">
        <div className="flex gap-4">
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAgentId(a.id)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-w-fit',
                selectedAgentId === a.id
                  ? 'bg-main border-b-2 border-blue-500'
                  : 'hover:bg-main/50'
              )}
            >
              <div className="relative">
                <span className="text-2xl">{a.avatar}</span>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card',
                    getStateColor(a.state),
                    a.state === 'working' && 'pulse-animation'
                  )}
                />
              </div>
              <div className="text-left">
                <div className="font-medium text-primary text-sm">{a.name}</div>
                <div className="text-xs text-tertiary">{getStateLabel(a.state)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ① Basic Info Card */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl">
              {agent.avatar}
            </div>
            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-card',
                getStateColor(agent.state),
                agent.state === 'working' && 'pulse-animation'
              )}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-primary">{agent.name}</h1>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium text-white',
                  getStateColor(agent.state)
                )}
              >
                {getStateLabel(agent.state)}
              </span>
            </div>
            <p className="text-secondary mb-2">{agent.role}</p>
            {agent.description && (
              <p className="text-sm text-tertiary">{agent.description}</p>
            )}
            {agent.createdAt && (
              <p className="text-xs text-tertiary mt-2">创建时间: {agent.createdAt}</p>
            )}
          </div>
        </div>
      </div>

      {/* ② Core Metrics (2x4 grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">今日完成任务</p>
          <p className="text-2xl font-bold text-primary">{agent.todayCompletedTasks || 0}</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">累计完成任务</p>
          <p className="text-2xl font-bold text-primary">{agent.totalCompletedTasks || 0}</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">今日Token消耗</p>
          <p className="text-2xl font-bold text-primary">{((agent.todayTokens || 0) / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">累计Token消耗</p>
          <p className="text-2xl font-bold text-primary">{((agent.totalTokens || 0) / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">今日产物数</p>
          <p className="text-2xl font-bold text-primary">{agent.todayOutputs || 0}</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">响应时间</p>
          <p className="text-2xl font-bold text-primary">{agent.latency}ms</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">成功率</p>
          <p className="text-2xl font-bold text-primary">{agent.successRate || 0}%</p>
        </div>
        <div className="bg-card border border-custom rounded-xl p-4">
          <p className="text-xs text-tertiary mb-1">系统告警数</p>
          <p className="text-2xl font-bold text-error">{agent.alertCount || 0}</p>
        </div>
      </div>

      {/* ③ Current Task Card */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          当前任务
        </h3>
        <div className="p-4 rounded-lg bg-main">
          <p className="text-primary font-medium mb-2">{agent.currentTask}</p>
          {agent.currentTaskProgress !== undefined && agent.currentTaskProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">进度</span>
                <span className="text-primary font-medium">{agent.currentTaskProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${agent.currentTaskProgress}%` }}
                />
              </div>
              {agent.currentTaskStartTime && (
                <p className="text-xs text-tertiary">开始时间: {agent.currentTaskStartTime}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ④ Exception Info Card */}
      {agent.recentAlerts && agent.recentAlerts.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" />
            异常信息
          </h3>
          <div className="space-y-2">
            {agent.recentAlerts.slice(0, 3).map((alert, idx) => (
              <div
                key={idx}
                className={cn(
                  'px-3 py-2 rounded-md border text-sm',
                  alert.level === 'error' && 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                  alert.level === 'warning' && 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
                  alert.level === 'info' && 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1">{alert.desc}</p>
                  <span className="text-xs opacity-75">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⑤ Execution History Table */}
      {agent.history && agent.history.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            执行历史
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-custom">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">任务描述</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">Token</th>
                </tr>
              </thead>
              <tbody>
                {agent.history.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="border-b border-custom hover:bg-main transition-colors">
                    <td className="py-3 px-4 text-sm text-primary">{item.desc}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          item.status === 'completed' && 'bg-success text-white',
                          item.status === 'failed' && 'bg-error text-white',
                          item.status === 'running' && 'bg-primary text-white'
                        )}
                      >
                        {item.status === 'completed' && '已完成'}
                        {item.status === 'failed' && '失败'}
                        {item.status === 'running' && '进行中'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-tertiary">{item.time}</td>
                    <td className="py-3 px-4 text-sm text-secondary">{(item.tokens / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ⑥ Token Trend Chart */}
      {agent.tokenTrend && agent.tokenTrend.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Token趋势（最近7天）
          </h3>
          <TrendChart
            data={agent.tokenTrend}
            title=""
            yAxisName="Token消耗"
          />
        </div>
      )}

      {/* ⑦ Output Records */}
      {agent.outputs && agent.outputs.length > 0 && (
        <div className="bg-card border border-custom rounded-xl p-6">
          <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            产出记录
          </h3>
          <div className="space-y-3">
            {agent.outputs.map((output, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-main border border-custom">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-primary font-medium flex-1">{output.desc}</p>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary text-white ml-2">
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
