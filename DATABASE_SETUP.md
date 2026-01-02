# Database Sozlash Qo'llanmasi

## Database Ma'lumotlari

- **Database nomi**: `crm_db`
- **Foydalanuvchi**: `postgres`
- **Parol**: `Bismillah`
- **Host**: `localhost`
- **Port**: `5432`

## Qadamlar

### 1. Database yaratish

PostgreSQL'da database yaratilgan:
```sql
CREATE DATABASE crm_db;
```

### 2. Environment Sozlamalari

`apps/backend/.env` faylini yarating va quyidagi ma'lumotlarni kiriting:

```env
DATABASE_URL="postgresql://postgres:Bismillah@localhost:5432/crm_db?schema=public"
```

Yoki `.env.example` faylini nusxalab `.env` ga o'zgartiring:

```bash
cd apps/backend
copy .env.example .env
```

### 3. Prisma Migrate

```bash
# Prisma client generate qilish
pnpm db:generate

# Database migrate qilish
pnpm db:migrate

# Seed data (test foydalanuvchilar)
pnpm db:seed
```

### 4. Tekshirish

Database to'g'ri sozlanganini tekshirish:

```bash
# Prisma Studio ochish (visual database browser)
pnpm db:studio
```

Bu http://localhost:5555 da ochiladi va database ma'lumotlarini ko'rish mumkin.

## Test Foydalanuvchilar

Seed script quyidagi foydalanuvchilarni yaratadi:

- **Super Admin**: admin@soundz.uz / admin123
- **Filial Rahbari**: manager@soundz.uz / manager123  
- **Filial Xodimi**: staff@soundz.uz / staff123

## Muammo Tuzatish

Agar database ulanmasa:

1. PostgreSQL ishlayotganini tekshiring:
   ```bash
   # Windows Services'da PostgreSQL xizmatini tekshiring
   ```

2. Parolni tekshiring:
   - PostgreSQL'ga kirib, parolni tekshiring
   - Agar parol boshqacha bo'lsa, `.env` faylida yangilang

3. Database mavjudligini tekshiring:
   ```sql
   \l  -- PostgreSQL'da barcha databaselarni ko'rish
   ```

4. Connection string'ni tekshiring:
   - Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`
   - Bizning holat: `postgresql://postgres:Bismillah@localhost:5432/crm_db?schema=public`



