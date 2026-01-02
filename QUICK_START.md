# Soundz CRM - Tezkor Boshlash

## Eng Oson Usul

### 1. PowerShell'da quyidagi buyruqlarni ketma-ket bajaring:

```powershell
# Loyiha papkasiga o'ting
cd C:\Users\AzzaPRO\Desktop\Soundz-crm

# Dependencies o'rnatish (faqat birinchi marta)
pnpm install

# Database sozlash (faqat birinchi marta)
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Ishga tushirish
pnpm dev
```

### 2. Brauzerda oching:

- **Frontend:** http://localhost:3003
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

### 3. Login qiling:

- **Email:** admin@soundz.uz
- **Parol:** admin123

## Alohida Terminalda Ishga Tushirish

Agar bir vaqtda ikkita terminal ochib ishga tushirmoqchi bo'lsangiz:

**Terminal 1 (Backend):**
```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\backend
pnpm dev
```

**Terminal 2 (Frontend):**
```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
pnpm dev
```

## Portlar

- Backend: **3001**
- Frontend: **3003**
- PostgreSQL: **5432**

## Test Foydalanuvchilar

| Email | Parol | Rol |
|-------|-------|-----|
| admin@soundz.uz | admin123 | Super Admin |
| manager@soundz.uz | manager123 | Filial Rahbari |
| staff@soundz.uz | staff123 | Filial Xodimi |

## Muammolar?

1. **Backend ishlamayapti:** PostgreSQL ishlayotganini tekshiring
2. **Frontend ishlamayapti:** Backend ishlayotganini tekshiring
3. **Database xatosi:** `pnpm db:migrate` ni qayta ishga tushiring
