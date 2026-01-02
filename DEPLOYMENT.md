# Soundz CRM - Production Deployment Qo'llanmasi

## 📋 Talablar

### Server
- Ubuntu 20.04+ yoki boshqa Linux distributivlari
- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- Nginx (reverse proxy uchun)
- PM2 (process manager)

### Domain va SSL
- Domain nomi
- SSL sertifikati (Let's Encrypt yoki boshqa)

## 🚀 Deployment Qadamlar

### 1. Serverga Kirish va Dasturlarni O'rnatish

```bash
# Node.js o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm o'rnatish
npm install -g pnpm

# PostgreSQL o'rnatish
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# PM2 o'rnatish
npm install -g pm2

# Nginx o'rnatish
sudo apt-get install -y nginx
```

### 2. Database Yaratish

```bash
# PostgreSQL'ga kirish
sudo -u postgres psql

# Database va foydalanuvchi yaratish
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'Bismillah';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
\q
```

### 3. Loyihani Serverga Yuklash

```bash
# Git orqali klonlash
cd /var/www
sudo git clone https://github.com/tiuulugbek/chatgpt.git soundz-crm
cd soundz-crm

# Dependencies o'rnatish
pnpm install

# Environment variables sozlash
cp .env.example .env
nano .env  # Yoki vim .env
```

### 4. Environment Variables Sozlash

`.env` faylida quyidagilarni o'zgartiring:

```env
DATABASE_URL="postgresql://crm_user:Bismillah@localhost:5432/crm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
NODE_ENV=production
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
```

### 5. Database Migration va Seed

```bash
# Prisma client generate qilish
pnpm db:generate

# Migration qilish
pnpm db:migrate

# Seed data (ixtiyoriy)
pnpm db:seed
```

### 6. Build Qilish

```bash
# Barcha app'larni build qilish
pnpm build
```

### 7. PM2 bilan Ishga Tushirish

#### Backend

```bash
cd apps/backend
pm2 start dist/main.js --name "soundz-crm-backend" --env production
pm2 save
pm2 startup  # Systemd service yaratish
```

#### Frontend

```bash
cd apps/frontend
pm2 start npm --name "soundz-crm-frontend" -- start
pm2 save
```

### 8. Nginx Konfiguratsiyasi

```bash
sudo nano /etc/nginx/sites-available/soundz-crm
```

Nginx konfiguratsiyasi:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Nginx konfiguratsiyasini faollashtirish
sudo ln -s /etc/nginx/sites-available/soundz-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL Sertifikati (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### 10. Firewall Sozlash

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🔄 Yangilash

```bash
cd /var/www/soundz-crm
git pull origin main
pnpm install
pnpm build
pm2 restart soundz-crm-backend
pm2 restart soundz-crm-frontend
```

## 📊 Monitoring

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs soundz-crm-backend
pm2 logs soundz-crm-frontend

# PM2 monitoring
pm2 monit
```

## 🔒 Xavfsizlik

1. **Firewall** - Faqat kerakli portlarni oching
2. **SSL** - HTTPS ishlatish majburiy
3. **JWT Secret** - Kuchli secret key ishlating
4. **Database** - Kuchli parol ishlating
5. **Regular Updates** - Dasturlarni muntazam yangilang

## 🐛 Troubleshooting

### Backend ishlamayapti
```bash
pm2 logs soundz-crm-backend
pm2 restart soundz-crm-backend
```

### Frontend ishlamayapti
```bash
pm2 logs soundz-crm-frontend
pm2 restart soundz-crm-frontend
```

### Database muammolari
```bash
sudo -u postgres psql -d crm_db
```

### Nginx muammolari
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## 📝 Eslatmalar

- Production'da `NODE_ENV=production` o'rnatilgan bo'lishi kerak
- JWT_SECRET kuchli bo'lishi kerak (min 32 belgi)
- Database backup'larini muntazam oling
- Loglarni monitoring qiling

