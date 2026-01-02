# CRM24.soundz.uz O'rnatish Holati

## ✅ Bajarilgan ishlar:

1. ✅ Eski CRM dasturi backup qilindi: `/var/www/crm24-backup-*`
2. ✅ Yangi repository klonlandi: `/var/www/soundz-crm`
3. ✅ Database yaratildi:
   - Database: `crm_db`
   - User: `crm_user`
   - Parol: `Bismillah`
4. ✅ Environment variables sozlandi: `/var/www/soundz-crm/.env`
5. ✅ Dependencies o'rnatildi: `pnpm install`
6. ✅ Nginx konfiguratsiyasi yaratildi va faollashtirildi: `/etc/nginx/sites-available/crm24.soundz.uz`

## ⚠️ Hal qilinishi kerak bo'lgan muammo:

**Prisma Client generatsiya qilinmadi** - Bu build jarayonini to'xtatmoqda.

### Muammoni hal qilish:

```bash
cd /var/www/soundz-crm

# 1-usul: Prisma'ni global o'rnatish va generatsiya qilish
npm install -g prisma@5.22.0
cd apps/backend
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public" \
prisma generate --schema=../../prisma/schema.prisma

# 2-usul: Migration yaratish va generatsiya qilish
cd /var/www/soundz-crm
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public" \
pnpm --filter @soundz/backend exec prisma migrate dev --name init --schema=../../prisma/schema.prisma --create-only

# Keyin migration'ni qo'lda qo'llash
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public" \
pnpm --filter @soundz/backend exec prisma migrate deploy --schema=../../prisma/schema.prisma

# Prisma client generatsiya qilish
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public" \
pnpm --filter @soundz/backend exec prisma generate --schema=../../prisma/schema.prisma
```

## 📋 Keyingi qadamlar:

### 1. Prisma muammosini hal qiling (yuqoridagi usullardan birini ishlating)

### 2. Build qilish:
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
