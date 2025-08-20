#!/bin/bash

echo "正在启动 QA 系统..."

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "项目根目录: $SCRIPT_DIR"

# 检查目录是否存在
if [ ! -d "$SCRIPT_DIR/server" ]; then
    echo "错误: server 目录不存在"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/app" ]; then
    echo "错误: app 目录不存在"
    exit 1
fi

# 启动 NestJS 后端
echo "启动 NestJS 后端服务..."
cd "$SCRIPT_DIR/server"
npm run start:dev &
NESTJS_PID=$!

# 等待几秒钟让后端启动
sleep 5

# 启动前端
echo "启动前端服务..."
cd "$SCRIPT_DIR/app"
npm run start:dev &
FRONTEND_PID=$!

echo "系统启动完成!"
echo "后端服务: http://localhost:3000"
echo "前端服务: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait

# 清理进程
kill $NESTJS_PID $FRONTEND_PID 2>/dev/null
echo "所有服务已停止"
