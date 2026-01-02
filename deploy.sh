#!/bin/bash

# Soundz CRM Deployment Script
# Bu script serverga yuklash va ishga tushirish uchun

set -e

echo "🚀 Soundz CRM Deployment boshlandi..."

# 1. Git'dan yangilash
echo "📥 Git'dan yangilash..."
git pull origin main

# 2. Dependencies o'rnatish
echo "📦 Dependencies o'rnatish..."
pnpm install --frozen-lockfile

# 3. Prisma client generate
echo "🔧 Prisma client generate..."
pnpm db:generate

# 4. Database migration
echo "🗄️ Database migration..."
pnpm db:migrate

# 5. Build
echo "🏗️ Build qilish..."
pnpm build

# 6. PM2 restart
echo "🔄 PM2 restart..."
pm2 restart soundz-crm-backend || pm2 start apps/backend/dist/main.js --name "soundz-crm-backend" --env production
pm2 restart soundz-crm-frontend || pm2 start npm --name "soundz-crm-frontend" --cwd apps/frontend -- start

# 7. PM2 save
pm2 save

echo "✅ Deployment yakunlandi!"
echo "📊 Status:"
pm2 status

