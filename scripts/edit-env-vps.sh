#!/bin/bash

# Script để mở .env file bằng nano trên VPS
# Usage: ./edit-env-vps.sh

# Đường dẫn project trên VPS (thay đổi theo cấu hình của bạn)
PROJECT_DIR="/path/to/girl-pick"
ENV_FILE="$PROJECT_DIR/.env"

# Kiểm tra file .env có tồn tại không
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 File .env không tồn tại, tạo mới từ env.local.example..."
    if [ -f "$PROJECT_DIR/env.local.example" ]; then
        cp "$PROJECT_DIR/env.local.example" "$ENV_FILE"
        echo "✅ Đã tạo file .env mới"
    else
        touch "$ENV_FILE"
        echo "✅ Đã tạo file .env trống"
    fi
fi

# Backup trước khi edit
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo "💾 Đã backup .env tại: $BACKUP_FILE"
echo ""

# Mở nano để edit
echo "📝 Mở nano để edit .env file..."
echo "💡 Sau khi paste xong, nhấn:"
echo "   - Ctrl + O (Save)"
echo "   - Enter (Confirm)"
echo "   - Ctrl + X (Exit)"
echo ""
read -p "Nhấn Enter để tiếp tục..."

nano "$ENV_FILE"

echo ""
echo "✅ Đã lưu .env file!"
echo ""
echo "🔄 Để restart backend, chạy:"
echo "   ./scripts/restart-backend-vps.sh"




