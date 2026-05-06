'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Activity, Users, Brain, FileText, ListTodo, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocaleStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'

const menuItems = [
  { icon: LayoutDashboard, key: 'overview', href: '/overview' },
  { icon: Activity, key: 'usage', href: '/usage' },
  { icon: Users, key: 'agents', href: '/agents' },
  { icon: Brain, key: 'memory', href: '/memory' },
  { icon: FileText, key: 'docs', href: '/docs' },
  { icon: ListTodo, key: 'tasks', href: '/tasks' },
  { icon: Settings, key: 'settings', href: '/settings' }
]

export function Sidebar() {
  const pathname = usePathname()
  const { locale } = useLocaleStore()
  const t = useI18n(locale)

  return (
    <aside className="w-[220px] bg-card border-r border-custom fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="px-4 pb-4 pt-[19px] space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{t.nav[item.key as keyof typeof t.nav]}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
