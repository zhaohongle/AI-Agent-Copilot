import { Router } from 'express'
import { getCache } from '../store/statsStore'

const router = Router()

router.get('/', (req, res) => {
  const { type = 'token', period = '30days' } = req.query

  const cache = getCache()

  let data
  if (period === 'today') {
    if (type === 'token') {
      data = cache.todayTrends.token
    } else if (type === 'task') {
      data = cache.todayTrends.task
    } else {
      // Latency for today (mock)
      data = cache.todayTrends.token.map(t => ({
        date: t.date,
        value: Math.round(150 + Math.random() * 100)
      }))
    }
  } else {
    // 30days or 7days
    let sourceData
    if (type === 'token') {
      sourceData = cache.trends.token
    } else if (type === 'task') {
      sourceData = cache.trends.task
    } else {
      sourceData = cache.trends.latency
    }

    if (period === '7days') {
      data = sourceData.slice(-7)
    } else {
      data = sourceData
    }
  }

  res.json({ data })
})

export default router
