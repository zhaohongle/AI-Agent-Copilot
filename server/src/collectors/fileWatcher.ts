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

// Both directories are scanned; workspace/agents/ takes precedence over ~/.openclaw/agents/
function getCandidateAgentsDirs(): string[] {
  return [WORKSPACE_AGENTS_DIR, REAL_AGENTS_DIR].filter(d => fs.existsSync(d))
}

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
  const seen = new Set<string>()

  // Scan both dirs; workspace/agents/ first (takes precedence)
  for (const agentsDir of getCandidateAgentsDirs()) {
    try {
      const agentDirs = fs.readdirSync(agentsDir)

      agentDirs.forEach(agentId => {
        if (seen.has(agentId)) return // already loaded from higher-priority dir
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
            seen.add(agentId)
            configs.push({ agentId, files })
          }
        } catch {
          // Skip agents that can't be read
        }
      })
    } catch {
      // If this agents directory can't be read, try next
    }
  }

  return configs
}

export function getAgentMemoryFiles(): MemoryFile[] {
  const memoryFiles: MemoryFile[] = []
  const seen = new Set<string>() // deduplicate by "<agentId>/<fileName>"

  // Scan both dirs for memory/*.md files
  for (const agentsDir of getCandidateAgentsDirs()) {
    try {
      const agentDirs = fs.readdirSync(agentsDir)

      agentDirs.forEach(agentId => {
        const memoryPath = path.join(agentsDir, agentId, 'memory')

        if (!fs.existsSync(memoryPath)) return

        try {
          const files = fs.readdirSync(memoryPath)

          files.forEach(fileName => {
            if (!fileName.endsWith('.md')) return
            const key = `${agentId}/${fileName}`
            if (seen.has(key)) return // prefer first (workspace) occurrence
            seen.add(key)

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
      // If this agents directory can't be read, try next
    }
  }

  return memoryFiles
}

export function getDocFileContent(agentId: string, fileName: string): string | null {
  // Try workspace/agents/ first, then ~/.openclaw/agents/
  for (const agentsDir of getCandidateAgentsDirs()) {
    const filePath = path.join(agentsDir, agentId, fileName)
    const content = readFileIfExists(filePath)
    if (content !== null) return content
  }
  return null
}

export function updateDocFileContent(agentId: string, fileName: string, content: string): boolean {
  // Write to workspace/agents/ if it exists, otherwise ~/.openclaw/agents/
  for (const agentsDir of getCandidateAgentsDirs()) {
    const agentPath = path.join(agentsDir, agentId)
    if (fs.existsSync(agentPath)) {
      try {
        fs.writeFileSync(path.join(agentPath, fileName), content, 'utf-8')
        return true
      } catch {
        // Try next dir
      }
    }
  }
  return false
}

export function getMemoryFileContent(agentId: string, fileName: string): string | null {
  // Try both dirs
  for (const agentsDir of getCandidateAgentsDirs()) {
    const filePath = path.join(agentsDir, agentId, 'memory', fileName)
    const content = readFileIfExists(filePath)
    if (content !== null) return content
  }
  return null
}

export function getAllAgentIds(): string[] {
  const seen = new Set<string>()

  for (const agentsDir of getCandidateAgentsDirs()) {
    try {
      fs.readdirSync(agentsDir).forEach(entry => {
        try {
          if (fs.statSync(path.join(agentsDir, entry)).isDirectory()) {
            seen.add(entry)
          }
        } catch { /* skip */ }
      })
    } catch { /* skip */ }
  }

  return Array.from(seen)
}
