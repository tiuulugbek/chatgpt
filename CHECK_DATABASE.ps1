# Database'ni tekshirish va seed qilish

Write-Host "Database tekshirilmoqda..." -ForegroundColor Yellow

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Prisma client generate
Write-Host ""
Write-Host "Prisma client generate qilinmoqda..." -ForegroundColor Yellow
npx prisma generate --schema=prisma/schema.prisma

# Database seed qilish
Write-Host ""
Write-Host "Database seed qilinmoqda..." -ForegroundColor Yellow
Write-Host "Bu biroz vaqt olishi mumkin..." -ForegroundColor Gray
node prisma/seed.js

Write-Host ""
Write-Host "Database seed yakunlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Test foydalanuvchilar:" -ForegroundColor Cyan
Write-Host "  - admin@soundz.uz / admin123" -ForegroundColor White
Write-Host "  - manager@soundz.uz / manager123" -ForegroundColor White
Write-Host "  - staff@soundz.uz / staff123" -ForegroundColor White
Write-Host ""
Write-Host "Endi backend'ni qayta ishga tushiring va login qiling!" -ForegroundColor Green

