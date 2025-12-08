# PowerShell script to deploy to VPS
$VPS_IP = "207.148.78.56"
$VPS_USER = "root"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_rsa_vps"
$PROJECT_DIR = "/var/www/girl-pick"

Write-Host "=========================================="
Write-Host "Deploying Girl-Pick to VPS"
Write-Host "=========================================="
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "SSH key not found at $SSH_KEY" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed on VPS
Write-Host "Checking Docker on VPS..." -ForegroundColor Yellow
$dockerCheck = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "docker --version 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker not installed on VPS. Installing..." -ForegroundColor Yellow
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && systemctl enable docker && systemctl start docker"
    Write-Host "Docker installed!" -ForegroundColor Green
} else {
    Write-Host "Docker is installed: $dockerCheck" -ForegroundColor Green
}

# Check if Docker Compose is installed
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
$composeCheck = ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "docker compose version 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Compose not found. Installing..." -ForegroundColor Yellow
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "apt-get update && apt-get install -y docker-compose-plugin"
    Write-Host "Docker Compose installed!" -ForegroundColor Green
} else {
    Write-Host "Docker Compose is installed: $composeCheck" -ForegroundColor Green
}

# Create project directory
Write-Host "Creating project directory..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "mkdir -p $PROJECT_DIR"

# Upload project files using SCP (excluding large directories)
Write-Host "Uploading project files..." -ForegroundColor Yellow
Write-Host "This may take a while..." -ForegroundColor Yellow

# Upload backend
Write-Host "Uploading backend..." -ForegroundColor Cyan
scp -i $SSH_KEY -o StrictHostKeyChecking=no -r backend "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null

# Upload frontend
Write-Host "Uploading frontend..." -ForegroundColor Cyan
scp -i $SSH_KEY -o StrictHostKeyChecking=no -r frontend "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null

# Upload Docker files
Write-Host "Uploading Docker configuration..." -ForegroundColor Cyan
scp -i $SSH_KEY -o StrictHostKeyChecking=no docker-compose.yml "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null
scp -i $SSH_KEY -o StrictHostKeyChecking=no docker-compose.prod.yml "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null
scp -i $SSH_KEY -o StrictHostKeyChecking=no deploy.sh "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null
scp -i $SSH_KEY -o StrictHostKeyChecking=no .env.example "$VPS_USER@${VPS_IP}:$PROJECT_DIR/" 2>&1 | Out-Null

Write-Host "Upload complete!" -ForegroundColor Green
Write-Host ""

# Setup .env file if not exists
Write-Host "Setting up environment file..." -ForegroundColor Yellow
ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "cd $PROJECT_DIR && if [ ! -f .env ]; then cp .env.example .env && echo '.env file created from .env.example'; else echo '.env file already exists'; fi"

Write-Host ""
Write-Host "=========================================="
Write-Host "Deployment files uploaded!"
Write-Host "=========================================="
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. SSH into VPS: ssh -i $SSH_KEY $VPS_USER@$VPS_IP"
Write-Host "  2. cd $PROJECT_DIR"
Write-Host "  3. Edit .env file with production values: nano .env"
Write-Host "  4. Make deploy script executable: chmod +x deploy.sh"
Write-Host "  5. Run deployment: ./deploy.sh"
Write-Host ""
Write-Host "Or run deployment automatically now? (y/n)" -ForegroundColor Cyan
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "Running deployment..." -ForegroundColor Yellow
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "cd $PROJECT_DIR && chmod +x deploy.sh && ./deploy.sh"
}

