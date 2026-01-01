# Frontend Port O'zgartirildi

Frontend endi **port 3002** da ishlaydi (3000 band bo'lgani uchun).

## Ishga Tushirish

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\frontend
pnpm dev
```

Frontend: **http://localhost:3002**

## Portni O'zgartirish

Agar yana boshqa port kerak bo'lsa, `package.json` faylida o'zgartiring:

```json
"dev": "next dev -p 3003"  // 3003 port uchun
```

Yoki environment variable orqali:

```powershell
$env:PORT=3003; pnpm dev
```

## Tekshirish

- Frontend: http://localhost:3002
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs


