# Port 3001 Band Bo'lganda Hal Qilish

## Muammo
```
Error: listen EADDRINUSE: address already in use :::3001
```

Bu xatolik port 3001 allaqachon ishlatilmoqda degani.

## Yechimlar

### 1-usul: Avtomatik Script (Tavsiya etiladi)

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm
.\FIX_PORT.ps1
```

### 2-usul: Qo'lda To'xtatish

**Windows PowerShell:**
```powershell
# Port 3001'da ishlayotgan jarayonni topish
netstat -ano | findstr :3001

# Jarayon ID'ni ko'ring va to'xtating (masalan, PID 33348)
taskkill /F /PID 33348
```

**Yoki barcha Node.js jarayonlarini to'xtatish:**
```powershell
taskkill /F /IM node.exe
```

### 3-usul: Boshqa Portdan Foydalanish

Agar portni to'xtatib bo'lmasa, backend'ni boshqa portda ishga tushiring:

**apps/backend/src/main.ts** faylida portni o'zgartiring:
```typescript
await app.listen(3002); // 3001 o'rniga 3002
```

Va **apps/frontend/.env.local** faylida:
```
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

## Tekshirish

Port bo'sh ekanligini tekshirish:
```powershell
netstat -ano | findstr :3001
```

Agar hech narsa ko'rinmasa, port bo'sh.

## Keyin

Port bo'shagach, backend'ni qayta ishga tushiring:
```powershell
cd apps/backend
pnpm dev
```

