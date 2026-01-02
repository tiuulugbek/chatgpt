# GitHub'ga Push Qilish Script

Write-Host "🚀 GitHub'ga Push Qilish" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  GitHub'ga push qilish uchun Personal Access Token kerak!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Qadamlar:" -ForegroundColor Cyan
Write-Host "1. GitHub → Settings → Developer settings → Personal access tokens"
Write-Host "2. 'Generate new token (classic)' ni bosing"
Write-Host "3. Token nomi: soundz-crm"
Write-Host "4. Scopes: repo ni tanlang"
Write-Host "5. 'Generate token' ni bosing va token'ni nusxalab oling"
Write-Host ""

$token = Read-Host "GitHub Personal Access Token'ni kiriting"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "❌ Token kiritilmadi!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 GitHub'ga push qilinmoqda..." -ForegroundColor Cyan

# Remote URL'ni token bilan o'zgartirish
git remote set-url origin "https://$token@github.com/tiuulugbek/chatgpt.git"

# Push qilish
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Muvaffaqiyatli push qilindi!" -ForegroundColor Green
    Write-Host "🌐 Repository: https://github.com/tiuulugbek/chatgpt" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push qilishda xatolik!" -ForegroundColor Red
    Write-Host "Token'ni tekshiring yoki GIT_PUSH.md faylini ko'ring" -ForegroundColor Yellow
}


