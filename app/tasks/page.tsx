'use client'

import { Clock, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTasks, useCronJobs } from '@/lib/use-dashboard-data'

export default function TasksPage() {
  const { tasks } = useTasks()
  const { cronJobs } = useCronJobs()
  return (
    <div className="space-y-6 pt-[15px]">
      {/* Cron任务看板 */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          定时任务
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cronJobs.map((cron) => (
            <div key={cron.id} className="p-4 rounded-lg bg-main border border-custom">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary mb-1">{cron.name}</h4>
                  <p className="text-xs text-tertiary font-mono">{cron.schedule}</p>
                </div>
                <button
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                    cron.status === 'active'
                      ? 'bg-success text-white hover:bg-success/80'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  )}
                >
                  {cron.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-secondary">
                  下次执行: <span className="font-medium">{cron.nextRun}</span>
                </p>
                {cron.lastRun && (
                  <p className="text-xs text-tertiary">上次执行: {cron.lastRun}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 任务队列 */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <h3 className="text-lg font-bold text-primary mb-4">当前任务队列</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-custom">
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">任务名称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">负责龙虾</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">进度</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">开始时间</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-secondary">预计完成</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-custom hover:bg-main transition-colors">
                  <td className="py-3 px-4 text-sm text-primary font-medium">{task.name}</td>
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
                      {task.status === 'running' && '运行中'}
                      {task.status === 'waiting' && '等待中'}
                      {task.status === 'completed' && '已完成'}
                      {task.status === 'failed' && '失败'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {task.status === 'running' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                  <td className="py-3 px-4 text-sm text-tertiary">{task.estimatedTime || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
