'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/translations';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useTranslation();

  // Asosiy menyu (barcha foydalanuvchilar uchun)
  const baseMenuItems = [
    { href: '/dashboard', label: t('navigation.dashboard'), icon: '📊', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/leads', label: t('navigation.leads'), icon: '📋', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/deals', label: t('navigation.deals'), icon: '💼', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/contacts', label: t('navigation.contacts'), icon: '👥', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/messages', label: t('navigation.messages'), icon: '💬', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/reviews', label: t('navigation.reviews'), icon: '⭐', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
    { href: '/reports', label: t('navigation.reports'), icon: '📈', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  ];

  // Admin menyu (faqat SUPER_ADMIN uchun)
  const adminMenuItems = [
    { href: '/admin/users', label: t('navigation.admin.users'), icon: '👤', roles: ['SUPER_ADMIN'] },
    { href: '/admin/branches', label: t('navigation.admin.branches'), icon: '🏢', roles: ['SUPER_ADMIN'] },
    { href: '/admin/settings', label: t('navigation.admin.settings'), icon: '⚙️', roles: ['SUPER_ADMIN'] },
    { href: '/admin/integrations', label: t('navigation.admin.integrations'), icon: '🔌', roles: ['SUPER_ADMIN'] },
  ];

  // Foydalanuvchi roliga qarab menyu filtrlash
  const getMenuItems = () => {
    const allItems = [...baseMenuItems];
    if (isAdmin) {
      allItems.push(...adminMenuItems);
    }
    return allItems.filter((item) => 
      item.roles.includes(user?.role || '')
    );
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-primary to-purple-900 text-white shadow-2xl">
        <div className="p-6 h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <span className="bg-white bg-opacity-20 rounded-lg p-2 mr-2">🎵</span>
              Soundz CRM
            </h2>
            {user && (
              <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-xs mt-1 text-white text-opacity-70">{user.role}</div>
              </div>
            )}
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  pathname === item.href
                    ? 'bg-white bg-opacity-25 shadow-lg transform scale-105'
                    : 'hover:bg-white hover:bg-opacity-15'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <button
                  onClick={logout}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <span>🚪</span>
                  <span>{t('navigation.logout')}</span>
                </button>
              </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}



