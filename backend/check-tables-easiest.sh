#!/bin/bash

# Easiest way to check tables - using Prisma Studio or direct query

echo "=== Checking Community Posts Tables (Easiest Method) ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "Method 1: Using Prisma Client (if generated)..."
echo ""

# Try to use Prisma Client to check
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SHOW TABLES LIKE 'community_posts'\`.then(result => {
  if (result && result.length > 0) {
    console.log('✅ Table community_posts EXISTS');
    console.log(result);
  } else {
    console.log('❌ Table community_posts NOT FOUND');
  }
  prisma.\$disconnect();
}).catch(err => {
  console.log('Error:', err.message);
  prisma.\$disconnect();
});
" 2>&1 | grep -v "Loaded Prisma" || echo "Prisma Client check failed"

echo ""
echo "Method 2: Check via backend API (if running)..."
echo "Try accessing: https://gaigo1.net/api/admin/community-posts?status=PENDING&page=1&limit=1"
echo "If it returns 200 OK, table exists. If 500 error, table doesn't exist."

echo ""
echo "=== Check Complete ==="

