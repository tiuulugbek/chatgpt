# Soundz CRM

CRM tizimi - Mijozlar bilan munosabatlarni boshqarish platformasi.

## 📋 Tavsif

Bu tizim amoCRM va Bitrix24 kabi ishlaydigan mijozlar bilan munosabatlarni boshqarish tizimi (CRM) bo'lib, quyidagi funksiyalarni ta'minlaydi:

- Turli manbalardan (veb-sayt, Instagram, Facebook, Telegram, YouTube) keladigan lidlarni yagona CRM bazasida qabul qilish
- Filiallarga taqsimlash va nazorat qilish
- Omnikanal kommunikatsiya (ijtimoiy tarmoqlar, messenjerlar)
- Bitimlar va savdo voronkasi boshqaruvi
- Google Maps va Yandex Maps sharhlarini integratsiya qilish
- Hisobotlar va statistika

## 🏗️ Arxitektura

Monorepo struktura:
- `apps/backend` - NestJS backend API
- `apps/frontend` - Next.js frontend (CRM interfeysi - xodimlar va adminlar uchun)
- `packages/shared` - Umumiy tip va utilitlar

## 🚀 Boshlash

### Talablar
- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

### O'rnatish

```bash
# Dependencies o'rnatish
pnpm install

# Database yaratish va migrate qilish
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Development rejimida ishga tushirish
pnpm dev
```

## 📁 Struktura

```
soundz-crm/
├── apps/
│   ├── backend/      # NestJS API
│   └── frontend/     # Next.js frontend (CRM interfeysi)
├── packages/
│   └── shared/       # Umumiy kod
├── prisma/           # Database schema
└── infra/            # Infrastructure configs
```

## 🔐 Foydalanuvchi rollari

- **Tizim administratori** - Barcha filiallar va foydalanuvchilar bo'yicha cheksiz huquq
- **Filial rahbari** - O'z filialidagi barcha mijozlar va xodimlar
- **Filial xodimi** - Faqat o'ziga biriktirilgan mijozlar

## 🌐 Integratsiyalar

- Instagram (Graph API)
- Facebook (Graph API)
- Telegram (Bot API + Mini App)
- YouTube (Data API)
- Google Maps (Reviews API)
- Yandex Maps (Reviews API)

## 📝 Til

Tizim to'liq o'zbek tilida ishlaydi.

## 🔒 Xavfsizlik

- JWT autentifikatsiya
- HTTPS/TLS shifrlash
- Role-based access control (RBAC)
- Audit logging
- Ma'lumotlarni shifrlash

## 🚀 Production Deployment

Production serverga yuklash uchun qo'llanmalar:

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Batafsil deployment qo'llanmasi
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Tezkor deployment qo'llanmasi
- **[deploy.sh](./deploy.sh)** - Avtomatik deployment script

### Tezkor Boshlash

```bash
# Serverga kirish
ssh user@your-server

# Loyihani klonlash
cd /var/www
git clone https://github.com/tiuulugbek/chatgpt.git soundz-crm
cd soundz-crm

# Environment variables
cp env.example .env
nano .env  # Sozlamalarni o'zgartiring

# O'rnatish va build
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build

# PM2 bilan ishga tushirish
pm2 start apps/backend/dist/main.js --name "soundz-crm-backend"
pm2 start npm --name "soundz-crm-frontend" --cwd apps/frontend -- start
pm2 save
```

Batafsil qo'llanma: [DEPLOYMENT.md](./DEPLOYMENT.md)


