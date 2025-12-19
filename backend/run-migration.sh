#!/bin/bash

# Script to run migration for community_posts on production server

echo "=== Running Migration for Community Posts ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "1. Checking current migration status..."
npx prisma migrate status

echo ""
echo "2. Running migration deploy..."
npx prisma migrate deploy

echo ""
echo "3. Verifying tables were created..."
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';" || echo "Table check failed"

echo ""
echo "4. Restarting backend..."
cd /var/www/girl-pick
pm2 restart girl-pick-backend

echo ""
echo "=== Migration Complete ==="
echo "Check backend logs: pm2 logs girl-pick-backend --lines 50"

