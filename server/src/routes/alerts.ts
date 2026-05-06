import { Router } from 'express'
import { getCache } from '../store/statsStore'

const router = Router()

router.get('/', (req, res) => {
  const cache = getCache()
  res.json(cache.alerts)
})

export default router
