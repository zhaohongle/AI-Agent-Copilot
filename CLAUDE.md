# CLAUDE.md - 360安全龙虾驾驶舱 (Agent Cockpit)

## 项目概述
360安全龙虾驾驶舱 - AI Agent 监控与调度平台，前端 + Mock 数据版本。

## 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **组件库**: shadcn/ui
- **图表**: ECharts (echarts-for-react)
- **动效**: Framer Motion
- **状态管理**: Zustand
- **数字动画**: react-countup

## 项目路径
`/home/nami/.openclaw/workspace/agents/nami_claudequanzhankaifazhuanjia/agent-cockpit/`

## 目录结构
```
agent-cockpit/
├── app/
│   ├── layout.tsx          # 全局布局（顶栏+左侧栏+右侧栏）
│   ├── page.tsx            # 重定向到 /overview
│   ├── overview/page.tsx   # 总览页
│   ├── usage/page.tsx      # 资源用量页
│   ├── agents/page.tsx     # 龙虾员工列表
│   ├── agents/[id]/page.tsx # Agent详情页
│   ├── memory/page.tsx     # 记忆页
│   ├── docs/page.tsx       # 文档页
│   ├── tasks/page.tsx      # 任务页
│   └── settings/page.tsx   # 设置页
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # 顶栏
│   │   ├── Sidebar.tsx     # 左侧导航
│   │   └── RightPanel.tsx  # 右侧控制栏
│   ├── charts/
│   │   ├── TrendChart.tsx  # 趋势图（柱+折线双轴）
│   │   ├── DonutChart.tsx  # 环形图
│   │   └── SparkLine.tsx   # 迷你趋势图
│   ├── agent/
│   │   ├── AgentCard.tsx   # Agent卡片
│   │   └── AgentAvatar.tsx # 拟人化头像
│   ├── cards/
│   │   └── MetricCard.tsx  # Top指标卡片
│   └── panels/
│       ├── AlertPanel.tsx  # 告警中心
│       ├── TaskQueue.tsx   # 任务队列
│       └── CronPanel.tsx   # Cron定时
├── lib/
│   ├── mock-data.ts        # Mock数据
│   └── store.ts            # Zustand状态
├── hooks/
│   └── useTheme.ts         # 主题切换
└── types/
    └── index.ts            # 类型定义
```

## 设计规范

### 颜色系统
- Primary: #3B82F6（蓝）/ #6366F1（蓝紫）
- Success: #22C55E | Warning: #F59E0B | Error: #EF4444
- 浅色背景: #F8FAFC | 卡片: #FFFFFF | 边框: #E5E7EB
- 深色背景: #0B1220 | 卡片: #111827 | 边框: #1F2937

### 布局
- 左侧栏: 220px（固定）
- 右侧栏: 320px（固定）
- 中间: 自适应
- 卡片: border-radius 12px, padding 16px

### 动效规范
- hover卡片: translateY(-4px) + 阴影增强
- 数字: count up 动画
- 图表: 逐步绘制动画
- 页面切换: fade + translate
- Agent工作中: 蓝色呼吸光 pulse
- 告警: 红色低频闪烁

## 关键功能

### 总览页模块
1. Top指标卡片（7个）: 活跃智能体/完成任务/成功率/响应时间/token/成本/告警
2. 趋势图（Tab切换）: token消耗/任务量/响应时间，柱状+折线双轴
3. 环形图（3个）: 实时任务/队列分布/模型占比
4. Agent卡片列表（拟人化）
5. 任务管理简表

### Agent卡片必须包含
- 拟人化头像（渐变/插画风格）
- 状态指示灯（绿/黄/红 + 工作中pulse动画）
- 名称/职责/当前任务/最近产出
- 今日任务数/今日token/总token/响应速度
- hover时浮现「查看详情」按钮

### 右侧控制栏
- 告警中心（红/橙/蓝级别，可折叠）
- 任务队列（当前+排队）
- Cron定时（下次执行时间+状态标签）

## 命令
```bash
# 安装依赖
npm install

# 开发（禁止在ACP中执行，会阻塞）
npm run dev

# 构建
npm run build
```

## 重要约束
- **禁止执行 `npm run dev`** - 会阻塞ACP进程
- 所有数据使用 Mock，不需要后端接口
- 必须支持深色模式（不是简单反色，重新设计）
- 所有图表必须有动画
- 端口使用 5173（如需自定义）
- 使用 `人话` 而非技术术语展示状态
