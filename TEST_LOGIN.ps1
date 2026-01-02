# Login'ni test qilish scripti

Write-Host "Login test qilinmoqda..." -ForegroundColor Yellow

$baseUrl = "http://localhost:3001/api"

# Test login
$body = @{
    email = "admin@soundz.uz"
    password = "admin123"
} | ConvertTo-Json

Write-Host ""
Write-Host "Backend'ga so'rov yuborilmoqda..." -ForegroundColor Cyan
Write-Host "URL: $baseUrl/auth/login" -ForegroundColor Gray
Write-Host "Email: admin@soundz.uz" -ForegroundColor Gray
Write-Host "Parol: admin123" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Muvaffaqiyatli login!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Foydalanuvchi ma'lumotlari:" -ForegroundColor Cyan
    $response.user | Format-List
    Write-Host ""
    Write-Host "Access Token:" -ForegroundColor Cyan
    Write-Host $response.accessToken.Substring(0, 50) + "..." -ForegroundColor Gray
    
} catch {
    Write-Host "Xatolik yuz berdi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Xatolik ma'lumotlari:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Javob:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Muammo hal qilish:" -ForegroundColor Yellow
    Write-Host "1. Backend ishlayotganini tekshiring: http://localhost:3001/api/docs" -ForegroundColor Gray
    Write-Host "2. Database seed qiling: pnpm db:seed" -ForegroundColor Gray
    Write-Host "3. Backend'ni qayta ishga tushiring" -ForegroundColor Gray
}

