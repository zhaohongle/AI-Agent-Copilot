import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { DashboardProvider } from '@/lib/dashboard-context'
import { BackendBanner } from '@/components/layout/BackendBanner'
import './globals.css'

export const metadata: Metadata = {
  title: '360安全龙虾驾驶舱 - OpenClaw Agent Cockpit',
  description: 'AI Agent 监控与调度平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          <DashboardProvider>
            <div className="min-h-screen bg-main">
              <Header />
              <Sidebar />
              <BackendBanner />
              <main className="ml-[220px] mr-[320px] pt-[79px] p-6">
                {children}
              </main>
              <RightPanel />
            </div>
          </DashboardProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
