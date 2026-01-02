# Login Muammosini Hal Qilish Scripti

Write-Host "Login muammosini hal qilish..." -ForegroundColor Green

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Database seed qilish
Write-Host ""
Write-Host "Database seed qilinmoqda..." -ForegroundColor Yellow
pnpm db:seed

Write-Host ""
Write-Host "Seed yakunlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Endi quyidagi ma'lumotlar bilan login qiling:" -ForegroundColor Cyan
Write-Host "Email: admin@soundz.uz" -ForegroundColor White
Write-Host "Parol: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Agar muammo davom etsa, backend'ni qayta ishga tushiring:" -ForegroundColor Yellow
Write-Host "cd apps/backend" -ForegroundColor Gray
Write-Host "pnpm dev" -ForegroundColor Gray

