import { Router } from 'express'
import { getCache } from '../store/statsStore'

const router = Router()

router.get('/', (req, res) => {
  const cache = getCache()
  res.json(cache.agents)
})

router.get('/:id', (req, res) => {
  const cache = getCache()
  const agent = cache.agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' })
  }

  res.json(agent)
})

export default router
