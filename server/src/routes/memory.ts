import { Router } from 'express'
import { getAgentMemoryFiles, getMemoryFileContent } from '../collectors/fileWatcher'

const router = Router()

router.get('/', (req, res) => {
  const memoryFiles = getAgentMemoryFiles()
  res.json(memoryFiles)
})

router.get('/:agentId/:filename', (req, res) => {
  const { agentId, filename } = req.params
  const content = getMemoryFileContent(agentId, filename)

  if (content === null) {
    return res.status(404).json({ error: 'Memory file not found' })
  }

  res.json({ content })
})

export default router
