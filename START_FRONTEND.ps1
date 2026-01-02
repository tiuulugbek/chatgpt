# Frontend'ni ishga tushirish

Write-Host "Frontend ishga tushirilmoqda..." -ForegroundColor Green

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Band portlarni to'xtatish
Write-Host ""
Write-Host "Port 3003 tekshirilmoqda..." -ForegroundColor Yellow
$process3003 = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3003) {
    Stop-Process -Id $process3003 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3003 to'xtatildi" -ForegroundColor Green
}

# Frontend papkasiga o'tish
Set-Location apps\frontend

Write-Host ""
Write-Host "Frontend ishga tushirilmoqda..." -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3003" -ForegroundColor Yellow
Write-Host ""
Write-Host "To'xtatish uchun Ctrl+C bosing" -ForegroundColor Gray
Write-Host ""

# Frontend'ni ishga tushirish
pnpm dev
