#!/bin/bash

# Verify if table actually exists by checking backend logs

echo "=== Verifying Community Posts Table ==="
echo ""

echo "1. Checking backend logs for errors..."
echo "-------------------------------------------"
pm2 logs girl-pick-backend --lines 100 --nostream | grep -i "community_posts\|table.*does not exist" | tail -5

echo ""
echo "2. Testing API with actual request..."
echo "-------------------------------------------"
echo "Making request to API endpoint..."

# Try to get actual error message
RESPONSE=$(curl -s https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1 2>&1)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1 2>&1)

echo "HTTP Status: $HTTP_CODE"

if echo "$RESPONSE" | grep -qi "table.*does not exist\|community_posts.*does not exist"; then
    echo "❌ Table DOES NOT EXIST - Error found in response"
    echo ""
    echo "Response preview:"
    echo "$RESPONSE" | head -3
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ API is reachable (auth required) - Table likely EXISTS"
    echo "   (If table didn't exist, would get 500 error)"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ HTTP 500 - Table likely DOES NOT EXIST"
    echo ""
    echo "Full error response:"
    echo "$RESPONSE"
else
    echo "Status: $HTTP_CODE"
    echo "Response: $RESPONSE" | head -5
fi

echo ""
echo "3. Final verification - Check if Prisma can query..."
echo "-------------------------------------------"
cd /var/www/girl-pick/backend
set -a && . .env.production && set +a

# Try to query using Prisma Client directly
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT COUNT(*) as count FROM community_posts\`.then(result => {
  console.log('✅ Table EXISTS - Row count:', result[0]?.count || 0);
  prisma.\$disconnect();
  process.exit(0);
}).catch(err => {
  if (err.message.includes('does not exist') || err.code === 'P2021') {
    console.log('❌ Table DOES NOT EXIST');
  } else {
    console.log('Error:', err.message);
  }
  prisma.\$disconnect();
  process.exit(1);
});
" 2>&1 | grep -v "Loaded Prisma"

echo ""
echo "=== Verification Complete ==="

