'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-600">
              Sozlamalar moduli tez orada qo'shiladi...
            </p>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}

