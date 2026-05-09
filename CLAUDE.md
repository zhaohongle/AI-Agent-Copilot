# CLAUDE.md - 360安全龙虾驾驶舱项目规范

## 项目信息
- **项目名称**: OpenClaw Agent Cockpit（360安全龙虾驾驶舱）
- **项目路径**: `/home/nami/.openclaw/workspace/agents/nami_claudequanzhankaifazhuanjia/agent-cockpit/`
- **技术栈**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + ECharts + Framer Motion + Zustand

## 技术架构

### 目录结构
```
agent-cockpit/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # 全局布局（Header + Sidebar + RightPanel）
│   ├── page.tsx           # 总览页（默认路由）
│   ├── usage/             # 资源用量页
│   ├── agents/            # Agent列表页
│   │   └── [id]/         # Agent详情页
│   ├── memory/            # 记忆页
│   ├── docs/              # 文档页
│   ├── tasks/             # 任务页
│   └── settings/          # 设置页
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── RightPanel.tsx
│   ├── charts/
│   │   ├── TrendChart.tsx
│   │   ├── DonutChart.tsx
│   │   └── SparklineChart.tsx
│   ├── agent/
│   │   ├── AgentCard.tsx
│   │   └── AgentStatusBadge.tsx
│   ├── cards/
│   │   └── MetricCard.tsx
│   └── ui/                # shadcn/ui 组件
├── lib/
│   ├── mock-data.ts       # Mock 数据
│   ├── types.ts           # TypeScript 类型定义
│   └── utils.ts
├── store/
│   └── useAppStore.ts     # Zustand 状态管理
├── public/
│   └── avatars/           # Agent 头像
└── styles/
    └── globals.css        # 全局样式
```

### 核心类型定义（TypeScript）
```typescript
type Agent = {
  id: string
  name: string
  avatar: string
  role: string
  status: 'online' | 'offline'
  state: 'idle' | 'working' | 'alert'
  currentTask: string
  lastOutput: string
  schedule: boolean
  todayTasks: number
  todayTokens: number
  totalTokens: number
  latency: number
}

type Metrics = {
  activeAgents: number
  tasks: number
  successRate: number
  latency: number
  tokens: number
  cost: number
  alerts: number
}

type Task = {
  id: string
  agentId: string
  description: string
  status: 'running' | 'completed' | 'failed' | 'queued'
  startTime: string
  endTime?: string
  tokens: number
}

type Alert = {
  id: string
  level: 'red' | 'orange' | 'blue'
  message: string
  timestamp: string
  agentId?: string
}
```

## 开发规范

### 必须遵守的原则
1. **禁止提交密钥** - 所有 API key 使用环境变量
2. **类型安全** - 所有对外函数必须包含 TypeScript 类型定义
3. **Mock 数据** - 使用 `/lib/mock-data.ts` 模拟后端 API 数据
4. **响应式设计** - 使用 TailwindCSS 实现移动端适配
5. **深色模式** - 使用 `next-themes` 实现深色模式切换
6. **动效规范** - 使用 Framer Motion，遵循 200-400ms 动效时长

### 设计规范
1. **颜色系统**
   - 主色：`#3B82F6`（蓝）、`#6366F1`（蓝紫）
   - 成功：`#22C55E`、警告：`#F59E0B`、异常：`#EF4444`
   - 浅色背景：`#F8FAFC`、卡片：`#FFFFFF`、边框：`#E5E7EB`
   - 深色背景：`#0B1220`、卡片：`#111827`、边框：`#1F2937`

2. **间距系统**
   - 基础间距：8px 体系
   - 卡片间距：16px
   - 模块间距：24px
   - 卡片圆角：12px

3. **动效规范**
   - 卡片 hover：`transform: translateY(-4px)` + 阴影增强
   - 数字加载：使用 count-up 动画
   - 图表：柱状逐个弹起、折线路径绘制
   - 页面切换：fade + slide

### 组件复用规范
1. **MetricCard 组件**（Top 指标卡片）
   - Props: `title`, `value`, `change`, `sparklineData`
   - 必须包含：主值 + 变化百分比 + 迷你趋势图
   - hover 动效：卡片抬起 + 折线重绘

2. **AgentCard 组件**
   - Props: `agent` (Agent 类型)
   - 必须包含：头像 + 名称 + 状态徽章 + 当前任务 + 今日数据 + "查看详情"按钮
   - 状态颜色：在线（绿）、待命（灰）、工作中（蓝+pulse）、异常（红）

3. **TrendChart 组件**（趋势图）
   - 使用 ECharts
   - 支持 Tab 切换（token消耗、任务量、响应时间）
   - 必须包含：柱状图 + 折线图（双轴）
   - 初始加载：柱状逐个弹起动画

4. **DonutChart 组件**（环形图）
   - 使用 ECharts
   - 中心显示核心数据
   - hover：segment 放大 + 数值高亮

### 启动配置
```typescript
// vite.config.ts / next.config.js
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: false,  // 云电脑环境禁止自动打开浏览器
  },
})
```

### Mock 数据示例
```typescript
// lib/mock-data.ts
export const mockMetrics: Metrics = {
  activeAgents: 8,
  tasks: 1247,
  successRate: 94.5,
  latency: 1.2,
  tokens: 234567,
  cost: 89.32,
  alerts: 3
}

export const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Claude 全栈专家',
    avatar: '/avatars/claude.png',
    role: '前端开发',
    status: 'online',
    state: 'working',
    currentTask: '构建AI驾驶舱主界面',
    lastOutput: '已完成总览页组件开发',
    schedule: true,
    todayTasks: 12,
    todayTokens: 45678,
    totalTokens: 1234567,
    latency: 0.8
  },
  // ... 更多 Agent
]
```

## 测试规范
1. **单元测试** - 使用 Jest + React Testing Library（可选）
2. **E2E 测试** - 使用 Playwright（可选）
3. **视觉回归** - 确保深色模式切换无异常

## 交付标准
1. ✅ 所有页面无报错
2. ✅ 支持深色/浅色模式切换
3. ✅ 所有图表有动画
4. ✅ Agent 卡片有拟人化状态表达
5. ✅ 响应式布局适配移动端
6. ✅ 启动服务监听 `0.0.0.0:5173`

## 禁止事项
❌ 禁止执行 `npm run dev`（会阻塞进程，由外层 Agent 启动）
❌ 禁止使用 localhost 监听地址
❌ 禁止硬编码端口（使用环境变量或配置文件）
❌ 禁止提交 .env 文件

## 启动命令
```bash
# 安装依赖
npm install

# 开发模式（由外层 Agent 执行）
npm run dev -- --host 0.0.0.0 --port 5173

# 构建
npm run build

# 预览
npm run start
```

---

_此规范由 nami_claudequanzhankaifazhuanjia 创建，用于指导 Claude Code 开发_
