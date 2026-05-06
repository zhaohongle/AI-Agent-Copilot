'use client'

import ReactECharts from 'echarts-for-react'
import type { TrendData } from '@/types'

interface SparkLineProps {
  data: TrendData[]
  color?: string
}

export function SparkLine({ data, color = '#3B82F6' }: SparkLineProps) {
  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      data: data.map(d => d.date)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: data.map(d => d.value),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 2,
          color: color
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '00' }
            ]
          }
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  return <ReactECharts option={option} style={{ height: '60px', width: '100%' }} opts={{ renderer: 'svg' }} />
}
