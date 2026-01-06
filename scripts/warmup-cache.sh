#!/bin/bash
# Warmup script - Run after deployment to populate cache

BASE_URL="${1:-https://gaigo1.net}"

echo "🔥 Starting cache warmup for $BASE_URL"

# Warmup homepage
echo "  → Warming up homepage..."
curl -s -o /dev/null "$BASE_URL/"

# Warmup girls list (first 3 pages)
echo "  → Warming up girls list..."
for page in 1 2 3; do
  curl -s -o /dev/null "$BASE_URL/girls?page=$page"
  sleep 0.5
done

# Warmup API endpoints
echo "  → Warming up API..."
curl -s -o /dev/null "$BASE_URL/api/girls?page=1&limit=20"
curl -s -o /dev/null "$BASE_URL/api/girls?page=2&limit=20"
curl -s -o /dev/null "$BASE_URL/api/girls?page=3&limit=20"

# Get top 10 girls and warmup their detail pages
echo "  → Warming up top detail pages..."
GIRLS=$(curl -s "$BASE_URL/api/girls?page=1&limit=10" | grep -oP '"slug":"[^"]+' | head -10 | cut -d'"' -f4)

for slug in $GIRLS; do
  curl -s -o /dev/null "$BASE_URL/girls/$slug"
  sleep 0.3
done

echo "✅ Cache warmup complete!"
