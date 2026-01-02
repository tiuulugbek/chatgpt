# Login Muammosini Hal Qilish

## Muammo: "Email yoki parol noto'g'ri"

Bu muammo odatda quyidagi sabablarga ko'ra yuzaga keladi:

1. Database'da seed data bo'lmasligi
2. Foydalanuvchilar yaratilmagan
3. Parol hash qilinmagan

## Yechim

### 1. Database'ni tekshirish va seed qilish

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm

# Database'ni seed qilish
pnpm db:seed
```

### 2. Agar seed ishlamasa, qo'lda foydalanuvchi yaratish

```powershell
# Prisma Studio ochish
pnpm db:studio
```

Keyin Prisma Studio'da `User` jadvaliga kiring va foydalanuvchi yaratish.

### 3. Yoki SQL orqali to'g'ridan-to'g'ri yaratish

```sql
-- PostgreSQL'ga ulaning
psql -U postgres -d crm_db

-- Foydalanuvchilarni yaratish (parol: admin123)
-- Eslatma: Parol hash qilingan bo'lishi kerak
```

### 4. Test qilish

Backend'ni qayta ishga tushiring va quyidagi ma'lumotlar bilan login qiling:

- **Email:** admin@soundz.uz
- **Parol:** admin123

## Tezkor Yechim Scripti

Quyidagi scriptni ishga tushiring:

```powershell
.\FIX_LOGIN.ps1
```

