# Soundz CRM - Tezkor Boshlash

## ✅ Database Sozlangan

Database ma'lumotlari:
- **Database**: `crm_db`
- **User**: `postgres`
- **Parol**: `Bismillah`

## 🚀 Birinchi Qadamlar

### 1. Dependencies O'rnatish

```bash
cd C:\Users\AzzaPRO\Desktop\Soundz-crm
pnpm install
```

### 2. Environment Sozlash

`apps/backend/.env` faylini yarating (agar yo'q bo'lsa):

```env
DATABASE_URL="postgresql://postgres:Bismillah@localhost:5432/crm_db?schema=public"
JWT_SECRET=soundz-crm-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Database Migrate

```bash
# Prisma client generate qilish
pnpm db:generate

# Database migrate qilish (jadval yaratish)
pnpm db:migrate

# Test ma'lumotlar yaratish (foydalanuvchilar, filiallar)
pnpm db:seed
```

### 4. Backend Ishga Tushirish

```bash
cd apps/backend
pnpm dev
```

Backend http://localhost:3001 da ishga tushadi.

API Dokumentatsiya: http://localhost:3001/api/docs

## 📧 Test Foydalanuvchilar

Seed script quyidagi foydalanuvchilarni yaratadi:

- **Super Admin**: 
  - Email: `admin@soundz.uz`
  - Parol: `admin123`

- **Filial Rahbari**: 
  - Email: `manager@soundz.uz`
  - Parol: `manager123`

- **Filial Xodimi**: 
  - Email: `staff@soundz.uz`
  - Parol: `staff123`

## 🔍 Tekshirish

### API Test

Postman yoki browser'da:

```bash
# Health check
curl http://localhost:3001/health

# Login test
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soundz.uz","password":"admin123"}'
```

### Prisma Studio

Database ma'lumotlarini ko'rish:

```bash
pnpm db:studio
```

Bu http://localhost:5555 da ochiladi.

## ⚠️ Muammo Tuzatish

### Database ulanmayapti

1. PostgreSQL ishlayotganini tekshiring
2. Parolni tekshiring (`Bismillah`)
3. Database mavjudligini tekshiring:
   ```sql
   -- PostgreSQL'da
   \l
   -- yoki
   SELECT datname FROM pg_database WHERE datname = 'crm_db';
   ```

### Port band

Agar 3001 port band bo'lsa, `.env` faylida `PORT` ni o'zgartiring.

### Prisma xatolari

```bash
# Prisma client'ni qayta generate qiling
pnpm db:generate

# Migration'larni qayta ishga tushiring
pnpm db:migrate
```

## 📝 Keyingi Qadamlar

1. Frontend yaratish (Next.js)
2. Admin panel yaratish (React)
3. Integratsiyalar (Instagram, Facebook, Telegram)
4. Maps integratsiyasi (Google, Yandex)



