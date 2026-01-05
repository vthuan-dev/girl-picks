#!/bin/bash

# Script để restart backend service trên VPS
# Usage: ./restart-backend-vps.sh

set -e

echo "🔄 Restarting backend service on VPS..."

# Đường dẫn project trên VPS (thay đổi theo cấu hình của bạn)
PROJECT_DIR="/path/to/girl-pick"

# Kiểm tra xem có dùng Docker Compose không
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo "🐳 Detected Docker Compose setup"
    cd "$PROJECT_DIR"
    
    echo "🛑 Stopping backend container..."
    docker-compose stop backend
    
    echo "🔄 Restarting backend container..."
    docker-compose up -d backend
    
    echo "📊 Checking backend status..."
    docker-compose ps backend
    
    echo "📋 Viewing backend logs (last 50 lines)..."
    docker-compose logs --tail=50 backend
    
    echo ""
    echo "✅ Backend đã được restart!"
    echo "📝 Để xem logs real-time: docker-compose logs -f backend"
    
elif [ -f "/etc/systemd/system/girl-pick-backend.service" ]; then
    echo "⚙️  Detected systemd service"
    
    echo "🔄 Restarting systemd service..."
    sudo systemctl restart girl-pick-backend
    
    echo "📊 Checking service status..."
    sudo systemctl status girl-pick-backend
    
    echo ""
    echo "✅ Backend service đã được restart!"
    echo "📝 Để xem logs: sudo journalctl -u girl-pick-backend -f"
    
elif [ -f "$PROJECT_DIR/backend/package.json" ]; then
    echo "📦 Detected Node.js/NestJS setup"
    cd "$PROJECT_DIR/backend"
    
    # Kiểm tra xem có PM2 không
    if command -v pm2 &> /dev/null; then
        echo "🔄 Restarting with PM2..."
        pm2 restart girl-pick-backend || pm2 start npm --name "girl-pick-backend" -- run start:prod
        
        echo "📊 Checking PM2 status..."
        pm2 status
        
        echo "📋 Viewing PM2 logs..."
        pm2 logs girl-pick-backend --lines 50
        
        echo ""
        echo "✅ Backend đã được restart với PM2!"
        echo "📝 Để xem logs real-time: pm2 logs girl-pick-backend"
    else
        echo "⚠️  PM2 không được cài đặt"
        echo "🔄 Restarting manually..."
        
        # Tìm và kill process cũ
        pkill -f "node.*dist/src/main" || true
        
        # Start lại
        npm run build
        nohup npm run start:prod > backend.log 2>&1 &
        
        echo "✅ Backend đã được restart!"
        echo "📝 Logs được ghi vào: backend.log"
    fi
else
    echo "❌ Không tìm thấy cấu hình backend"
    echo "📝 Vui lòng restart thủ công"
    exit 1
fi

echo ""
echo "🔍 Kiểm tra backend có chạy không:"
echo "   curl http://localhost:3001/health || curl http://localhost:3001/api/health"

