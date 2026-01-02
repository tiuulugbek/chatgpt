# Backend'ni ishga tushirish

Write-Host "Backend ishga tushirilmoqda..." -ForegroundColor Green

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Band portlarni to'xtatish
Write-Host ""
Write-Host "Port 3001 tekshirilmoqda..." -ForegroundColor Yellow
$process3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3001) {
    Stop-Process -Id $process3001 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3001 to'xtatildi" -ForegroundColor Green
}

# Backend papkasiga o'tish
Set-Location apps\backend

Write-Host ""
Write-Host "Backend ishga tushirilmoqda..." -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:3001/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "To'xtatish uchun Ctrl+C bosing" -ForegroundColor Gray
Write-Host ""

# Backend'ni ishga tushirish
pnpm dev

