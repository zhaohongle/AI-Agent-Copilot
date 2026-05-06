import { Router } from 'express'
import { getCache } from '../store/statsStore'

const router = Router()

router.get('/', (req, res) => {
  const cache = getCache()
  res.json(cache.tasks)
})

export default router
