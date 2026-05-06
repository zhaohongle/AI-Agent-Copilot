'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Folder } from 'lucide-react'
import { useMemoryFiles } from '@/lib/use-dashboard-data'

export default function MemoryPage() {
  const { memoryFiles } = useMemoryFiles()
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedFile, setSelectedFile] = useState<typeof memoryFiles[0] | null>(null)

  // 数据加载完后自动选中第一个文件
  useEffect(() => {
    if (memoryFiles.length > 0 && !selectedFile) {
      setSelectedFile(memoryFiles[0])
    }
  }, [memoryFiles])

  const categories = ['全部', '技术文档', '工作记录', '技术方案']

  const filteredFiles =
    selectedCategory === '全部'
      ? memoryFiles
      : memoryFiles.filter(f => f.category === selectedCategory)

  return (
    <div className="space-y-6 pt-[15px]">
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧分类 */}
        <div className="col-span-2 bg-card border border-custom rounded-xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
            <Folder className="w-4 h-4" />
            分类
          </h3>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 中间文件列表 */}
        <div className="col-span-4 bg-card border border-custom rounded-xl p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
              <input
                type="text"
                placeholder="搜索文件..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-main border border-custom text-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedFile?.id === file.id
                    ? 'bg-primary/10 border border-primary'
                    : 'hover:bg-main'
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-tertiary">{file.size}</span>
                      <span className="text-xs text-tertiary">·</span>
                      <span className="text-xs text-tertiary">{file.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧编辑器 */}
        <div className="col-span-6 bg-card border border-custom rounded-xl p-6">
          {selectedFile ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-primary">{selectedFile.name}</h3>
                <p className="text-xs text-tertiary mt-1">
                  {selectedFile.category} · {selectedFile.size} · 更新于 {selectedFile.updatedAt}
                </p>
              </div>
              <div className="bg-main rounded-lg p-4 font-mono text-sm text-primary min-h-[400px]">
                {selectedFile.content || '暂无内容'}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] text-tertiary text-sm">
              请从左侧选择一个文件
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
