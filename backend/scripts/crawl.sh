#!/bin/bash

# Crawler script for gaigu1.net
# Usage:
#   ./crawl.sh                    # Crawl page 1, 60 items
#   ./crawl.sh 1                  # Crawl page 1, 60 items
#   ./crawl.sh 1 60               # Crawl page 1, 60 items
#   ./crawl.sh 1 60 5             # Crawl pages 1 to 5

PAGE=${1:-1}
LIMIT=${2:-60}
END_PAGE=${3:-}

echo "🚀 Starting crawler..."
echo "📄 Page: $PAGE"
echo "📊 Limit: $LIMIT"
if [ ! -z "$END_PAGE" ]; then
  echo "📚 End Page: $END_PAGE"
fi
echo ""

if [ ! -z "$END_PAGE" ]; then
  npm run crawl $PAGE $LIMIT $END_PAGE
else
  npm run crawl $PAGE $LIMIT
fi

