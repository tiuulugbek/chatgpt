# Soundz CRM - Tezkor Boshlash (Yakuniy)

## ✅ Avvalo: Band Portlarni To'xtatish

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm
.\FIX_ALL_PORTS.ps1
```

## 🚀 Keyin: Ishga Tushirish

### Eng Oson Usul:

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm
.\START_SERVERS.ps1
```

Bu script:
- ✅ Band portlarni avtomatik to'xtatadi
- ✅ Backend va Frontend'ni bir vaqtda ishga tushiradi

### Yoki Qo'lda:

**Terminal 1:**
```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\backend
pnpm dev
```

**Terminal 2:**
```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
pnpm dev
```

## 🔗 Linklar

- **Frontend:** http://localhost:3003
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

## 🔐 Login

- **Email:** admin@soundz.uz
- **Parol:** admin123

## ⚠️ Muammo Bo'lsa

Agar portlar yana band bo'lsa:

```powershell
# Barcha Node.js jarayonlarini to'xtatish
taskkill /F /IM node.exe

# Keyin qayta ishga tushiring
.\START_SERVERS.ps1
```

