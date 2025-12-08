# Script to fix Prisma EPERM error by stopping processes that might lock files

Write-Host "Checking for running Node processes..." -ForegroundColor Cyan

# Find Node processes related to this project
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*girl-pick*" -or 
    $_.CommandLine -like "*nest*" -or
    $_.CommandLine -like "*backend*"
}

if ($nodeProcesses) {
    Write-Host "Found Node processes that might lock Prisma files:" -ForegroundColor Yellow
    $nodeProcesses | Format-Table Id, ProcessName, Path -AutoSize
    
    $response = Read-Host "Do you want to stop these processes? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        foreach ($proc in $nodeProcesses) {
            Write-Host "Stopping process $($proc.Id)..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Processes stopped. Waiting 2 seconds..." -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
} else {
    Write-Host "No Node processes found." -ForegroundColor Green
}

# Try to remove Prisma client lock files
Write-Host "`nCleaning Prisma client files..." -ForegroundColor Cyan
$prismaClientPath = "node_modules\.prisma\client"

if (Test-Path $prismaClientPath) {
    try {
        # Remove lock files if they exist
        $lockFiles = Get-ChildItem -Path $prismaClientPath -Filter "*.lock" -ErrorAction SilentlyContinue
        if ($lockFiles) {
            $lockFiles | Remove-Item -Force -ErrorAction SilentlyContinue
            Write-Host "Removed lock files." -ForegroundColor Green
        }
        
        # Try to remove query engine files that might be locked
        $engineFiles = Get-ChildItem -Path $prismaClientPath -Filter "*query_engine*" -ErrorAction SilentlyContinue
        if ($engineFiles) {
            Write-Host "Found query engine files. They will be regenerated." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Could not clean Prisma files: $_" -ForegroundColor Red
    }
}

Write-Host "`nNow you can run: npm run import-girls" -ForegroundColor Green

