#!/bin/bash

# Final check - test API directly (easiest and most reliable)

echo "=== Checking Community Posts Table ==="
echo ""

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo "Method 1: Test API Endpoint (Most Reliable)"
echo "-------------------------------------------"
echo "Testing: GET /api/admin/community-posts"
echo ""

# Test API endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json" \
  https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 OK - Table EXISTS and API works!"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ HTTP 500 Error - Table might NOT exist or Prisma Client not generated"
    echo "   Check backend logs: pm2 logs girl-pick-backend --lines 20"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "⚠️  HTTP $HTTP_CODE - Authentication required (but API is reachable)"
    echo "   This means table might exist, but need auth token to verify"
else
    echo "❓ HTTP $HTTP_CODE - Unknown status"
fi

echo ""
echo "Method 2: Check Backend Logs"
echo "-------------------------------------------"
echo "Run: pm2 logs girl-pick-backend --lines 50 | grep -i 'community\|error'"
echo ""

echo "Method 3: Check Prisma Client"
echo "-------------------------------------------"
if node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); console.log('communityPost' in p ? '✅ Prisma Client has communityPost' : '❌ Prisma Client MISSING communityPost');" 2>/dev/null; then
    echo "✅ Prisma Client check completed"
else
    echo "❌ Prisma Client check failed - need to run: npx prisma generate"
fi

echo ""
echo "=== Check Complete ==="
echo ""
echo "If table doesn't exist, run:"
echo "  cd /var/www/girl-pick/backend"
echo "  set -a && . .env.production && set +a"
echo "  npx prisma db push --accept-data-loss"
echo "  npx prisma generate"
echo "  cd /var/www/girl-pick && pm2 restart girl-pick-backend"

