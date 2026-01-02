'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function AdminIntegrationsPage() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Integratsiyalar</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Instagram</h3>
              <p className="text-sm text-gray-600 mb-4">
                Instagram Graph API integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Facebook</h3>
              <p className="text-sm text-gray-600 mb-4">
                Facebook Graph API integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Telegram</h3>
              <p className="text-sm text-gray-600 mb-4">
                Telegram Bot API integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">YouTube</h3>
              <p className="text-sm text-gray-600 mb-4">
                YouTube Data API integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Google Maps</h3>
              <p className="text-sm text-gray-600 mb-4">
                Google Maps Reviews integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Yandex Maps</h3>
              <p className="text-sm text-gray-600 mb-4">
                Yandex Maps Reviews integratsiyasi
              </p>
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
                Sozlash
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}

