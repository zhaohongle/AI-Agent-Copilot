import * as fs from 'fs'
import * as path from 'path'
import { DocFile, MemoryFile } from '../types'

const OPENCLAW_ROOT = process.env.OPENCLAW_ROOT || `${process.env.HOME}/.openclaw`
// workspace/agents/ contains all agent workspace dirs (IDENTITY.md, SOUL.md, etc.)
const WORKSPACE_ROOT = process.env.OPENCLAW_WORKSPACE || `${process.env.HOME}/.openclaw/workspace`

// Agent config files (IDENTITY.md, SOUL.md etc.) live in workspace/agents/<agentId>/
const WORKSPACE_AGENTS_DIR = path.join(WORKSPACE_ROOT, 'agents')
// Agent session/memory files live in ~/.openclaw/agents/<agentId>/
const REAL_AGENTS_DIR = path.join(OPENCLAW_ROOT, 'agents')

const CONFIG_FILES = ['IDENTITY.md', 'SOUL.md', 'AGENTS.md', 'TOOLS.md', 'USER.md', 'MEMORY.md']

interface AgentConfig {
  agentId: string
  files: DocFile[]
}

function readFileIfExists(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8')
    }
  } catch {
    // Ignore read errors
  }
  return null
}

function getFileStats(filePath: string): { size: number; updatedAt: string } {
  try {
    const stats = fs.statSync(filePath)
    return {
      size: stats.size,
      updatedAt: stats.mtime.toISOString()
    }
  } catch {
    return {
      size: 0,
      updatedAt: new Date().toISOString()
    }
  }
}

export function getAgentConfigs(): AgentConfig[] {
  const configs: AgentConfig[] = []
  const agentsDir = WORKSPACE_AGENTS_DIR

  if (!fs.existsSync(agentsDir)) {
    return configs
  }

  try {
    const agentDirs = fs.readdirSync(agentsDir)

    agentDirs.forEach(agentId => {
      const agentPath = path.join(agentsDir, agentId)

      try {
        const stat = fs.statSync(agentPath)
        if (!stat.isDirectory()) return

        const files: DocFile[] = []

        CONFIG_FILES.forEach(fileName => {
          const filePath = path.join(agentPath, fileName)
          const content = readFileIfExists(filePath)

          if (content !== null) {
            const { size, updatedAt } = getFileStats(filePath)
            files.push({
              id: `${agentId}_${fileName}`,
              agentId,
              name: fileName,
              path: filePath,
              content,
              updatedAt,
              size
            })
          }
        })

        if (files.length > 0) {
          configs.push({ agentId, files })
        }
      } catch {
        // Skip agents that can't be read
      }
    })
  } catch {
    // If agents directory can't be read, return empty
  }

  return configs
}

export function getAgentMemoryFiles(): MemoryFile[] {
  const memoryFiles: MemoryFile[] = []
  // memory/*.md files live in ~/.openclaw/agents/<agentId>/memory/
  const agentsDir = REAL_AGENTS_DIR

  if (!fs.existsSync(agentsDir)) {
    return memoryFiles
  }

  try {
    const agentDirs = fs.readdirSync(agentsDir)

    agentDirs.forEach(agentId => {
      const memoryPath = path.join(agentsDir, agentId, 'memory')

      if (!fs.existsSync(memoryPath)) return

      try {
        const files = fs.readdirSync(memoryPath)

        files.forEach(fileName => {
          if (!fileName.endsWith('.md')) return

          const filePath = path.join(memoryPath, fileName)
          try {
            const content = fs.readFileSync(filePath, 'utf-8')
            const { size, updatedAt } = getFileStats(filePath)

            memoryFiles.push({
              id: `${agentId}_${fileName}`,
              name: fileName,
              category: agentId,
              size: `${Math.round(size / 1024)}KB`,
              updatedAt,
              content: content.slice(0, 100) // Preview only
            })
          } catch {
            // Skip files that can't be read
          }
        })
      } catch {
        // Skip memory directories that can't be read
      }
    })
  } catch {
    // If agents directory can't be read, return empty
  }

  return memoryFiles
}

export function getDocFileContent(agentId: string, fileName: string): string | null {
  const filePath = path.join(WORKSPACE_ROOT, 'agents', agentId, fileName)
  return readFileIfExists(filePath)
}

export function updateDocFileContent(agentId: string, fileName: string, content: string): boolean {
  const filePath = path.join(WORKSPACE_ROOT, 'agents', agentId, fileName)

  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  } catch {
    return false
  }
}

export function getMemoryFileContent(agentId: string, fileName: string): string | null {
  const filePath = path.join(WORKSPACE_ROOT, 'agents', agentId, 'memory', fileName)
  return readFileIfExists(filePath)
}

export function getAllAgentIds(): string[] {
  const agentsDir = WORKSPACE_AGENTS_DIR

  if (!fs.existsSync(agentsDir)) {
    return []
  }

  try {
    return fs.readdirSync(agentsDir).filter(entry => {
      const entryPath = path.join(agentsDir, entry)
      try {
        return fs.statSync(entryPath).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    return []
  }
}
