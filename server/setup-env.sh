#!/bin/bash

echo "🔧 设置 myserver 环境配置..."

# 检查是否已存在 .env 文件
if [ -f ".env" ]; then
    echo "⚠️  .env 文件已存在，是否要覆盖？(y/n)"
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "❌ 取消设置"
        exit 0
    fi
fi

# 获取数据库配置
echo "📝 请输入数据库配置："
echo -n "数据库主机 (默认: localhost): "
read -r db_host
db_host=${db_host:-localhost}

echo -n "数据库端口 (默认: 3306): "
read -r db_port
db_port=${db_port:-3306}

echo -n "数据库用户名 (默认: root): "
read -r db_username
db_username=${db_username:-root}

echo -n "数据库密码: "
read -s db_password
echo

echo -n "主数据库名称 (默认: erp_db): "
read -r db_name
db_name=${db_name:-erp_db}

echo -n "报表数据库名称 (默认: report): "
read -r report_db_name
report_db_name=${report_db_name:-report}

# 创建 .env 文件
cat > .env << EOF
# 数据库配置
DB_HOST=$db_host
DB_PORT=$db_port
DB_USERNAME=$db_username
DB_PASSWORD=$db_password
DB_NAME=$db_name

# 报表数据库配置
REPORT_DB_NAME=$report_db_name

# 应用配置
PORT=3000
NODE_ENV=development

# JWT配置
JWT_SECRET=your-secret-key-$(date +%s)
JWT_EXPIRES_IN=7d
EOF

echo "✅ 环境配置文件已创建: .env"
echo "📋 配置内容："
echo "   - 数据库主机: $db_host"
echo "   - 数据库端口: $db_port"
echo "   - 数据库用户: $db_username"
echo "   - 主数据库名称: $db_name"
echo "   - 报表数据库名称: $report_db_name"
echo "   - 应用端口: 3000"
echo ""
echo "🚀 现在可以运行以下命令启动服务："
echo "   npm run start:dev" 