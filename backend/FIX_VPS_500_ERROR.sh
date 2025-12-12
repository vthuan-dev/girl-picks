#!/bin/bash

# Script để fix lỗi 500 trên VPS
# Chạy script này trên VPS để regenerate Prisma Client và restart backend

set -e

APP_DIR=/var/www/girl-pick

echo "==> Fixing 500 error on VPS"
echo ""

cd "$APP_DIR/backend"

echo "Step 1: Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Checking migration status..."
npx prisma migrate status

echo ""
echo "Step 3: Restarting backend..."
pm2 restart girl-pick-backend

echo ""
echo "Step 4: Waiting for backend to start..."
sleep 3

if pm2 list | grep -q "girl-pick-backend.*online"; then
  echo "✓ Backend restarted successfully"
  echo ""
  echo "Step 5: Checking backend logs (last 20 lines)..."
  pm2 logs girl-pick-backend --lines 20 --nostream
else
  echo "✗ Backend failed to start!"
  echo "Checking logs..."
  pm2 logs girl-pick-backend --lines 50 --nostream
  exit 1
fi

echo ""
echo "✅ Fix completed!"
echo ""
echo "Test the API:"
echo "curl https://gaigo1.net/api/chat-sex?page=1&limit=12&isActive=true"

