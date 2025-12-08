#!/bin/bash

set -e

APP_DIR=/var/www/girl-pick

echo "=== UPDATE CODE FROM GITHUB ==="

cd "$APP_DIR"

# Pull latest code
echo "Pulling latest code..."
git pull origin master

# Load environment variables
if [ -f ".env.production" ]; then
    set -a
    source .env.production
    set +a
fi

# Rebuild backend
echo "Rebuilding backend..."
cd "$APP_DIR/backend"
npm ci
npx prisma migrate deploy
npm run build
pm2 restart girl-pick-backend

# Rebuild frontend
echo "Rebuilding frontend..."
cd "$APP_DIR/frontend"
npm ci
npm run build
pm2 restart girl-pick-frontend

echo "=== UPDATE COMPLETE ==="
pm2 list

