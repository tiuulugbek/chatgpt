# Frontend Ishga Tushirish Script

Write-Host "🚀 Soundz CRM Frontend Ishga Tushirish" -ForegroundColor Green
Write-Host ""

$frontendPath = "apps\frontend"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend papkasi topilmadi!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Frontend papkasiga o'tilmoqda..." -ForegroundColor Cyan
Set-Location $frontendPath

# .env.local faylini tekshirish
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local fayli topilmadi. Yaratilmoqda..." -ForegroundColor Yellow
    
    $envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ .env.local fayli yaratildi" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 Frontend port 3003 da ishga tushmoqda..." -ForegroundColor Cyan
Write-Host "   Browser'da oching: http://localhost:3003" -ForegroundColor Yellow
Write-Host ""

# Frontend'ni ishga tushirish
pnpm dev


