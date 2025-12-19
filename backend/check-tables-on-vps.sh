#!/bin/bash

# Script to check if community_posts tables exist on VPS
# Run this on VPS

set -e

echo "=== Checking Community Posts Tables on VPS ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

# Verify env vars are loaded
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Error: Database environment variables not loaded!"
    echo "DB_USER: ${DB_USER:-NOT SET}"
    echo "DB_NAME: ${DB_NAME:-NOT SET}"
    echo "DB_PASSWORD: ${DB_PASSWORD:+SET (hidden)}"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "   DB_USER: $DB_USER"
echo "   DB_NAME: $DB_NAME"
echo ""

# Extract password from DATABASE_URL if needed
if [ -z "$DB_PASSWORD" ] && [ ! -z "$DATABASE_URL" ]; then
    # Extract password from DATABASE_URL format: mysql://user:password@host:port/db
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
fi

echo "1. Checking community_posts table..."
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE 'community_posts';" 2>/dev/null | grep -q "community_posts"; then
    echo "   ✅ Table 'community_posts' EXISTS"
    echo "   Structure:"
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE community_posts;" 2>/dev/null | head -15
else
    echo "   ❌ Table 'community_posts' NOT FOUND"
fi

echo ""
echo "2. Checking community_post_likes table..."
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE 'community_post_likes';" 2>/dev/null | grep -q "community_post_likes"; then
    echo "   ✅ Table 'community_post_likes' EXISTS"
else
    echo "   ❌ Table 'community_post_likes' NOT FOUND"
fi

echo ""
echo "3. Checking community_post_comments table..."
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE 'community_post_comments';" 2>/dev/null | grep -q "community_post_comments"; then
    echo "   ✅ Table 'community_post_comments' EXISTS"
else
    echo "   ❌ Table 'community_post_comments' NOT FOUND"
fi

echo ""
echo "4. Checking all tables with 'community' in name..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES LIKE '%community%';" 2>/dev/null || echo "Error querying"

echo ""
echo "5. Using Prisma to check (alternative method)..."
npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'community_posts';" 2>&1 | grep -v "Loaded Prisma" || echo "Prisma check completed"

echo ""
echo "=== Check Complete ==="

