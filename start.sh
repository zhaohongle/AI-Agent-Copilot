#!/bin/bash
# AI Agent Cockpit 一键启动脚本
# 同时启动后端 API 服务和前端开发服务器

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 启动 AI Agent Cockpit...${NC}"

# 检查依赖
if ! command -v node &> /dev/null; then
  echo "❌ 未找到 node，请先安装 Node.js >= 18"
  exit 1
fi

# 安装依赖（如果 node_modules 不存在）
if [ ! -d "$ROOT/node_modules" ]; then
  echo -e "${YELLOW}📦 安装前端依赖...${NC}"
  cd "$ROOT" && npm install
fi

if [ ! -d "$ROOT/server/node_modules" ]; then
  echo -e "${YELLOW}📦 安装后端依赖...${NC}"
  cd "$ROOT/server" && npm install
fi

# 复制 .env（如果不存在）
if [ ! -f "$ROOT/.env.local" ] && [ -f "$ROOT/.env.example" ]; then
  cp "$ROOT/.env.example" "$ROOT/.env.local"
  echo -e "${YELLOW}📝 已自动生成 .env.local，请按需修改后端地址${NC}"
fi

echo ""
echo -e "${GREEN}▶ 启动后端 API (端口 3001)...${NC}"
cd "$ROOT/server" && npm run dev &
BACKEND_PID=$!

# 等待后端就绪
echo -n "   等待后端启动"
for i in {1..15}; do
  sleep 1
  echo -n "."
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e " ${GREEN}✓${NC}"
    break
  fi
done
echo ""

echo -e "${GREEN}▶ 启动前端 (端口 3000)...${NC}"
cd "$ROOT" && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ 启动成功！${NC}"
echo "   前端地址：http://localhost:3000"
echo "   后端地址：http://localhost:3001"
echo ""
echo "   按 Ctrl+C 停止所有服务"

# 捕获退出信号，清理子进程
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
