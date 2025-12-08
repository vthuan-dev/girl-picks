# Clear Next.js cache and restart
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Stop any running Next.js processes
Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.MainWindowTitle -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Deleted .next folder" -ForegroundColor Green
} else {
    Write-Host "✓ .next folder not found" -ForegroundColor Green
}

# Remove node_modules cache if exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Deleted node_modules cache" -ForegroundColor Green
}

Write-Host "`nCache cleared! Please restart dev server with: npm run dev" -ForegroundColor Cyan

