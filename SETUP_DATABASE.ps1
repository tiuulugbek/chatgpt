# Soundz CRM Database Setup Script

Write-Host "🚀 Soundz CRM Database Setup" -ForegroundColor Green
Write-Host ""

# Database ma'lumotlari
$DATABASE_NAME = "crm_db"
$DATABASE_USER = "postgres"
$DATABASE_PASSWORD = "Bismillah"
$DATABASE_HOST = "localhost"
$DATABASE_PORT = "5432"

Write-Host "📋 Database ma'lumotlari:" -ForegroundColor Cyan
Write-Host "   Database: $DATABASE_NAME"
Write-Host "   User: $DATABASE_USER"
Write-Host "   Host: $DATABASE_HOST:$DATABASE_PORT"
Write-Host ""

# .env faylini tekshirish
$envPath = "apps\backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "⚠️  .env fayli topilmadi. Yaratilmoqda..." -ForegroundColor Yellow
    
    $envContent = @"
# Database
DATABASE_URL="postgresql://postgres:Bismillah@localhost:5432/crm_db?schema=public"

# JWT
JWT_SECRET=soundz-crm-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "✅ .env fayli yaratildi" -ForegroundColor Green
} else {
    Write-Host "✅ .env fayli mavjud" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Dependencies o'rnatilmoqda..." -ForegroundColor Cyan
Write-Host "   Bu biroz vaqt olishi mumkin..." -ForegroundColor Gray

# Dependencies o'rnatish
try {
    pnpm install
    Write-Host "✅ Dependencies o'rnatildi" -ForegroundColor Green
} catch {
    Write-Host "❌ Dependencies o'rnatishda xatolik: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗄️  Database migrate qilinmoqda..." -ForegroundColor Cyan

# Prisma generate
try {
    Write-Host "   Prisma client generate qilinmoqda..." -ForegroundColor Gray
    pnpm db:generate
    Write-Host "✅ Prisma client generate qilindi" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma generate xatolik: $_" -ForegroundColor Red
    exit 1
}

# Prisma migrate
try {
    Write-Host "   Database jadvallar yaratilmoqda..." -ForegroundColor Gray
    pnpm db:migrate
    Write-Host "✅ Database migrate qilindi" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migrate xatolik: $_" -ForegroundColor Red
    Write-Host "   Database mavjudligini va parolni tekshiring" -ForegroundColor Yellow
    exit 1
}

# Prisma seed
Write-Host ""
Write-Host "🌱 Test ma'lumotlar yaratilmoqda..." -ForegroundColor Cyan
try {
    pnpm db:seed
    Write-Host "✅ Test ma'lumotlar yaratildi" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Seed xatolik (bu normal bo'lishi mumkin): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Database setup yakunlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "📧 Test foydalanuvchilar:" -ForegroundColor Cyan
Write-Host "   Super Admin: admin@soundz.uz / admin123"
Write-Host "   Filial Rahbari: manager@soundz.uz / manager123"
Write-Host "   Filial Xodimi: staff@soundz.uz / staff123"
Write-Host ""
Write-Host "🚀 Backend ishga tushirish:" -ForegroundColor Cyan
Write-Host "   cd apps/backend"
Write-Host "   pnpm dev"
Write-Host ""
Write-Host "📚 API Dokumentatsiya: http://localhost:3001/api/docs" -ForegroundColor Cyan


