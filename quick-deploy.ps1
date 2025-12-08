# Quick Deploy Script - Chạy từ máy Windows
# Usage: .\quick-deploy.ps1

$VPS_IP = "207.148.78.56"
$VPS_USER = "root"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_rsa_vps"
$REMOTE_DIR = "/var/www/girl-pick"
$LOCAL_DIR = "D:\Project\girl-pick"

Write-Host "🚀 Starting deployment to VPS..." -ForegroundColor Cyan

# Sync code to VPS (excluding node_modules, .git, etc.)
Write-Host "📤 Uploading code to VPS..." -ForegroundColor Yellow
rsync -avz --progress --delete `
    --exclude 'node_modules' `
    --exclude '.git' `
    --exclude '.next' `
    --exclude 'dist' `
    --exclude '*.log' `
    --exclude '.env.local' `
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" `
    "$LOCAL_DIR/" "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"

# Run deploy script on VPS
Write-Host "🔧 Running deploy on VPS..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "cd $REMOTE_DIR && chmod +x deploy-vps.sh && ./deploy-vps.sh"

Write-Host "✅ Deployment complete!" -ForegroundColor Green