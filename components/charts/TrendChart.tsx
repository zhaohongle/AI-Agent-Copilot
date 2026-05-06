'use client'

import ReactECharts from 'echarts-for-react'
import type { TrendData } from '@/types'

interface TrendChartProps {
  data: TrendData[]
  title: string
  yAxisName: string
  yAxisName2?: string
  height?: number
}

export function TrendChart({ data, title, yAxisName, yAxisName2, height = 260 }: TrendChartProps) {

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: 'inherit',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      top: 30,
      textStyle: {
        color: 'inherit'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
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
      boundaryGap: true,
      data: data.map(d => d.date),
      axisLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      axisLabel: {
        color: '#6B7280'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: yAxisName,
        scale: true,
        nameTextStyle: {
          color: '#6B7280'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E7EB'
          }
        },
        axisLabel: {
          color: '#6B7280'
        },
        splitLine: {
          lineStyle: {
            color: '#E5E7EB',
            type: 'dashed'
          }
        }
      },
      ...(yAxisName2
        ? [
            {
              type: 'value',
              name: yAxisName2,
              scale: true,
              nameTextStyle: {
                color: '#6B7280'
              },
              axisLine: {
                lineStyle: {
                  color: '#E5E7EB'
                }
              },
              axisLabel: {
                color: '#6B7280'
              },
              splitLine: {
                show: false
              }
            }
          ]
        : [])
    ],
    series: [
      {
        name: yAxisName,
        type: 'bar',
        barCategoryGap: '60%',
        barMaxWidth: 20,
        data: data.map(d => d.value),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3B82F6' },
              { offset: 1, color: '#60A5FA' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        animationDelay: (idx: number) => idx * 20
      },
      ...(data[0]?.value2 && yAxisName2
        ? [
            {
              name: yAxisName2,
              type: 'line',
              yAxisIndex: 1,
              data: data.map(d => d.value2),
              smooth: true,
              lineStyle: {
                width: 3,
                color: '#22C55E'
              },
              itemStyle: {
                color: '#22C55E'
              },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(34, 197, 94, 0.15)' },
                    { offset: 1, color: 'rgba(34, 197, 94, 0)' }
                  ]
                }
              }
            }
          ]
        : [])
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  return <ReactECharts option={option} style={{ height: `${height}px`, width: '100%' }} opts={{ renderer: 'svg' }} />
}
