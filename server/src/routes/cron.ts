import { Router } from 'express'
import { collectCronJobs } from '../collectors/cronCollector'

const router = Router()

router.get('/', (req, res) => {
  const cronJobs = collectCronJobs()
  res.json(cronJobs)
})

export default router
