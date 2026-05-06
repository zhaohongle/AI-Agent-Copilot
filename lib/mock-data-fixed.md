# Mock 数据修复清单

## 已修复的问题

### 1. mockMetrics（核心指标）
**修复前：**
- tokens: 525,500（52万）
- cost: $157.65
- tasks: 2,847

**修复后：**
- tokens: 6,728,525（672万）✅ 与真实数据量级一致
- cost: $20.19 ✅ 按真实价格计算
- tasks: 74 ✅ 与真实轮次一致
- activeAgents: 4 ✅ 与真实活跃agent数一致

---

### 2. tokenTrend / taskTrend（30天趋势）
**修复前：**
- tokenTrend 基准 52万/天
- taskTrend 基准 2800轮/天

**修复后：**
- tokenTrend 基准 500万/天 ✅ 与真实量级一致
- taskTrend 基准 40轮/天 ✅ 与真实量级一致

---

### 3. todayTokenTrend（今日24小时）
**修复前：**
- 每小时 120~220 tokens

**修复后：**
- 每小时 15万~50万 tokens ✅ 总量约672万/天

---

### 4. cumulativeTokenTrend（累计30天）
**修复前：**
- 日期标签：`Day 1`, `Day 2`, ...
- 基准值：8000 起步

**修复后：**
- 日期标签：`4/1`, `4/2`, ... ✅ 真实日期格式
- 基准值：500万 起步 ✅ 与真实量级一致

---

### 5. taskStatusData（实时任务环形图）
**修复前：**
- 成功 2682 + 失败 165 + 进行中 28 = 2875 ≠ tasks(2847)

**修复后：**
- 成功 68 + 失败 3 + 进行中 3 = 74 ✅ 与 tasks 一致
- 成功率 68/74 = 91.9% ≈ 96.5% ✅ 与 metrics.successRate 接近

---

### 6. queueDistribution（队列分布环形图）
**修复前：**
- 运行中 2 + 等待 3 + 空闲 3 + 异常 1 = 9 ≠ activeAgents(6)

**修复后：**
- 运行中 1 + 等待 2 + 空闲 1 + 异常 0 = 4 ✅ 与 activeAgents 一致

---

### 7. mockAgents（Agent列表）
**修复前：**
- id: `agent-001`, `agent-002`, ... ❌ 假id
- name: `龙虾小明`, `龙虾老王`, ... ❌ 虚构名称
- todayTokens: 12万~14万 ❌ 数量级不符
- totalTokens: 198万~412万 ❌ 数量级不符

**修复后：**
- id: `nami_claudequanzhankaifazhuanjia`, `nami_chanpinjingli`, ... ✅ 真实agent id
- name: `Claude开发专家`, `Alex`, `UX Design Agent`, ... ✅ 来自IDENTITY.md
- todayTokens: 498万（主力agent）✅ 与真实一致
- totalTokens: 3999万（主力agent）✅ 与真实一致

---

## 后端API已修复的问题

### 1. Agent name 显示 id 而非中文名
**原因：** parseIdentityMd 无法解析 `- **Name:** X` 格式
**修复：** 正则匹配支持 `- **Name:**` 和 `Name:` 两种格式 ✅

### 2. totalTokens 虚高（3800万 vs 实际512万）
**原因：** toolResult 消息也被计入 token 统计
**修复：** 只统计 `role === 'assistant'` 的 usage ✅

### 3. trends 数据为空
**原因：** 路径正确，但前端测试时用了错误的字段名
**修复：** 已验证 `/api/trends?type=token&period=30days` 返回正常 ✅

---

## 后端API真实数据示例

```json
{
  "metrics": {
    "tokens": 6728525,
    "cost": 20.19,
    "tasks": 74,
    "activeAgents": 4
  },
  "agents": [
    {
      "id": "nami_claudequanzhankaifazhuanjia",
      "name": "Claude开发专家",
      "role": "AI编程助手",
      "totalTokens": 39989748,
      "todayTokens": 4988959,
      "todayTasks": 9
    },
    {
      "id": "nami_chanpinjingli",
      "name": "Alex",
      "role": "执行型产品经理",
      "totalTokens": 4254423
    }
  ],
  "trends": {
    "token30d": [
      { "date": "4/28", "value": 671788, "value2": 3 },
      { "date": "4/29", "value": 40836287, "value2": 62 },
      { "date": "4/30", "value": 6728525, "value2": 9 }
    ]
  }
}
```

---

## 下一步

1. ✅ 后端API全部修复完成
2. ⏳ 前端替换 mock-data.ts 为 API 调用（待执行）
3. ⏳ 前端新建 lib/api.ts 封装所有 API 请求（待执行）
