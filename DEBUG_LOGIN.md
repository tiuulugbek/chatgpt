# Login Debug Qo'llanmasi

## Backend Ishga Tushgan ✅

Backend muvaffaqiyatli ishga tushdi va barcha route'lar mavjud:
- ✅ `/api/auth/login` - POST
- ✅ `/api/auth/register` - POST  
- ✅ `/api/auth/me` - GET

## Frontend'da Login Qilish

### 1. Frontend'ni ishga tushiring:

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
pnpm dev
```

### 2. Brauzerda oching:

http://localhost:3003

### 3. Login qiling:

- **Email:** admin@soundz.uz
- **Parol:** admin123

## Muammo Bo'lsa

### Browser Console'ni oching (F12)

Va quyidagilarni tekshiring:

1. **Network tab** - Login so'rovini ko'ring
2. **Console tab** - Xatoliklarni ko'ring
3. **Application tab** - localStorage'da `access_token` borligini tekshiring

### Tekshirish

1. **Backend ishlayotganini tekshiring:**
   - http://localhost:3001/api/docs ochilishi kerak

2. **Frontend API URL to'g'ri ekanligini tekshiring:**
   - Browser Console'da: `localStorage.getItem('access_token')`
   - Agar `null` bo'lsa, login ishlamagan

3. **CORS muammosi bo'lishi mumkin:**
   - Backend'da CORS sozlamalari to'g'ri ekanligini tekshiring

## Test Qilish

Backend'ni test qilish:
```powershell
.\TEST_LOGIN_API.ps1
```

Bu script login'ni test qiladi va natijani ko'rsatadi.

