# Soundz CRM - O'rnatish Qo'llanmasi

## Talablar

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

## Qadamlar

### 1. Dependencies o'rnatish

```bash
pnpm install
```

### 2. Environment sozlamalari

Backend papkasida `.env` faylini yarating:

```bash
cd apps/backend
cp .env.example .env
```

`.env` faylini tahrirlang va kerakli ma'lumotlarni kiriting.

### 3. Database yaratish

PostgreSQL'da yangi database yarating:

```sql
CREATE DATABASE soundz_crm;
```

### 4. Prisma migrate

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Development rejimida ishga tushirish

```bash
pnpm dev
```

Backend: http://localhost:3001
API Docs: http://localhost:3001/api/docs

## Test foydalanuvchilar

Seed script quyidagi test foydalanuvchilarni yaratadi:

- **Super Admin**: admin@soundz.uz / admin123
- **Filial Rahbari**: manager@soundz.uz / manager123
- **Filial Xodimi**: staff@soundz.uz / staff123

## Keyingi qadamlar

1. Frontend va Admin panel yaratish
2. Integratsiyalar (Instagram, Facebook, Telegram, YouTube)
3. Google Maps va Yandex Maps integratsiyasi
4. Telegram mini-app



