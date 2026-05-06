# 🦞 OpenClaw Agent Cockpit (360安全龙虾驾驶舱)

> OpenClaw 的可视化 AI Agent 监控驾驶舱

## 📸 功能截图

<!-- screenshot: 在此添加驾驶舱截图 -->
<!-- screenshot: 拟人化Agent卡片展示 -->
<!-- screenshot: 实时数据可视化图表 -->

## ✨ 项目介绍

OpenClaw Agent Cockpit 是一个专为 AI Agent 设计的可视化监控与调度平台，提供实时状态监控、任务管理、资源用量分析等核心功能。

### 核心特性

- 🎨 **现代化UI** - 采用 Next.js 14 + TailwindCSS 构建，支持深色模式
- 📊 **数据可视化** - ECharts 图表展示趋势、分布和实时数据
- 🦞 **拟人化设计** - 6 个拟人化龙虾员工，各有不同职责
- ⚡ **流畅动效** - Framer Motion 动画 + CountUp 数字滚动
- 📱 **响应式布局** - 三栏布局适配不同屏幕尺寸
- 🎯 **完整功能** - 总览、资源用量、员工管理、记忆库、文档、任务、设置

## 📋 前置要求

- **Node.js** >= 18.0.0
- **OpenClaw** 已安装在 `~/.openclaw` 目录
- **npm** 或 **yarn** 包管理器

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd agent-cockpit
```

### 2. 配置环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env 文件，默认会自动探测 OpenClaw 路径
```

### 3. 启动前端

```bash
npm install
npm run dev
```

访问 http://localhost:5173 或 http://localhost:3000

### 4. 启动后端（可选，用于真实数据）

如果不启动后端，前端会自动使用 mock 数据进行演示。

```bash
cd server
npm install
npm run dev
```

后端 API 运行在 http://localhost:3001

## ⚙️ 环境变量配置

### 前端环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `OPENCLAW_ROOT` | `~/.openclaw` | OpenClaw 安装根目录 |
| `OPENCLAW_WORKSPACE` | `~/.openclaw/workspace` | OpenClaw 工作区路径 |
| `NEXT_PUBLIC_API_URL` | (未设置) | 后端 API URL，未设置时使用 mock 数据 |

### 后端环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `OPENCLAW_ROOT` | `~/.openclaw` | OpenClaw 安装根目录 |
| `OPENCLAW_WORKSPACE` | `~/.openclaw/workspace` | OpenClaw 工作区路径 |
| `API_PORT` | `3001` | API 服务器监听端口 |
| `CORS_ORIGIN` | `http://localhost:3000` | 允许的跨域来源 |

## 🏗️ 架构说明

### 前端架构

- **框架**: Next.js 14 (App Router)
- **端口**: 5173 或 3000
- **数据模式**: 自动检测 - 有后端时使用真实数据，否则使用 mock 数据

### 后端架构（可选）

- **框架**: Express + TypeScript
- **端口**: 3001
- **数据源**: 自动从 `~/.openclaw/workspace` 读取 session 日志和配置文件
- **刷新频率**: 每 5 分钟自动刷新缓存

### Mock 模式说明

当未配置 `NEXT_PUBLIC_API_URL` 或后端未启动时，前端自动进入 mock 模式：

- ✅ 所有功能可正常使用
- ✅ 使用预设的演示数据
- ✅ 适合快速体验和开发调试
- ⚠️ 数据不会实时更新

## 🎨 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.3 | React 框架（App Router） |
| TypeScript | 5.4.5 | 类型安全 |
| TailwindCSS | 3.4.3 | 样式框架 |
| ECharts | 5.5.0 | 数据可视化 |
| echarts-for-react | 3.0.2 | React 封装 |
| Framer Motion | 11.1.7 | 动画库 |
| Zustand | 4.5.2 | 状态管理 |
| react-countup | 6.5.3 | 数字动画 |
| lucide-react | 0.379.0 | 图标库 |

## 📁 项目结构

```
agent-cockpit/
├── app/                      # Next.js App Router 页面
│   ├── layout.tsx           # 全局布局（三栏）
│   ├── page.tsx             # 首页（重定向到总览）
│   ├── overview/page.tsx    # 总览页（核心页面）
│   ├── usage/page.tsx       # 资源用量页
│   ├── agents/              # 龙虾员工
│   │   ├── page.tsx         # 员工列表
│   │   └── [id]/page.tsx    # 员工详情
│   ├── memory/page.tsx      # 记忆库
│   ├── docs/page.tsx        # 文档中心
│   ├── tasks/page.tsx       # 任务管理
│   └── settings/page.tsx    # 系统设置
├── components/              # React 组件
│   ├── layout/              # 布局组件
│   ├── charts/              # 图表组件
│   ├── agent/               # Agent 相关
│   └── cards/               # 卡片组件
├── lib/                     # 工具库
│   ├── mock-data.ts         # Mock 数据
│   ├── store.ts             # Zustand 状态管理
│   └── utils.ts             # 工具函数
├── types/
│   └── index.ts             # TypeScript 类型定义
├── server/                  # 后端 API 服务（可选）
│   ├── src/
│   │   ├── index.ts         # Express 入口
│   │   ├── collectors/      # 数据采集器
│   │   ├── routes/          # API 路由
│   │   └── store/           # 内存缓存
│   └── README.md            # 后端文档
└── app/globals.css          # 全局样式
```

## 📊 核心功能

### 总览页 (`/overview`)

**5 大核心模块：**

1. **Top 指标卡片（7个）**
   - 活跃智能体 / 完成任务 / 成功率 / 响应时间
   - Token 消耗 / 今日成本 / 系统告警
   - 每个卡片含：数字滚动 + 变化趋势 + 迷你图表

2. **趋势图（Tab 切换）**
   - Token 消耗趋势（近 30 天）
   - 任务量趋势（近 30 天）
   - 响应时间趋势（近 30 天）
   - 柱状图 + 折线图双轴展示

3. **环形图（3个）**
   - 实时任务分布（成功/失败/进行中）
   - 队列分布（运行中/等待/空闲/异常）
   - 模型占比（Coding/Ultra/Kimi/其他）

4. **Agent 拟人化卡片（6个）**
   - 龙虾小明（全栈开发）、龙虾老王（数据分析）、龙虾小美（UI 设计）
   - 龙虾阿强（运维工程）、龙虾小芳（内容运营）、龙虾大虎（安全专家）
   - 每个卡片：头像+状态灯+当前任务+最近产出+数据统计

5. **任务简表**
   - 当前运行中任务列表
   - 实时进度条展示

### 其他页面

- **资源用量页** (`/usage`) - Token 消耗趋势和效率排行
- **龙虾员工页** (`/agents`) - Agent 列表和详情
- **记忆库页** (`/memory`) - 三栏布局的文件管理
- **文档中心** (`/docs`) - 文档卡片和 FAQ
- **任务管理** (`/tasks`) - Cron 任务和队列管理
- **系统设置** (`/settings`) - 通知、主题、API 配置

## 🛠️ 开发命令

```bash
# 前端开发
npm run dev              # 启动前端开发服务器
npm run build            # 构建生产版本
npm start                # 运行生产版本

# 后端开发
npm run dev:server       # 启动后端开发服务器

# 同时启动前后端
npm run dev:all          # 使用 concurrently 同时启动

# 批量安装依赖
npm run install:all      # 安装前端+后端所有依赖

# 代码检查
npm run lint             # ESLint 检查
```

## 🚢 部署指南

### Vercel 部署（推荐用于前端）

```bash
npm install -g vercel
vercel
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
ENV NEXT_PUBLIC_API_URL=http://api.example.com
EXPOSE 3000
CMD ["npm", "start"]
```

### Systemd 服务（Linux）

前端服务：

```ini
[Unit]
Description=Agent Cockpit Frontend
After=network.target

[Service]
Type=simple
User=openclaw
WorkingDirectory=/opt/agent-cockpit
Environment="NEXT_PUBLIC_API_URL=http://localhost:3001"
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

后端服务详见 `server/README.md`

## 🐛 故障排查

### 前端无法连接后端

- ✅ 检查后端是否启动：`curl http://localhost:3001/health`
- ✅ 检查 `NEXT_PUBLIC_API_URL` 环境变量是否正确
- ✅ 检查 CORS 配置：后端 `CORS_ORIGIN` 应包含前端 URL

### Mock 数据未加载

- ✅ 清除浏览器缓存
- ✅ 检查控制台错误信息
- ✅ 确认 `lib/mock-data.ts` 文件完整

### 后端无法读取数据

- ✅ 验证 `OPENCLAW_WORKSPACE` 路径是否正确
- ✅ 检查 session `.jsonl` 文件是否存在
- ✅ 确认文件读取权限

## 📄 开源协议

MIT License

Copyright (c) 2026 OpenClaw Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 📞 联系方式

- **项目主页**: [GitHub Repository]
- **问题反馈**: [GitHub Issues]
- **OpenClaw**: https://openclaw.ai

---

**构建时间：** 2026-04-30  
**技术栈：** Next.js 14 + TypeScript + TailwindCSS + ECharts  
**作者：** OpenClaw Team 🦞
