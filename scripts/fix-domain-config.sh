#!/bin/bash

echo "==> Fixing domain configuration on VPS"
echo ""

APP_DIR=/var/www/girl-pick

# 1. Update frontend .env.production
echo "==> Updating frontend .env.production"
cd "$APP_DIR/frontend"

# Remove any existing .env files that might override
rm -f .env .env.local .env.development

# Create .env.production with domain
cat > .env.production <<'EOF'
NEXT_PUBLIC_API_URL=http://gaigo1.net/api
NEXT_PUBLIC_SITE_URL=http://gaigo1.net
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
EOF

# Verify the file was created correctly
echo "✓ Frontend .env.production updated:"
cat .env.production

# 2. Update backend CORS_ORIGIN in .env.production (if exists)
echo ""
echo "==> Updating backend CORS_ORIGIN"
cd "$APP_DIR"
if [ -f .env.production ]; then
    # Remove old CORS_ORIGIN if exists
    sed -i '/^CORS_ORIGIN=/d' .env.production
    # Add new CORS_ORIGIN
    echo "CORS_ORIGIN=http://gaigo1.net,http://www.gaigo1.net" >> .env.production
    echo "✓ Backend CORS_ORIGIN updated in .env.production"
else
    echo "⚠ .env.production not found, will set via PM2 env"
fi

# 3. Rebuild frontend (NEXT_PUBLIC_* vars are embedded at build time)
echo ""
echo "==> Rebuilding frontend with new domain config"
cd "$APP_DIR/frontend"

# Remove old build cache
rm -rf .next

# Verify env vars before build
echo "Environment variables before build:"
echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-NOT SET}"
echo ""

# Build with explicit env vars
NEXT_PUBLIC_API_URL=http://gaigo1.net/api NEXT_PUBLIC_SITE_URL=http://gaigo1.net npm run build
echo "✓ Frontend rebuilt"

# 4. Restart frontend
echo ""
echo "==> Restarting frontend"
pm2 delete girl-pick-frontend || true
PORT=3000 HOST=0.0.0.0 pm2 start "npm run start" --name girl-pick-frontend --time --env production
echo "✓ Frontend restarted"

# 5. Restart backend with CORS_ORIGIN
echo ""
echo "==> Restarting backend with CORS_ORIGIN"
pm2 delete girl-pick-backend || true
cd "$APP_DIR/backend"
CORS_ORIGIN=http://gaigo1.net,http://www.gaigo1.net pm2 start "npm run start:prod" --name girl-pick-backend --time
echo "✓ Backend restarted with CORS_ORIGIN"

# 6. Save PM2
pm2 save

echo ""
echo "==> Configuration updated successfully!"
echo "Frontend API URL: http://gaigo1.net/api"
echo "Backend CORS Origin: http://gaigo1.net,http://www.gaigo1.net"
echo ""
echo "Please test the website now: http://gaigo1.net"

