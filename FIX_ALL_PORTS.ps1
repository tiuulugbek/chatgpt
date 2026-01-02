# Barcha band portlarni to'xtatish

Write-Host "Band portlar tekshirilmoqda..." -ForegroundColor Yellow

# Port 3001 (Backend)
Write-Host ""
Write-Host "Port 3001 (Backend) tekshirilmoqda..." -ForegroundColor Cyan
$process3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3001) {
    Write-Host "Port 3001'da jarayon topildi: $process3001" -ForegroundColor Yellow
    Stop-Process -Id $process3001 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3001 to'xtatildi!" -ForegroundColor Green
} else {
    Write-Host "Port 3001 bo'sh" -ForegroundColor Green
}

# Port 3003 (Frontend)
Write-Host ""
Write-Host "Port 3003 (Frontend) tekshirilmoqda..." -ForegroundColor Cyan
$process3003 = Get-NetTCPConnection -LocalPort 3003 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process3003) {
    Write-Host "Port 3003'da jarayon topildi: $process3003" -ForegroundColor Yellow
    Stop-Process -Id $process3003 -Force -ErrorAction SilentlyContinue
    Write-Host "Port 3003 to'xtatildi!" -ForegroundColor Green
} else {
    Write-Host "Port 3003 bo'sh" -ForegroundColor Green
}

Write-Host ""
Write-Host "Barcha portlar tekshirildi!" -ForegroundColor Green
Write-Host ""
Write-Host "Endi backend va frontend'ni ishga tushirishingiz mumkin:" -ForegroundColor Cyan
Write-Host "  Backend: cd apps/backend && pnpm dev" -ForegroundColor Gray
Write-Host "  Frontend: cd apps/frontend && pnpm dev" -ForegroundColor Gray

