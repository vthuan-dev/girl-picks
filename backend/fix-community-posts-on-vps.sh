#!/bin/bash

# Script to fix community_posts table on production VPS
# Run this directly on VPS via SSH

set -e

echo "=== Fixing Community Posts Migration ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "1. Checking current migration status..."
npx prisma migrate status

echo ""
echo "2. Checking if tables exist..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';" || echo "Table does not exist"

echo ""
echo "3. Attempting to create tables using Prisma DB Push..."
npx prisma db push --accept-data-loss --skip-generate

echo ""
echo "4. Generating Prisma Client..."
npx prisma generate

echo ""
echo "5. Verifying tables were created..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';"

echo ""
echo "6. Marking migration as applied (if needed)..."
npx prisma migrate resolve --applied 20250119000000_add_community_posts 2>/dev/null || echo "Migration already marked or not found"

echo ""
echo "7. Restarting backend..."
cd /var/www/girl-pick
pm2 restart girl-pick-backend

echo ""
echo "=== Fix Complete ==="
echo "Check backend logs: pm2 logs girl-pick-backend --lines 50"

