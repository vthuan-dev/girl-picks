# SSH to VPS script
$ip = "207.148.78.56"
$username = "root"
$password = "8c{P-zn{YZTBM*F{"

# Install SSH client if not available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "SSH client not found. Installing OpenSSH Client..."
    Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
}

# Method 1: Using ssh with password (requires sshpass or manual input)
# For Windows, we can use plink (PuTTY) or create a key-based auth

Write-Host "Connecting to VPS..."
Write-Host "IP: $ip"
Write-Host "Username: $username"
Write-Host ""
Write-Host "Note: You may need to enter the password manually"
Write-Host "Password: $password"
Write-Host ""

# Try to connect
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL $username@$ip

