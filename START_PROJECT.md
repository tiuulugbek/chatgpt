# Soundz CRM - Ishga Tushirish Qo'llanmasi

## 📋 Talablar

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (port 5432)
- Database: `crm_db` (parol: `Bismillah`)

## 🚀 Tezkor Boshlash

### 1. Dependencies O'rnatish

```bash
# Root papkada
cd C:\Users\AzzaPRO\Desktop\Soundz-crm
pnpm install
```

### 2. Database Sozlash

```bash
# Prisma client generate qilish
pnpm db:generate

# Database migrate qilish
pnpm db:migrate

# Seed data (test ma'lumotlar)
pnpm db:seed
```

### 3. Backend Ishga Tushirish

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev
```

**Backend ishlaydi:** http://localhost:3001
**API Docs (Swagger):** http://localhost:3001/api/docs

### 4. Frontend Ishga Tushirish

```bash
# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

**Frontend ishlaydi:** http://localhost:3003

## 📝 Test Foydalanuvchilar

Tizimga kirish uchun quyidagi foydalanuvchilardan foydalaning:

| Rol | Email | Parol |
|-----|-------|-------|
| Super Admin | admin@soundz.uz | admin123 |
| Filial Rahbari | manager@soundz.uz | manager123 |
| Filial Xodimi | staff@soundz.uz | staff123 |

## 🔗 Portlar

- **Backend API:** `http://localhost:3001`
- **Frontend:** `http://localhost:3003`
- **PostgreSQL:** `localhost:5432`
- **Database:** `crm_db`

## 📂 Loyiha Struktura

```
Soundz-crm/
├── apps/
│   ├── backend/      # NestJS Backend (port 3001)
│   └── frontend/     # Next.js Frontend (port 3003)
├── packages/
│   └── shared/       # Umumiy kodlar
└── prisma/           # Database schema
```

## 🛠️ Foydali Buyruqlar

```bash
# Barcha loyihalarni bir vaqtda ishga tushirish
pnpm dev

# Faqat backend
cd apps/backend && pnpm dev

# Faqat frontend
cd apps/frontend && pnpm dev

# Database operatsiyalar
pnpm db:generate   # Prisma client generate
pnpm db:migrate    # Database migrate
pnpm db:seed       # Seed data
pnpm db:studio     # Prisma Studio (database GUI)
```

## 🐛 Muammolarni Hal Qilish

### Backend ishlamayapti
1. PostgreSQL ishlayotganini tekshiring
2. `.env` faylida `DATABASE_URL` to'g'ri ekanligini tekshiring
3. Port 3001 band emasligini tekshiring

### Frontend ishlamayapti
1. Backend ishlayotganini tekshiring
2. Port 3003 band emasligini tekshiring
3. `.env.local` faylida `NEXT_PUBLIC_API_URL` to'g'ri ekanligini tekshiring

### Database muammolari
1. PostgreSQL ishlayotganini tekshiring
2. Database `crm_db` yaratilganini tekshiring
3. `pnpm db:migrate` ni qayta ishga tushiring

## 📱 Foydalanish

1. **Frontend'ga kirish:** http://localhost:3003
2. **Login qilish:** Yuqoridagi test foydalanuvchilaridan biri bilan
3. **Dashboard'ni ko'rish:** Kirishdan keyin avtomatik dashboard'ga yo'naltiriladi
4. **Admin bo'limi:** Faqat `admin@soundz.uz` bilan kirganda ko'rinadi

## 🎯 Keyingi Qadamlar

- Bitimlar Kanban taxtasi
- Real-time bildirishnomalar
- Integratsiyalar (Instagram, Facebook, Telegram)
- Maps integratsiyasi (Google, Yandex)

