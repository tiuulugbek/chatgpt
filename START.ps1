# Soundz CRM - Ishga Tushirish Scripti

Write-Host "Soundz CRM ishga tushirilmoqda..." -ForegroundColor Green

# Dependencies tekshirish
Write-Host ""
Write-Host "Dependencies tekshirilmoqda..." -ForegroundColor Yellow
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "pnpm topilmadi! Iltimos, pnpm o'rnating: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Root papkaga o'tish
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Dependencies o'rnatish (agar kerak bo'lsa)
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Dependencies o'rnatilmoqda..." -ForegroundColor Yellow
    pnpm install
}

# Database tekshirish
Write-Host ""
Write-Host "Database tekshirilmoqda..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "Bismillah"
    $dbCheck = psql -U postgres -d crm_db -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Database topilmadi yoki xatolik bor. Iltimos, database'ni yarating." -ForegroundColor Yellow
    } else {
        Write-Host "Database topildi!" -ForegroundColor Green
    }
} catch {
    Write-Host "PostgreSQL tekshirilmadi. Iltimos, PostgreSQL ishlayotganini tekshiring." -ForegroundColor Yellow
}

# Prisma client generate
Write-Host ""
Write-Host "Prisma client generate qilinmoqda..." -ForegroundColor Yellow
pnpm db:generate

# Backend va Frontend'ni parallel ishga tushirish
Write-Host ""
Write-Host "Backend va Frontend ishga tushirilmoqda..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3003" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "To'xtatish uchun Ctrl+C bosing" -ForegroundColor Yellow
Write-Host ""

# Turbo orqali ishga tushirish
pnpm dev
