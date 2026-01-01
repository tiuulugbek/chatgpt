# Frontend Ishga Tushirish

## Qadamlar

1. **Terminal oching va frontend papkasiga kiring:**
   ```powershell
   cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
   ```

2. **Environment faylini yarating:**
   ```powershell
   Copy-Item .env.local.example .env.local
   ```
   Yoki `.env.local` faylini yarating va quyidagini kiriting:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Frontend'ni ishga tushiring:**
   ```powershell
   pnpm dev
   ```

4. **Browser'da oching:**
   - Frontend: http://localhost:3000
   - Login sahifasi ochiladi

## Test Foydalanuvchilar

- **Super Admin**: admin@soundz.uz / admin123
- **Filial Rahbari**: manager@soundz.uz / manager123
- **Filial Xodimi**: staff@soundz.uz / staff123

## Sahifalar

- `/` - Login sahifasi
- `/dashboard` - Dashboard (statistika)
- `/leads` - Lidlar ro'yxati
- `/deals` - Bitimlar ro'yxati
- `/contacts` - Mijozlar ro'yxati
- `/messages` - Xabarlar ro'yxati
- `/reports` - Hisobotlar

## Muammo bo'lsa

- Backend ishlayotganini tekshiring (http://localhost:3001)
- `.env.local` faylida `NEXT_PUBLIC_API_URL` to'g'ri ekanligini tekshiring
- Port 3000 band bo'lmasligi kerak


