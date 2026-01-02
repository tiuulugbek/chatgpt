# Login API'ni test qilish

Write-Host "Login API test qilinmoqda..." -ForegroundColor Yellow

$baseUrl = "http://localhost:3001/api"

# Login test
Write-Host ""
Write-Host "Login so'rovi yuborilmoqda..." -ForegroundColor Cyan
Write-Host "Email: admin@soundz.uz" -ForegroundColor Gray
Write-Host "Parol: admin123" -ForegroundColor Gray
Write-Host ""

$body = @{
    email = "admin@soundz.uz"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Muvaffaqiyatli login!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Javob:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    
    if ($response.accessToken) {
        Write-Host ""
        Write-Host "Token topildi: accessToken" -ForegroundColor Green
        Write-Host "Token (birinchi 50 belgi): $($response.accessToken.Substring(0, [Math]::Min(50, $response.accessToken.Length)))..." -ForegroundColor Gray
    } elseif ($response.access_token) {
        Write-Host ""
        Write-Host "Token topildi: access_token" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Token topilmadi!" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "Login xatosi!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Xatolik:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Backend javobi:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
        
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host ""
            Write-Host "Xatolik ma'lumotlari:" -ForegroundColor Yellow
            Write-Host "Message: $($errorJson.message)" -ForegroundColor Red
            Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        } catch {
            Write-Host "JSON parse qilishda xatolik" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Muammo hal qilish:" -ForegroundColor Yellow
    Write-Host "1. Database'da foydalanuvchilar borligini tekshiring:" -ForegroundColor Gray
    Write-Host "   pnpm db:studio" -ForegroundColor Gray
    Write-Host "2. Database'ni qayta seed qiling:" -ForegroundColor Gray
    Write-Host "   node prisma/seed.js" -ForegroundColor Gray
}

