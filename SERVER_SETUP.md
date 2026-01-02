# Server Setup - Qadam-baqadam Qo'llanma

## 1️⃣ Serverga Kirish

```bash
ssh user@your-server-ip
```

## 2️⃣ Dasturlarni O'rnatish

### Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # 18.x.x bo'lishi kerak
```

### pnpm
```bash
npm install -g pnpm
pnpm --version  # 8.x.x bo'lishi kerak
```

### PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### PM2
```bash
npm install -g pm2
pm2 --version
```

### Nginx
```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 3️⃣ Database Yaratish

```bash
sudo -u postgres psql
```

PostgreSQL ichida:
```sql
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'Bismillah';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
ALTER DATABASE crm_db OWNER TO crm_user;
\q
```

## 4️⃣ Loyihani Yuklash

```bash
cd /var/www
sudo git clone https://github.com/tiuulugbek/chatgpt.git soundz-crm
cd soundz-crm
sudo chown -R $USER:$USER .
```

## 5️⃣ Environment Variables

```bash
cp env.example .env
nano .env
```

`.env` faylida quyidagilarni o'zgartiring:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Kuchli secret key (min 32 belgi, masalan: `openssl rand -base64 32`)
- `NEXT_PUBLIC_API_URL` - Backend API URL (masalan: `https://api.yourdomain.com/api`)
- `NEXT_PUBLIC_SITE_URL` - Frontend URL (masalan: `https://yourdomain.com`)
- `FRONTEND_URL` - Frontend URL

## 6️⃣ Dependencies va Build

```bash
# Dependencies o'rnatish
pnpm install

# Prisma client generate
pnpm db:generate

# Database migration
pnpm db:migrate

# Seed data (ixtiyoriy)
pnpm db:seed

# Build
pnpm build
```

## 7️⃣ PM2 bilan Ishga Tushirish

### Backend
```bash
cd apps/backend
pm2 start dist/main.js --name "soundz-crm-backend" --env production
```

### Frontend
```bash
cd apps/frontend
pm2 start npm --name "soundz-crm-frontend" -- start
```

### PM2 Save va Startup
```bash
pm2 save
pm2 startup  # Bu systemd service yaratadi
# Chiqgan buyruqni nusxalab ishga tushiring
```

## 8️⃣ Nginx Konfiguratsiyasi

```bash
# Nginx config faylini yaratish
sudo nano /etc/nginx/sites-available/soundz-crm
```

Quyidagi konfiguratsiyani kiriting (domain nomlarini o'zgartiring):

```nginx
# Backend API
upstream soundz_backend {
    server localhost:3001;
}

# Frontend
upstream soundz_frontend {
    server localhost:3003;
}

# Backend API Server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://soundz_backend;
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

# Frontend Server
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://soundz_frontend;
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
# Nginx config'ni faollashtirish
sudo ln -s /etc/nginx/sites-available/soundz-crm /etc/nginx/sites-enabled/
sudo nginx -t  # Syntax tekshirish
sudo systemctl restart nginx
```

## 9️⃣ SSL Sertifikati (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## 🔟 Firewall Sozlash

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## ✅ Tekshirish

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

## 🔄 Keyingi Yangilashlar

```bash
cd /var/www/soundz-crm
bash deploy.sh
```

Yoki qo'lda:
```bash
git pull origin main
pnpm install
pnpm build
pm2 restart soundz-crm-backend
pm2 restart soundz-crm-frontend
```

## 📊 Monitoring

```bash
# PM2 monitoring
pm2 monit

# PM2 logs
pm2 logs --lines 100

# System resources
htop
```

## 🐛 Muammolarni Hal Qilish

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
sudo tail -f /var/log/nginx/error.log
```

