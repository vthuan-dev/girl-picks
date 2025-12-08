#!/bin/bash

# Script to upload project to VPS and deploy with Docker

VPS_IP="207.148.78.56"
VPS_USER="root"
SSH_KEY="$HOME/.ssh/id_rsa_vps"
PROJECT_DIR="/var/www/girl-pick"

echo "=========================================="
echo "Uploading project to VPS"
echo "=========================================="
echo ""

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "SSH key not found at $SSH_KEY"
    echo "Please create SSH key or update path in script"
    exit 1
fi

# Create project directory on VPS
echo "Creating project directory on VPS..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $PROJECT_DIR"

# Upload project files (excluding node_modules, .next, dist, etc.)
echo "Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env' \
    --exclude '.env.local' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    ./ $VPS_USER@$VPS_IP:$PROJECT_DIR/

echo ""
echo "Upload complete!"
echo ""
echo "Next steps on VPS:"
echo "  1. SSH into VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
echo "  2. cd $PROJECT_DIR"
echo "  3. cp .env.example .env"
echo "  4. Edit .env with production values"
echo "  5. chmod +x deploy.sh"
echo "  6. ./deploy.sh"

