'use client'

import { AlertCircle, Clock, ChevronDown, Users } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAlerts, useTasks, useCronJobs, useAgents } from '@/lib/use-dashboard-data'

export function RightPanel() {
  const { alerts } = useAlerts()
  const { tasks } = useTasks()
  const { cronJobs } = useCronJobs()
  const { agents } = useAgents()
  const [alertsExpanded, setAlertsExpanded] = useState(true)
  const [tasksExpanded, setTasksExpanded] = useState(true)
  const [cronExpanded, setCronExpanded] = useState(true)
  const [activeAgentsExpanded, setActiveAgentsExpanded] = useState(true)

  return (
    <aside className="w-[320px] bg-card border-l border-custom fixed right-0 top-16 bottom-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 当前活跃智能体 */}
        <div>
          <button
            onClick={() => setActiveAgentsExpanded(!activeAgentsExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">当前活跃智能体</h3>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', activeAgentsExpanded && 'rotate-180')} />
          </button>

          {activeAgentsExpanded && (
            <div className="space-y-2">
              {agents.filter(a => a.status === 'online').slice(0, 5).map(agent => (
                <div key={agent.id} className="p-3 rounded-lg bg-main border border-custom">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{agent.name}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-tertiary">会话数</p>
                      <p className="text-primary font-semibold">{Math.floor(Math.random() * 10 + 1)}</p>
                    </div>
                    <div>
                      <p className="text-tertiary">任务数</p>
                      <p className="text-primary font-semibold">{agent.todayTasks}</p>
                    </div>
                    <div>
                      <p className="text-tertiary">状态</p>
                      <p className="text-success font-semibold">工作中</p>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full text-xs text-blue-500 hover:underline text-center py-1">
                查看更多
              </button>
            </div>
          )}
        </div>

        {/* 告警中心 */}
        <div>
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              <h3 className="font-semibold text-primary">告警中心</h3>
              <span className="px-2 py-0.5 rounded-full bg-error text-white text-xs">
                {alerts.filter(a => a.level !== 'info').length}
              </span>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', alertsExpanded && 'rotate-180')} />
          </button>

          {alertsExpanded && (
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'px-3 py-2 rounded-md border text-sm',
                    alert.level === 'error' && 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700',
                    alert.level === 'warning' && 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700',
                    alert.level === 'info' && 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700'
                  )}
                >
                  <p className="font-medium mb-1">{alert.message}</p>
                  <p className="text-xs opacity-75">{alert.time}</p>
                </div>
              ))}
              <button className="w-full text-xs text-blue-500 hover:underline text-center py-1">
                查看更多
              </button>
            </div>
          )}
        </div>

        {/* 任务队列 */}
        <div>
          <button
            onClick={() => setTasksExpanded(!tasksExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-primary">任务队列</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs">
                {tasks.filter(t => t.status === 'running').length}
              </span>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', tasksExpanded && 'rotate-180')} />
          </button>

          {tasksExpanded && (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-main border border-custom">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-primary text-sm font-medium flex-1">{task.name}</p>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        task.status === 'running' && 'bg-primary text-white',
                        task.status === 'waiting' && 'bg-warning text-white'
                      )}
                    >
                      {task.status === 'running' ? '运行中' : '等待中'}
                    </span>
                  </div>
                  <p className="text-tertiary text-xs mb-2">{task.agentName}</p>
                  {task.status === 'running' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-secondary">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button className="w-full text-xs text-blue-500 hover:underline text-center py-1">
                查看更多
              </button>
            </div>
          )}
        </div>

        {/* Cron定时 */}
        <div>
          <button
            onClick={() => setCronExpanded(!cronExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-primary">定时与自动化</h3>
            </div>
            <ChevronDown className={cn('w-4 h-4 transition-transform', cronExpanded && 'rotate-180')} />
          </button>

          {cronExpanded && (
            <div className="space-y-2">
              {cronJobs.slice(0, 5).map((cron) => (
                <div key={cron.id} className="p-3 rounded-lg bg-main border border-custom">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-primary text-sm font-medium flex-1">{cron.name}</p>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        cron.status === 'active' ? 'bg-success text-white' : 'bg-gray-400 text-white'
                      )}
                    >
                      {cron.status === 'active' ? '运行中' : '已暂停'}
                    </span>
                  </div>
                  <p className="text-tertiary text-xs">下次执行: {cron.nextRun}</p>
                </div>
              ))}
              <button className="w-full text-xs text-blue-500 hover:underline text-center py-1">
                查看更多
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
