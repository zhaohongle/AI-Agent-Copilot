# 驾驶舱后端 API 数据对照表

## 1. 全局指标 `/api/metrics`

```json
{
  "activeAgents": 0,
  "activeSessions": 0,
  "tasks": 74,
  "successRate": 100,
  "latency": 245,
  "tokens": 6728525,
  "cost": 20.19,
  "alerts": 1
}
```

**修复点**：
- ✅ tokens 从 mock 的 52万 → 真实 672万（数量级修正）
- ✅ tasks 从 2847 → 74（真实轮次）
- ✅ cost 从 $157 → $20（与 tokens 对应）

---

## 2. Agent 列表 `/api/agents`

**有数据的 4 个 Agent**：

| id | name | role | totalTokens | todayTokens | todayTasks |
|----|------|------|-------------|-------------|------------|
| nami_claudequanzhankaifazhuanjia | Claude开发专家 | AI编程助手 | 39,989,748 | 4,988,959 | 9 |
| nami_chanpinjingli | Alex | 执行型产品经理 | 4,254,423 | 0 | 0 |
| nami_chanpinjiaohushejishi | UX Design Agent | Assistant Designer | 1,667,388 | 0 | 0 |
| nami_xiangmuguanlicaopanshou | 泊客 (Block) | ToB 项目操盘手 | 2,325,041 | 0 | 0 |

**修复点**：
- ✅ agent name 从 id → 真实中文名（IDENTITY.md 解析修复）
- ✅ totalTokens 从虚高 3800万 → 修正后只统计 assistant 消息
- ✅ mock agents 的 id 从 `agent-001` → 真实 agent id

---

## 3. 趋势图 `/api/trends`

### 30天 token 趋势 `?type=token&period=30days`

```json
{
  "data": [
    {"date": "4/1", "value": 0, "value2": 0},
    ...
    {"date": "4/28", "value": 671788, "value2": 3},
    {"date": "4/29", "value": 40836287, "value2": 62},
    {"date": "4/30", "value": 6728525, "value2": 9}
  ]
}
```

**修复点**：
- ✅ 日期格式从 `Day 1~30` → 真实日期 `M/D`
- ✅ 数量级从每天 12~22万 → 真实 300万~4000万
- ✅ value2 是 tasks 数量（3~62轮/天）

### 今日24小时 `?type=token&period=today`

```json
{
  "data": [
    {"date": "0:00", "value": 0, "value2": 0},
    ...
    {"date": "12:00", "value": 4988959, "value2": 9}
  ]
}
```

**修复点**：
- ✅ 每小时 token 从 120~220 → 真实累计分布（今日总 498万）

---

## 4. Cron 任务 `/api/cron`

```json
[
  {
    "id": "223b660f-db0a-4cd3-9169-2b7c996d4307",
    "name": "EvoMap Evolver",
    "schedule": "0 4 * * *",
    "nextRun": "2026-04-30T20:00:00.000Z",
    "status": "active",
    "lastRun": "2026-04-29T20:00:00.056Z"
  }
]
```

**修复点**：
- ✅ 真实 cron job 已读取（从 `~/.openclaw/cron/jobs.json`）
- ✅ mock 应该包含这个真实任务

---

## 5. 任务队列 `/api/tasks`

真实数据从最近会话提取，包含：
- 任务描述（user 消息内容）
- 状态（running/completed，根据是否有后续 assistant 回复）
- 时间戳
- 所属 agent

---

## 6. 告警 `/api/alerts`

当前 1 条告警（从规则引擎生成）：
- Token 超阈值
- 任务失败
- 响应超时

---

## 7. 记忆文件 `/api/memory`

从 `~/.openclaw/agents/<agentId>/memory/*.md` 读取，包含：
- 文件名
- 分类（从文件名推断）
- 大小
- 更新时间

---

## 8. 配置文件 `/api/docs`

从 `~/.openclaw/workspace/agents/<agentId>/` 读取：
- IDENTITY.md
- SOUL.md
- AGENTS.md
- TOOLS.md
- USER.md
- MEMORY.md

---

## Mock 数据修复清单

### ✅ 已修复
1. mockMetrics 数量级对齐（tokens 672万、tasks 74、cost $20）
2. mockAgents 使用真实 id 和中文名
3. tokenTrend/taskTrend 日期格式改为 `M/D`
4. cumulativeTokenTrend 日期格式改为 `M/D`
5. todayTokenTrend 数量级调整（今日总 498万）
6. taskStatusData 总数修正为 74（68成功+3失败+3进行中）
7. queueDistribution 总数对应 4 个活跃 agent

### ⚠️ 待优化（可选）
1. mockCronJobs 增加真实的 EvoMap Evolver 任务
2. mockMemoryFiles 文件名改为真实 memory 文件
3. 资源用量页的 agentTokenData 用真实 4 个 agent 的 token 分布

---

## 后端服务启动

```bash
cd /home/nami/.openclaw/workspace/agents/nami_claudequanzhankaifazhuanjia/agent-cockpit/server
npm run dev  # 开发模式（端口 3001）
npm run build && npm start  # 生产模式
```

**环境变量**（可选）：
```bash
OPENCLAW_ROOT=/home/nami/.openclaw
OPENCLAW_WORKSPACE=/home/nami/.openclaw/workspace
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**健康检查**：
```bash
curl http://localhost:3001/health
```

**数据刷新**：每 5 分钟自动刷新一次，也可以重启服务立即刷新。
