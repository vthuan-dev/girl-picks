# Script to run commands on VPS via SSH
$ip = "207.148.78.56"
$username = "root"
$password = "8c{P-zn{YZTBM*F{"

Write-Host "Connecting to VPS and running system check..."
Write-Host ""

# Method: Create a temporary script and execute it via SSH
$commands = @"
echo '=== System Information ==='
uname -a
echo ''
echo '=== Disk Usage ==='
df -h
echo ''
echo '=== Memory Usage ==='
free -h
echo ''
echo '=== Current Directory ==='
pwd
echo ''
echo '=== Node.js Version ==='
command -v node >/dev/null 2>&1 && node -v || echo 'Node.js not installed'
echo ''
echo '=== NPM Version ==='
command -v npm >/dev/null 2>&1 && npm -v || echo 'NPM not installed'
echo ''
echo '=== PM2 Status ==='
command -v pm2 >/dev/null 2>&1 && pm2 list || echo 'PM2 not installed'
echo ''
echo '=== Nginx Status ==='
systemctl is-active --quiet nginx && systemctl status nginx --no-pager || echo 'Nginx not installed or not running'
echo ''
echo '=== Git Version ==='
command -v git >/dev/null 2>&1 && git --version || echo 'Git not installed'
echo ''
echo '=== Docker Version ==='
command -v docker >/dev/null 2>&1 && docker --version || echo 'Docker not installed'
"@

# Save commands to a file
$commands | Out-File -FilePath "vps-commands.sh" -Encoding ASCII -NoNewline

Write-Host "Commands saved to vps-commands.sh"
Write-Host ""
Write-Host "To execute on VPS, run:"
Write-Host "ssh root@$ip 'bash -s' < vps-commands.sh"
Write-Host ""
Write-Host "Or copy the content of vps-commands.sh and paste it into your SSH session"

