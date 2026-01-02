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
- `apps/frontend` - Next.js frontend (xodimlar uchun)
- `apps/admin` - React admin panel (CRM adminlar uchun)
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
│   ├── frontend/     # Next.js frontend
│   └── admin/        # React admin panel
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



