# Script to apply slug migration and generate slugs
Write-Host "🔄 Applying Prisma migration for slug fields..." -ForegroundColor Cyan

# Step 1: Create and apply migration
Write-Host "`n📦 Step 1: Creating and applying migration..." -ForegroundColor Yellow
Write-Host "⚠️  You will be prompted to confirm. Please type 'y' and press Enter." -ForegroundColor Yellow
npx prisma migrate dev --name add_slug_to_girls_and_posts

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to apply migration" -ForegroundColor Red
    exit 1
}

# Step 3: Regenerate Prisma Client
Write-Host "`n📦 Step 3: Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to regenerate Prisma Client" -ForegroundColor Red
    exit 1
}

# Step 4: Generate slugs for existing records
Write-Host "`n📦 Step 4: Generating slugs for existing records..." -ForegroundColor Yellow
npm run generate-slugs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate slugs" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All done! Slugs have been added and generated." -ForegroundColor Green

