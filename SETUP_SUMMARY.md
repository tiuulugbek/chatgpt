# CRM24.soundz.uz - O'rnatish Holati

## ✅ Bajarilgan ishlar:

1. ✅ **Eski CRM24 tozalandi:**
   - Eski `/var/www/crm24` papkasi o'chirildi
   - Backup saqlanadi: `/var/www/crm24-backup-20260102-125214`
   - Eski Nginx konfiguratsiyalari tozalandi

2. ✅ **Prisma Client generatsiya qilindi:**
   - Prisma Client muvaffaqiyatli generatsiya qilindi
   - Manzil: `node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client`

3. ✅ **Database yaratildi:**
   - Database: `crm_db`
   - User: `crm_user`
   - Parol: `Bismillah`

4. ✅ **Environment variables sozlandi:**
   - `.env` fayli yaratildi va sozlandi

5. ✅ **Dependencies o'rnatildi:**
   - `pnpm install --shamefully-hoist` bajarildi

6. ✅ **Nginx konfiguratsiyasi:**
   - `/etc/nginx/sites-available/crm24.soundz.uz` yaratildi
   - Faollashtirildi: `/etc/nginx/sites-enabled/crm24.soundz.uz`

## ⚠️ Build jarayonida TypeScript xatolari:

Build jarayonida 22 ta TypeScript xatosi bor. Bu kod muammolari, lekin Prisma Client generatsiya qilindi.

## 📋 Keyingi qadamlar:

### 1. TypeScript xatolarini hal qilish (ixtiyoriy):
```bash
cd /var/www/soundz-crm/apps/backend
# Xatolarni ko'rish
pnpm build 2>&1 | grep error
```

### 2. Build qilish (xatolarni hal qilgandan keyin):
```bash
cd /var/www/soundz-crm
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public" \
pnpm build
```

### 3. PM2 bilan ishga tushirish:

#### Backend:
```bash
cd /var/www/soundz-crm/apps/backend
pm2 start dist/main.js --name "soundz-crm-backend" --env production
```

#### Frontend:
```bash
cd /var/www/soundz-crm/apps/frontend
pm2 start npm --name "soundz-crm-frontend" -- start
```

#### PM2 Save:
```bash
pm2 save
pm2 startup  # Chiqgan buyruqni nusxalab ishga tushiring
```

### 4. SSL sertifikati o'rnatish:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d crm24.soundz.uz
```

### 5. Nginx'ni qayta ishga tushirish:
```bash
sudo systemctl restart nginx
```

## 🔍 Tekshirish:

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs soundz-crm-backend
pm2 logs soundz-crm-frontend

# Backend API
curl http://localhost:3001/api/docs

# Frontend
curl http://localhost:3003
```

## 📝 Eslatmalar:

- Backend port: 3001
- Frontend port: 3003
- Database: crm_db (PostgreSQL)
- Environment fayl: `/var/www/soundz-crm/.env`
- Prisma Client: Generatsiya qilindi ✅
