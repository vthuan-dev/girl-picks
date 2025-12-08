#!/bin/bash
echo "=== System Information ==="
uname -a
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Memory Usage ==="
free -h
echo ""
echo "=== Current Directory ==="
pwd
echo ""
echo "=== Node.js Version (if installed) ==="
node -v 2>/dev/null || echo "Node.js not installed"
echo ""
echo "=== NPM Version (if installed) ==="
npm -v 2>/dev/null || echo "NPM not installed"
echo ""
echo "=== PM2 Status (if installed) ==="
pm2 list 2>/dev/null || echo "PM2 not installed"
echo ""
echo "=== Nginx Status (if installed) ==="
systemctl status nginx --no-pager 2>/dev/null || echo "Nginx not installed"
echo ""
echo "=== Docker Status (if installed) ==="
docker --version 2>/dev/null || echo "Docker not installed"
echo ""
echo "=== Git Version (if installed) ==="
git --version 2>/dev/null || echo "Git not installed"
echo ""
echo "=== Current User ==="
whoami
echo ""
echo "=== Home Directory ==="
ls -la ~ | head -20
