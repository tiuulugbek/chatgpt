# Backend'ni test qilish

Write-Host "Backend test qilinmoqda..." -ForegroundColor Yellow

$baseUrl = "http://localhost:3001/api"

# Backend ishlayotganini tekshirish
Write-Host ""
Write-Host "Backend ishlayotganini tekshirish..." -ForegroundColor Cyan
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl" -Method Get -ErrorAction Stop
    Write-Host "Backend ishlayapti!" -ForegroundColor Green
} catch {
    Write-Host "Backend ishlamayapti!" -ForegroundColor Red
    Write-Host "Iltimos, backend'ni ishga tushiring: cd apps/backend && pnpm dev" -ForegroundColor Yellow
    exit 1
}

# Login test
Write-Host ""
Write-Host "Login test qilinmoqda..." -ForegroundColor Cyan
$body = @{
    email = "admin@soundz.uz"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host ""
    Write-Host "Muvaffaqiyatli login!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Javob struktura:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    
    if ($response.accessToken) {
        Write-Host ""
        Write-Host "Token topildi: accessToken" -ForegroundColor Green
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
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Javob:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Red
    }
}

