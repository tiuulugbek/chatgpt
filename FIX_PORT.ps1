# Port 3001 band bo'lganda hal qilish

Write-Host "Port 3001 tekshirilmoqda..." -ForegroundColor Yellow

# Port 3001'da ishlayotgan jarayonni topish
$process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host ""
    Write-Host "Port 3001'da ishlayotgan jarayon topildi!" -ForegroundColor Red
    Write-Host "Jarayon ID: $process" -ForegroundColor Yellow
    
    # Jarayonni to'xtatish
    $confirm = Read-Host "Jarayonni to'xtatishni xohlaysizmi? (y/n)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Stop-Process -Id $process -Force
        Write-Host "Jarayon to'xtatildi!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Endi backend'ni qayta ishga tushiring:" -ForegroundColor Cyan
        Write-Host "cd apps/backend" -ForegroundColor Gray
        Write-Host "pnpm dev" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "Jarayon to'xtatilmadi. Boshqa portdan foydalaning yoki jarayonni qo'lda to'xtating." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Port 3001 bo'sh. Backend'ni ishga tushirish mumkin." -ForegroundColor Green
}

