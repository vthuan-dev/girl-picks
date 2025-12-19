#!/bin/bash

# Script to check for data loss after db push
# Run this on VPS to verify no data was lost

set -e

echo "=== Checking for Data Loss ==="

cd /var/www/girl-pick/backend || exit 1

# Load environment variables
set -a
. .env.production
set +a

echo ""
echo "1. Checking review_comments table structure..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "DESCRIBE review_comments;" || echo "Table not found"

echo ""
echo "2. Checking review_comments data count..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as total FROM review_comments;" || echo "Error counting"

echo ""
echo "3. Checking if parent_id column exists..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW COLUMNS FROM review_comments LIKE 'parent_id';" || echo "Column not found"

echo ""
echo "4. Checking review_comments with parent_id values..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as with_parent FROM review_comments WHERE parent_id IS NOT NULL;" || echo "Error querying"

echo ""
echo "5. Checking community_posts table exists..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES LIKE 'community_posts';" || echo "Table not found"

echo ""
echo "6. Checking all review_comments records..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT id, reviewId, userId, parentId, LEFT(content, 50) as content_preview, createdAt FROM review_comments LIMIT 10;" || echo "Error querying"

echo ""
echo "=== Data Check Complete ==="

