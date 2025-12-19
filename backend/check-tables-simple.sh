#!/bin/bash

# Simple script to check tables using Prisma with schema

echo "=== Checking Community Posts Tables ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "Using Prisma to check tables..."
echo ""

# Check using Prisma db execute with schema
echo "1. Checking community_posts table..."
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SHOW TABLES LIKE 'community_posts';" 2>&1 | grep -i "community_posts" && echo "   ✅ EXISTS" || echo "   ❌ NOT FOUND"

echo ""
echo "2. Checking community_post_likes table..."
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SHOW TABLES LIKE 'community_post_likes';" 2>&1 | grep -i "community_post_likes" && echo "   ✅ EXISTS" || echo "   ❌ NOT FOUND"

echo ""
echo "3. Checking community_post_comments table..."
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SHOW TABLES LIKE 'community_post_comments';" 2>&1 | grep -i "community_post_comments" && echo "   ✅ EXISTS" || echo "   ❌ NOT FOUND"

echo ""
echo "4. Listing all community tables..."
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< "SHOW TABLES LIKE '%community%';" 2>&1 | grep -i "community" || echo "No community tables found"

echo ""
echo "=== Check Complete ==="

