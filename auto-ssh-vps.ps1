# Auto SSH to VPS and run commands
$ip = "207.148.78.56"
$username = "root"
$password = "8c{P-zn{YZTBM*F{"

# Check if plink (PuTTY) is available
$plinkPath = Get-Command plink -ErrorAction SilentlyContinue

if ($plinkPath) {
    Write-Host "Using PuTTY plink..."
    # Using plink with password
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
echo '=== Node.js Version (if installed) ==='
node -v 2>/dev/null || echo 'Node.js not installed'
echo ''
echo '=== NPM Version (if installed) ==='
npm -v 2>/dev/null || echo 'NPM not installed'
echo ''
echo '=== PM2 Status (if installed) ==='
pm2 list 2>/dev/null || echo 'PM2 not installed'
echo ''
echo '=== Nginx Status (if installed) ==='
systemctl status nginx --no-pager 2>/dev/null || echo 'Nginx not installed'
"@
    
    echo $commands | plink -ssh $username@$ip -pw $password
} else {
    Write-Host "PuTTY plink not found. Installing or using alternative method..."
    
    # Try using ssh with expect-like behavior via PowerShell
    # For now, we'll create a script file to run on VPS
    Write-Host "Creating remote script..."
    
    $remoteScript = @"
#!/bin/bash
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
echo '=== Node.js Version (if installed) ==='
node -v 2>/dev/null || echo 'Node.js not installed'
echo ''
echo '=== NPM Version (if installed) ==='
npm -v 2>/dev/null || echo 'NPM not installed'
echo ''
echo '=== PM2 Status (if installed) ==='
pm2 list 2>/dev/null || echo 'PM2 not installed'
echo ''
echo '=== Nginx Status (if installed) ==='
systemctl status nginx --no-pager 2>/dev/null || echo 'Nginx not installed'
"@
    
    $remoteScript | Out-File -FilePath "remote-check.sh" -Encoding ASCII
    
    Write-Host "To run commands on VPS, execute:"
    Write-Host "ssh root@$ip 'bash -s' < remote-check.sh"
    Write-Host ""
    Write-Host "Or manually SSH and run the commands from remote-check.sh"
}

