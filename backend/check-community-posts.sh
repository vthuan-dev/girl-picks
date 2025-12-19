#!/bin/bash

# Script to check and fix Community Posts on production server

echo "=== Checking Community Posts Setup ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "1. Checking Prisma Client..."
if node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); console.log('CommunityPost' in prisma ? '✓ Prisma Client has CommunityPost model' : '✗ Prisma Client MISSING CommunityPost model');" 2>/dev/null; then
    echo "   Prisma Client check completed"
else
    echo "   ✗ Error checking Prisma Client"
fi

echo ""
echo "2. Checking database table..."
if npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';" 2>/dev/null | grep -q "community_posts"; then
    echo "   ✓ Table community_posts exists"
else
    echo "   ✗ Table community_posts NOT FOUND"
fi

echo ""
echo "3. Checking migration status..."
npx prisma migrate status 2>&1 | tail -5

echo ""
echo "=== Fix Steps ==="
echo ""
echo "If Prisma Client is missing, run:"
echo "  cd /var/www/girl-pick/backend"
echo "  set -a && . .env.production && set +a"
echo "  npx prisma generate"
echo ""
echo "If table is missing, run:"
echo "  npx prisma migrate deploy"
echo ""
echo "Then restart backend:"
echo "  pm2 restart girl-pick-backend"

