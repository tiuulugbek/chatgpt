import uzTranslations from '@/locales/uz.json';

type Translations = typeof uzTranslations;

/**
 * Get translation by key
 * Supports nested keys like 'dashboard.title' or 'leads.statuses.NEW'
 * 
 * @example
 * t('dashboard.title') // "Dashboard"
 * t('leads.statuses.NEW') // "Yangi"
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = uzTranslations;
  
  // Navigate through nested object
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return key itself if not found
    }
  }
  
  if (typeof value === 'string') {
    // Replace interpolation placeholders like {name}
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    return value;
  }
  
  console.warn(`Translation value is not a string for key: ${key}`);
  return key;
}

/**
 * React hook for translations in client components
 */
export function useTranslation() {
  return {
    t: (key: string, params?: Record<string, string | number>) => t(key, params),
  };
}

/**
 * Type-safe translation keys (optional, for better IDE support)
 */
export type TranslationKey = 
  | `common.${keyof Translations['common']}`
  | `dashboard.${keyof Translations['dashboard']}`
  | `leads.${string}`
  | `deals.${string}`
  | `contacts.${string}`
  | `messages.${string}`
  | `reviews.${string}`
  | `reports.${string}`
  | `admin.${string}`
  | `navigation.${string}`
  | `auth.${string}`
  | `telegram.${string}`;

