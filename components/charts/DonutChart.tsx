'use client'

import ReactECharts from 'echarts-for-react'
import type { DonutDataItem } from '@/types'

interface DonutChartProps {
  data: DonutDataItem[]
  title: string
  centerText: string
  centerSubtext?: string
  showLeaderLine?: boolean
}

export function DonutChart({ data, title, centerText, centerSubtext, showLeaderLine = false }: DonutChartProps) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: false
    },
    graphic: [
      {
        type: 'group',
        left: 'center',
        top: 'middle',
        children: [
          {
            type: 'text',
            z: 100,
            left: 'center',
            top: 'middle',
            style: {
              text: centerText,
              textAlign: 'center',
              fill: '#111827',
              fontSize: 22,
              fontWeight: 'bold',
              y: -18
            }
          },
          ...(centerSubtext
            ? [
                {
                  type: 'text',
                  z: 100,
                  left: 'center',
                  top: 'middle',
                  style: {
                    text: centerSubtext,
                    textAlign: 'center',
                    fill: '#9CA3AF',
                    fontSize: 12,
                    y: 16
                  }
                }
              ]
            : [])
        ]
      }
    ],
    series: [
      {
        name: title,
        type: 'pie',
        radius: showLeaderLine ? ['38%', '60%'] : ['44%', '70%'],
        center: showLeaderLine ? ['40%', '50%'] : ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: showLeaderLine,
          position: showLeaderLine ? 'outside' : undefined,
          formatter: showLeaderLine ? '{b}\n{d}%' : undefined,
          lineHeight: showLeaderLine ? 18 : undefined
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          },
          scale: true,
          scaleSize: 10
        },
        labelLine: {
          show: showLeaderLine,
          length: showLeaderLine ? 15 : undefined,
          length2: showLeaderLine ? 20 : undefined
        },
        data: data.map(item => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  return <ReactECharts option={option} style={{ height: '200px', width: '100%' }} opts={{ renderer: 'svg' }} />
}
