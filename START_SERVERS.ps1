# Backend va Frontend'ni ishga tushirish

Write-Host "Soundz CRM ishga tushirilmoqda..." -ForegroundColor Green

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Band portlarni to'xtatish
Write-Host ""
Write-Host "Band portlar to'xtatilmoqda..." -ForegroundColor Yellow

$process3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3001) {
    Stop-Process -Id $process3001 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3001 to'xtatildi" -ForegroundColor Green
}

$process3003 = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3003) {
    Stop-Process -Id $process3003 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3003 to'xtatildi" -ForegroundColor Green
}

Write-Host ""
Write-Host "Backend va Frontend ishga tushirilmoqda..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3003" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:3001/api/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "To'xtatish uchun Ctrl+C bosing" -ForegroundColor Gray
Write-Host ""

# Kichik kutish (portlar to'xtatilishi uchun)
Start-Sleep -Seconds 2

# Turbo orqali ishga tushirish
pnpm dev

