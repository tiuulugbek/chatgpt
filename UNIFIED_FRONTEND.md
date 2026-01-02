# Birlashtirilgan Frontend + Admin Panel

## ✅ O'zgarishlar

Frontend va Admin panel endi **bitta Next.js ilovasida** birlashtirildi!

## 🎯 Qanday Ishlaydi?

### Role-Based UI (Rolga asoslangan interfeys)

1. **SUPER_ADMIN** (Tizim administratori):
   - Barcha asosiy sahifalar (Dashboard, Lidlar, Bitimlar, va h.k.)
   - **Admin bo'limi:**
     - `/admin/users` - Foydalanuvchilar boshqaruvi
     - `/admin/branches` - Filiallar boshqaruvi
     - `/admin/settings` - Sozlamalar
     - `/admin/integrations` - Integratsiyalar

2. **BRANCH_MANAGER** (Filial rahbari):
   - Barcha asosiy sahifalar
   - Admin bo'limiga kirish huquqi yo'q

3. **BRANCH_STAFF** (Filial xodimi):
   - Faqat asosiy sahifalar
   - Faqat o'ziga biriktirilgan ma'lumotlar

## 📁 Struktura

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/      # Dashboard (barcha uchun)
│   │   ├── leads/          # Lidlar (barcha uchun)
│   │   ├── deals/          # Bitimlar (barcha uchun)
│   │   ├── contacts/       # Mijozlar (barcha uchun)
│   │   ├── messages/       # Xabarlar (barcha uchun)
│   │   ├── reports/        # Hisobotlar (barcha uchun)
│   │   └── admin/          # Admin sahifalar (faqat SUPER_ADMIN)
│   │       ├── users/      # Foydalanuvchilar
│   │       ├── branches/   # Filiallar
│   │       ├── settings/   # Sozlamalar
│   │       └── integrations/ # Integratsiyalar
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx  # Role-based menyu
│   │   ├── guards/
│   │   │   └── AdminGuard.tsx       # Admin sahifalar uchun guard
│   │   └── auth/
│   │       └── LoginForm.tsx
│   └── hooks/
│       └── useAuth.ts      # Auth hook (role tekshirish)
```

## 🔐 Xavfsizlik

- **AdminGuard** - Admin sahifalar uchun guard komponenti
- **useAuth hook** - Foydalanuvchi roli va autentifikatsiya
- **Role-based routing** - Menyu foydalanuvchi roliga qarab ko'rsatiladi

## 🎨 Menyu

Menyu avtomatik ravishda foydalanuvchi roliga qarab filtrlashadi:
- SUPER_ADMIN: Barcha sahifalar + Admin bo'limi
- BRANCH_MANAGER: Asosiy sahifalar
- BRANCH_STAFF: Asosiy sahifalar

## ✅ Afzalliklari

1. ✅ Bitta kod bazasi
2. ✅ Bitta deployment
3. ✅ Role-based UI
4. ✅ Kamroq murakkablik
5. ✅ Oson boshqarish

## 📝 Keyingi Qadamlar

1. Admin sahifalarini to'ldirish (CRUD formlar)
2. Integratsiya sozlamalarini qo'shish
3. Real-time bildirishnomalar
4. Bitimlar Kanban taxtasi

