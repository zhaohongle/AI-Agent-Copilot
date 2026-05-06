'use client'

import type { Agent } from '@/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { AgentAvatar } from './AgentAvatar'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getStateColor = (state: Agent['state']) => {
    switch (state) {
      case 'working':
        return 'bg-primary'
      case 'alert':
        return 'bg-error'
      default:
        return 'bg-success'
    }
  }

  const getStateLabel = (state: Agent['state']) => {
    switch (state) {
      case 'working':
        return '工作中'
      case 'alert':
        return '告警'
      default:
        return '空闲'
    }
  }

  return (
    <div
      className="bg-card border border-custom rounded-xl p-6 card-hover relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 头像和状态 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <AgentAvatar avatar={agent.avatar} name={agent.name} size="lg" />
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
              getStateColor(agent.state),
              agent.state === 'working' && 'pulse-animation'
            )}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-primary">{agent.name}</h3>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium text-white',
                getStateColor(agent.state)
              )}
            >
              {getStateLabel(agent.state)}
            </span>
          </div>
          <p className="text-sm text-secondary">{agent.role}</p>
        </div>
      </div>

      {/* 当前任务 */}
      <div className="mb-4 p-3 rounded-lg bg-main">
        <p className="text-xs text-tertiary mb-1">当前任务</p>
        <p className="text-sm text-primary font-medium">{agent.currentTask}</p>
      </div>

      {/* 最近产出 */}
      <div className="mb-4">
        <p className="text-xs text-tertiary mb-1">最近产出</p>
        <p className="text-sm text-secondary">{agent.lastOutput}</p>
      </div>

      {/* 数据行 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-tertiary mb-1">今日任务</p>
          <p className="text-lg font-bold text-primary">{agent.todayTasks}</p>
        </div>
        <div>
          <p className="text-xs text-tertiary mb-1">��日Token</p>
          <p className="text-lg font-bold text-primary">{(agent.todayTokens / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <p className="text-xs text-tertiary mb-1">总Token</p>
          <p className="text-lg font-bold text-primary">{(agent.totalTokens / 1000000).toFixed(2)}M</p>
        </div>
        <div>
          <p className="text-xs text-tertiary mb-1">响应速度</p>
          <p className="text-lg font-bold text-primary">{agent.latency}ms</p>
        </div>
        {agent.todayOutputs !== undefined && (
          <div>
            <p className="text-xs text-tertiary mb-1">今日产出</p>
            <p className="text-lg font-bold text-primary">{agent.todayOutputs}</p>
          </div>
        )}
      </div>

      {/* Hover时显示的查看详情按钮 */}
      {isHovered && (
        <Link
          href={`/agents/${agent.id}`}
          className="absolute inset-x-6 bottom-6 bg-primary text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
        >
          查看详情 <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
