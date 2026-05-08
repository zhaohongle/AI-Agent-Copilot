'use client'

import { Settings as SettingsIcon, Bell, Palette, Key, Database } from 'lucide-react'
import { useThemeStore } from '@/lib/store'

export default function SettingsPage() {
  const { isDark, setDark } = useThemeStore()

  return (
    <div className="space-y-6 pt-[15px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 通知设置 */}
        <div className="bg-card border border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">通知设置</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: '任务完成通知', checked: true },
              { label: '系统告警通知', checked: true },
              { label: '每日报告', checked: false }
            ].map((item, index) => (
              <label key={index} className="flex items-center justify-between p-3 rounded-lg bg-main cursor-pointer">
                <span className="text-sm text-primary">{item.label}</span>
                <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4" />
              </label>
            ))}
          </div>
        </div>

        {/* 主题设置 */}
        <div className="bg-card border border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">外观主题</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-main cursor-pointer">
              <span className="text-sm text-primary">浅色模式</span>
              <input type="radio" name="theme" className="w-4 h-4" checked={!isDark} onChange={() => setDark(false)} />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg bg-main cursor-pointer">
              <span className="text-sm text-primary">深色模式</span>
              <input type="radio" name="theme" className="w-4 h-4" checked={isDark} onChange={() => setDark(true)} />
            </label>
          </div>
        </div>

        {/* API配置 */}
        <div className="bg-card border border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">API配置</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-tertiary mb-1 block">API密钥</label>
              <input
                type="password"
                defaultValue="sk-xxxxxxxxxxxxxxxx"
                className="w-full h-10 px-4 rounded-lg bg-main border border-custom text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-tertiary mb-1 block">API端点</label>
              <input
                type="text"
                defaultValue="https://api.example.com"
                className="w-full h-10 px-4 rounded-lg bg-main border border-custom text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-card border border-custom rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-primary">数据管理</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors">
              导出数据
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-main border border-custom text-primary font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              清除缓存
            </button>
            <button className="w-full px-4 py-3 rounded-lg bg-error text-white font-medium hover:bg-error/80 transition-colors">
              重置所有设置
            </button>
          </div>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-card border border-custom rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-primary">关于</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-tertiary mb-1">版本号</p>
            <p className="text-sm text-primary font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-xs text-tertiary mb-1">构建时间</p>
            <p className="text-sm text-primary font-medium">2026-04-30</p>
          </div>
          <div>
            <p className="text-xs text-tertiary mb-1">技术栈</p>
            <p className="text-sm text-primary font-medium">Next.js 14 + TypeScript</p>
          </div>
          <div>
            <p className="text-xs text-tertiary mb-1">开源协议</p>
            <p className="text-sm text-primary font-medium">MIT License</p>
          </div>
        </div>
      </div>
    </div>
  )
}
