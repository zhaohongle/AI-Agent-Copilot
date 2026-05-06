import { Router } from 'express'
import { getAgentConfigs, getDocFileContent, updateDocFileContent } from '../collectors/fileWatcher'

const router = Router()

router.get('/', (req, res) => {
  const configs = getAgentConfigs()
  const allDocs = configs.flatMap(c => c.files)
  res.json(allDocs)
})

router.get('/:agentId/:filename', (req, res) => {
  const { agentId, filename } = req.params
  const content = getDocFileContent(agentId, filename)

  if (content === null) {
    return res.status(404).json({ error: 'Document not found' })
  }

  res.json({ content })
})

router.patch('/:agentId/:filename', (req, res) => {
  const { agentId, filename } = req.params
  const { content } = req.body

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' })
  }

  const success = updateDocFileContent(agentId, filename, content)

  if (!success) {
    return res.status(500).json({ error: 'Failed to update document' })
  }

  res.json({ success: true })
})

export default router
