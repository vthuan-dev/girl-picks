# Script to setup slugs: apply migration first, then generate slugs
Write-Host "Setting up slugs for Girls and Posts..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if migration already exists
Write-Host "Step 1: Checking migration status..." -ForegroundColor Yellow
$migrationFiles = Get-ChildItem -Path "prisma\migrations" -Filter "*add_slug*" -ErrorAction SilentlyContinue

if ($migrationFiles) {
    Write-Host "Migration file already exists" -ForegroundColor Green
    Write-Host "Applying existing migration..." -ForegroundColor Yellow
    npx prisma migrate deploy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to apply migration" -ForegroundColor Red
        Write-Host "Try running: npx prisma migrate dev --name add_slug_to_girls_and_posts" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Creating new migration..." -ForegroundColor Yellow
    Write-Host "You will be prompted. Please type 'y' and press Enter when asked." -ForegroundColor Yellow
    Write-Host ""
    npx prisma migrate dev --name add_slug_to_girls_and_posts
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create/apply migration" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Regenerate Prisma Client
Write-Host ""
Write-Host "Step 2: Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to regenerate Prisma Client" -ForegroundColor Red
    exit 1
}

# Step 3: Generate slugs for existing records
Write-Host ""
Write-Host "Step 3: Generating slugs for existing records..." -ForegroundColor Yellow
npm run generate-slugs

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to generate slugs" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All done! Slugs have been added and generated." -ForegroundColor Green
Write-Host "You can now use slug URLs like: /girls/{id}/{slug} or /posts/{id}/{slug}" -ForegroundColor Cyan
