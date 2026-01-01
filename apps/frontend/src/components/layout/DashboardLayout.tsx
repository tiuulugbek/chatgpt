'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Lidlar', icon: '📋' },
  { href: '/deals', label: 'Bitimlar', icon: '💼' },
  { href: '/contacts', label: 'Mijozlar', icon: '👥' },
  { href: '/messages', label: 'Xabarlar', icon: '💬' },
  { href: '/reports', label: 'Hisobotlar', icon: '📈' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-white">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-8">Soundz CRM</h2>
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
            onClick={handleLogout}
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


