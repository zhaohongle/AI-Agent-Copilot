/**
 * use-dashboard-data.ts
 * 所有 hooks 现在由 DashboardContext 统一管理，此文件仅做重新导出。
 * 全站 import 路径不需要改动。
 */
export {
  useApiStatus,
  useMetrics,
  useAgents,
  useAlerts,
  useTasks,
  useCronJobs,
  useMemoryFiles,
  useTrends,
  useDashboard,
  DashboardProvider,
} from './dashboard-context'
