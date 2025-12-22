# Clear Next.js cache and restart
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Stop any running Next.js processes
Write-Host "Stopping Next.js processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Where-Object { 
    $_.Path -like "*girl-pick*" -or $_.CommandLine -like "*next*"
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

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

# Remove webpack cache
if (Test-Path ".next\cache") {
    Remove-Item -Recurse -Force ".next\cache"
    Write-Host "✓ Deleted webpack cache" -ForegroundColor Green
}

# Clear browser cache hint
Write-Host "`n✓ Cache cleared successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host '1. Clear browser cache (Ctrl+Shift+Delete)' -ForegroundColor White
Write-Host '2. Restart dev server: npm run dev' -ForegroundColor White
Write-Host '3. Hard refresh page: Ctrl+Shift+R' -ForegroundColor White

