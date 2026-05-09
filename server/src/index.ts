import express from 'express'
import cors from 'cors'
import { refresh, getCache } from './store/statsStore'

// Import routes
import metricsRouter from './routes/metrics'
import agentsRouter from './routes/agents'
import trendsRouter from './routes/trends'
import alertsRouter from './routes/alerts'
import tasksRouter from './routes/tasks'
import cronRouter from './routes/cron'
import memoryRouter from './routes/memory'
import docsRouter from './routes/docs'

const app = express()
const PORT = Number(process.env.API_PORT) || 5173  // 使用允许范围内的端口
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'  // 开发/演示环境允许所有 origin

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Serve static files from Next.js build (out/)
const path = require('path')
const staticDir = path.join(__dirname, '../../out')
app.use(express.static(staticDir))

// Routes
app.use('/api/metrics', metricsRouter)
app.use('/api/agents', agentsRouter)
app.use('/api/trends', trendsRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/cron', cronRouter)
app.use('/api/memory', memoryRouter)
app.use('/api/docs', docsRouter)

// Health check
app.get('/health', (req, res) => {
  const cache = getCache()
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    lastUpdate: cache.updatedAt
  })
})

// Initial refresh
console.log('[StatsStore] Performing initial refresh...')
refresh()

// Auto-refresh every 30 seconds (data is read from local JSONL files, very lightweight)
const REFRESH_INTERVAL = 30 * 1000
setInterval(() => {
  refresh()
}, REFRESH_INTERVAL)

// Manual refresh endpoint
app.post('/api/refresh', (req, res) => {
  refresh()
  res.json({ status: 'ok', message: 'Data refreshed', updatedAt: getCache().updatedAt })
})

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  const path = require('path')
  const staticDir = path.join(__dirname, '../../out')
  res.sendFile(path.join(staticDir, 'index.html'))
})

// Start server
app.listen(PORT, '0.0.0.0', () => {  // 监听所有接口，支持 tunnel 访问
  console.log(`Agent Cockpit API Server running on port ${PORT}`)
  console.log(`CORS enabled for: ${CORS_ORIGIN}`)
  console.log(`Auto-refresh interval: ${REFRESH_INTERVAL / 1000}s`)
})
