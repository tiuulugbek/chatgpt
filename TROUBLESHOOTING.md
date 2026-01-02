# Troubleshooting Guide

## `/api/settings` 404 Xatosi

### Muammo
Frontend'da `/api/settings` endpoint 404 xatosi qaytarmoqda.

### Sabablar
1. **Backend ishlamayapti** - Backend server ishlamayotgan bo'lishi mumkin
2. **Authentication muammosi** - Token yuborilmayotgan yoki noto'g'ri bo'lishi mumkin
3. **Endpoint topilmayapti** - Backend'da endpoint to'g'ri sozlanmagan

### Yechimlar

#### 1. Backend'ni tekshirish
```bash
cd apps/backend
pnpm dev
```

Backend `http://localhost:3001` da ishlashi kerak.

#### 2. Authentication tekshirish
- Login qiling va token oling
- Browser DevTools > Application > Cookies'da `access_token` borligini tekshiring
- Yoki Network tab'da request header'larida `Authorization: Bearer <token>` borligini tekshiring

#### 3. Default qiymatlar
Agar settings endpoint ishlamasa, frontend avtomatik ravishda default qiymatlarni ishlatadi:
- Barcha platformalar yoqilgan bo'ladi
- Xatoliklar console'da ko'rsatiladi, lekin sahifa ishlashda davom etadi

### Boshqa Xatolar

#### Telegram Web App Xabarlari
Bu normal warning'lar - Telegram Web App SDK ishlayotganini ko'rsatadi. Xatolik emas.

#### React DevTools Warning
Bu ham normal - development rejimida React DevTools'ni o'rnatishni tavsiya qiladi. Xatolik emas.

#### "Extra attributes from the server: style"
Bu Next.js hydration xatosi - layout.tsx'da style attribute'lar bilan bog'liq. Katta muammo emas.

## Backend Ishlamayapti

### Tekshirish
1. Backend port tekshirish: `http://localhost:3001/api/docs`
2. Database ulanishini tekshirish
3. Environment variables tekshirish

### Yechim
```bash
# Backend'ni qayta ishga tushirish
cd apps/backend
pnpm dev
```

## Database Muammolari

### Migration qilish
```bash
cd apps/backend
pnpm db:migrate
```

### Seed qilish
```bash
cd apps/backend
pnpm db:seed
```

