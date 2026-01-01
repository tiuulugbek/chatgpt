# Frontend Tezkor Ishga Tushirish

## Port 3003 da ishga tushirish

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
pnpm dev
```

Frontend: **http://localhost:3003**

## Portni O'zgartirish

Agar port band bo'lsa, quyidagilardan birini ishlating:

### Variant 1: package.json'da o'zgartirish
`apps/frontend/package.json` faylida:
```json
"dev": "next dev -p 3004"  // istalgan port
```

### Variant 2: Environment variable
```powershell
$env:PORT=3004; pnpm dev
```

### Variant 3: To'g'ridan-to'g'ri buyruq
```powershell
pnpm next dev -p 3004
```

## Tekshirish

Frontend ochilganini tekshirish:
- Browser'da: http://localhost:3003
- Yoki terminal'da: `curl http://localhost:3003`

## Muammo bo'lsa

1. **Port band bo'lsa:**
   - Boshqa port tanlang (3004, 3005, va hokazo)
   - Yoki band portni to'xtating

2. **Backend ulanmayapti:**
   - Backend ishlayotganini tekshiring: http://localhost:3001/health
   - `.env.local` faylida `NEXT_PUBLIC_API_URL` to'g'ri ekanligini tekshiring

3. **Build xatoliklari:**
   ```powershell
   pnpm install
   pnpm build
   ```

## Test Foydalanuvchilar

- **Super Admin**: admin@soundz.uz / admin123
- **Filial Rahbari**: manager@soundz.uz / manager123
- **Filial Xodimi**: staff@soundz.uz / staff123


