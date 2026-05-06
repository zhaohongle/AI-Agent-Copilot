'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Save } from 'lucide-react'
import { mockAgents } from '@/lib/mock-data'
import { useAgents } from '@/lib/use-dashboard-data'
import { cn } from '@/lib/utils'
import { AgentAvatar } from '@/components/agent/AgentAvatar'

type DocFile = {
  id: string
  agentId: string
  name: string
  path: string
  content: string
  updatedAt: string  // ISO 8601
  size: number       // bytes
}

// 格式化相对时间
function formatRelativeTime(isoString: string): string {
  const now = new Date()
  const date = new Date(isoString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}

// 格式化文件大小（字节转KB）
function formatFileSize(bytes: number): string {
  const kb = Math.round(bytes / 1024)
  return `${kb}KB`
}

export default function DocsPage() {
  const { agents: apiAgents } = useAgents()
  const agents = apiAgents.length > 0 ? apiAgents : mockAgents
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [editContent, setEditContent] = useState('')
  const [showToast, setShowToast] = useState(false)

  // 新增状态：从 API 加载的文档文件
  const [docFiles, setDocFiles] = useState<DocFile[]>([])
  const [loading, setLoading] = useState(true)

  // 从 API 加载文档
  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then((data: DocFile[]) => {
        setDocFiles(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // 当 agents 加载完成后，默认选中第一个
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  // 根据真实 agentId 过滤文件
  const currentFiles = docFiles.filter(f => f.agentId === selectedAgentId)
  const currentFile = currentFiles[selectedFileIndex]

  // Update editContent when file or agent changes
  useEffect(() => {
    if (currentFile) {
      setEditContent(currentFile.content)
    }
  }, [currentFile])

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId)
    setSelectedFileIndex(0)
    const newFiles = docFiles.filter(f => f.agentId === agentId)
    if (newFiles[0]) {
      setEditContent(newFiles[0].content)
    }
  }

  const handleFileChange = (index: number) => {
    setSelectedFileIndex(index)
    if (currentFiles[index]) {
      setEditContent(currentFiles[index].content)
    }
  }

  const handleRefresh = () => {
    if (currentFile) {
      setEditContent(currentFile.content)
    }
  }

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'working': return 'bg-blue-500'
      case 'alert': return 'bg-red-500'
      default: return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-5 min-h-screen pb-6 pt-[15px]">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          保存成功 ✓
        </div>
      )}

      {/* Top: Agent selector (horizontal cards like agents page) */}
      <div className="bg-card border border-custom rounded-xl p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentChange(agent.id)}
              className={cn(
                'flex flex-col items-center gap-2 px-5 py-3 rounded-xl border transition-all min-w-[96px] flex-shrink-0',
                selectedAgentId === agent.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent hover:border-custom hover:bg-main'
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <AgentAvatar avatar={agent.avatar} name={agent.name} size="md" />
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                  getStateColor(agent.state),
                  agent.state === 'working' && 'animate-pulse'
                )} />
              </div>
              {/* Name */}
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                selectedAgentId === agent.id ? 'text-blue-600 dark:text-blue-400' : 'text-secondary'
              )}>{agent.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content: Left sidebar (file list) + Right (file editor) */}
      <div className="flex gap-4 min-h-[600px]">
        {/* Left: File navigation */}
        <div className="w-[220px] bg-card border border-custom rounded-xl p-4 flex-shrink-0">
          <h3 className="text-sm font-bold text-primary mb-3">配置文件</h3>
          <div className="space-y-1">
            {loading ? (
              // 骨架屏
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : currentFiles.length === 0 ? (
              // 空状态
              <div className="text-sm text-tertiary text-center py-8">
                暂无配置文件
              </div>
            ) : (
              // 文件列表
              currentFiles.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => handleFileChange(index)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-all',
                    selectedFileIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                      : 'hover:bg-main'
                  )}
                >
                  <div className="text-sm font-medium text-primary mb-0.5">{file.name}</div>
                  <div className="text-xs text-tertiary truncate">{file.path}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: File editor */}
        <div className="flex-1 bg-card border border-custom rounded-xl p-6 flex flex-col">
          {loading ? (
            // 编辑器骨架屏
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
              <div className="flex-1 min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
          ) : !currentFile ? (
            // 无文件状态
            <div className="flex items-center justify-center h-full text-tertiary">
              请选择一个文件进行编辑
            </div>
          ) : (
            <>
              {/* File header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-custom">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-primary mb-1">{currentFile.name}</h2>
                  <div className="flex items-center gap-3 text-xs text-tertiary">
                    <span>{currentFile.path}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(currentFile.updatedAt)}</span>
                    <span>•</span>
                    <span>{formatFileSize(currentFile.size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">刷新</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm">保存</span>
                  </button>
                </div>
              </div>

              {/* Textarea editor */}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 w-full p-4 bg-gray-50 dark:bg-[#0d1117] border border-custom rounded-lg text-sm font-mono text-primary resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[500px]"
                spellCheck={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
