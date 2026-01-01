# Backend Ishga Tushirish

## Qadamlar

1. **Terminal oching va backend papkasiga kiring:**
   ```powershell
   cd C:\Users\AzzaPRO\Desktop\Soundz-crm\apps\backend
   ```

2. **Backend'ni ishga tushiring:**
   ```powershell
   pnpm dev
   ```

3. **Tekshirish:**
   - Browser'da oching: http://localhost:3001/health
   - API Docs: http://localhost:3001/api/docs

## Muammo bo'lsa

- Database ulanayotganini tekshiring (PostgreSQL ishlayotgan bo'lishi kerak)
- `.env` faylida `DATABASE_URL` to'g'ri ekanligini tekshiring
- Port 3001 band bo'lmasligi kerak

## Test API

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soundz.uz","password":"admin123"}'
```


