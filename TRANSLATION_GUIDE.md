# Translation System - Qo'llanma

## Umumiy Ma'lumot

Barcha UI matnlari endi `apps/frontend/src/locales/uz.json` faylidan o'qiladi. Bu sizga barcha matnlarni bitta joydan boshqarish imkonini beradi.

## Qanday Ishlaydi

### 1. Translation Fayli
Barcha matnlar `apps/frontend/src/locales/uz.json` faylida saqlanadi.

### 2. Hook Ishlatish
Komponentlarda `useTranslation` hook'ini ishlatish:

```tsx
import { useTranslation } from '@/lib/translations';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('dashboard.newLead')}</button>
    </div>
  );
}
```

### 3. Nested Keys
Nested key'larni ishlatish mumkin:

```tsx
t('leads.statuses.NEW') // "Yangi"
t('admin.users.roles.SUPER_ADMIN') // "Tizim administratori"
```

### 4. Parametrlar
Matnlarda parametrlar ishlatish:

```json
{
  "common": {
    "welcome": "Xush kelibsiz, {name}!"
  }
}
```

```tsx
t('common.welcome', { name: 'Ali' }) // "Xush kelibsiz, Ali!"
```

## Matnlarni O'zgartirish

1. `apps/frontend/src/locales/uz.json` faylini oching
2. Kerakli matnni toping va o'zgartiring
3. O'zgarishlar darhol qo'llanadi (development rejimida)

## Misollar

### Dashboard
```json
{
  "dashboard": {
    "title": "Dashboard",
    "quickActions": "Tezkor Amallar",
    "newLead": "Yangi Lid",
    "newDeal": "Yangi Bitim",
    "newContact": "Yangi Mijoz"
  }
}
```

### Navigation
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "leads": "Lidlar",
    "deals": "Bitimlar",
    "contacts": "Mijozlar"
  }
}
```

## Qo'shimcha Matnlar Qo'shish

Yangi matn qo'shish uchun:

1. `uz.json` fayliga yangi key qo'shing
2. Komponentda `t('your.new.key')` ishlating

## Eslatmalar

- Barcha matnlar o'zbek tilida
- Key nomlari ingliz tilida (kodda ishlatish uchun)
- Nested struktura ishlatiladi (guruhlash uchun)
- Agar key topilmasa, key o'zi qaytariladi

