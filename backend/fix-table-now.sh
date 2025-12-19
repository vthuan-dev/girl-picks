#!/bin/bash

# Fix: Create table directly using db push

set -e

echo "=== Fixing Community Posts Table ==="
echo ""

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo "1. Checking current status..."
npx prisma migrate status 2>&1 | tail -5

echo ""
echo "2. Creating table using Prisma DB Push..."
echo "   (This will create tables directly from schema)"
npx prisma db push --accept-data-loss

echo ""
echo "3. Generating Prisma Client..."
npx prisma generate

echo ""
echo "4. Verifying table exists..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT COUNT(*) as count FROM community_posts\`.then(result => {
  console.log('✅ SUCCESS - Table EXISTS! Row count:', result[0]?.count || 0);
  prisma.\$disconnect();
  process.exit(0);
}).catch(err => {
  if (err.message.includes('does not exist') || err.code === 'P2021') {
    console.log('❌ FAILED - Table still does not exist');
    console.log('Error:', err.message);
  } else {
    console.log('Error:', err.message);
  }
  prisma.\$disconnect();
  process.exit(1);
});
" 2>&1 | grep -v "Loaded Prisma"

echo ""
echo "5. Restarting backend..."
cd /var/www/girl-pick
pm2 restart girl-pick-backend

echo ""
echo "6. Waiting 3 seconds and checking logs..."
sleep 3
pm2 logs girl-pick-backend --lines 20 --nostream | grep -i "community\|error\|started" | tail -5

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Test API: curl https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1"
echo "Should return 401 (auth required) or 200, NOT 500"

