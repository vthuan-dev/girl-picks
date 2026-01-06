#!/bin/bash

# Script để update .env file trên VPS
# Usage: ./update-env-vps.sh

set -e

echo "🔧 Updating .env file on VPS..."

# Đường dẫn project trên VPS (thay đổi theo cấu hình của bạn)
PROJECT_DIR="/path/to/girl-pick"
ENV_FILE="$PROJECT_DIR/.env"

# Kiểm tra file .env có tồn tại không
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env không tồn tại tại: $ENV_FILE"
    echo "📝 Tạo file .env mới từ env.local.example..."
    cp "$PROJECT_DIR/env.local.example" "$ENV_FILE"
    echo "✅ Đã tạo file .env mới"
fi

# Backup file .env hiện tại
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo "💾 Đã backup .env tại: $BACKUP_FILE"

# Nếu có file .env.local từ local, copy lên
if [ -f ".env.local" ]; then
    echo "📤 Copy .env.local từ local lên VPS..."
    scp .env.local user@your-vps-ip:$ENV_FILE
    echo "✅ Đã copy .env.local lên VPS"
else
    echo "⚠️  Không tìm thấy .env.local trong thư mục hiện tại"
    echo "📝 Vui lòng chỉnh sửa file .env trên VPS thủ công:"
    echo "   nano $ENV_FILE"
fi

echo ""
echo "✅ Hoàn tất! Vui lòng restart backend service:"
echo "   ./scripts/restart-backend-vps.sh"



