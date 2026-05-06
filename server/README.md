# Agent Cockpit - Backend API Server

Node.js backend service for the Agent Cockpit monitoring platform. Provides real-time data collection and API endpoints for agent metrics, sessions, tasks, and configuration management.

## Features

- **Session Analytics**: Collects and analyzes OpenClaw session JSONL files
- **Agent Monitoring**: Tracks agent status, token consumption, and task completion
- **Real-time Alerts**: Rule-based alerting system for anomalies and failures
- **File Watching**: Monitors agent configuration and memory files
- **Cron Job Integration**: Reads and displays scheduled tasks
- **Auto-refresh**: In-memory cache updated every 5 minutes

## Quick Start

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

All variables are optional with sensible defaults:

```bash
# OpenClaw workspace root directory
OPENCLAW_WORKSPACE=/home/nami/.openclaw/workspace/agents/nami_claudequanzhankaifazhuanjia

# API server port
API_PORT=3001

# CORS allowed origin (frontend URL)
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Core Metrics

#### `GET /api/metrics`
Returns dashboard top-level metrics.

**Response:**
```json
{
  "activeAgents": 3,
  "activeSessions": 3,
  "tasks": 128,
  "successRate": 94.5,
  "latency": 185,
  "tokens": 45000,
  "cost": 0.14,
  "alerts": 2
}
```

### Agents

#### `GET /api/agents`
List all agents with status and stats.

#### `GET /api/agents/:id`
Get detailed agent information.

**Response:**
```json
{
  "id": "agent_001",
  "name": "Claude全栈开发专家",
  "status": "online",
  "state": "working",
  "todayTasks": 15,
  "todayTokens": 8500,
  "totalTokens": 125000,
  "latency": 180,
  ...
}
```

### Trends

#### `GET /api/trends?type=token|task|latency&period=today|7days|30days`
Get time-series trend data.

**Response:**
```json
{
  "data": [
    { "date": "04/30", "value": 12345, "value2": 45 },
    ...
  ]
}
```

### Alerts

#### `GET /api/alerts`
Get active alerts from rule engine.

**Response:**
```json
[
  {
    "id": "alert_1",
    "level": "warning",
    "message": "Token消耗异常增长",
    "time": "2026-04-30T08:30:00Z",
    "agentId": "agent_001"
  }
]
```

### Tasks

#### `GET /api/tasks`
Get recent task queue (last 20 tasks).

**Response:**
```json
[
  {
    "id": "task_1",
    "name": "实现用户认证功能",
    "status": "running",
    "agentId": "agent_001",
    "agentName": "Claude全栈开发专家",
    "progress": 60,
    "startTime": "2026-04-30T08:00:00Z"
  }
]
```

### Cron Jobs

#### `GET /api/cron`
Get scheduled cron jobs.

**Response:**
```json
[
  {
    "id": "cron_1",
    "name": "Daily Backup",
    "schedule": "0 2 * * *",
    "nextRun": "2026-05-01T02:00:00Z",
    "status": "active"
  }
]
```

### Memory Files

#### `GET /api/memory`
List all agent memory files.

#### `GET /api/memory/:agentId/:filename`
Get full content of a memory file.

### Configuration Documents

#### `GET /api/docs`
List all agent configuration files (IDENTITY.md, SOUL.md, etc.).

#### `GET /api/docs/:agentId/:filename`
Get full content of a configuration file.

#### `PATCH /api/docs/:agentId/:filename`
Update a configuration file.

**Request body:**
```json
{
  "content": "New content..."
}
```

## Architecture

### Data Flow

```
Session JSONL Files → sessionCollector → statsStore → API Routes → Frontend
Agent Configs       → fileWatcher     ↗
Cron Data          → cronCollector   ↗
```

### Collectors

- **sessionCollector**: Scans all `.jsonl` files, calculates tokens, tasks, trends
- **fileWatcher**: Reads agent directories for config and memory files
- **cronCollector**: Reads cron jobs from CLI or fallback JSON files

### Stats Store

In-memory cache refreshed every 5 minutes:
- Aggregates data from all collectors
- Generates alerts using rule engine
- Pre-computes trends and distributions

### Alert Rules

1. **Token Anomaly**: Today's tokens > yesterday's × 1.5 → warning
2. **High Failure Rate**: Agent fails > 30% of last 10 tasks → error
3. **Long Idle**: Agent online but no activity for 2+ hours → warning
4. **Disk Usage**: Workspace size > 1GB → info

## File Structure

```
server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Express app entry
│   ├── types.ts              # Shared TypeScript types
│   ├── collectors/
│   │   ├── sessionCollector.ts
│   │   ├── fileWatcher.ts
│   │   └── cronCollector.ts
│   ├── routes/
│   │   ├── metrics.ts
│   │   ├── agents.ts
│   │   ├── trends.ts
│   │   ├── alerts.ts
│   │   ├── tasks.ts
│   │   ├── cron.ts
│   │   ├── memory.ts
│   │   └── docs.ts
│   └── store/
│       └── statsStore.ts     # In-memory cache
└── README.md
```

## 开源化说明 (Open Source Configuration)

To adapt this server for different OpenClaw installations:

1. **Set Workspace Path**: Export `OPENCLAW_WORKSPACE` environment variable:
   ```bash
   export OPENCLAW_WORKSPACE=/path/to/your/workspace
   npm run dev
   ```

2. **Custom Port**: Set `API_PORT` for non-default port:
   ```bash
   export API_PORT=4000
   npm run dev
   ```

3. **CORS Configuration**: Update `CORS_ORIGIN` to match your frontend URL:
   ```bash
   export CORS_ORIGIN=http://your-frontend-domain.com
   npm run dev
   ```

4. **Docker Deployment**:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   RUN npm run build
   ENV OPENCLAW_WORKSPACE=/workspace
   ENV API_PORT=3001
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

5. **Systemd Service** (Linux):
   ```ini
   [Unit]
   Description=Agent Cockpit API
   After=network.target
   
   [Service]
   Type=simple
   User=openclaw
   WorkingDirectory=/opt/agent-cockpit/server
   Environment="OPENCLAW_WORKSPACE=/home/openclaw/.openclaw/workspace"
   Environment="API_PORT=3001"
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   ```

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Testing Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get metrics
curl http://localhost:3001/api/metrics

# Get agents
curl http://localhost:3001/api/agents

# Get trends
curl "http://localhost:3001/api/trends?type=token&period=7days"
```

## Troubleshooting

### No Session Data

- Verify `OPENCLAW_WORKSPACE` points to correct directory
- Check that session `.jsonl` files exist in `sessions/` or `agents/*/sessions/`
- Ensure read permissions on session files

### Cron Jobs Not Showing

- Try running `openclaw cron list --json` manually
- Check fallback paths: `/home/nami/.openclaw/data/cron.json`, `/home/nami/.openclaw/cron.json`
- Cron collector gracefully returns empty array if unavailable

### High Memory Usage

- Default refresh interval is 5 minutes
- Consider increasing `REFRESH_INTERVAL` in `src/index.ts` for large workspaces
- Session files are read fully into memory during refresh

## License

MIT (match with frontend license)

## Contributing

1. Keep collectors stateless and side-effect free
2. All file reads must handle errors gracefully (no throws)
3. Use explicit types from `src/types.ts`
4. Follow existing naming conventions (camelCase, no abbreviations)
5. Test with both empty and populated workspaces

## 开源化说明

本服务通过环境变量适配任意 OpenClaw 安装路径：

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| OPENCLAW_ROOT | ~/.openclaw | OpenClaw 安装根目录 |
| OPENCLAW_WORKSPACE | ~/.openclaw/workspace | Workspace 路径 |
| API_PORT | 3001 | API 监听端口 |
| CORS_ORIGIN | http://localhost:3000 | 允许的跨域来源 |

默认值通过 `process.env.HOME` 自动推断，无需额外配置即可运行。

### 快速适配步骤

1. **克隆项目后直接运行**（使用默认路径）
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **自定义工作区路径**
   ```bash
   export OPENCLAW_WORKSPACE=/custom/path/to/workspace
   npm run dev
   ```

3. **使用 .env 文件**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，取消注释并修改需要的变量
   npm run dev
   ```

4. **Docker 部署**
   ```bash
   docker build -t agent-cockpit-api .
   docker run -p 3001:3001 \
     -e OPENCLAW_WORKSPACE=/workspace \
     -v /path/to/openclaw:/workspace \
     agent-cockpit-api
   ```

### 自动探测机制

服务启动时会按以下顺序查找 OpenClaw 安装：

1. 环境变量 `OPENCLAW_ROOT`
2. 环境变量 `OPENCLAW_WORKSPACE`
3. `$HOME/.openclaw` （默认安装路径）
4. 如果以上都不存在，将使用 mock 数据模式

这确保了在任何环境下都能正常启动服务。

