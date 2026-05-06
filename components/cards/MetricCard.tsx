'use client'

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import CountUp from 'react-countup'

const SparkLine = dynamic(() => import('@/components/charts/SparkLine').then(m => ({ default: m.SparkLine })), {
  ssr: false,
  loading: () => <div className="h-12" />,
})
import type { TrendData } from '@/types'

interface MetricCardProps {
  icon: LucideIcon
  title: string
  value: number
  unit?: string
  change: number
  isUp: boolean
  sparklineData: TrendData[]
  color?: string
  decimals?: number
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  unit = '',
  change,
  isUp,
  sparklineData,
  color = '#3B82F6',
  decimals = 0
}: MetricCardProps) {
  return (
    <div className="bg-card border border-custom rounded-xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-secondary">{title}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-primary">
                <CountUp end={value} decimals={decimals} duration={1.5} separator="," />
              </span>
              {unit && <span className="text-lg text-secondary">{unit}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 变化指示 */}
      <div className="flex items-center gap-2 mb-3">
        {isUp ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : (
          <TrendingDown className="w-4 h-4 text-error" />
        )}
        <span className={`text-sm font-medium ${isUp ? 'text-success' : 'text-error'}`}>
          {isUp ? '+' : '-'}{change}%
        </span>
        <span className="text-xs text-tertiary">较昨日</span>
      </div>

      {/* 趋势图 */}
      <SparkLine data={sparklineData} color={color} />
    </div>
  )
}
