# Tezkor Deployment Qo'llanmasi

## Serverga Birinchi Marta Yuklash

### 1. Serverga Kirish
```bash
ssh user@your-server-ip
```

### 2. Kerakli Dasturlarni O'rnatish
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm

# PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# PM2
npm install -g pm2

# Nginx
sudo apt-get install -y nginx
```

### 3. Database Yaratish
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

### 4. Loyihani Yuklash
```bash
cd /var/www
sudo git clone https://github.com/tiuulugbek/chatgpt.git soundz-crm
cd soundz-crm
sudo chown -R $USER:$USER .
```

### 5. Environment Variables
```bash
cp .env.example .env
nano .env  # Yoki vim .env
```

`.env` faylida quyidagilarni o'zgartiring:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Kuchli secret key (min 32 belgi)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Frontend URL
- `FRONTEND_URL` - Frontend URL

### 6. Dependencies va Build
```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm build
```

### 7. PM2 bilan Ishga Tushirish

#### Backend
```bash
cd apps/backend
pm2 start dist/main.js --name "soundz-crm-backend" --env production
```

#### Frontend
```bash
cd apps/frontend
pm2 start npm --name "soundz-crm-frontend" -- start
```

#### PM2 Save
```bash
pm2 save
pm2 startup  # Systemd service yaratish
```

### 8. Nginx Sozlash
```bash
sudo cp infra/nginx/soundz-crm.conf /etc/nginx/sites-available/soundz-crm
sudo nano /etc/nginx/sites-available/soundz-crm  # Domain nomlarini o'zgartiring
sudo ln -s /etc/nginx/sites-available/soundz-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## Keyingi Yangilashlar

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

## Tekshirish

- Backend: `http://your-server-ip:3001/api/docs`
- Frontend: `http://your-server-ip:3003`
- PM2 Status: `pm2 status`
- Logs: `pm2 logs`

