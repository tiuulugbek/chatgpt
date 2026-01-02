'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Asosiy menyu (barcha foydalanuvchilar uchun)
const baseMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  { href: '/leads', label: 'Lidlar', icon: '📋', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  { href: '/deals', label: 'Bitimlar', icon: '💼', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  { href: '/contacts', label: 'Mijozlar', icon: '👥', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  { href: '/messages', label: 'Xabarlar', icon: '💬', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
  { href: '/reports', label: 'Hisobotlar', icon: '📈', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'BRANCH_STAFF'] },
];

// Admin menyu (faqat SUPER_ADMIN uchun)
const adminMenuItems = [
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: '👤', roles: ['SUPER_ADMIN'] },
  { href: '/admin/branches', label: 'Filiallar', icon: '🏢', roles: ['SUPER_ADMIN'] },
  { href: '/admin/settings', label: 'Sozlamalar', icon: '⚙️', roles: ['SUPER_ADMIN'] },
  { href: '/admin/integrations', label: 'Integratsiyalar', icon: '🔌', roles: ['SUPER_ADMIN'] },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

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
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Soundz CRM</h2>
          {user && (
            <div className="text-sm text-white text-opacity-80 mb-6">
              <div>{user.firstName} {user.lastName}</div>
              <div className="text-xs mt-1">{user.role}</div>
            </div>
          )}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-white bg-opacity-20'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={logout}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition"
          >
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}



